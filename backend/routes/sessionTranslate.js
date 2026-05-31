const express = require('express');
const router = express.Router({ mergeParams: true });
const Session = require('../models/Session');
const SessionChatMessage = require('../models/SessionChatMessage');
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { translateBatch, SUPPORTED } = require('../services/translateService');

async function canAccessSession(session, userId, userRole) {
  const isStudent = String(session.student) === userId;
  if (isStudent) return true;
  if (userRole === 'admin') return true;
  if (userRole === 'teacher') {
    const teacher = await Teacher.findOne({ user: userId });
    return teacher && String(session.teacher) === String(teacher._id);
  }
  return false;
}

router.get('/languages', protect, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('student', 'name preferences')
      .populate({ path: 'teacher', populate: { path: 'user', select: 'name preferences' } });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (!(await canAccessSession(session, req.user.id, req.user.role))) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const studentLang = session.student?.preferences?.language || 'id';
    const teacherLang = session.teacher?.user?.preferences?.language || 'ar';

    res.json({
      student: { name: session.student?.name, lang: studentLang },
      teacher: { name: session.teacher?.user?.name, lang: teacherLang },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/messages', protect, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (!(await canAccessSession(session, req.user.id, req.user.role))) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const since = req.query.since ? new Date(req.query.since) : null;
    const filter = { session: session._id };
    if (since && !Number.isNaN(since.getTime())) filter.createdAt = { $gt: since };

    const messages = await SessionChatMessage.find(filter).sort({ createdAt: 1 }).limit(100);
    const myLang = req.query.lang || req.user.preferences?.language || 'ar';

    res.json({
      messages: messages.map((m) => {
        const trans = m.translations instanceof Map
          ? Object.fromEntries(m.translations)
          : (m.translations || {});
        return {
          _id: m._id,
          userName: m.userName,
          text: m.text,
          lang: m.lang,
          translation: trans[myLang] || m.text,
          createdAt: m.createdAt,
          isMe: String(m.user) === req.user.id,
        };
      }),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/messages', protect, async (req, res) => {
  try {
    const { text, lang } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: 'Text required' });

    const session = await Session.findById(req.params.id)
      .populate('student', 'preferences')
      .populate({ path: 'teacher', populate: { path: 'user', select: 'preferences' } });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (!(await canAccessSession(session, req.user.id, req.user.role))) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const fromLang = SUPPORTED.includes(lang) ? lang : (req.user.preferences?.language || 'ar');
    const studentLang = session.student?.preferences?.language || 'id';
    const teacherLang = session.teacher?.user?.preferences?.language || 'ar';
    const targets = [...new Set([studentLang, teacherLang, 'en', 'ar', 'id'].filter((l) => SUPPORTED.includes(l)))];

    const translationsMap = await translateBatch(text.trim(), fromLang, targets);

    const msg = await SessionChatMessage.create({
      session: session._id,
      user: req.user.id,
      userName: req.user.name,
      text: text.trim(),
      lang: fromLang,
      translations: translationsMap,
    });

    res.status(201).json({
      _id: msg._id,
      userName: msg.userName,
      text: msg.text,
      lang: msg.lang,
      translations: translationsMap,
      createdAt: msg.createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
