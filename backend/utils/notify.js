const Notification = require('../models/Notification');
const User = require('../models/User');

async function notifyUser(userId, { type, title, message, data = {}, priority = 'normal', channels }) {
  const user = await User.findById(userId).select('preferences email phone');
  const prefs = user?.preferences?.notifications || {};

  const defaultChannels = {
    inApp: { enabled: true },
    email: { enabled: prefs.email !== false },
    push: { enabled: prefs.push !== false },
    telegram: { enabled: !!process.env.TELEGRAM_BOT_TOKEN },
    sms: { enabled: !!(process.env.TWILIO_ACCOUNT_SID && user?.phone) },
  };

  return Notification.createAndSend(userId, {
    type,
    title,
    message,
    data,
    priority,
    channels: channels || defaultChannels,
  });
}

async function notifyTeacherForSessionRequest(session, teacherUserId) {
  return notifyUser(teacherUserId, {
    type: 'session-request',
    title: { ar: 'طلب حصة جديد', en: 'New session request' },
    message: {
      ar: `طلب حصة ${session.type === 'trial' ? 'تجريبية' : ''} — ${new Date(session.scheduledAt).toLocaleString('ar-EG')}`,
      en: `New ${session.type} session — ${new Date(session.scheduledAt).toLocaleString('en-US')}`,
    },
    data: { session: session._id },
    priority: 'high',
  });
}

async function notifySessionAccepted(session, studentId, meetingUrl) {
  return notifyUser(studentId, {
    type: 'session-accepted',
    title: { ar: 'تم قبول الحصة', en: 'Session accepted' },
    message: {
      ar: `تم قبول حصتك. رابط الانضمام: ${meetingUrl || 'سيُرسل لاحقاً'}`,
      en: `Your session was accepted. Join: ${meetingUrl || 'link pending'}`,
    },
    data: { session: session._id, meetingLink: meetingUrl },
    priority: 'high',
    channels: {
      inApp: { enabled: true },
      email: { enabled: true },
      push: { enabled: true },
      telegram: { enabled: true },
      sms: { enabled: true },
    },
  });
}

async function notifyCourseEnrollment(userId, course) {
  const title = course.title?.ar || course.title?.en || 'دورة';
  return notifyUser(userId, {
    type: 'course-enrollment',
    title: { ar: 'تم التسجيل في الدورة', en: 'Course enrollment confirmed' },
    message: {
      ar: `سجّلت بنجاح في: ${title}`,
      en: `Enrolled in: ${course.title?.en || title}`,
    },
    data: { course: course._id },
  });
}

async function notifyCertificateIssued(userId, certificate, course) {
  return notifyUser(userId, {
    type: 'certificate-issued',
    title: { ar: 'شهادة جديدة', en: 'Certificate issued' },
    message: {
      ar: `تهانينا! حصلت على شهادة إتمام: ${course?.title?.ar || ''}`,
      en: `Congratulations! Certificate for: ${course?.title?.en || ''}`,
    },
    data: { certificate: certificate._id, course: course?._id },
    priority: 'high',
  });
}

module.exports = {
  notifyUser,
  notifyTeacherForSessionRequest,
  notifySessionAccepted,
  notifyCourseEnrollment,
  notifyCertificateIssued,
};
