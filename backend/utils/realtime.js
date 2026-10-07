'use strict';

const { RoomServiceClient, DataPacket_Kind } = require('livekit-server-sdk');

function liveKitHttpUrl() {
  const value = String(process.env.LIVEKIT_URL || '').trim();
  if (!value) return '';
  return value
    .replace(/^wss:/i, 'https:')
    .replace(/^ws:/i, 'http:');
}

function isRealtimeConfigured() {
  return Boolean(
    process.env.LIVEKIT_API_KEY &&
    process.env.LIVEKIT_API_SECRET &&
    process.env.LIVEKIT_URL
  );
}

function realtimeRoomForUser(userId) {
  return `realtime_user_${String(userId || '').replace(/[^a-zA-Z0-9_-]/g, '')}`;
}

function getRoomService() {
  if (!isRealtimeConfigured()) return null;
  return new RoomServiceClient(
    liveKitHttpUrl(),
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET
  );
}

async function emitRealtimeEvent(userId, event) {
  if (!userId || !isRealtimeConfigured()) return false;

  try {
    const roomService = getRoomService();
    const payload = Buffer.from(JSON.stringify({
      version: 1,
      sentAt: new Date().toISOString(),
      ...event,
    }));

    await roomService.sendData(
      realtimeRoomForUser(userId),
      payload,
      DataPacket_Kind.RELIABLE,
      { topic: 'wn-realtime' }
    );

    return true;
  } catch (error) {
    // Offline users simply have no personal realtime room. Persistent
    // notifications remain in MongoDB and polling continues as fallback.
    if (!/not found|room/i.test(String(error?.message || ''))) {
      console.warn('Realtime event delivery failed:', error.message);
    }
    return false;
  }
}

module.exports = {
  liveKitHttpUrl,
  isRealtimeConfigured,
  realtimeRoomForUser,
  emitRealtimeEvent,
};
