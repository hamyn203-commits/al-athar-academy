const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const VideoAsset = require('../models/VideoAsset');

const DEMO_COURSES = [
  {
    slug: 'quran-memorization-beginner',
    title: { ar: 'تحفيظ القرآن — المبتدئ', en: 'Quran Memorization — Beginner' },
    desc: { ar: 'ابدأ حفظ جزء عم مع معلم مجاز', en: 'Start Juz Amma with a certified teacher' },
    category: 'quran',
    programs: ['general', 'kids'],
  },
  {
    slug: 'quran-kids-fun',
    title: { ar: 'قرآن للأطفال — ممتع', en: 'Quran for Kids — Fun' },
    desc: { ar: 'حفظ وتجويد للأطفال بأسلوب تفاعلي', en: 'Interactive Quran for children' },
    category: 'children',
    programs: ['kids'],
  },
  {
    slug: 'reverts-quran-basics',
    title: { ar: 'قرآن للمسلمين الجدد', en: 'Quran for Reverts' },
    desc: { ar: 'أساسيات القراءة والحفظ للمبتدئين', en: 'Reading and memorization basics' },
    category: 'quran',
    programs: ['reverts', 'general'],
  },
  {
    slug: 'women-quran-circle',
    title: { ar: 'حلقة قرآن للنساء', en: 'Women Quran Circle' },
    desc: { ar: 'حفظ وتجويد في بيئة نسائية آمنة', en: 'Memorization and tajweed for women' },
    category: 'quran',
    programs: ['women'],
  },
];

const DEMO_VIDEOS = [
  { title: 'مقدمة في التجويد', titleEn: 'Introduction to Tajweed', category: 'tajweed', videoUrl: 'https://www.youtube.com/embed/2Qd_1wstBg0', duration: 600, sortOrder: 1 },
  { title: 'تلاوة قرآنية — نموذج', titleEn: 'Quran Recitation Sample', category: 'quran', videoUrl: 'https://www.youtube.com/embed/HGr1BOrrPyY', duration: 480, sortOrder: 2 },
  { title: 'تعلم الحروف العربية', titleEn: 'Learn Arabic Letters', category: 'arabic', videoUrl: 'https://www.youtube.com/embed/2Qd_1wstBg0', duration: 420, sortOrder: 3 },
  { title: 'سيرة النبي ﷺ — مقدمة', titleEn: 'Prophet Biography Intro', category: 'seerah', videoUrl: 'https://www.youtube.com/embed/HGr1BOrrPyY', duration: 720, sortOrder: 4 },
  { title: 'تجويد للأطفال', titleEn: 'Tajweed for Kids', category: 'kids', videoUrl: 'https://www.youtube.com/embed/2Qd_1wstBg0', duration: 360, sortOrder: 5 },
  { title: 'أحكام النون الساكنة', titleEn: 'Noon Sakinah Rules', category: 'tajweed', videoUrl: 'https://www.youtube.com/embed/HGr1BOrrPyY', duration: 540, sortOrder: 6 },
];

async function ensureDemoTeacher() {
  let teacher = await Teacher.findOne({ status: 'approved' });
  if (teacher) return teacher;

  const user = await User.create({
    name: 'الشيخ أحمد محمد',
    email: `teacher-demo-${Date.now()}@alathar.edu`,
    password: 'DemoTeacher2024!',
    role: 'teacher',
  });

  return Teacher.create({
    user: user._id,
    personalInfo: { fullName: user.name, age: 35, gender: 'male', country: 'مصر', city: 'القاهرة', phone: '+201234567890' },
    academicInfo: { university: 'الأزهر', faculty: 'الدراسات الإسلامية', graduationYear: 2010, specialization: 'التجويد', qualification: 'إجازة في القرآن' },
    documents: { idCard: '/uploads/demo/id.pdf', graduationCertificate: '/uploads/demo/cert.pdf' },
    media: {
      profilePhoto: '/assets/logo.png',
      introductionVideo: 'https://www.youtube.com/embed/2Qd_1wstBg0',
      recitationVideo: 'https://www.youtube.com/embed/HGr1BOrrPyY',
      teachingMethodVideo: 'https://www.youtube.com/embed/2Qd_1wstBg0',
    },
    quranInfo: { specializations: ['tajweed', 'children'], memorizedParts: 30 },
    status: 'approved',
    isVerified: true,
    isFeatured: true,
    languages: ['arabic', 'english'],
    stats: { totalSessions: 120, totalHours: 120, rating: { average: 4.9, count: 45 } },
  });
}

router.post('/bootstrap', async (req, res) => {
  try {
    const secret = req.headers['x-seed-secret'] || req.body?.secret;
    if (!process.env.SEED_SECRET || secret !== process.env.SEED_SECRET) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const teacher = await ensureDemoTeacher();
    const created = [];

    for (const c of DEMO_COURSES) {
      const exists = await Course.findOne({ slug: c.slug });
      if (exists) continue;
      await Course.create({
        title: c.title,
        description: c.desc,
        slug: c.slug,
        category: c.category,
        programs: c.programs,
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
        stats: { enrolled: 8, rating: { average: 4.8, count: 5 } },
      });
      created.push(c.slug);
    }

    const videosCreated = [];
    for (const v of DEMO_VIDEOS) {
      const exists = await VideoAsset.findOne({ title: v.title, category: v.category });
      if (exists) continue;
      await VideoAsset.create(v);
      videosCreated.push(v.title);
    }

    const [teacherCount, courseCount, videoCount] = await Promise.all([
      Teacher.countDocuments({ status: 'approved' }),
      Course.countDocuments({ status: 'published' }),
      VideoAsset.countDocuments({ isPublished: true }),
    ]);

    res.json({
      success: true,
      message: created.length || videosCreated.length ? 'Bootstrap seeded data' : 'Already seeded',
      created,
      videosCreated,
      teacherCount,
      courseCount,
      videoCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
