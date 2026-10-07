'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV = 'development';
process.env.LIVEKIT_API_KEY = 'qa-realtime-key';
process.env.LIVEKIT_API_SECRET = 'qa-realtime-secret-abcdefghijklmnopqrstuvwxyz';
process.env.LIVEKIT_URL = 'wss://qa.example.livekit.cloud';

const { realtimeRoomForUser, liveKitHttpUrl } = require('../utils/realtime');
const { generateAccessToken } = require('../middleware/auth');

test('realtime helpers scope rooms per user and normalize the server URL', () => {
  assert.equal(liveKitHttpUrl(), 'https://qa.example.livekit.cloud');
  assert.equal(realtimeRoomForUser('abc-123'), 'realtime_user_abc-123');
  assert.equal(realtimeRoomForUser('abc:$123'), 'realtime_user_abc123');
});

test('realtime token cannot publish and is scoped to the authenticated user room', async (t) => {
  delete require.cache[require.resolve('../routes/live')];
  const liveRouter = require('../routes/live');

  const app = express();
  app.use(express.json());
  app.use('/api/live', liveRouter);

  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const userId = new mongoose.Types.ObjectId().toString();
  const token = generateAccessToken({
    _id: userId,
    email: 'student-realtime@example.test',
    role: 'student',
  });

  const response = await fetch(
    'http://127.0.0.1:' + server.address().port + '/api/live/realtime-token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({ connectionId: 'tab_123' }),
    }
  );

  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.url, process.env.LIVEKIT_URL);
  assert.equal(data.roomName, 'realtime_user_' + userId);

  const decoded = jwt.decode(data.token);
  assert.equal(decoded.video.room, data.roomName);
  assert.equal(decoded.video.roomJoin, true);
  assert.notEqual(decoded.video.canPublish, true);
  assert.notEqual(decoded.video.canPublishData, true);
});
