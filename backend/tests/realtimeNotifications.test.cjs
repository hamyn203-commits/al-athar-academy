'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

test('LiveKit realtime notification token is data-receive only and user scoped', async () => {
  process.env.LIVEKIT_URL = 'wss://qa-realtime.livekit.cloud';
  process.env.LIVEKIT_API_KEY = 'qa-key';
  process.env.LIVEKIT_API_SECRET = 'qa-secret-abcdefghijklmnopqrstuvwxyz';

  delete require.cache[require.resolve('../services/realtimeNotificationBus')];
  const {
    createUserRealtimeToken,
    roomNameForUser,
    isRealtimeConfigured,
  } = require('../services/realtimeNotificationBus');

  assert.equal(isRealtimeConfigured(), true);
  assert.equal(roomNameForUser('abc-123'), 'notify_abc-123');
  assert.equal(roomNameForUser('abc/123'), 'notify_abc123');

  const connection = await createUserRealtimeToken('abc-123');
  assert.equal(connection.url, 'wss://qa-realtime.livekit.cloud');
  assert.equal(connection.roomName, 'notify_abc-123');

  const decoded = jwt.decode(connection.token);
  assert.equal(decoded.video.room, 'notify_abc-123');
  assert.equal(decoded.video.roomJoin, true);
  assert.equal(decoded.video.canSubscribe, true);
  assert.equal(decoded.video.canPublish, false);
  assert.equal(decoded.video.canPublishData, false);
});
