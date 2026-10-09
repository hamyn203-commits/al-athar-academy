const express = require('express');
const router = express.Router();

const StudentSubscription = require('../models/StudentSubscription');
const { protect, authorize } = require('../middleware/auth');
const {
  isSection,
  publicPlanCatalog,
  quoteSubscription,
} = require('../config/subscriptionPlans');

function serializeSubscription(subscription) {
  const value = typeof subscription?.toObject === 'function'
    ? subscription.toObject()
    : subscription;

  if (!value) return null;

  return {
    _id: value._id,
    planKey: value.planKey,
    section: value.section,
    sessionCount: value.sessionCount,
    sessionsUsed: value.sessionsUsed,
    sessionsRemaining: value.sessionsRemaining,
    currency: value.currency,
    pricePerSessionMinor: value.pricePerSessionMinor,
    totalAmountMinor: value.totalAmountMinor,
    status: value.status,
    circle: value.circle || null,
    pricingSnapshot: value.pricingSnapshot,
    selectedAt: value.selectedAt,
    startedAt: value.startedAt || null,
    completedAt: value.completedAt || null,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

router.get('/plans', (_req, res) => {
  return res.json({
    success: true,
    ...publicPlanCatalog(),
  });
});

router.get('/me', protect, authorize('student'), async (req, res) => {
  try {
    const subscriptions = await StudentSubscription.find({ student: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return res.json({
      success: true,
      subscriptions: subscriptions.map(serializeSubscription),
    });
  } catch (error) {
    return res.status(500).json({ error: 'فشل جلب الاشتراكات', details: error.message });
  }
});

router.post('/select', protect, authorize('student'), async (req, res) => {
  try {
    const planKey = String(req.body.planKey || '').trim();
    const section = String(req.body.section || '').trim();
    const sessionCount = Number(req.body.sessionCount);

    if (!isSection(section)) {
      return res.status(400).json({
        error: 'القسم غير متاح',
        code: 'SUBSCRIPTION_SECTION_INVALID',
      });
    }

    let quote;
    try {
      quote = quoteSubscription({ planKey, sessionCount });
    } catch (error) {
      return res.status(400).json({
        error: error.message,
        code: error.code || 'SUBSCRIPTION_SELECTION_INVALID',
      });
    }

    const { plan } = quote;
    const update = {
      planKey: plan.key,
      section,
      sessionCount: quote.sessionCount,
      sessionsUsed: 0,
      sessionsRemaining: quote.sessionCount,
      currency: quote.currency,
      pricePerSessionMinor: quote.pricePerSessionMinor,
      totalAmountMinor: quote.totalAmountMinor,
      status: 'pending_payment',
      circle: null,
      payment: null,
      pricingSnapshot: {
        minStudents: plan.minStudents,
        maxStudents: plan.maxStudents,
        durationMinMinutes: plan.durationMinMinutes,
        durationMaxMinutes: plan.durationMaxMinutes,
        nameAr: plan.name.ar,
        nameEn: plan.name.en,
        durationLabelAr: plan.durationLabel.ar,
        durationLabelEn: plan.durationLabel.en,
      },
      selectedAt: new Date(),
      startedAt: null,
      completedAt: null,
    };

    const subscription = await StudentSubscription.findOneAndUpdate(
      { student: req.user.id, status: 'pending_payment' },
      { $set: update, $setOnInsert: { student: req.user.id } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json({
      success: true,
      message: 'تم حفظ اختيار الباقة. لن يتم الخصم قبل إتمام خطوة الدفع.',
      checkoutReady: false,
      subscription: serializeSubscription(subscription),
    });
  } catch (error) {
    return res.status(500).json({ error: 'فشل حفظ اختيار الاشتراك', details: error.message });
  }
});

module.exports = router;
