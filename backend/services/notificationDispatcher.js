const { getEmailProviderStatus } = require('../config/emailProvider');

let smtpTransporter = null;

function getSmtpTransporter() {
  if (smtpTransporter) return smtpTransporter;

  const nodemailer = require('nodemailer');
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = String(process.env.SMTP_SECURE || '').trim()
    ? String(process.env.SMTP_SECURE).trim().toLowerCase() === 'true'
    : port === 465;

  smtpTransporter = nodemailer.createTransport({
    host: String(process.env.SMTP_HOST || 'smtp.gmail.com').trim(),
    port: Number.isFinite(port) && port > 0 ? port : 465,
    secure,
    auth: {
      user: String(process.env.SMTP_USER || '').trim(),
      pass: String(process.env.SMTP_PASS || '').replace(/\s+/g, ''),
    },
  });

  return smtpTransporter;
}

async function sendEmail({ to, subject, html, text }) {
  if (!to) throw new Error('Email recipient required');

  const emailProvider = getEmailProviderStatus();

  if (emailProvider.provider === 'smtp' && emailProvider.configured) {
    const transporter = getSmtpTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      text: text || subject,
      html: html || `<p>${text || subject}</p>`,
    });
    return { channel: 'email', sent: true, provider: 'smtp' };
  }

  if (emailProvider.provider === 'resend' && emailProvider.configured) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'Wahy Wa Namaa <noreply@example.com>',
        to: [to],
        subject,
        html: html || `<p>${text || subject}</p>`,
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    return { channel: 'email', sent: true, provider: 'resend' };
  }

  if (process.env.NODE_ENV === 'production') {
    console.warn('Email delivery requested but the selected provider is not configured');
    return { channel: 'email', sent: false, provider: emailProvider.provider || 'not-configured' };
  }

  console.log(`📧 [email preview] → ${to}: ${subject}`);
  return { channel: 'email', sent: true, provider: 'console' };
}

async function sendTelegram({ chatId, text }) {
  if (!chatId) throw new Error('Telegram chat ID required');
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    if (process.env.NODE_ENV === 'production') {
      return { channel: 'telegram', sent: false, provider: 'not-configured' };
    }
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
    const digits = String(phone).replace(/\D/g, '');
    if (!digits) throw new Error('Valid WhatsApp phone required');
    const normalizedFrom = from.startsWith('whatsapp:') ? from : `whatsapp:${from}`;
    const body = new URLSearchParams({ From: normalizedFrom, To: `whatsapp:+${digits}`, Body: text });
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

  if (process.env.NODE_ENV === 'production') {
    return { channel: 'sms', sent: false, provider: 'not-configured' };
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

  if (process.env.NODE_ENV === 'production') {
    return { channel: 'push', sent: false, provider: 'not-configured' };
  }

  console.log(`🔔 [push] → ${token.slice(0, 12)}…: ${title}`);
  return { channel: 'push', sent: true, provider: 'console' };
}

module.exports = { sendEmail, sendTelegram, sendWhatsApp, sendPush };
