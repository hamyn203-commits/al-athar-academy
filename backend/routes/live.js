const express = require('express');
const router = express.Router();
const { AccessToken } = require('livekit-server-sdk');
const LiveSession = require('../models/LiveSession');
const { verifyAccessToken, requireRole } = require('../middleware/auth');

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || '';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || '';
const LIVEKIT_URL = process.env.LIVEKIT_URL || '';

function isLiveKitConfigured() {
  return Boolean(LIVEKIT_API_KEY && LIVEKIT_API_SECRET && LIVEKIT_URL);
}

function createToken({ roomName, identity, participantName, canPublish }) {
  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity,
    name: participantName,
  });

  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish,
    canSubscribe: true,
    canPublishData: true,
  });

  return at.toJwt();
}

router.get('/status', (_req, res) => {
  res.json({ configured: isLiveKitConfigured() });
});

router.post('/demo-room', verifyAccessToken, requireRole('admin'), async (_req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Route not found' });
  }

  try {
    const roomId = `demo-${Date.now()}`;
    const session = await LiveSession.create({
      roomId,
      title: 'غرفة تطوير — وَحْيٌ وَنَمَاء',
      description: 'Development-only LiveKit room',
      subject: 'quran',
      isLive: false,
      participants: 0,
    });
    return res.status(201).json({ session, configured: isLiveKitConfigured() });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create demo room' });
  }
});

router.post('/token', verifyAccessToken, async (req, res) => {
  try {
    const { roomName } = req.body;
    if (!roomName) return res.status(400).json({ message: 'Room name is required' });

    if (!isLiveKitConfigured()) {
      return res.status(503).json({ message: 'LiveKit is not configured' });
    }

    const session = await LiveSession.findOne({ roomId: roomName }).select('_id roomId');
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const role = req.user.role;
    const allowedRoles = ['student', 'teacher', 'guardian', 'supervisor', 'admin'];
    if (!allowedRoles.includes(role)) return res.status(403).json({ message: 'Role is not allowed in live rooms' });

    const observer = role === 'guardian' || role === 'supervisor';
    const canPublish = !observer;
    const participantName = String(req.body.participantName || req.user.email || role).slice(0, 80);
    const identity = `${role}:${req.user.id}`;

    const token = createToken({ roomName, identity, participantName, canPublish });
    return res.json({
      token,
      permissions: {
        role,
        isHost: role === 'teacher' || role === 'admin',
        isObserver: observer,
        canPublish,
      },
    });
  } catch (error) {
    console.error('Token generation error:', error);
    return res.status(500).json({ message: 'Failed to generate token' });
  }
});

router.get('/sessions', verifyAccessToken, async (_req, res) => {
  try {
    const sessionsList = await LiveSession.find().sort({ createdAt: -1 });
    return res.json(sessionsList);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch sessions' });
  }
});

router.post('/sessions', verifyAccessToken, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { title, description, subject } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const roomId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const session = await LiveSession.create({
      roomId,
      title: String(title).slice(0, 160),
      description: String(description || '').slice(0, 1000),
      subject: String(subject || 'general').slice(0, 80),
      isLive: false,
      participants: 0,
    });

    return res.status(201).json(session);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create session' });
  }
});

router.get('/sessions/:roomId', verifyAccessToken, async (req, res) => {
  try {
    const session = await LiveSession.findOne({ roomId: req.params.roomId });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    return res.json(session);
  } catch {
    return res.status(500).json({ message: 'Failed to get session' });
  }
});

router.delete('/sessions/:roomId', verifyAccessToken, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const result = await LiveSession.deleteOne({ roomId: req.params.roomId });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Session not found' });
    return res.json({ message: 'Session deleted successfully' });
  } catch {
    return res.status(500).json({ message: 'Failed to delete session' });
  }
});

router.patch('/sessions/:roomId/live', verifyAccessToken, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const session = await LiveSession.findOneAndUpdate(
      { roomId: req.params.roomId },
      { isLive: Boolean(req.body.isLive) },
      { new: true }
    );
    if (!session) return res.status(404).json({ message: 'Session not found' });
    return res.json(session);
  } catch {
    return res.status(500).json({ message: 'Failed to update session' });
  }
});

module.exports = router;
