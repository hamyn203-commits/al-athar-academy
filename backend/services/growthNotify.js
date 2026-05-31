const { sendEmail } = require('./notificationDispatcher');

async function notifyAdmin({ subject, html }) {
  const to = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM?.match(/<([^>]+)>/)?.[1];
  if (!to) {
    console.log(`📬 [admin-notify] ${subject}`);
    return;
  }
  try {
    await sendEmail({ to, subject, html });
  } catch (e) {
    console.warn('Admin notify failed:', e.message);
  }
}

module.exports = { notifyAdmin };
