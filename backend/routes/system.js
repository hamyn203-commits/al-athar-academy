const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Teacher = require('../models/Teacher');
const User = require('../models/User');

router.post('/bootstrap', async (req, res) => {
  try {
    const secret = req.headers['x-seed-secret'] || req.body?.secret;
    if (!process.env.SEED_SECRET || secret !== process.env.SEED_SECRET) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const [teacherCount, courseCount] = await Promise.all([
      Teacher.countDocuments({ status: 'approved' }),
      Course.countDocuments({ status: 'published' }),
    ]);

    if (teacherCount > 0 && courseCount > 0) {
      return res.json({ skipped: true, message: 'Data already exists', teacherCount, courseCount });
    }

    let teacher = await Teacher.findOne({ status: 'approved' });
    if (!teacher) {
      const user = await User.create({
        name: 'الشيخ أحمد محمد',
        email: `teacher-demo-${Date.now()}@alathar.edu`,
        password: 'DemoTeacher2024!',
        role: 'teacher',
      });
      teacher = await Teacher.create({
        user: user._id,
        personalInfo: { fullName: user.name, country: 'مصر', city: 'القاهرة', phone: '+201234567890' },
        status: 'approved',
        isVerified: true,
        isFeatured: true,
        languages: ['ar', 'en'],
        specializations: ['quran', 'tajweed'],
        stats: { totalSessions: 120, totalHours: 120, rating: { average: 4.9, count: 45 } },
      });
    }

    let course = await Course.findOne({ slug: 'quran-memorization-beginner' });
    if (!course) {
      course = await Course.create({
        title: { ar: 'تحفيظ القرآن — المبتدئ', en: 'Quran Memorization — Beginner' },
        description: { ar: 'ابدأ حفظ جزء عم مع معلم مجاز', en: 'Start Juz Amma with a certified teacher' },
        slug: 'quran-memorization-beginner',
        category: 'quran',
        programs: ['general', 'kids'],
        level: 'beginner',
        price: 0,
        currency: 'USD',
        duration: '3 months',
        durationInHours: 20,
        instructor: teacher._id,
        image: '/courses/quran-beginner.jpg',
        status: 'published',
        publishedAt: new Date(),
        certificate: { enabled: true },
        stats: { enrolled: 12, rating: { average: 4.9, count: 8 } },
      });
    }

    res.json({ success: true, message: 'Bootstrap complete', teacherId: teacher._id, courseSlug: course.slug });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
