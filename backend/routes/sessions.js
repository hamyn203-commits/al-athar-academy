const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const Teacher = require('../models/Teacher');
const { protect, authorize } = require('../middleware/auth');
const meetingService = require('../services/meetingService');
const { notifyTeacherForSessionRequest, notifySessionAccepted, notifyUser } = require('../utils/notify');

router.post('/trial', protect, async (req, res) => {
  try {
    const { teacherId, scheduledAt, timezone, notes } = req.body;

    const teacher = await Teacher.findOne({ 
      _id: teacherId, 
      status: 'approved', 
      isVerified: true 
    });

    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found or not available' });
    }

    const existingTrial = await Session.findOne({
      student: req.user.id,
      teacher: teacherId,
      type: 'trial',
      status: { $in: ['pending', 'accepted'] }
    });

    if (existingTrial) {
      return res.status(400).json({ error: 'You already have a pending trial session with this teacher' });
    }

    const session = await Session.create({
      student: req.user.id,
      teacher: teacherId,
      type: 'trial',
      scheduledAt: new Date(scheduledAt),
      timezone: timezone || 'Africa/Cairo',
      notes,
      status: 'pending'
    });

    try {
      await notifyTeacherForSessionRequest(session, teacher.user);
    } catch (e) {
      console.warn('Session request notification:', e.message);
    }

    res.status(201).json({
      success: true,
      message: 'Trial session request sent successfully',
      session
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/my-sessions', protect, async (req, res) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (req.user.role === 'student') {
      filter.student = req.user.id;
    } else if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user.id });
      if (!teacher) {
        return res.status(404).json({ error: 'Teacher profile not found' });
      }
      filter.teacher = teacher._id;
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (status) filter.status = status;
    if (type) filter.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [sessions, total] = await Promise.all([
      Session.find(filter)
        .populate('student', 'name email avatar')
        .populate({
          path: 'teacher',
          populate: { path: 'user', select: 'name email avatar' }
        })
        .sort({ scheduledAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Session.countDocuments(filter)
    ]);

    res.json({
      sessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/respond', protect, authorize('teacher'), async (req, res) => {
  try {
    const { action, rescheduledDate, reason } = req.body;
    const teacher = await Teacher.findOne({ user: req.user.id });

    if (!teacher) {
      return res.status(404).json({ error: 'Teacher profile not found' });
    }

    const session = await Session.findOne({
      _id: req.params.id,
      teacher: teacher._id
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (action === 'accept') {
      session.status = 'accepted';
      const provider = req.body.provider || process.env.DEFAULT_MEETING_PROVIDER || 'jitsi';
      meetingService.attachToSession(session, provider);
    } else if (action === 'reject') {
      session.status = 'rejected';
      session.cancellationReason = reason;
    } else if (action === 'reschedule') {
      const newSession = await Session.create({
        ...session.toObject(),
        _id: undefined,
        scheduledAt: new Date(rescheduledDate),
        status: 'pending',
        rescheduledFrom: session._id
      });
      
      session.status = 'cancelled';
      session.cancellationReason = 'Rescheduled';
      await session.save();

      return res.json({ success: true, session: newSession });
    }

    await session.save();

    try {
      if (action === 'accept') {
        await notifySessionAccepted(session, session.student, session.meetingLink);
      } else if (action === 'reject') {
        await notifyUser(session.student, {
          type: 'session-rejected',
          title: { ar: 'تم رفض الحصة', en: 'Session rejected' },
          message: {
            ar: reason || 'لم يتم قبول طلب الحصة',
            en: reason || 'Your session request was not accepted',
          },
          data: { session: session._id },
        });
      }
    } catch (e) {
      console.warn('Session respond notification:', e.message);
    }

    res.json({ success: true, session });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id/complete', protect, authorize('teacher'), async (req, res) => {
  try {
    const { evaluation } = req.body;
    const teacher = await Teacher.findOne({ user: req.user.id });

    if (!teacher) {
      return res.status(404).json({ error: 'Teacher profile not found' });
    }

    const session = await Session.findOne({
      _id: req.params.id,
      teacher: teacher._id,
      status: 'accepted'
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found or not accepted' });
    }

    const SESSION_RATE = 50;
    session.status = 'completed';
    session.duration = 60;
    session.teacherEvaluation = evaluation;
    session.earnings.amount = SESSION_RATE;
    session.earnings.status = 'pending';
    
    await session.save();

    await Teacher.findByIdAndUpdate(teacher._id, {
      $inc: {
        'stats.totalSessions': 1,
        'stats.totalHours': 1,
        'earnings.pendingEarnings': SESSION_RATE,
      },
    });

    res.json({ success: true, session });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id/feedback', protect, authorize('student'), async (req, res) => {
  try {
    const { rating, comment, wouldContinue } = req.body;

    const session = await Session.findOne({
      _id: req.params.id,
      student: req.user.id,
      status: 'completed'
    });

    if (!session) {
      return res.status(404).json({ error: 'Completed session not found' });
    }

    session.studentFeedback = { rating, comment, wouldContinue };
    await session.save();

    res.json({ success: true, session });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/admin/all', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (type) filter.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [sessions, total] = await Promise.all([
      Session.find(filter)
        .populate('student', 'name email')
        .populate({
          path: 'teacher',
          populate: { path: 'user', select: 'name email' }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Session.countDocuments(filter)
    ]);

    res.json({
      sessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;