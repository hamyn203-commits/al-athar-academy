const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');
const { protect, authorize } = require('../middleware/auth');

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'جميع الحقول المطلوبة يجب تعبئتها' });
    }
    const msg = await ContactMessage.create({ name, email, phone, subject, message });
    res.status(201).json({ success: true, message: 'تم إرسال رسالتك بنجاح', id: msg._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};
    const skip = (Number(page) - 1) * Number(limit);
    const [messages, total] = await Promise.all([
      ContactMessage.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      ContactMessage.countDocuments(filter),
    ]);
    res.json({ messages, pagination: { page: Number(page), limit: Number(limit), total } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/reply', protect, authorize('admin'), async (req, res) => {
  try {
    const { reply, status = 'replied' } = req.body;
    const msg = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { adminReply: reply, status, repliedBy: req.user.id, repliedAt: new Date() },
      { new: true }
    );
    if (!msg) return res.status(404).json({ error: 'الرسالة غير موجودة' });
    res.json(msg);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const msg = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!msg) return res.status(404).json({ error: 'الرسالة غير موجودة' });
    res.json(msg);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await ContactMessage.findByIdAndDelete(req.params.id);
    res.json({ message: 'تم الحذف' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
