const JOIN_EARLY_MINUTES = 30;
const JOIN_LATE_MINUTES = 60;

function sessionParticipantWindow(session, now = Date.now()) {
  const scheduledAt = new Date(session?.scheduledAt || 0).getTime();
  if (!Number.isFinite(scheduledAt) || scheduledAt <= 0) {
    return { valid: false, within: false, opensAt: null, closesAt: null };
  }

  const durationMinutes = Math.max(15, Number(session?.duration || 60));
  const opensAt = scheduledAt - JOIN_EARLY_MINUTES * 60 * 1000;
  const closesAt = scheduledAt + (durationMinutes + JOIN_LATE_MINUTES) * 60 * 1000;
  const clock = now instanceof Date ? now.getTime() : Number(now);

  return {
    valid: true,
    within: clock >= opensAt && clock <= closesAt,
    opensAt: new Date(opensAt),
    closesAt: new Date(closesAt),
  };
}

function meetingVisibleToRole(session, role, now = Date.now()) {
  if (role === 'admin') return true;
  if (session?.status !== 'accepted') return false;
  return sessionParticipantWindow(session, now).within;
}

module.exports = {
  JOIN_EARLY_MINUTES,
  JOIN_LATE_MINUTES,
  sessionParticipantWindow,
  meetingVisibleToRole,
};
