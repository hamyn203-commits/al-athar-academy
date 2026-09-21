const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Session = require('../models/Session');
const TeacherTask = require('../models/TeacherTask');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { findMockUserById } = require('../mockStore');

const isMockMode = !process.env.MONGODB_URI;
const isDBConnected = () => mongoose.connection.readyState === 1;
const isValidObjectId = (id) => id && mongoose.Types.ObjectId.isValid(id);

router.get('/profile', protect, authorize('student'), async (req, res) => {
  try {
    if (!isDBConnected() || !isValidObjectId(req.user.id)) {
      const mockUser = findMockUserById(req.user.id);
      return res.json({
        user: {
          _id: req.user.id,
          name: mockUser?.name || 'طالب الأثر',
          email: mockUser?.email || req.user.email,
          phone: mockUser?.phone || '+20100000000',
          avatar: mockUser?.avatar || null,
          role: 'student',
          createdAt: mockUser?.createdAt || new Date(),
        },
        summary: {
          totalSessions: 8,
          completedSessions: 6,
          pendingHomework: 1,
        },
      });
    }

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
    if (!isDBConnected() || !isValidObjectId(req.user.id)) {
      return res.json({
        pendingTrials: 0,
        upcomingSessions: 2,
        completedSessions: 6,
        homeworkPending: 1,
        homeworkSubmitted: 3,
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
      return res.json({
        teachers: [
          {
            _id: 'mock-teacher-1',
            name: 'الشيخ أحمد منصور',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
            country: 'مصر',
            rating: 4.9,
            sessionCount: 8,
            lastSession: new Date(),
            canBookRegular: true,
          },
          {
            _id: 'mock-teacher-2',
            name: 'الشيخة فاطمة الزهراء',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
            country: 'المغرب',
            rating: 5.0,
            sessionCount: 4,
            lastSession: new Date(Date.now() - 86400000 * 3),
            canBookRegular: true,
          }
        ]
      });
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
      return res.json({
        evaluations: [
          {
            _id: 'mock-eval-1',
            scheduledAt: new Date(Date.now() - 86400000 * 2),
            teacher: { name: 'الشيخ أحمد منصور', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
            teacherEvaluation: {
              attendance: 'attended',
              rating: 5,
              tajweedLevel: 'ممتاز',
              memorizationQuality: 'قوي ومتقن',
              notes: 'ما شاء الله تبارك الله، تلاوة خاشعة وإتقان تام لأحكام النون الساكنة والميم والتنوين.',
              assignedHomework: [
                { title: 'حفظ سورة مريم من آية 1 إلى 15', type: 'audio' }
              ]
            }
          }
        ]
      });
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
      return res.json({
        sessions: [
          {
            _id: 'mock-rec-1',
            scheduledAt: new Date(Date.now() - 86400000 * 2),
            teacher: { name: 'الشيخ أحمد منصور', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
            recordingUrl: 'https://example.com/recording.mp4',
            duration: 45,
          }
        ]
      });
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
