const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const Teacher = require('../models/Teacher');
const TeacherTask = require('../models/TeacherTask');
const WithdrawRequest = require('../models/WithdrawRequest');
const { protect, authorize } = require('../middleware/auth');

const SESSION_RATE = 50;
const isMockMode = !process.env.MONGODB_URI;

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

    const sessions = await Session.find({
      teacher: teacher._id,
      type: 'regular',
      status: { $in: ['accepted', 'completed'] },
    }).populate('student', 'name email avatar phone');

    const map = {};
    sessions.forEach((s) => {
      const id = s.student._id.toString();
      if (!map[id]) {
        map[id] = { ...s.student.toObject(), sessionCount: 0, lastSession: s.scheduledAt };
      }
      map[id].sessionCount++;
    });
    res.json({ students: Object.values(map) });
  } catch (error) {
    res.status(500).json({ error: error.message });
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

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const sessions = await Session.find({
      teacher: teacher._id,
      status: 'completed',
      updatedAt: { $gte: sixMonthsAgo },
    });

    const monthly = {};
    sessions.forEach((s) => {
      const key = `${s.updatedAt.getFullYear()}-${String(s.updatedAt.getMonth() + 1).padStart(2, '0')}`;
      monthly[key] = (monthly[key] || 0) + 1;
    });

    const now = new Date();
    const dayStart = new Date(now); dayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const earnings = { daily: 0, weekly: 0, monthly: 0 };
    sessions.forEach((s) => {
      const amt = s.earnings?.amount || SESSION_RATE;
      const d = s.updatedAt;
      if (d >= dayStart) earnings.daily += amt;
      if (d >= weekStart) earnings.weekly += amt;
      if (d >= monthStart) earnings.monthly += amt;
    });

    res.json({
      monthlySessions: Object.entries(monthly).map(([month, count]) => ({ month, count })),
      totalCompleted: sessions.length,
      averageRating: teacher.rating.average,
      totalStudents: teacher.stats.totalStudents,
      earnings: { ...earnings, pending: teacher.earnings.pendingEarnings },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    res.status(201).json({ success: true, withdrawal });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const VALID_DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

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

    const cleaned = availability
      .filter((d) => VALID_DAYS.includes(d.day))
      .map((d) => ({
        day: d.day,
        slots: (d.slots || [])
          .filter((s) => s.startTime && s.endTime)
          .map((s) => ({ startTime: s.startTime, endTime: s.endTime, isBooked: false })),
      }))
      .filter((d) => d.slots.length);

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