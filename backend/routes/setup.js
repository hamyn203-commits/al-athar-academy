const express = require('express');
const router = express.Router();
const User = require('../models/User');

const SEED_SECRET = process.env.SEED_SECRET;

function requireSeedSecret(req, res, next) {
  const provided = req.headers['x-seed-secret'] || req.query.seed_secret;
  if (!SEED_SECRET || provided !== SEED_SECRET) {
    return res.status(403).json({ error: 'ممنوع: سر التهيئة غير صالح' });
  }
  next();
}

router.post('/ensure-admin', requireSeedSecret, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 8) {
      return res.status(400).json({ error: 'الاسم والبريد وكلمة مرور 8+ أحرف مطلوبة' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const admins = await User.find({ role: 'admin' }).select('email _id');

    if (admins.length > 0) {
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing?.role === 'admin') {
        return res.status(200).json({
          message: 'هذا الحساب أدمن بالفعل — سجّل دخولك من /login',
          email: existing.email,
        });
      }
      return res.status(403).json({
        error: 'يوجد أدمن بالفعل. سجّل دخولك من /login أو تواصل مع الدعم.',
      });
    }

    let user = await User.findOne({ email: normalizedEmail });
    if (user) {
      user.name = name;
      user.password = password;
      user.role = 'admin';
      await user.save();
      return res.status(200).json({
        message: 'تم ترقية حسابك إلى أدمن — سجّل دخولك الآن',
        email: user.email,
      });
    }

    user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: 'admin',
    });

    res.status(201).json({
      message: 'تم إنشاء حساب الأدمن بنجاح',
      email: user.email,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'البريد مسجل مسبقاً — جرّب تسجيل الدخول' });
    }
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
