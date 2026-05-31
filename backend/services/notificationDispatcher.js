async function sendEmail({ to, subject, html, text }) {
  if (!to) throw new Error('Email recipient required');

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'Al-Athar <noreply@alathar.edu>',
        to: [to],
        subject,
        html: html || `<p>${text || subject}</p>`,
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    return { channel: 'email', sent: true, provider: 'resend' };
  }

  console.log(`📧 [email] → ${to}: ${subject}`);
  return { channel: 'email', sent: true, provider: 'console' };
}

async function sendTelegram({ chatId, text }) {
  if (!chatId) throw new Error('Telegram chat ID required');
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.log(`📱 [telegram] → ${chatId}: ${text?.slice(0, 80)}`);
    return { channel: 'telegram', sent: true, provider: 'console' };
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  });
  if (!res.ok) throw new Error(await res.text());
  return { channel: 'telegram', sent: true, provider: 'telegram-bot' };
}

async function sendWhatsApp({ phone, text }) {
  if (!phone) throw new Error('WhatsApp phone required');

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;

  if (sid && authToken && from) {
    const body = new URLSearchParams({ From: from, To: `whatsapp:${phone}`, Body: text });
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });
    if (!res.ok) throw new Error(await res.text());
    return { channel: 'sms', sent: true, provider: 'twilio-whatsapp' };
  }

  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
  console.log(`💬 [whatsapp] → ${phone}: ${text?.slice(0, 60)} | ${waLink}`);
  return { channel: 'sms', sent: true, provider: 'console-wa-link', link: waLink };
}

async function sendPush({ token, title, body, data = {} }) {
  if (!token) throw new Error('Push token required');
  const fcmKey = process.env.FCM_SERVER_KEY;

  if (fcmKey) {
    const res = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        Authorization: `key=${fcmKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: token,
        notification: { title, body },
        data,
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    return { channel: 'push', sent: true, provider: 'fcm' };
  }

  console.log(`🔔 [push] → ${token.slice(0, 12)}…: ${title}`);
  return { channel: 'push', sent: true, provider: 'console' };
}

module.exports = { sendEmail, sendTelegram, sendWhatsApp, sendPush };
