const express = require('express');
const router = express.Router();

const StudentSubscription = require('../models/StudentSubscription');
const GroupCircle = require('../models/GroupCircle');
const Teacher = require('../models/Teacher');
const { protect, authorize } = require('../middleware/auth');
const { placeSubscription } = require('../services/subscriptionPlacement');
const { logAdminAction } = require('../services/adminAudit');
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
    payment: value.payment || null,
    preferredTeacher: value.preferredTeacher || null,
    pricingSnapshot: value.pricingSnapshot,
    selectedAt: value.selectedAt,
    paidAt: value.paidAt || null,
    placedAt: value.placedAt || null,
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

    const existingOpen = await StudentSubscription.findOne({
      student: req.user.id,
      status: { $in: ['payment_review', 'awaiting_placement', 'placed', 'active', 'paused'] },
    }).select('_id status');

    if (existingOpen) {
      return res.status(409).json({
        error: 'لديك اشتراك قائم بالفعل. أكمل مراجعته أو تسكينه قبل إنشاء اشتراك جديد.',
        code: 'SUBSCRIPTION_ALREADY_OPEN',
        subscriptionId: String(existingOpen._id),
        status: existingOpen.status,
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
      preferredTeacher: null,
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


router.get('/admin/placements', protect, authorize('admin'), async (req, res) => {
  try {
    const requestedStatus = String(req.query.status || 'awaiting_placement').trim();
    const allowedStatuses = new Set(['awaiting_placement', 'placed', 'active', 'all']);
    const status = allowedStatuses.has(requestedStatus) ? requestedStatus : 'awaiting_placement';
    const filter = status === 'all'
      ? { status: { $in: ['awaiting_placement', 'placed', 'active'] } }
      : { status };

    const subscriptions = await StudentSubscription.find(filter)
      .sort({ paidAt: 1, createdAt: 1 })
      .limit(100)
      .populate('student', 'name email phone gender age preferredTrack currentLevel')
      .populate({
        path: 'preferredTeacher',
        select: 'personalInfo user status isVerified',
        populate: { path: 'user', select: 'name email avatar' },
      })
      .populate('circle', 'name code status capacity students schedule timezone subscriptionPlanKey teacher')
      .lean();

    const teacherIds = subscriptions
      .map((item) => item.preferredTeacher?._id)
      .filter(Boolean);

    const circles = teacherIds.length
      ? await GroupCircle.find({
          teacher: { $in: teacherIds },
          status: { $nin: ['completed', 'paused'] },
        })
        .select('name code status capacity students schedule timezone subscriptionPlanKey teacher')
        .lean()
      : [];

    const rows = subscriptions.map((subscription) => {
      const compatibleCircles = circles
        .filter((circle) => (
          String(circle.teacher) === String(subscription.preferredTeacher?._id || '')
          && circle.subscriptionPlanKey === subscription.planKey
          && (circle.students || []).length < Number(circle.capacity || 0)
        ))
        .map((circle) => ({
          _id: circle._id,
          name: circle.name,
          code: circle.code,
          status: circle.status,
          capacity: circle.capacity,
          currentCount: (circle.students || []).length,
          availableSeats: Math.max(0, Number(circle.capacity || 0) - (circle.students || []).length),
          schedule: circle.schedule || [],
          timezone: circle.timezone,
        }));

      return {
        ...serializeSubscription(subscription),
        student: subscription.student,
        preferredTeacher: subscription.preferredTeacher,
        compatibleCircles,
      };
    });

    return res.json({ subscriptions: rows });
  } catch (error) {
    return res.status(500).json({ error: 'فشل تحميل طلبات التسكين', details: error.message });
  }
});

router.post('/admin/:id/place', protect, authorize('admin'), async (req, res) => {
  try {
    const result = await placeSubscription({
      subscriptionId: req.params.id,
      existingCircleId: req.body?.existingCircleId,
      circleName: req.body?.circleName,
      schedule: req.body?.schedule,
      timezone: req.body?.timezone,
    });

    await logAdminAction({
      req,
      action: 'subscription.placed',
      entityType: 'student-subscription',
      entityId: req.params.id,
      reason: 'تم تسكين الطالب في حلقة الاشتراك بعد اعتماد الدفع.',
      metadata: {
        circleId: result.circleId,
        teacherId: result.teacherId,
        circleStatus: result.circleStatus,
      },
    }).catch(() => {});

    return res.json({ success: true, ...result });
  } catch (error) {
    const statusByCode = {
      SUBSCRIPTION_NOT_FOUND: 404,
      STUDENT_NOT_FOUND: 404,
      PREFERRED_TEACHER_UNAVAILABLE: 409,
      SUBSCRIPTION_NOT_READY_FOR_PLACEMENT: 409,
      PREFERRED_TEACHER_REQUIRED: 409,
      CIRCLE_NOT_COMPATIBLE: 409,
      CIRCLE_FULL: 409,
      SUBSCRIPTION_PLAN_INVALID: 400,
    };
    return res.status(statusByCode[error.code] || 400).json({
      error: error.message || 'فشل تسكين الطالب',
      code: error.code || 'SUBSCRIPTION_PLACEMENT_FAILED',
    });
  }
});

router.get('/:id', protect, authorize('student', 'admin'), async (req, res) => {
  try {
    const subscription = await StudentSubscription.findById(req.params.id)
      .populate({
        path: 'preferredTeacher',
        select: 'personalInfo user rating status isVerified',
        populate: { path: 'user', select: 'name avatar' },
      })
      .populate('circle', 'name code status schedule timezone');

    if (!subscription) {
      return res.status(404).json({ error: 'الاشتراك غير موجود', code: 'SUBSCRIPTION_NOT_FOUND' });
    }

    if (req.user.role !== 'admin' && String(subscription.student) !== String(req.user.id)) {
      return res.status(403).json({ error: 'غير مصرح بعرض هذا الاشتراك' });
    }

    return res.json({ success: true, subscription: serializeSubscription(subscription) });
  } catch (error) {
    return res.status(400).json({ error: 'فشل جلب بيانات الاشتراك' });
  }
});

module.exports = router;
