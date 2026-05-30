const express = require('express');
const router = express.Router();
const { AccessToken } = require('livekit-server-sdk');

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || 'your-api-key';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || 'your-api-secret';

const sessions = new Map();

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

router.post('/token', (req, res) => {
  try {
    const { roomName, participantName, isHost } = req.body;

    if (!roomName || !participantName) {
      return res.status(400).json({ 
        message: 'Room name and participant name are required' 
      });
    }

    if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || 
        LIVEKIT_API_KEY === 'your-api-key') {
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

router.get('/sessions', (req, res) => {
  try {
    const sessionsList = Array.from(sessions.values())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(sessionsList);
  } catch (error) {
    console.error('Fetch sessions error:', error);
    res.status(500).json({ message: 'Failed to fetch sessions' });
  }
});

router.post('/sessions', (req, res) => {
  try {
    const { title, description, subject } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const roomId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session = {
      roomId,
      title,
      description: description || '',
      subject: subject || 'general',
      createdAt: new Date().toISOString(),
      isLive: false,
      isHost: true,
      participants: 0
    };

    sessions.set(roomId, session);
    
    res.status(201).json(session);
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ message: 'Failed to create session' });
  }
});

router.get('/sessions/:roomId', (req, res) => {
  try {
    const session = sessions.get(req.params.roomId);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ message: 'Failed to get session' });
  }
});

router.delete('/sessions/:roomId', (req, res) => {
  try {
    const { roomId } = req.params;
    
    if (!sessions.has(roomId)) {
      return res.status(404).json({ message: 'Session not found' });
    }

    sessions.delete(roomId);
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ message: 'Failed to delete session' });
  }
});

router.patch('/sessions/:roomId/live', (req, res) => {
  try {
    const { roomId } = req.params;
    const { isLive } = req.body;
    
    const session = sessions.get(roomId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    session.isLive = isLive;
    sessions.set(roomId, session);
    
    res.json(session);
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({ message: 'Failed to update session' });
  }
});

module.exports = router;
