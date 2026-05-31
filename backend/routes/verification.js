const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const VerificationCode = require('../models/VerificationCode');

const sendWhatsAppMessage = async (phone, code) => {
  console.log(`📱 WhatsApp verification code for ${phone}: ${code}`);
  return true;
};

const sendTelegramMessage = async (username, code) => {
  console.log(`✈️ Telegram verification code for ${username}: ${code}`);
  return true;
};

router.post('/send-verification', async (req, res) => {
  try {
    const { phone, method, whatsapp, telegram } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    if (!method) {
      return res.status(400).json({ error: 'Verification method is required' });
    }

    const code = crypto.randomInt(100000, 999999).toString();

    await VerificationCode.create({
      phone,
      code,
      method,
      expires: new Date(Date.now() + 10 * 60 * 1000),
      attempts: 0
    });

    let sent = false;
    if (method === 'whatsapp' && whatsapp) {
      sent = await sendWhatsAppMessage(whatsapp, code);
    } else if (method === 'telegram' && telegram) {
      sent = await sendTelegramMessage(telegram, code);
    } else {
      sent = await sendWhatsAppMessage(phone, code);
    }

    if (sent) {
      res.json({
        success: true,
        message: `Verification code sent via ${method}`,
        ...(process.env.NODE_ENV !== 'production' && { code })
      });
    } else {
      res.status(500).json({ error: 'Failed to send verification code' });
    }
  } catch (error) {
    console.error('Send verification error:', error);
    res.status(500).json({ error: 'Failed to send verification code' });
  }
});

router.post('/verify-code', async (req, res) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ error: 'Phone and code are required' });
    }

    const verification = await VerificationCode.findOne({ phone }).sort({ createdAt: -1 });

    if (!verification) {
      return res.status(400).json({ error: 'No verification code found for this phone' });
    }

    if (Date.now() > verification.expires.getTime()) {
      await VerificationCode.deleteOne({ _id: verification._id });
      return res.status(400).json({ error: 'Verification code expired' });
    }

    if (verification.attempts >= 5) {
      await VerificationCode.deleteOne({ _id: verification._id });
      return res.status(400).json({ error: 'Too many attempts. Please request a new code' });
    }

    if (verification.code !== code) {
      verification.attempts++;
      await verification.save();
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    await VerificationCode.deleteOne({ _id: verification._id });
    res.json({ success: true, message: 'Phone verified successfully' });
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

module.exports = router;
