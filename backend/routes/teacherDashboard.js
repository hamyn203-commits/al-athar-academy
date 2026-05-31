const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const Teacher = require('../models/Teacher');
const TeacherTask = require('../models/TeacherTask');
const { protect, authorize } = require('../middleware/auth');

const SESSION_RATE = 50;

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

    res.json({
      monthlySessions: Object.entries(monthly).map(([month, count]) => ({ month, count })),
      totalCompleted: sessions.length,
      averageRating: teacher.rating.average,
      totalStudents: teacher.stats.totalStudents,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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