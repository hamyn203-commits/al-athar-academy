const express = require('express');
const router = express.Router();
const JobApplication = require('../models/JobApplication');
const JOBS = require('../config/careers');
const { protect, authorize } = require('../middleware/auth');

router.get('/jobs', (req, res) => {
  res.json({ jobs: JOBS });
});

router.post('/apply', async (req, res) => {
  try {
    const { name, email, phone, position, coverLetter, resumeUrl, experience, languages } = req.body;
    if (!name || !email || !phone || !position) {
      return res.status(400).json({ error: 'جميع الحقول الأساسية مطلوبة' });
    }
    const job = JOBS.find((j) => j.id === position);
    if (!job) return res.status(400).json({ error: 'الوظيفة غير موجودة' });

    const app = await JobApplication.create({
      name, email, phone, position, coverLetter, resumeUrl, experience, languages,
    });
    res.status(201).json({ success: true, message: 'تم استلام طلبك — سنتواصل معك قريباً', id: app._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/applications', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = status ? { status } : {};
    const skip = (Number(page) - 1) * Number(limit);
    const [applications, total] = await Promise.all([
      JobApplication.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      JobApplication.countDocuments(filter),
    ]);
    res.json({ applications, pagination: { page: Number(page), limit: Number(limit), total } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
