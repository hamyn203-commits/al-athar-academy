const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const { protect, authorize } = require('../middleware/auth');
const { notifyAdmin } = require('../services/growthNotify');

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, amount, currency, category, message, isAnonymous } = req.body;
    if (!name || !email || !amount) {
      return res.status(400).json({ error: 'الاسم والبريد والمبلغ مطلوبة' });
    }
    const donation = await Donation.create({
      name, email, phone, amount: Number(amount), currency, category, message, isAnonymous,
    });
    notifyAdmin({
      subject: `تبرع جديد — ${amount} ${currency || 'USD'}`,
      html: `<p>تبرع من ${isAnonymous ? 'مجهول' : name} (${email})</p><p>الفئة: ${category} — ${amount} ${currency}</p>`,
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
  try {
    const { page = 1, limit = 20, status } = req.query;
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
    const donation = await Donation.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!donation) return res.status(404).json({ error: 'التبرع غير موجود' });
    res.json(donation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
