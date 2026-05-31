const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const Teacher = require('../models/Teacher');
const { protect, authorize } = require('../middleware/auth');
const meetingService = require('../services/meetingService');

router.get('/session/:id', protect, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('student', 'name email')
      .populate({ path: 'teacher', populate: { path: 'user', select: 'name' } });

    if (!session) return res.status(404).json({ error: 'Session not found' });

    const isStudent = String(session.student._id || session.student) === req.user.id;
    let isTeacher = false;
    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user.id });
      isTeacher = teacher && String(session.teacher._id || session.teacher) === String(teacher._id);
    }

    if (!isStudent && !isTeacher && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (session.status !== 'accepted' && session.status !== 'completed') {
      return res.status(400).json({ error: 'Meeting available only for accepted sessions' });
    }

    const meeting = session.meetingLink
      ? { url: session.meetingLink, provider: session.meetingProvider || 'jitsi' }
      : meetingService.generateMeetingLink(session._id);

    res.json({ session: { _id: session._id, scheduledAt: session.scheduledAt, status: session.status }, meeting });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/session/:id/regenerate', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { provider } = req.body;
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user.id });
      if (!teacher || String(session.teacher) !== String(teacher._id)) {
        return res.status(403).json({ error: 'Not your session' });
      }
    }

    const meeting = meetingService.attachToSession(session, provider);
    await session.save();

    res.json({ success: true, meetingLink: session.meetingLink, meeting });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/providers', protect, (_req, res) => {
  res.json({
    providers: meetingService.PROVIDERS,
    default: process.env.DEFAULT_MEETING_PROVIDER || 'jitsi',
  });
});

module.exports = router;
