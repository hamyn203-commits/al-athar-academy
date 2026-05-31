const crypto = require('crypto');

const PROVIDERS = ['jitsi', 'google_meet', 'zoom'];

function slugify(id) {
  return String(id).replace(/[^a-zA-Z0-9]/g, '').slice(-12) || crypto.randomBytes(6).toString('hex');
}

function generateJitsiLink(sessionId, roomName) {
  const room = roomName || `alathar-${slugify(sessionId)}`;
  return {
    provider: 'jitsi',
    url: `https://meet.jit.si/${room}`,
    room,
    instructions: {
      ar: 'انضم للحصة عبر الرابط — لا يحتاج تسجيل',
      en: 'Join via link — no signup required',
    },
  };
}

function generateZoomLink(sessionId) {
  const base = process.env.ZOOM_MEETING_BASE_URL;
  if (base) {
    return {
      provider: 'zoom',
      url: `${base.replace(/\/$/, '')}/${slugify(sessionId)}`,
      instructions: { ar: 'انضم عبر Zoom', en: 'Join via Zoom' },
    };
  }
  const demoId = `${100000000 + (parseInt(slugify(sessionId), 36) % 899999999)}`;
  return {
    provider: 'zoom',
    url: `https://zoom.us/j/${demoId}`,
    instructions: {
      ar: 'رابط Zoom تجريبي — اضبط ZOOM_MEETING_BASE_URL للإنتاج',
      en: 'Demo Zoom link — set ZOOM_MEETING_BASE_URL for production',
    },
  };
}

function generateGoogleMeetLink(sessionId) {
  const custom = process.env.GOOGLE_MEET_BASE_URL;
  if (custom) {
    return {
      provider: 'google_meet',
      url: custom,
      instructions: { ar: 'انضم عبر Google Meet', en: 'Join via Google Meet' },
    };
  }
  return {
    provider: 'google_meet',
    url: `https://meet.jit.si/alathar-gmeet-${slugify(sessionId)}`,
    instructions: {
      ar: 'جلسة عبر Jitsi (بديل Meet) — اضبط GOOGLE_MEET_BASE_URL لرابط Meet حقيقي',
      en: 'Jitsi fallback — set GOOGLE_MEET_BASE_URL for real Meet links',
    },
  };
}

function generateMeetingLink(sessionId, provider = 'jitsi') {
  const p = PROVIDERS.includes(provider) ? provider : 'jitsi';
  if (p === 'zoom') return generateZoomLink(sessionId);
  if (p === 'google_meet') return generateGoogleMeetLink(sessionId);
  return generateJitsiLink(sessionId);
}

function attachToSession(session, provider) {
  const meeting = generateMeetingLink(session._id, provider || process.env.DEFAULT_MEETING_PROVIDER || 'jitsi');
  session.meetingLink = meeting.url;
  session.meetingProvider = meeting.provider;
  return meeting;
}

module.exports = {
  PROVIDERS,
  generateMeetingLink,
  attachToSession,
};
