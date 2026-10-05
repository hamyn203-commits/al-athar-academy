const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Session = require('../models/Session');
const TeacherTask = require('../models/TeacherTask');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { findMockUserById } = require('../mockStore');

const isDBConnected = () => mongoose.connection.readyState === 1;
const isValidObjectId = (id) => id && mongoose.Types.ObjectId.isValid(id);

async function createUniqueGuardianLinkCode() {
  const crypto = require('crypto');
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = `WN-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const exists = await User.exists({ guardianLinkCode: code });
    if (!exists) return code;
  }
  throw new Error('Unable to generate a unique guardian link code');
}

router.get('/profile', protect, authorize('student'), async (req, res) => {
  try {
    if (!isDBConnected() || !isValidObjectId(req.user.id)) {
      const mockUser = findMockUserById(req.user.id);
      return res.json({
        user: {
          _id: req.user.id,
          name: mockUser?.name || 'طالب',
          email: mockUser?.email || req.user.email,
          phone: mockUser?.phone || null,
          avatar: mockUser?.avatar || null,
          role: 'student',
          createdAt: mockUser?.createdAt || null,
        },
        summary: {
          totalSessions: 0,
          completedSessions: 0,
          pendingHomework: 0,
        },
      });
    }

    const user = await User.findById(req.user.id)
      .select('name email phone avatar role createdAt +guardianLinkCode');
    if (!user) return res.status(404).json({ error: 'Student not found' });

    if (!user.guardianLinkCode) {
      user.guardianLinkCode = await createUniqueGuardianLinkCode();
      await user.save();
    }

    const [totalSessions, completedSessions, pendingHomework] = await Promise.all([
      Session.countDocuments({ student: req.user.id }),
      Session.countDocuments({ student: req.user.id, status: 'completed' }),
      TeacherTask.countDocuments({ student: req.user.id, status: 'pending' }),
    ]);

    const safeUser = user.toObject();
    safeUser.guardianLinkCode = user.guardianLinkCode;

    res.json({
      user: safeUser,
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

router.post('/guardian-link-code/rotate', protect, authorize('student'), async (req, res) => {
  try {
    if (!isDBConnected() || !isValidObjectId(req.user.id)) {
      return res.status(503).json({ error: 'Guardian linking requires the database' });
    }

    const user = await User.findById(req.user.id).select('+guardianLinkCode role');
    if (!user || user.role !== 'student') {
      return res.status(404).json({ error: 'Student not found' });
    }

    user.guardianLinkCode = await createUniqueGuardianLinkCode();
    await user.save();

    return res.json({ guardianLinkCode: user.guardianLinkCode });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to rotate guardian link code' });
  }
});

router.get('/stats', protect, authorize('student'), async (req, res) => {
  try {
    if (!isDBConnected() || !isValidObjectId(req.user.id)) {
      return res.json({
        pendingTrials: 0,
        upcomingSessions: 0,
        completedSessions: 0,
        homeworkPending: 0,
        homeworkSubmitted: 0,
      });
    }

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
    if (!isDBConnected() || !isValidObjectId(req.user.id)) {
      return res.json({ teachers: [] });
    }

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
    if (!isDBConnected() || !isValidObjectId(req.user.id)) {
      return res.json({ evaluations: [] });
    }

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
    if (!isDBConnected() || !isValidObjectId(req.user.id)) {
      return res.json({ sessions: [] });
    }

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
