const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const VerificationCode = require('../models/VerificationCode');
const { sendWhatsApp, sendTelegram } = require('../services/notificationDispatcher');

const OTP_MSG = (code) => `رمز التحقق — أكاديمية وَحْيٌ وَنَمَاء: ${code}\nصالح 10 دقائق.`;

router.post('/send-verification', async (req, res) => {
  try {
    const { phone, method, whatsapp, telegram } = req.body;

    if (!phone) return res.status(400).json({ error: 'Phone number is required' });
    if (!['whatsapp', 'telegram'].includes(method)) {
      return res.status(400).json({ error: 'Unsupported verification method' });
    }

    const code = crypto.randomInt(100000, 1000000).toString();

    await VerificationCode.deleteMany({ phone });
    await VerificationCode.create({
      phone,
      code,
      method,
      expires: new Date(Date.now() + 10 * 60 * 1000),
      attempts: 0
    });

    const msg = OTP_MSG(code);
    const result = method === 'telegram' && telegram
      ? await sendTelegram({ chatId: telegram, text: msg })
      : await sendWhatsApp({ phone: whatsapp || phone, text: msg });

    if (!result?.sent) return res.status(502).json({ error: 'Failed to send verification code' });

    return res.json({
      success: true,
      message: `Verification code sent via ${method}`,
      ...(process.env.NODE_ENV !== 'production' && { code })
    });
  } catch (error) {
    console.error('Send verification error:', error);
    return res.status(500).json({ error: 'Failed to send verification code' });
  }
});

router.post('/verify-code', async (req, res) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) return res.status(400).json({ error: 'Phone and code are required' });

    const verification = await VerificationCode.findOne({ phone }).sort({ createdAt: -1 });
    if (!verification) return res.status(400).json({ error: 'No verification code found for this phone' });

    if (Date.now() > verification.expires.getTime()) {
      await VerificationCode.deleteOne({ _id: verification._id });
      return res.status(400).json({ error: 'Verification code expired' });
    }

    if (verification.attempts >= 5) {
      await VerificationCode.deleteOne({ _id: verification._id });
      return res.status(429).json({ error: 'Too many attempts. Please request a new code' });
    }

    if (verification.code !== code) {
      verification.attempts += 1;
      await verification.save();
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    await VerificationCode.deleteOne({ _id: verification._id });

    const secret = process.env.JWT_SECRET;
    if (!secret && process.env.NODE_ENV === 'production') {
      return res.status(503).json({ error: 'Verification service is not configured' });
    }

    const verificationToken = jwt.sign(
      { phone, purpose: 'teacher-phone-verification' },
      secret || 'wahy-namaa-dev-access-secret-change-me',
      { expiresIn: '30m' }
    );

    return res.json({
      success: true,
      message: 'Phone verified successfully',
      verificationToken,
    });
  } catch (error) {
    console.error('Verify code error:', error);
    return res.status(500).json({ error: 'Verification failed' });
  }
});

module.exports = router;
