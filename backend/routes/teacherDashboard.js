const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const Teacher = require('../models/Teacher');
const TeacherTask = require('../models/TeacherTask');
const WithdrawRequest = require('../models/WithdrawRequest');
const TeacherLedger = require('../models/TeacherLedger');
const { calculateTeacherBalance } = require('../services/teacherFinance');
const { protect, authorize } = require('../middleware/auth');
const { notifyAdmins } = require('../utils/notify');

const SESSION_RATE = 50;
const { isMockMode } = require('../config/runtime');

// Simple mock-mode fallbacks so the teacher dashboard works in local dev without DB.
if (isMockMode) {
  router.get('/profile', protect, authorize('teacher'), (req, res) => {
    const teacher = {
      _id: `mock-teacher-${req.user.id}`,
      personalInfo: { fullName: req.user.name || 'معلم تجريبي', phone: '', country: '' },
      academicInfo: {},
      earnings: { pendingEarnings: 0, totalEarned: 0, withdrawnEarnings: 0 },
      stats: { totalStudents: 0, totalHours: 0, totalSessions: 0 },
      rating: { average: 0, count: 0 },
      availability: [],
    };
    return res.json({ teacher, wallet: { sessionRate: SESSION_RATE, sessionDurationMinutes: 60, pendingEarnings: 0, totalEarned: 0, withdrawn: 0, completedSessions: 0 } });
  });

  router.get('/active-students', protect, authorize('teacher'), (req, res) => res.json({ students: [] }));
  router.get('/tasks', protect, authorize('teacher'), (req, res) => res.json({ tasks: [] }));
  router.post('/tasks', protect, authorize('teacher'), (req, res) => res.status(201).json({ success: true, task: { _id: `mock-task-${Date.now()}`, ...req.body } }));
  router.patch('/tasks/:id', protect, authorize('teacher'), (req, res) => res.json({ success: true, task: { _id: req.params.id, ...req.body } }));
  router.get('/stats', protect, authorize('teacher'), (req, res) => res.json({ totalStudents: 0, totalSessions: 0, totalHours: 0, pendingEarnings: 0, totalEarnings: 0, averageRating: 0, sessionRate: SESSION_RATE }));
  router.get('/students', protect, authorize('teacher'), (req, res) => res.json({ students: [] }));
  router.get('/analytics', protect, authorize('teacher'), (req, res) => res.json({ monthlySessions: [], totalCompleted: 0, averageRating: 0, totalStudents: 0, earnings: { daily: 0, weekly: 0, monthly: 0, pending: 0 } }));
  router.get('/withdrawals', protect, authorize('teacher'), (req, res) => res.json({ withdrawals: [], available: 0 }));
  router.post('/withdrawals', protect, authorize('teacher'), (req, res) => res.status(201).json({ success: true, withdrawal: { _id: `mock-withdraw-${Date.now()}`, amount: req.body.amount, method: req.body.method, accountInfo: req.body.accountInfo, status: 'pending' } }));
  router.get('/availability', protect, authorize('teacher'), (req, res) => res.json({ availability: [] }));
  router.put('/availability', protect, authorize('teacher'), (req, res) => res.json({ success: true, availability: req.body.availability || [] }));
  router.get('/reviews', protect, authorize('teacher'), (req, res) => res.json({ reviews: [], averageRating: 0, totalReviews: 0 }));
}

router.get('/profile', protect, authorize('teacher'), async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id })
      .populate('user', 'name email phone avatar');
    if (!teacher) return res.status(404).json({ error: 'Teacher profile not found' });

    res.json({
      teacher,
      wallet: {
        sessionRate: SESSION_RATE,
        sessionDurationMinutes: 60,
        pendingEarnings: teacher.earnings.pendingEarnings,
        totalEarned: teacher.earnings.totalEarned,
        withdrawn: teacher.earnings.withdrawnEarnings,
        completedSessions: teacher.stats.totalSessions,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/active-students', protect, authorize('teacher'), async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id });
    if (!teacher) return res.status(404).json({ error: 'Teacher profile not found' });

    const [sessions, tasks] = await Promise.all([
      Session.find({
        teacher: teacher._id,
        type: 'regular',
        status: { $in: ['accepted', 'completed'] },
      })
        .populate('student', 'name email avatar phone')
        .sort({ scheduledAt: -1 })
        .lean(),
      TeacherTask.find({ teacher: teacher._id })
        .select('student status dueDate updatedAt')
        .lean(),
    ]);

    const now = Date.now();
    const map = new Map();

    for (const session of sessions) {
      if (!session.student?._id) continue;
      const id = String(session.student._id);

      if (!map.has(id)) {
        map.set(id, {
          ...session.student,
          sessionCount: 0,
          completedSessions: 0,
          nextSession: null,
          lastSession: null,
          pendingHomework: 0,
          submittedHomework: 0,
          lastProgress: null,
        });
      }

      const record = map.get(id);
      record.sessionCount += 1;

      const at = new Date(session.scheduledAt).getTime();
      if (session.status === 'completed') {
        record.completedSessions += 1;
        if (!record.lastSession || at > new Date(record.lastSession.scheduledAt).getTime()) {
          record.lastSession = {
            _id: session._id,
            scheduledAt: session.scheduledAt,
            type: session.type,
          };
        }

        const latestReport = (session.studentReports || []).find(
          (report) => report.student && String(report.student) === id,
        );
        if (latestReport && (!record.lastProgress || at > new Date(record.lastProgress.scheduledAt).getTime())) {
          record.lastProgress = {
            scheduledAt: session.scheduledAt,
            memorizationScore: latestReport.memorizationScore,
            tajweedScore: latestReport.tajweedScore,
            surahRecited: latestReport.surahRecited,
            nextHomework: latestReport.nextHomework,
            notes: latestReport.notes,
          };
        }
      }

      if (session.status === 'accepted' && at >= now) {
        if (!record.nextSession || at < new Date(record.nextSession.scheduledAt).getTime()) {
          record.nextSession = {
            _id: session._id,
            scheduledAt: session.scheduledAt,
            type: session.type,
          };
        }
      }
    }

    for (const task of tasks) {
      const record = map.get(String(task.student));
      if (!record) continue;
      if (task.status === 'submitted') record.submittedHomework += 1;
      if (task.status === 'pending') record.pendingHomework += 1;
    }

    const students = [...map.values()].sort((a, b) => {
      const aNext = a.nextSession ? new Date(a.nextSession.scheduledAt).getTime() : Number.MAX_SAFE_INTEGER;
      const bNext = b.nextSession ? new Date(b.nextSession.scheduledAt).getTime() : Number.MAX_SAFE_INTEGER;
      return aNext - bNext || String(a.name || '').localeCompare(String(b.name || ''), 'ar');
    });

    return res.json({ students });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/students/:studentId/summary', protect, authorize('teacher'), async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id }).select('_id');
    if (!teacher) return res.status(404).json({ error: 'Teacher profile not found' });

    const relationship = await Session.findOne({
      teacher: teacher._id,
      student: req.params.studentId,
      status: { $in: ['accepted', 'completed'] },
    })
      .populate('student', 'name email avatar phone')
      .lean();

    if (!relationship?.student) {
      return res.status(403).json({ error: 'لا يمكنك فتح ملف طالب غير مرتبط بحصصك' });
    }

    const [sessions, tasks] = await Promise.all([
      Session.find({
        teacher: teacher._id,
        student: req.params.studentId,
        status: { $in: ['accepted', 'completed'] },
      })
        .select('type status scheduledAt duration teacherEvaluation studentReports')
        .sort({ scheduledAt: -1 })
        .limit(50)
        .lean(),
      TeacherTask.find({
        teacher: teacher._id,
        student: req.params.studentId,
      })
        .select('type title description dueDate status teacherFeedback reviewedAt createdAt updatedAt')
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
    ]);

    const studentId = String(req.params.studentId);
    const timeline = sessions.map((session) => ({
      _id: session._id,
      type: session.type,
      status: session.status,
      scheduledAt: session.scheduledAt,
      duration: session.duration,
      evaluation: session.teacherEvaluation || null,
      progressReport: (session.studentReports || []).find(
        (report) => report.student && String(report.student) === studentId,
      ) || null,
    }));

    return res.json({
      student: relationship.student,
      summary: {
        totalSessions: sessions.length,
        completedSessions: sessions.filter((session) => session.status === 'completed').length,
        upcomingSessions: sessions.filter((session) => (
          session.status === 'accepted' && new Date(session.scheduledAt) >= new Date()
        )).length,
        pendingHomework: tasks.filter((task) => task.status === 'pending').length,
        submittedHomework: tasks.filter((task) => task.status === 'submitted').length,
      },
      sessions: timeline,
      tasks,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/tasks', protect, authorize('teacher'), async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id });
    if (!teacher) return res.status(404).json({ error: 'Teacher profile not found' });

    const tasks = await TeacherTask.find({ teacher: teacher._id })
      .populate('student', 'name email avatar')
      .sort({ createdAt: -1 });
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/tasks', protect, authorize('teacher'), async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id });
    if (!teacher) return res.status(404).json({ error: 'Teacher profile not found' });

    const { studentId, sessionId, type, title, description, dueDate } = req.body;
    if (!studentId || !type || !title) {
      return res.status(400).json({ error: 'studentId, type, title مطلوبة' });
    }

    const relationship = await Session.findOne({
      teacher: teacher._id,
      student: studentId,
      status: { $in: ['accepted', 'completed'] },
    }).select('_id');

    if (!relationship) {
      return res.status(403).json({ error: 'لا يمكن تعيين واجب لطالب غير مرتبط بهذا المعلم' });
    }

    if (sessionId) {
      const ownedSession = await Session.findOne({
        _id: sessionId,
        teacher: teacher._id,
        student: studentId,
      }).select('_id');
      if (!ownedSession) {
        return res.status(403).json({ error: 'الحصة المحددة لا تخص هذا المعلم والطالب' });
      }
    }

    const task = await TeacherTask.create({
      teacher: teacher._id,
      student: studentId,
      session: sessionId || undefined,
      type,
      title,
      description: description || '',
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });
    res.status(201).json({ success: true, task });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.patch('/tasks/:id', protect, authorize('teacher'), async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id });
    if (!teacher) return res.status(404).json({ error: 'Teacher profile not found' });

    const task = await TeacherTask.findOneAndUpdate(
      { _id: req.params.id, teacher: teacher._id },
      { status: req.body.status },
      { new: true },
    );
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ success: true, task });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/stats', protect, authorize('teacher'), async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id });
    
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher profile not found' });
    }

    const totalSessions = await Session.countDocuments({ teacher: teacher._id });
    const completedSessions = await Session.countDocuments({ 
      teacher: teacher._id, 
      status: 'completed' 
    });

    const totalHours = Math.round(teacher.stats.totalHours);
    const totalEarnings = teacher.earnings.totalEarned + teacher.earnings.withdrawnEarnings;

    res.json({
      totalStudents: teacher.stats.totalStudents,
      totalSessions: completedSessions,
      totalHours,
      pendingEarnings: teacher.earnings.pendingEarnings,
      totalEarnings,
      averageRating: teacher.rating.average,
      sessionRate: SESSION_RATE,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/students', protect, authorize('teacher'), async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id });
    
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher profile not found' });
    }

    const sessions = await Session.find({ 
      teacher: teacher._id, 
      status: 'completed' 
    }).populate('student', 'name email avatar');

    const studentMap = {};
    sessions.forEach(session => {
      const studentId = session.student._id.toString();
      if (!studentMap[studentId]) {
        studentMap[studentId] = {
          _id: session.student._id,
          name: session.student.name,
          email: session.student.email,
          avatar: session.student.avatar,
          sessionCount: 0
        };
      }
      studentMap[studentId].sessionCount++;
    });

    const students = Object.values(studentMap);
    res.json({ students });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/analytics', protect, authorize('teacher'), async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id });
    if (!teacher) return res.status(404).json({ error: 'Teacher profile not found' });

    const now = new Date();
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const dayStart = new Date(now); dayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const sevenDaysAhead = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));

    const [allSessions, tasks, ledgerEntries, balances] = await Promise.all([
      Session.find({ teacher: teacher._id })
        .select('student type status scheduledAt updatedAt duration')
        .lean(),
      TeacherTask.find({ teacher: teacher._id }).select('status').lean(),
      TeacherLedger.find({
        teacher: teacher._id,
        type: 'session_earning',
        status: 'completed',
        createdAt: { $gte: sixMonthsAgo },
      }).select('amount currency createdAt').lean(),
      calculateTeacherBalance(teacher._id),
    ]);

    const recentCompleted = allSessions.filter((session) => (
      session.status === 'completed'
      && new Date(session.updatedAt || session.scheduledAt) >= sixMonthsAgo
    ));

    const monthly = {};
    for (const session of recentCompleted) {
      const date = new Date(session.updatedAt || session.scheduledAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthly[key] = (monthly[key] || 0) + 1;
    }

    const earnings = { daily: 0, weekly: 0, monthly: 0 };
    for (const entry of ledgerEntries) {
      if (entry.currency !== 'EGP') continue;
      const date = new Date(entry.createdAt);
      const amount = Number(entry.amount) || 0;
      if (date >= dayStart) earnings.daily += amount;
      if (date >= weekStart) earnings.weekly += amount;
      if (date >= monthStart) earnings.monthly += amount;
    }

    const completedTrials = allSessions.filter((session) => (
      session.type === 'trial' && session.status === 'completed' && session.student
    ));
    const trialStudentIds = new Set(completedTrials.map((session) => String(session.student)));
    const continuingStudentIds = new Set(
      allSessions
        .filter((session) => (
          session.type === 'regular'
          && ['accepted', 'completed'].includes(session.status)
          && session.student
        ))
        .map((session) => String(session.student)),
    );
    const convertedCount = [...trialStudentIds].filter((id) => continuingStudentIds.has(id)).length;
    const trialConversionRate = trialStudentIds.size
      ? Math.round((convertedCount / trialStudentIds.size) * 100)
      : 0;

    const completedTasks = tasks.filter((task) => task.status === 'done').length;
    const homeworkCompletionRate = tasks.length
      ? Math.round((completedTasks / tasks.length) * 100)
      : 0;

    const upcomingSevenDays = allSessions.filter((session) => {
      if (session.status !== 'accepted') return false;
      const scheduledAt = new Date(session.scheduledAt);
      return scheduledAt >= now && scheduledAt <= sevenDaysAhead;
    }).length;

    return res.json({
      monthlySessions: Object.entries(monthly)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, count]) => ({ month, count })),
      totalCompleted: recentCompleted.length,
      lifetimeCompleted: allSessions.filter((session) => session.status === 'completed').length,
      averageRating: teacher.rating.average,
      totalStudents: continuingStudentIds.size,
      trialConversion: {
        completedTrials: trialStudentIds.size,
        converted: convertedCount,
        rate: trialConversionRate,
      },
      homework: {
        total: tasks.length,
        completed: completedTasks,
        completionRate: homeworkCompletionRate,
      },
      upcomingSevenDays,
      earnings: {
        ...earnings,
        available: balances?.EGP?.available || 0,
        pendingPayouts: balances?.EGP?.pending || 0,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

async function availableBalance(teacherId) {
  const teacher = await Teacher.findById(teacherId);
  if (!teacher) return 0;
  const pendingSum = await WithdrawRequest.aggregate([
    { $match: { teacher: teacher._id, status: 'pending' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const locked = pendingSum[0]?.total || 0;
  return Math.max(0, teacher.earnings.pendingEarnings - locked);
}

router.get('/withdrawals', protect, authorize('teacher'), async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id });
    if (!teacher) return res.status(404).json({ error: 'Teacher profile not found' });

    const withdrawals = await WithdrawRequest.find({ teacher: teacher._id }).sort({ createdAt: -1 });
    const available = await availableBalance(teacher._id);
    res.json({ withdrawals, available });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/withdrawals', protect, authorize('teacher'), async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id });
    if (!teacher) return res.status(404).json({ error: 'Teacher profile not found' });

    const { amount, method, accountInfo } = req.body;
    const num = Number(amount);
    if (!num || num < SESSION_RATE) {
      return res.status(400).json({ error: `الحد الأدنى للسحب ${SESSION_RATE} ج.م` });
    }
    if (!accountInfo?.trim()) {
      return res.status(400).json({ error: 'بيانات الحساب مطلوبة' });
    }

    const available = await availableBalance(teacher._id);
    if (num > available) {
      return res.status(400).json({ error: `الرصيد المتاح ${available} ج.م فقط` });
    }

    const withdrawal = await WithdrawRequest.create({
      teacher: teacher._id,
      amount: num,
      method: method || 'vodafone_cash',
      accountInfo: accountInfo.trim(),
    });

    notifyAdmins({
      type: 'system',
      title: { ar: 'طلب سحب أرباح جديد', en: 'New withdrawal request' },
      message: {
        ar: `طلب معلم سحب ${num} ج.م ويحتاج مراجعة الإدارة.`,
        en: `A tutor requested a withdrawal of ${num} EGP and it needs admin review.`,
      },
      data: {
        actionUrl: '/admin?tab=withdrawals',
        metadata: { withdrawalId: String(withdrawal._id), amount: num },
      },
      priority: 'high',
    }).catch((error) => {
      console.warn('Admin withdrawal notification failed:', error.message);
    });

    res.status(201).json({ success: true, withdrawal });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const VALID_DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function timeToMinutes(value) {
  if (!/^([01]\\d|2[0-3]):[0-5]\\d$/.test(String(value || ''))) return null;
  const [hours, minutes] = String(value).split(':').map(Number);
  return (hours * 60) + minutes;
}

function normalizeAvailabilityDays(availability) {
  const normalized = [];

  for (const day of availability || []) {
    if (!VALID_DAYS.includes(day?.day)) continue;

    const slots = [];
    for (const slot of day.slots || []) {
      const start = timeToMinutes(slot?.startTime);
      const end = timeToMinutes(slot?.endTime);
      if (start == null || end == null || start >= end) {
        const error = new Error('كل فترة متاحة يجب أن تحتوي وقت بداية ونهاية صحيحين وأن تكون النهاية بعد البداية');
        error.code = 'INVALID_AVAILABILITY_SLOT';
        throw error;
      }
      slots.push({
        startTime: slot.startTime,
        endTime: slot.endTime,
        isBooked: false,
        start,
        end,
      });
    }

    slots.sort((a, b) => a.start - b.start);
    for (let index = 1; index < slots.length; index += 1) {
      if (slots[index].start < slots[index - 1].end) {
        const error = new Error('لا يمكن حفظ فترات متداخلة في اليوم نفسه');
        error.code = 'OVERLAPPING_AVAILABILITY_SLOTS';
        throw error;
      }
    }

    if (slots.length) {
      normalized.push({
        day: day.day,
        slots: slots.map(({ startTime, endTime, isBooked }) => ({ startTime, endTime, isBooked })),
      });
    }
  }

  return normalized;
}

router.get('/availability', protect, authorize('teacher'), async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id }).select('availability');
    if (!teacher) return res.status(404).json({ error: 'Teacher profile not found' });
    res.json({ availability: teacher.availability || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/availability', protect, authorize('teacher'), async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id });
    if (!teacher) return res.status(404).json({ error: 'Teacher profile not found' });

    const { availability } = req.body;
    if (!Array.isArray(availability)) {
      return res.status(400).json({ error: 'availability must be an array' });
    }

    const cleaned = normalizeAvailabilityDays(availability);

    teacher.availability = cleaned;
    await teacher.save();
    res.json({ success: true, availability: teacher.availability });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/reviews', protect, authorize('teacher'), async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id });
    if (!teacher) return res.status(404).json({ error: 'Teacher profile not found' });

    const Review = require('../models/Review');
    const reviews = await Review.find({ teacher: teacher._id, isApproved: true })
      .populate('student', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ reviews, averageRating: teacher.rating.average, totalReviews: teacher.rating.count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;