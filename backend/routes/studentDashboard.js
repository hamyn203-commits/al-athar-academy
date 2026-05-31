const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const TeacherTask = require('../models/TeacherTask');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

router.get('/profile', protect, authorize('student'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name email phone avatar role createdAt');
    if (!user) return res.status(404).json({ error: 'Student not found' });

    const [totalSessions, completedSessions, pendingHomework] = await Promise.all([
      Session.countDocuments({ student: req.user.id }),
      Session.countDocuments({ student: req.user.id, status: 'completed' }),
      TeacherTask.countDocuments({ student: req.user.id, status: 'pending' }),
    ]);

    res.json({
      user,
      summary: {
        totalSessions,
        completedSessions,
        pendingHomework,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats', protect, authorize('student'), async (req, res) => {
  try {
    const [pendingTrials, upcomingSessions, completedSessions, homeworkPending, homeworkSubmitted] = await Promise.all([
      Session.countDocuments({ student: req.user.id, type: 'trial', status: 'pending' }),
      Session.countDocuments({ student: req.user.id, status: 'accepted', scheduledAt: { $gte: new Date() } }),
      Session.countDocuments({ student: req.user.id, status: 'completed' }),
      TeacherTask.countDocuments({ student: req.user.id, status: 'pending' }),
      TeacherTask.countDocuments({ student: req.user.id, status: { $in: ['submitted', 'done'] } }),
    ]);

    res.json({
      pendingTrials,
      upcomingSessions,
      completedSessions,
      homeworkPending,
      homeworkSubmitted,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/teachers', protect, authorize('student'), async (req, res) => {
  try {
    const sessions = await Session.find({
      student: req.user.id,
      status: { $in: ['accepted', 'completed'] },
    })
      .populate({
        path: 'teacher',
        populate: { path: 'user', select: 'name email avatar' },
      })
      .sort({ scheduledAt: -1 });

    const map = {};
    sessions.forEach((s) => {
      if (!s.teacher) return;
      const id = s.teacher._id.toString();
      if (!map[id]) {
        map[id] = {
          _id: s.teacher._id,
          name: s.teacher.user?.name || s.teacher.personalInfo?.fullName,
          avatar: s.teacher.user?.avatar || s.teacher.profilePhoto,
          country: s.teacher.personalInfo?.country,
          rating: s.teacher.rating?.average || 0,
          sessionCount: 0,
          lastSession: s.scheduledAt,
          canBookRegular: s.status === 'completed' || s.type === 'trial',
        };
      }
      map[id].sessionCount++;
      if (new Date(s.scheduledAt) > new Date(map[id].lastSession)) {
        map[id].lastSession = s.scheduledAt;
      }
      if (s.status === 'completed') map[id].canBookRegular = true;
    });

    res.json({ teachers: Object.values(map) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/evaluations', protect, authorize('student'), async (req, res) => {
  try {
    const sessions = await Session.find({
      student: req.user.id,
      status: 'completed',
      'teacherEvaluation.attendance': { $exists: true },
    })
      .populate({
        path: 'teacher',
        populate: { path: 'user', select: 'name avatar' },
      })
      .sort({ updatedAt: -1 });

    res.json({ evaluations: sessions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/recordings', protect, authorize('student'), async (req, res) => {
  try {
    const sessions = await Session.find({
      student: req.user.id,
      status: 'completed',
    })
      .populate({
        path: 'teacher',
        populate: { path: 'user', select: 'name avatar' },
      })
      .sort({ scheduledAt: -1 })
      .limit(50);

    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
