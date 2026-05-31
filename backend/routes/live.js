const express = require('express');
const router = express.Router();
const { AccessToken } = require('livekit-server-sdk');
const LiveSession = require('../models/LiveSession');

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || 'your-api-key';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || 'your-api-secret';

function createToken(roomName, participantName, isHost = false) {
  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: participantName,
    name: participantName,
  });

  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: isHost,
    canSubscribe: true,
    canPublishData: true,
  });

  if (isHost) {
    at.addGrant({
      roomCreate: true,
      roomList: true,
      roomRecord: true,
    });
  }

  return at.toJwt();
}

const LIVEKIT_URL = process.env.LIVEKIT_URL || '';

function isLiveKitConfigured() {
  return LIVEKIT_API_KEY && LIVEKIT_API_SECRET &&
    LIVEKIT_API_KEY !== 'your-api-key' && LIVEKIT_API_SECRET !== 'your-api-secret';
}

router.get('/status', (_req, res) => {
  res.json({ configured: isLiveKitConfigured(), url: LIVEKIT_URL || null });
});

router.post('/demo-room', async (_req, res) => {
  try {
    const roomId = `demo-${Date.now()}`;
    const session = await LiveSession.create({
      roomId,
      title: 'حصة تجريبية — أكاديمية الأثر',
      description: 'غرفة LiveKit تجريبية',
      subject: 'quran',
      isLive: false,
      participants: 0,
    });
    if (!isLiveKitConfigured()) {
      return res.status(201).json({ session, configured: false, message: 'LiveKit غير مُعد — أضف LIVEKIT_* على Azure' });
    }
    const token = createToken(roomId, 'Guest', false);
    res.status(201).json({ session, configured: true, token, livekitUrl: LIVEKIT_URL });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/token', (req, res) => {
  try {
    const { roomName, participantName, isHost } = req.body;

    if (!roomName || !participantName) {
      return res.status(400).json({
        message: 'Room name and participant name are required'
      });
    }

    if (!isLiveKitConfigured()) {
      return res.status(503).json({
        message: 'LiveKit not configured',
        note: 'Please set LIVEKIT_API_KEY and LIVEKIT_API_SECRET in .env file',
        mockToken: 'mock-token-for-development'
      });
    }

    const token = createToken(roomName, participantName, isHost);

    res.json({ token });
  } catch (error) {
    console.error('Token generation error:', error);
    res.status(500).json({ message: 'Failed to generate token' });
  }
});

router.get('/sessions', async (req, res) => {
  try {
    const sessionsList = await LiveSession.find().sort({ createdAt: -1 });
    res.json(sessionsList);
  } catch (error) {
    console.error('Fetch sessions error:', error);
    res.status(500).json({ message: 'Failed to fetch sessions' });
  }
});

router.post('/sessions', async (req, res) => {
  try {
    const { title, description, subject } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const roomId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const session = await LiveSession.create({
      roomId,
      title,
      description: description || '',
      subject: subject || 'general',
      isLive: false,
      isHost: true,
      participants: 0
    });

    res.status(201).json(session);
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ message: 'Failed to create session' });
  }
});

router.get('/sessions/:roomId', async (req, res) => {
  try {
    const session = await LiveSession.findOne({ roomId: req.params.roomId });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ message: 'Failed to get session' });
  }
});

router.delete('/sessions/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;

    const result = await LiveSession.deleteOne({ roomId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ message: 'Failed to delete session' });
  }
});

router.patch('/sessions/:roomId/live', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { isLive } = req.body;

    const session = await LiveSession.findOneAndUpdate(
      { roomId },
      { isLive },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({ message: 'Failed to update session' });
  }
});

module.exports = router;
