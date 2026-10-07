const Teacher = require('../models/Teacher');

function refId(value) {
  return String(value?._id || value?.id || value || '');
}

async function canAccessSession(session, userId, userRole) {
  const normalizedUserId = String(userId || '');
  const isStudent = refId(session.student) === normalizedUserId;
  if (isStudent) return true;
  if (userRole === 'admin') return true;
  if (userRole === 'teacher') {
    const teacher = await Teacher.findOne({ user: normalizedUserId }).select('_id');
    return Boolean(teacher && refId(session.teacher) === refId(teacher));
  }
  return false;
}

module.exports = { refId, canAccessSession };
