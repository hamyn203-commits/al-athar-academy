'use strict';

const express = require('express');
const crypto = require('crypto');
const router = express.Router();

const Course = require('../models/Course');
const User = require('../models/User');
const Payment = require('../models/Payment');
const { protect, authorize } = require('../middleware/auth');
const {
  normalizeCurrency,
  toMinorUnits,
} = require('../utils/paymentIntegrity');
const paymob = require('../services/paymob');
const { processPaymobWebhook } = require('../services/paymentSettlement');
const { notifyCourseEnrollment } = require('../utils/notify');

const SUPPORTED_LOCALES = new Set(['ar', 'en', 'fr', 'de', 'tr', 'ur', 'id', 'ms', 'ku']);

function cleanBaseUrl(value) {
  const parsed = new URL(String(value || '').trim());
  if (parsed.protocol !== 'https:') throw new Error('Public payment URLs must use HTTPS');
  return parsed.origin;
}

function paymentPublicConfig() {
  return {
    provider: 'paymob',
    configured: paymob.isConfigured(),
    checkoutMode: 'redirect',
  };
}

router.get('/config', (_req, res) => {
  return res.json(paymentPublicConfig());
});

router.post('/course/:slug/checkout', protect, authorize('student'), async (req, res) => {
  let payment = null;

  try {
    if (!paymob.isConfigured()) {
      return res.status(503).json({
        error: 'Online payment is not configured yet',
        code: 'PAYMENT_PROVIDER_NOT_CONFIGURED',
      });
    }

    const course = await Course.findOne({
      slug: req.params.slug,
      status: 'published',
    });

    if (!course) return res.status(404).json({ error: 'Course not found' });

    if (Number(course.price || 0) <= 0) {
      return res.status(400).json({
        error: 'This course does not require payment',
        code: 'FREE_COURSE_USE_ENROLLMENT',
      });
    }

    const Enrollment = require('../models/Enrollment');
    const existingEnrollment = await Enrollment.findOne({
      student: req.user.id,
      course: course._id,
    }).select('_id status');

    if (existingEnrollment) {
      return res.status(409).json({
        error: 'Already enrolled in this course',
        code: 'ALREADY_ENROLLED',
      });
    }

    const user = await User.findById(req.user.id)
      .select('name email phone whatsappPhone');

    if (!user) return res.status(404).json({ error: 'User not found' });

    const phone = String(user.phone || user.whatsappPhone || '').trim();
    if (!phone) {
      return res.status(400).json({
        error: 'A phone number is required before online payment',
        code: 'PAYMENT_PROFILE_INCOMPLETE',
      });
    }

    const currency = normalizeCurrency(course.currency || 'USD');
    const amountMinor = toMinorUnits(course.price, currency);

    payment = await Payment.create({
      kind: 'course_enrollment',
      provider: 'paymob',
      idempotencyKey: `paymob:${crypto.randomUUID()}`,
      student: user._id,
      course: course._id,
      amountMinor,
      currency,
      status: 'created',
    });

    const apiBase = cleanBaseUrl(process.env.API_PUBLIC_URL);
    const frontendBase = cleanBaseUrl(process.env.FRONTEND_URL);
    const locale = SUPPORTED_LOCALES.has(String(req.body?.locale || ''))
      ? String(req.body.locale)
      : 'ar';

    const redirect = new URL(`/${locale}/payment/return`, frontendBase);
    redirect.searchParams.set('payment', String(payment._id));
    redirect.searchParams.set('course', course.slug);

    const { firstName, lastName } = paymob.splitCustomerName(user.name);
    const title = String(course.title?.en || course.title?.ar || course.slug).slice(0, 120);

    const intention = await paymob.createIntention({
      amountMinor,
      currency,
      specialReference: String(payment._id),
      customer: {
        firstName,
        lastName,
        email: user.email,
        phone,
        country: 'EGY',
      },
      items: [{
        name: title,
        amount: amountMinor,
        description: `Wahy Wa Namaa course: ${course.slug}`,
        quantity: 1,
      }],
      notificationUrl: `${apiBase}/api/payments/paymob/webhook`,
      redirectionUrl: redirect.toString(),
    });

    payment.providerReference = intention.id;
    payment.providerOrderId = intention.orderId;
    payment.status = 'pending';
    await payment.save();

    return res.status(201).json({
      paymentId: String(payment._id),
      checkoutUrl: intention.checkoutUrl,
      provider: 'paymob',
    });
  } catch (error) {
    if (payment && payment.status === 'created') {
      payment.status = 'failed';
      payment.failedAt = new Date();
      payment.failureCode = error.code || 'PAYMENT_PROVIDER_ERROR';
      await payment.save().catch(() => {});
    }

    if (error.code === 'PAYMENT_PROVIDER_NOT_CONFIGURED') {
      return res.status(503).json({ error: error.message, code: error.code });
    }

    if (error.code === 'PAYMENT_PROVIDER_TIMEOUT' || error.code === 'PAYMENT_PROVIDER_ERROR') {
      return res.status(502).json({
        error: 'Payment provider is temporarily unavailable',
        code: error.code,
      });
    }

    console.error('Paymob checkout creation failed:', error.message);
    return res.status(400).json({
      error: 'Unable to start payment',
      code: 'PAYMENT_CHECKOUT_FAILED',
    });
  }
});

router.post('/paymob/webhook', async (req, res) => {
  try {
    if (!paymob.isConfigured()) {
      return res.status(404).json({ error: 'Route not found' });
    }

    const obj = req.body?.obj;
    const receivedHmac = String(req.query?.hmac || '');

    if (!obj || !paymob.verifyTransactionPostHmac(obj, receivedHmac)) {
      return res.status(401).json({
        error: 'Invalid payment callback signature',
        code: 'INVALID_PAYMENT_HMAC',
      });
    }

    const payloadHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(req.body || {}))
      .digest('hex');

    const merchantReference = String(obj.order?.merchant_order_id || '');
    const classification = paymob.classifyTransaction(obj);

    const result = await processPaymobWebhook({
      eventId: String(obj.id),
      eventType: String(req.body?.type || 'TRANSACTION'),
      payloadHash,
      merchantReference,
      providerOrderId: String(obj.order?.id || ''),
      amountMinor: Number(obj.amount_cents),
      currency: String(obj.currency || '').toUpperCase(),
      classification,
      transactionId: String(obj.id),
    });

    if (result?.enrollmentCreated && result.studentId && result.courseId) {
      const course = await Course.findById(result.courseId).select('title slug').lean();
      if (course) {
        notifyCourseEnrollment(result.studentId, course).catch(() => {});
      }
    }

    return res.status(200).json({
      received: true,
      processed: Boolean(result?.processed),
      duplicate: Boolean(result?.duplicate),
    });
  } catch (error) {
    console.error('Paymob webhook persistence failed:', error.message);
    return res.status(503).json({
      error: 'Payment callback persistence failed',
      code: 'PAYMENT_WEBHOOK_PERSISTENCE_FAILED',
    });
  }
});

router.get('/:id/status', protect, authorize('student', 'admin'), async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('course', 'slug title')
      .select('kind provider student course amountMinor currency status createdAt updatedAt settledAt failedAt cancelledAt refundedAt');

    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    if (
      req.user.role !== 'admin'
      && String(payment.student || '') !== String(req.user.id)
    ) {
      return res.status(403).json({ error: 'Not authorized to view this payment' });
    }

    return res.json({
      payment: {
        id: String(payment._id),
        kind: payment.kind,
        provider: payment.provider,
        status: payment.status,
        amountMinor: payment.amountMinor,
        currency: payment.currency,
        course: payment.course ? {
          id: String(payment.course._id),
          slug: payment.course.slug,
          title: payment.course.title,
        } : null,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        settledAt: payment.settledAt || null,
      },
    });
  } catch (error) {
    return res.status(400).json({ error: 'Unable to read payment status' });
  }
});

module.exports = router;
