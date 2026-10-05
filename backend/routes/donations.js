const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Donation = require('../models/Donation');
const { protect, authorize } = require('../middleware/auth');
const { notifyAdmin } = require('../services/growthNotify');

const isMockMode = !process.env.MONGODB_URI;
const isDBConnected = () => mongoose.connection.readyState === 1;

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, amount, currency = 'USD', category = 'general', message, isAnonymous } = req.body;
    const cleanName = String(name || '').trim();
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPhone = String(phone || '').trim();
    const cleanMessage = String(message || '').trim();
    const numericAmount = Number(amount);
    const normalizedCurrency = String(currency || 'USD').toUpperCase();
    const allowedCurrencies = ['USD', 'EUR', 'GBP', 'SAR', 'AED', 'EGP'];
    const allowedCategories = ['student', 'teacher', 'halaqa', 'general'];

    if (!cleanName || !cleanEmail || !numericAmount) {
      return res.status(400).json({ error: 'الاسم والبريد والمبلغ مطلوبة' });
    }
    if (cleanName.length < 2 || cleanName.length > 100) {
      return res.status(400).json({ error: 'الاسم غير صالح' });
    }
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail) || cleanEmail.length > 254) {
      return res.status(400).json({ error: 'البريد الإلكتروني غير صالح' });
    }
    if (!Number.isFinite(numericAmount) || numericAmount < 1 || numericAmount > 10000000) {
      return res.status(400).json({ error: 'المبلغ غير صالح' });
    }
    if (!allowedCurrencies.includes(normalizedCurrency) || !allowedCategories.includes(category)) {
      return res.status(400).json({ error: 'العملة أو فئة التبرع غير صالحة' });
    }
    if (cleanPhone.length > 32 || cleanMessage.length > 500) {
      return res.status(400).json({ error: 'بيانات التبرع تتجاوز الحد المسموح' });
    }

    if (isMockMode || !isDBConnected()) {
      return res.status(201).json({
        success: true,
        message: 'شكراً لتبرعك — سنتواصل معك لإتمام العملية',
        id: 'mock-donation-' + Date.now(),
      });
    }
    const donation = await Donation.create({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      amount: numericAmount,
      currency: normalizedCurrency,
      category,
      message: cleanMessage,
      isAnonymous: Boolean(isAnonymous),
    });
    notifyAdmin({
      subject: `تبرع جديد — ${numericAmount} ${normalizedCurrency}`,
      html: `<p>تم تسجيل تعهد تبرع جديد.</p><p>راجع لوحة الإدارة للاطلاع على بيانات المتبرع.</p>`,
    }).catch(() => {});
    res.status(201).json({ success: true, message: 'شكراً لتبرعك — سنتواصل معك لإتمام العملية', id: donation._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const [totals, byCategory] = await Promise.all([
      Donation.aggregate([
        { $match: { status: { $in: ['pledged', 'confirmed'] } } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Donation.aggregate([
        { $match: { status: { $in: ['pledged', 'confirmed'] } } },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
    ]);
    res.json({
      totalAmount: totals[0]?.total || 0,
      totalDonors: totals[0]?.count || 0,
      byCategory: byCategory.reduce((acc, c) => ({ ...acc, [c._id]: { total: c.total, count: c.count } }), {}),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/config', async (_req, res) => {
  res.json({
    paymentEnabled: !!(process.env.STRIPE_DONATION_URL || process.env.PAYPAL_DONATION_URL),
    stripeUrl: process.env.STRIPE_DONATION_URL || '',
    paypalUrl: process.env.PAYPAL_DONATION_URL || '',
  });
});

router.get('/', protect, authorize('admin'), async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  if (isMockMode || !isDBConnected()) {
    return res.json({
      donations: [],
      pagination: { page: Number(page), limit: Number(limit), total: 0 }
    });
  }
  try {
    const filter = status ? { status } : {};
    const skip = (Number(page) - 1) * Number(limit);
    const [donations, total] = await Promise.all([
      Donation.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Donation.countDocuments(filter),
    ]);
    res.json({ donations, pagination: { page: Number(page), limit: Number(limit), total } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['pledged', 'confirmed', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'حالة التبرع غير صالحة' });
    }
    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!donation) return res.status(404).json({ error: 'التبرع غير موجود' });
    res.json(donation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
