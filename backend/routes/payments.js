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
const manualPayments = require('../config/manualPayments');
const objectStorage = require('../services/objectStorage');
const { processPaymobWebhook } = require('../services/paymentSettlement');
const { processManualPaymentReview } = require('../services/manualPaymentSettlement');
const { notifyCourseEnrollment, notifyRole, notifyUser } = require('../utils/notify');

const SUPPORTED_LOCALES = new Set(['ar', 'en', 'fr', 'de', 'tr', 'ur', 'id', 'ms', 'ku']);

function cleanBaseUrl(value) {
  const parsed = new URL(String(value || '').trim());
  if (parsed.protocol !== 'https:') throw new Error('Public payment URLs must use HTTPS');
  return parsed.origin;
}

function paymentPublicConfig() {
  return {
    ...manualPayments.getPublicConfig(),
    paymobAvailable: paymob.isConfigured(),
  };
}

function cleanText(value, max = 180) {
  return String(value || '').trim().slice(0, max);
}

async function streamPrivateProof(reference, res) {
  const pathname = objectStorage.extractPathname(reference);
  if (!objectStorage.isSafeObjectPath(pathname) || !pathname.startsWith('uploads/payment-proof/')) {
    return res.status(404).json({ error: 'Payment proof not found' });
  }

  if (objectStorage.getDriver() === 'vercel-blob' && !objectStorage.isVercelBlobReference(reference)) {
    return res.status(404).json({ error: 'Payment proof not found' });
  }

  const result = await objectStorage.getPrivateObject(reference);
  if (!result) return res.status(404).json({ error: 'Payment proof not found' });

  res.setHeader('Content-Type', result.blob?.contentType || 'application/octet-stream');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'private, no-store');

  if (result.stream?.pipe) {
    result.stream.pipe(res);
    return undefined;
  }

  const reader = result.stream?.getReader?.();
  if (!reader) return res.status(500).end();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(Buffer.from(value));
  }
  return res.end();
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

router.post('/course/:slug/manual', protect, authorize('student'), async (req, res) => {
  try {
    if (!manualPayments.isConfigured()) {
      return res.status(503).json({
        error: 'Manual payment is not configured yet',
        code: 'MANUAL_PAYMENT_NOT_CONFIGURED',
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

    const existingPending = await Payment.findOne({
      kind: 'course_enrollment',
      provider: 'manual',
      student: req.user.id,
      course: course._id,
      status: 'pending',
    }).select('_id');

    if (existingPending) {
      return res.status(409).json({
        error: 'A transfer is already waiting for review',
        code: 'PAYMENT_REVIEW_PENDING',
        paymentId: String(existingPending._id),
      });
    }

    const method = manualPayments.getMethod(req.body?.method);
    if (!method) {
      return res.status(400).json({
        error: 'Unsupported manual payment method',
        code: 'INVALID_PAYMENT_METHOD',
      });
    }

    const proofReference = cleanText(req.body?.proofReference, 2048);
    if (!proofReference || !objectStorage.isOwnedObjectReference(
      proofReference,
      'payment-proof',
      req.user.id
    )) {
      return res.status(400).json({
        error: 'A valid owned payment proof is required',
        code: 'INVALID_PAYMENT_PROOF',
      });
    }

    const currency = normalizeCurrency(course.currency || 'EGP');
    const amountMinor = toMinorUnits(course.price, currency);

    const payment = await Payment.create({
      kind: 'course_enrollment',
      provider: 'manual',
      idempotencyKey: `manual:${crypto.randomUUID()}`,
      student: req.user.id,
      course: course._id,
      amountMinor,
      currency,
      status: 'pending',
      manual: {
        method: method.id,
        transferReference: cleanText(req.body?.transferReference, 160) || undefined,
        proofReference,
        proofFilename: cleanText(req.body?.proofFilename, 180) || undefined,
        proofContentType: cleanText(req.body?.proofContentType, 100) || undefined,
        proofSize: Number.isFinite(Number(req.body?.proofSize))
          ? Math.max(1, Math.min(Number(req.body.proofSize), 10 * 1024 * 1024))
          : undefined,
        submittedAt: new Date(),
      },
    });

    notifyRole('admin', {
      type: 'payment-received',
      title: { ar: 'إثبات دفع جديد يحتاج مراجعة', en: 'New payment proof requires review' },
      message: {
        ar: 'تم رفع إثبات دفع يدوي جديد ويحتاج تأكيد الإدارة.',
        en: 'A new manual payment proof was submitted and requires admin confirmation.',
      },
      data: {
        actionUrl: '/admin/payments',
        metadata: { paymentId: payment._id },
      },
      priority: 'urgent',
    }).catch((error) => console.warn('Admin payment notification:', error.message));

    return res.status(201).json({
      paymentId: String(payment._id),
      provider: 'manual',
      status: payment.status,
      reviewRequired: true,
    });
  } catch (error) {
    console.error('Manual payment submission failed:', error.message);
    return res.status(400).json({
      error: 'Unable to submit manual payment',
      code: 'MANUAL_PAYMENT_SUBMISSION_FAILED',
    });
  }
});

router.get('/admin/manual', protect, authorize('admin'), async (req, res) => {
  try {
    const requestedStatus = String(req.query.status || 'pending').trim().toLowerCase();
    const allowedStatuses = new Set(['pending', 'succeeded', 'failed', 'all']);
    const status = allowedStatuses.has(requestedStatus) ? requestedStatus : 'pending';

    const query = {
      provider: 'manual',
      kind: 'course_enrollment',
    };
    if (status !== 'all') query.status = status;

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('student', 'name email phone whatsappPhone')
      .populate('course', 'title slug price currency')
      .populate('manual.reviewedBy', 'name email')
      .select('+manual.proofReference');

    return res.json({
      payments: payments.map((payment) => ({
        id: String(payment._id),
        status: payment.status,
        amountMinor: payment.amountMinor,
        currency: payment.currency,
        provider: payment.provider,
        createdAt: payment.createdAt,
        settledAt: payment.settledAt || null,
        failedAt: payment.failedAt || null,
        student: payment.student,
        course: payment.course,
        proofAvailable: Boolean(payment.manual?.proofReference),
        manual: {
          method: payment.manual?.method || null,
          transferReference: payment.manual?.transferReference || null,
          submittedAt: payment.manual?.submittedAt || null,
          reviewedAt: payment.manual?.reviewedAt || null,
          reviewedBy: payment.manual?.reviewedBy || null,
          reviewAction: payment.manual?.reviewAction || null,
          reviewNote: payment.manual?.reviewNote || '',
        },
      })),
    });
  } catch (error) {
    console.error('Manual payment admin list failed:', error.message);
    return res.status(400).json({ error: 'Unable to load manual payments' });
  }
});

router.get('/admin/manual/:id/proof', protect, authorize('admin'), async (req, res) => {
  try {
    const payment = await Payment.findOne({
      _id: req.params.id,
      provider: 'manual',
    }).select('+manual.proofReference');

    if (!payment?.manual?.proofReference) {
      return res.status(404).json({ error: 'Payment proof not found' });
    }

    return await streamPrivateProof(payment.manual.proofReference, res);
  } catch (error) {
    console.error('Manual payment proof read failed:', error.message);
    return res.status(404).json({ error: 'Payment proof not found' });
  }
});

router.patch('/admin/manual/:id/review', protect, authorize('admin'), async (req, res) => {
  try {
    const result = await processManualPaymentReview({
      paymentId: req.params.id,
      adminId: req.user.id,
      action: req.body?.action,
      note: req.body?.note,
    });

    if (result?.enrollmentCreated && result.studentId && result.courseId) {
      const course = await Course.findById(result.courseId).select('title slug').lean();
      if (course) notifyCourseEnrollment(result.studentId, course).catch(() => {});
    } else if (result?.studentId) {
      notifyUser(result.studentId, {
        type: 'system',
        title: { ar: 'تمت مراجعة الدفع', en: 'Payment review completed' },
        message: {
          ar: result.paymentStatus === 'failed'
            ? 'لم يتم اعتماد عملية الدفع. راجع التفاصيل أو تواصل مع الإدارة.'
            : 'تم تحديث حالة عملية الدفع.',
          en: result.paymentStatus === 'failed'
            ? 'The payment was not approved. Review the details or contact support.'
            : 'Your payment status was updated.',
        },
        data: { actionUrl: '/student/dashboard' },
        priority: 'high',
      }).catch(() => {});
    }

    return res.json({
      ok: true,
      paymentId: result.paymentId,
      status: result.paymentStatus,
      enrollmentCreated: result.enrollmentCreated,
      enrollmentId: result.enrollmentId,
    });
  } catch (error) {
    if (error.code === 'PAYMENT_NOT_FOUND') {
      return res.status(404).json({ error: error.message, code: error.code });
    }
    if (error.code === 'PAYMENT_ALREADY_REVIEWED') {
      return res.status(409).json({ error: error.message, code: error.code });
    }
    if (error.code === 'INVALID_REVIEW_ACTION') {
      return res.status(400).json({ error: error.message, code: error.code });
    }

    console.error('Manual payment review failed:', error.message);
    return res.status(400).json({
      error: 'Unable to review manual payment',
      code: error.code || 'MANUAL_PAYMENT_REVIEW_FAILED',
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
      .select('kind provider student course amountMinor currency status manual createdAt updatedAt settledAt failedAt cancelledAt refundedAt');

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
        manualReview: payment.provider === 'manual' ? {
          method: payment.manual?.method || null,
          submittedAt: payment.manual?.submittedAt || null,
          reviewedAt: payment.manual?.reviewedAt || null,
          reviewAction: payment.manual?.reviewAction || null,
          reviewNote: payment.manual?.reviewNote || '',
        } : null,
      },
    });
  } catch (error) {
    return res.status(400).json({ error: 'Unable to read payment status' });
  }
});

module.exports = router;
