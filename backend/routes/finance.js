const express = require('express');
const router = express.Router();
const TeacherLedger = require('../models/TeacherLedger');
const Teacher = require('../models/Teacher');
const Session = require('../models/Session');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// Constants for academic financial rules (V7.6)
const STUDENT_RATE_EGP = 20; // 20 ج للمصريين لكل طالب في الحلقة
const STUDENT_RATE_USD = 1;  // 1$ للمغتربين لكل طالب في الحلقة
const MIN_PAYOUT_EGP = 100;  // الحد الأدنى للسحب بالجنيه المصري
const MIN_PAYOUT_USD = 10;   // الحد الأدنى للسحب بالدولار

const isMockMode = !process.env.MONGODB_URI;

/**
 * Helper: Calculate teacher balance across currencies
 */
async function calculateTeacherBalance(teacherId) {
  const teacher = await Teacher.findById(teacherId);
  if (!teacher) return null;

  const ledgerEntries = await TeacherLedger.find({ teacher: teacherId });

  const balances = {
    EGP: { available: 0, pending: 0, withdrawn: 0, totalEarned: 0 },
    USD: { available: 0, pending: 0, withdrawn: 0, totalEarned: 0 },
  };

  for (const entry of ledgerEntries) {
    const curr = entry.currency === 'USD' ? 'USD' : 'EGP';
    const amount = Number(entry.amount) || 0;

    if (entry.type === 'session_earning' || entry.type === 'bonus') {
      if (entry.status === 'completed') {
        balances[curr].totalEarned += amount;
      }
    } else if (entry.type === 'adjustment') {
      if (entry.status === 'completed') {
        balances[curr].totalEarned += amount;
      }
    } else if (entry.type === 'payout') {
      if (entry.status === 'pending' || entry.status === 'processing') {
        balances[curr].pending += amount;
      } else if (entry.status === 'completed') {
        balances[curr].withdrawn += amount;
      }
    }
  }

  // Backward compatibility with legacy earnings fields if ledger is empty for EGP
  if (balances.EGP.totalEarned === 0 && balances.EGP.withdrawn === 0 && teacher.earnings) {
    const legacyTotal = Number(teacher.earnings.totalEarned) || 0;
    const legacyPending = Number(teacher.earnings.pendingEarnings) || 0;
    const legacyWithdrawn = Number(teacher.earnings.withdrawnEarnings) || 0;
    if (legacyTotal > 0 || legacyPending > 0 || legacyWithdrawn > 0) {
      balances.EGP.totalEarned = legacyTotal + legacyPending;
      balances.EGP.withdrawn = legacyWithdrawn;
      balances.EGP.pending = 0;
    }
  }

  balances.EGP.available = Math.max(0, balances.EGP.totalEarned - balances.EGP.withdrawn - balances.EGP.pending);
  balances.USD.available = Math.max(0, balances.USD.totalEarned - balances.USD.withdrawn - balances.USD.pending);

  return balances;
}

/**
 * Helper: Determine if user/student is in Egyptian market
 */
function isEgyptianStudent(user) {
  if (!user) return false;
  const market = user.preferences?.market;
  const currency = user.preferences?.currency;
  const country = (user.personalInfo?.country || user.country || '').toLowerCase();
  return market === 'egypt' || currency === 'EGP' || country === 'eg' || country.includes('مصر') || country.includes('egypt');
}

// ==========================================
// 1. GET /api/finance/teacher/balance
// ==========================================
router.get('/teacher/balance', protect, authorize('teacher'), async (req, res) => {
  try {
    if (isMockMode) {
      return res.json({
        success: true,
        balances: {
          EGP: { available: 1200, pending: 200, withdrawn: 3400, totalEarned: 4800 },
          USD: { available: 45, pending: 0, withdrawn: 90, totalEarned: 135 },
        },
        limits: {
          minPayoutEGP: MIN_PAYOUT_EGP,
          minPayoutUSD: MIN_PAYOUT_USD,
        },
      });
    }

    const teacher = await Teacher.findOne({ user: req.user.id });
    if (!teacher) {
      return res.status(404).json({ error: 'لم يتم العثور على ملف المعلم' });
    }

    const balances = await calculateTeacherBalance(teacher._id);

    res.json({
      success: true,
      balances,
      limits: {
        minPayoutEGP: MIN_PAYOUT_EGP,
        minPayoutUSD: MIN_PAYOUT_USD,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 2. GET /api/finance/teacher/transactions
// ==========================================
router.get('/teacher/transactions', protect, authorize('teacher'), async (req, res) => {
  try {
    if (isMockMode) {
      return res.json({
        success: true,
        transactions: [
          {
            _id: 'mock-tx-1',
            type: 'session_earning',
            amount: 200,
            currency: 'EGP',
            attendeesCount: 10,
            status: 'completed',
            description: 'مستحقات حلقة جماعية مكتملة (10 طلاب)',
            createdAt: new Date().toISOString(),
          },
          {
            _id: 'mock-tx-2',
            type: 'payout',
            amount: 500,
            currency: 'EGP',
            payoutMethod: 'instapay',
            payoutDetails: { ipaAddress: 'teacher@instapay' },
            status: 'completed',
            referenceNumber: 'IPN-98421034',
            description: 'سحب أرباح عبر انستاباي',
            createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          },
        ],
        pagination: { total: 2, page: 1, limit: 20, totalPages: 1 },
      });
    }

    const teacher = await Teacher.findOne({ user: req.user.id });
    if (!teacher) {
      return res.status(404).json({ error: 'لم يتم العثور على ملف المعلم' });
    }

    const { type, currency, status, startDate, endDate } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = { teacher: teacher._id };

    if (type && type !== 'all') {
      filter.type = type;
    }
    if (currency && currency !== 'all') {
      filter.currency = currency.toUpperCase();
    }
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const [transactions, total] = await Promise.all([
      TeacherLedger.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('session', 'scheduledAt duration type')
        .lean(),
      TeacherLedger.countDocuments(filter),
    ]);

    res.json({
      success: true,
      transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 3. POST /api/finance/teacher/request-payout
// ==========================================
router.post('/teacher/request-payout', protect, authorize('teacher'), async (req, res) => {
  try {
    const { amount, currency = 'EGP', payoutMethod, payoutDetails, notes } = req.body;
    const numAmount = Number(amount);
    const curr = (currency || 'EGP').toUpperCase();

    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ error: 'يرجى إدخال مبلغ سحب صحيح' });
    }

    if (!['EGP', 'USD'].includes(curr)) {
      return res.status(400).json({ error: 'العملة يجب أن تكون EGP أو USD' });
    }

    const minAmount = curr === 'USD' ? MIN_PAYOUT_USD : MIN_PAYOUT_EGP;
    if (numAmount < minAmount) {
      return res.status(400).json({
        error: `الحد الأدنى لطلب السحب هو ${minAmount} ${curr === 'USD' ? 'دولار' : 'جنيه'}`,
      });
    }

    const validMethods = ['instapay', 'vodafone_cash', 'bank_transfer', 'paypal'];
    if (!payoutMethod || !validMethods.includes(payoutMethod)) {
      return res.status(400).json({
        error: 'يرجى اختيار وسيلة سحب صحيحة: instapay, vodafone_cash, bank_transfer, paypal',
      });
    }

    if (!payoutDetails || typeof payoutDetails !== 'object') {
      return res.status(400).json({ error: 'يرجى إدخال تفاصيل وسيلة السحب' });
    }

    // Specific validations per payout method
    if (payoutMethod === 'instapay') {
      if (!payoutDetails.ipaAddress && !payoutDetails.phone) {
        return res.status(400).json({ error: 'يرجى إدخال عنوان انستاباي (IPA) أو رقم الهاتف المرتبط بـ InstaPay' });
      }
    } else if (payoutMethod === 'vodafone_cash') {
      if (!payoutDetails.phone || !/^(010|011|012|015)[0-9]{8}$/.test(payoutDetails.phone.replace(/\s+/g, ''))) {
        return res.status(400).json({ error: 'يرجى إدخال رقم محفظة إلكترونية صحيح مكون من 11 رقماً' });
      }
    } else if (payoutMethod === 'bank_transfer') {
      if (!payoutDetails.bankAccountNumber || !payoutDetails.bankName) {
        return res.status(400).json({ error: 'يرجى إدخال اسم البنك ورقم الحساب البنكي / IBAN' });
      }
    } else if (payoutMethod === 'paypal') {
      if (!payoutDetails.paypalEmail || !/^\S+@\S+\.\S+$/.test(payoutDetails.paypalEmail)) {
        return res.status(400).json({ error: 'يرجى إدخال بريد إلكتروني صالح لحساب PayPal' });
      }
    }

    if (isMockMode) {
      return res.status(201).json({
        success: true,
        message: 'تم تقديم طلب سحب الأرباح بنجاح وجارٍ مراجعته من قِبل الإدارة',
        transaction: {
          _id: `mock-payout-${Date.now()}`,
          type: 'payout',
          amount: numAmount,
          currency: curr,
          payoutMethod,
          payoutDetails,
          status: 'pending',
          notes: notes || '',
          description: `طلب سحب أرباح بقيمة ${numAmount} ${curr} عبر ${payoutMethod}`,
          createdAt: new Date().toISOString(),
        },
      });
    }

    const teacher = await Teacher.findOne({ user: req.user.id });
    if (!teacher) {
      return res.status(404).json({ error: 'لم يتم العثور على ملف المعلم' });
    }

    // Verify sufficient available balance
    const balances = await calculateTeacherBalance(teacher._id);
    const available = balances[curr]?.available || 0;

    if (numAmount > available) {
      return res.status(400).json({
        error: `الرصيد المتاح للسحب غير كافٍ. رصيدك الحالي: ${available} ${curr}`,
      });
    }

    const transaction = await TeacherLedger.create({
      teacher: teacher._id,
      type: 'payout',
      amount: numAmount,
      currency: curr,
      payoutMethod,
      payoutDetails: {
        phone: payoutDetails.phone?.trim(),
        ipaAddress: payoutDetails.ipaAddress?.trim(),
        bankAccountNumber: payoutDetails.bankAccountNumber?.trim(),
        bankName: payoutDetails.bankName?.trim(),
        accountHolderName: payoutDetails.accountHolderName?.trim(),
        paypalEmail: payoutDetails.paypalEmail?.trim().toLowerCase(),
      },
      status: 'pending',
      notes: notes || '',
      description: `طلب سحب أرباح بقيمة ${numAmount} ${curr} عبر ${payoutMethod}`,
    });

    res.status(201).json({
      success: true,
      message: 'تم تقديم طلب سحب الأرباح بنجاح وجارٍ مراجعته من قِبل الإدارة',
      transaction,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==========================================
// 4. GET /api/finance/admin/overview
// ==========================================
router.get('/admin/overview', protect, authorize('admin'), async (req, res) => {
  try {
    if (isMockMode) {
      return res.json({
        success: true,
        rates: {
          egyptianStudentSessionRateEGP: STUDENT_RATE_EGP,
          expatriateStudentSessionRateUSD: STUDENT_RATE_USD,
        },
        studentsBreakdown: {
          egyptianAttendees: 350,
          expatriateAttendees: 120,
          totalCompletedSessions: 47,
        },
        revenue: {
          EGP: 350 * STUDENT_RATE_EGP, // 7000 EGP
          USD: 120 * STUDENT_RATE_USD, // 120 USD
        },
        teacherDues: {
          EGP: { totalEarned: 4500, withdrawn: 3000, pendingPayouts: 500, availableLiability: 1000 },
          USD: { totalEarned: 80, withdrawn: 50, pendingPayouts: 10, availableLiability: 20 },
        },
        netIncome: {
          EGP: (350 * STUDENT_RATE_EGP) - 4500, // 2500 EGP
          USD: (120 * STUDENT_RATE_USD) - 80,   // 40 USD
        },
        pendingPayoutsCount: 2,
        processingPayoutsCount: 1,
      });
    }

    // 1. Fetch completed sessions and calculate student attendees by origin
    const completedSessions = await Session.find({ status: 'completed' })
      .populate({ path: 'attendance.student', select: 'preferences personalInfo country' })
      .populate({ path: 'student', select: 'preferences personalInfo country' })
      .lean();

    let egyptianAttendees = 0;
    let expatriateAttendees = 0;

    for (const session of completedSessions) {
      if (Array.isArray(session.attendance) && session.attendance.length > 0) {
        for (const record of session.attendance) {
          if (record.status === 'attended' || (!record.status && record.student)) {
            if (isEgyptianStudent(record.student)) {
              egyptianAttendees++;
            } else {
              expatriateAttendees++;
            }
          }
        }
      } else if (session.student) {
        // Individual 1-on-1 session
        if (isEgyptianStudent(session.student)) {
          egyptianAttendees++;
        } else {
          expatriateAttendees++;
        }
      }
    }

    // Total gross revenue derived from student pricing rules
    const grossRevenueEGP = egyptianAttendees * STUDENT_RATE_EGP;
    const grossRevenueUSD = expatriateAttendees * STUDENT_RATE_USD;

    // 2. Aggregate TeacherLedger data for dues and payouts
    const ledgerAgg = await TeacherLedger.aggregate([
      {
        $group: {
          _id: { currency: '$currency', type: '$type', status: '$status' },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const teacherDues = {
      EGP: { totalEarned: 0, withdrawn: 0, pendingPayouts: 0, availableLiability: 0 },
      USD: { totalEarned: 0, withdrawn: 0, pendingPayouts: 0, availableLiability: 0 },
    };

    let pendingPayoutsCount = 0;
    let processingPayoutsCount = 0;

    for (const item of ledgerAgg) {
      const curr = item._id.currency === 'USD' ? 'USD' : 'EGP';
      const type = item._id.type;
      const status = item._id.status;
      const amount = item.totalAmount || 0;

      if (type === 'session_earning' || type === 'bonus' || type === 'adjustment') {
        if (status === 'completed') {
          teacherDues[curr].totalEarned += amount;
        }
      } else if (type === 'payout') {
        if (status === 'completed') {
          teacherDues[curr].withdrawn += amount;
        } else if (status === 'pending' || status === 'processing') {
          teacherDues[curr].pendingPayouts += amount;
          if (status === 'pending') pendingPayoutsCount += item.count;
          if (status === 'processing') processingPayoutsCount += item.count;
        }
      }
    }

    teacherDues.EGP.availableLiability = Math.max(0, teacherDues.EGP.totalEarned - teacherDues.EGP.withdrawn - teacherDues.EGP.pendingPayouts);
    teacherDues.USD.availableLiability = Math.max(0, teacherDues.USD.totalEarned - teacherDues.USD.withdrawn - teacherDues.USD.pendingPayouts);

    // 3. Net academy income
    const netIncomeEGP = grossRevenueEGP - teacherDues.EGP.totalEarned;
    const netIncomeUSD = grossRevenueUSD - teacherDues.USD.totalEarned;

    // 4. Fetch recent payout requests for fast admin action
    const recentPayoutRequests = await TeacherLedger.find({ type: 'payout', status: { $in: ['pending', 'processing'] } })
      .populate({ path: 'teacher', populate: { path: 'user', select: 'name email phone' } })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      rates: {
        egyptianStudentSessionRateEGP: STUDENT_RATE_EGP,
        expatriateStudentSessionRateUSD: STUDENT_RATE_USD,
      },
      studentsBreakdown: {
        egyptianAttendees,
        expatriateAttendees,
        totalCompletedSessions: completedSessions.length,
      },
      revenue: {
        EGP: grossRevenueEGP,
        USD: grossRevenueUSD,
      },
      teacherDues,
      netIncome: {
        EGP: netIncomeEGP,
        USD: netIncomeUSD,
      },
      pendingPayoutsCount,
      processingPayoutsCount,
      recentPayoutRequests,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 5. PUT /api/finance/admin/payouts/:id/process
// ==========================================
router.put('/admin/payouts/:id/process', protect, authorize('admin'), async (req, res) => {
  try {
    const { action, status, referenceNumber, receiptUrl, notes } = req.body;
    const targetStatus = status || (action === 'approve' ? 'completed' : action === 'reject' ? 'rejected' : action === 'processing' ? 'processing' : null);

    if (!targetStatus || !['processing', 'completed', 'rejected'].includes(targetStatus)) {
      return res.status(400).json({
        error: 'الحالة المستهدفة غير صحيحة. يجب أن تكون: processing, completed, rejected أو action: approve, reject, processing',
      });
    }

    if (isMockMode) {
      return res.json({
        success: true,
        message: 'تمت معالجة وتحديث طلب السحب بنجاح',
        payout: {
          _id: req.params.id,
          status: targetStatus,
          referenceNumber: referenceNumber || 'MOCK-REF-12345',
          receiptUrl: receiptUrl || '',
          notes: notes || '',
          processedAt: new Date().toISOString(),
        },
      });
    }

    const payout = await TeacherLedger.findById(req.params.id).populate('teacher');
    if (!payout) {
      return res.status(404).json({ error: 'لم يتم العثور على سجل المعاملة' });
    }

    if (payout.type !== 'payout') {
      return res.status(400).json({ error: 'هذه المعاملة ليست طلب سحب أرباح' });
    }

    if (payout.status === 'completed') {
      return res.status(400).json({ error: 'تم تحويل وسداد هذا الطلب مسبقاً' });
    }

    payout.status = targetStatus;
    if (referenceNumber !== undefined) payout.referenceNumber = referenceNumber.trim();
    if (receiptUrl !== undefined) payout.receiptUrl = receiptUrl.trim();
    if (notes !== undefined) payout.notes = notes.trim();

    payout.processedBy = req.user.id;
    payout.processedAt = new Date();

    await payout.save();

    // Sync legacy withdrawnEarnings on Teacher document for backwards compatibility
    if (targetStatus === 'completed' && payout.teacher && payout.currency === 'EGP') {
      await Teacher.findByIdAndUpdate(payout.teacher._id, {
        $inc: { 'earnings.withdrawnEarnings': payout.amount },
      });
    }

    res.json({
      success: true,
      message: 'تمت معالجة وتحديث طلب السحب بنجاح',
      payout,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==========================================
// 6. Helper: Credit session earning to TeacherLedger
// ==========================================
async function recordSessionEarning({ sessionId, teacherId, amount, currency = 'EGP', attendeesCount = 0, notes = '' }) {
  return await TeacherLedger.create({
    teacher: teacherId,
    session: sessionId,
    type: 'session_earning',
    amount,
    currency,
    attendeesCount,
    status: 'completed',
    notes,
    description: `مستحقات حلقة تعليمية (${attendeesCount} طلاب) - ${amount} ${currency}`,
  });
}

module.exports = router;
module.exports.calculateTeacherBalance = calculateTeacherBalance;
module.exports.recordSessionEarning = recordSessionEarning;
