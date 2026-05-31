const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Teacher = require('../models/Teacher');
const Session = require('../models/Session');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const Blog = require('../models/Blog');
const WithdrawRequest = require('../models/WithdrawRequest');
const { protect, authorize } = require('../middleware/auth');

const coursesUploadDir = path.join(__dirname, '..', 'uploads', 'courses');
if (!fs.existsSync(coursesUploadDir)) fs.mkdirSync(coursesUploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_, __, cb) => cb(null, coursesUploadDir),
    filename: (_, file, cb) => {
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const ok = /video|image|pdf|mp4|webm|jpeg|jpg|png/.test(file.mimetype);
    cb(ok ? null : new Error('نوع الملف غير مدعوم'), ok);
  },
});

const PLACEHOLDER = '/uploads/teachers/placeholder.jpg';
const API_PUBLIC = process.env.API_PUBLIC_URL || 'https://al-athar-api.azurewebsites.net';

router.get('/', protect, authorize('admin'), (_req, res) => {
  res.json({ ok: true, module: 'admin', version: 2 });
});

router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const [totalStudents, approvedTeachers, pendingTeachers, totalSessions, totalCourses, totalEnrollments] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Teacher.countDocuments({ status: 'approved', isVerified: true }),
      Teacher.countDocuments({ status: { $in: ['pending', 'under-review'] } }),
      Session.countDocuments({ status: 'completed' }),
      Course.countDocuments({ status: 'published' }),
      Enrollment.countDocuments({ status: 'active' }),
    ]);
    const earningsAgg = await Session.aggregate([
      { $match: { status: 'completed', 'earnings.amount': { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$earnings.amount' } } },
    ]);
    res.json({
      totalStudents,
      totalTeachers: approvedTeachers,
      totalSessions,
      totalCourses,
      totalEnrollments,
      pendingTeachers,
      totalEarnings: earningsAgg[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/teachers/approved', protect, authorize('admin'), async (req, res) => {
  try {
    const teachers = await Teacher.find({ status: 'approved', isVerified: true })
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 });
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/teachers', protect, authorize('admin'), async (req, res) => {
  try {
    const {
      name, email, password, phone = '+201000000000', country = 'مصر', city = 'القاهرة',
      gender = 'male', age = 30, university = 'الأزهر', specialization = 'تحفيظ',
      hourlyRate = 50, autoApprove = true,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'الاسم والبريد وكلمة المرور مطلوبة' });
    }
    if (await User.findOne({ email: email.toLowerCase() })) {
      return res.status(409).json({ error: 'البريد مسجل مسبقاً' });
    }

    const user = await User.create({ name, email, password, phone, role: 'teacher' });
    const teacher = await Teacher.create({
      user: user._id,
      personalInfo: { fullName: name, age, gender, country, city, phone },
      academicInfo: {
        university,
        faculty: 'الشريعة',
        graduationYear: 2015,
        specialization,
        qualification: 'إجازة في القرآن',
      },
      quranInfo: { memorizedParts: 30, teachingExperience: 5, specializations: ['tajweed', 'children'] },
      documents: { idCard: PLACEHOLDER, graduationCertificate: PLACEHOLDER },
      media: {
        profilePhoto: PLACEHOLDER,
        introductionVideo: PLACEHOLDER,
        recitationVideo: PLACEHOLDER,
        teachingMethodVideo: PLACEHOLDER,
      },
      status: autoApprove ? 'approved' : 'pending',
      isVerified: !!autoApprove,
      hourlyRate,
      languages: ['arabic', 'english'],
    });

    res.status(201).json({ user: { id: user._id, name, email }, teacher });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/teachers/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ error: 'المعلم غير موجود' });

    const { name, hourlyRate, status, country, city, phone } = req.body;
    if (name) {
      await User.findByIdAndUpdate(teacher.user, { name, phone });
      teacher.personalInfo.fullName = name;
    }
    if (phone) teacher.personalInfo.phone = phone;
    if (country) teacher.personalInfo.country = country;
    if (city) teacher.personalInfo.city = city;
    if (hourlyRate != null) teacher.hourlyRate = hourlyRate;
    if (status) {
      teacher.status = status;
      teacher.isVerified = status === 'approved';
    }
    await teacher.save();
    res.json(teacher);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/upload', protect, authorize('admin', 'teacher'), upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'لم يُرفع ملف' });
  const rel = `/uploads/courses/${req.file.filename}`;
  const url = `${API_PUBLIC}${rel}`;
  res.json({ url, path: rel, filename: req.file.filename, mimetype: req.file.mimetype, size: req.file.size });
});

router.get('/courses', protect, authorize('admin'), async (req, res) => {
  try {
    const courses = await Course.find()
      .populate({ path: 'instructor', populate: { path: 'user', select: 'name' } })
      .sort({ updatedAt: -1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/courses', protect, authorize('admin'), async (req, res) => {
  try {
    const {
      titleAr, titleEn, descAr, descEn, slug, category = 'quran', level = 'beginner',
      price = 0, instructorId, image = '/courses/default.jpg', status = 'published',
    } = req.body;

    if (!titleAr || !slug || !instructorId) {
      return res.status(400).json({ error: 'العنوان والرابط والمعلم مطلوبة' });
    }
    const course = await Course.create({
      title: { ar: titleAr, en: titleEn || titleAr },
      description: { ar: descAr || titleAr, en: descEn || titleEn || titleAr },
      slug: slug.toLowerCase().replace(/\s+/g, '-'),
      category,
      level,
      price,
      currency: 'USD',
      duration: '3 months',
      durationInHours: 20,
      instructor: instructorId,
      image,
      status,
      publishedAt: status === 'published' ? new Date() : undefined,
      certificate: { enabled: true },
      stats: { enrolled: 0, rating: { average: 0, count: 0 } },
    });
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/courses/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'الدورة غير موجودة' });

    const { titleAr, titleEn, descAr, descEn, price, status, image } = req.body;
    if (titleAr) { course.title.ar = titleAr; if (!titleEn) course.title.en = titleAr; }
    if (titleEn) course.title.en = titleEn;
    if (descAr) course.description.ar = descAr;
    if (descEn) course.description.en = descEn;
    if (price != null) course.price = price;
    if (image) course.image = image;
    if (status) {
      course.status = status;
      if (status === 'published' && !course.publishedAt) course.publishedAt = new Date();
    }
    await course.save();
    res.json(course);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/courses/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Lesson.deleteMany({ course: req.params.id });
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'تم حذف الدورة' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/courses/:id/lessons', protect, authorize('admin'), async (req, res) => {
  try {
    const lessons = await Lesson.find({ course: req.params.id }).sort({ order: 1 });
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/courses/:id/lessons', protect, authorize('admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'الدورة غير موجودة' });

    const {
      titleAr, titleEn, slug, type = 'video', duration = 10,
      videoUrl, youtubeUrl, textAr, textEn, order, isPublished = true,
    } = req.body;

    const count = await Lesson.countDocuments({ course: course._id });
    const videoSrc = videoUrl || youtubeUrl || '';
    const provider = youtubeUrl || videoSrc.includes('youtube') ? 'youtube' : 'self-hosted';

    const lesson = await Lesson.create({
      title: { ar: titleAr, en: titleEn || titleAr },
      slug: (slug || `lesson-${count + 1}`).toLowerCase(),
      course: course._id,
      order: order ?? count + 1,
      type,
      duration,
      isPublished,
      publishedAt: isPublished ? new Date() : undefined,
      content: type === 'video'
        ? { video: { url: videoSrc, provider, duration: duration * 60 } }
        : { text: { ar: textAr || '', en: textEn || '' } },
    });

    course.lessons.push(lesson._id);
    await course.save();
    res.status(201).json(lesson);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/lessons/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ error: 'الدرس غير موجود' });

    const { titleAr, titleEn, videoUrl, textAr, isPublished, order } = req.body;
    if (titleAr) lesson.title.ar = titleAr;
    if (titleEn) lesson.title.en = titleEn;
    if (order != null) lesson.order = order;
    if (isPublished != null) {
      lesson.isPublished = isPublished;
      if (isPublished) lesson.publishedAt = new Date();
    }
    if (videoUrl && lesson.type === 'video') {
      lesson.content.video = { ...lesson.content.video, url: videoUrl };
    }
    if (textAr && lesson.type === 'text') {
      lesson.content.text = { ...lesson.content.text, ar: textAr };
    }
    await lesson.save();
    res.json(lesson);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/lessons/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id);
    if (!lesson) return res.status(404).json({ error: 'الدرس غير موجود' });
    await Course.updateOne({ _id: lesson.course }, { $pull: { lessons: lesson._id } });
    res.json({ message: 'تم حذف الدرس' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/blog', protect, authorize('admin'), async (req, res) => {
  try {
    const posts = await Blog.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/blog', protect, authorize('admin'), async (req, res) => {
  try {
    const { slug, titleAr, titleEn, excerptAr, contentAr, coverImage, category, status = 'published' } = req.body;
    const post = await Blog.create({
      slug: slug.toLowerCase().replace(/\s+/g, '-'),
      title: { ar: titleAr, en: titleEn || titleAr },
      excerpt: { ar: excerptAr || '', en: excerptAr || '' },
      content: { ar: contentAr || '', en: contentAr || '' },
      coverImage: coverImage || '',
      category: category || 'general',
      author: req.user.id,
      authorName: req.user.name,
      status,
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/blog/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'المقال غير موجود' });
    const { titleAr, titleEn, contentAr, excerptAr, status, featured, coverImage } = req.body;
    if (titleAr) post.title.ar = titleAr;
    if (titleEn) post.title.en = titleEn;
    if (contentAr) post.content.ar = contentAr;
    if (excerptAr) post.excerpt.ar = excerptAr;
    if (status) post.status = status;
    if (featured != null) post.featured = featured;
    if (coverImage) post.coverImage = coverImage;
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/blog/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: 'تم حذف المقال' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/withdrawals', protect, authorize('admin'), async (req, res) => {
  try {
    const status = req.query.status || 'pending';
    const filter = status === 'all' ? {} : { status };
    const withdrawals = await WithdrawRequest.find(filter)
      .populate({ path: 'teacher', populate: { path: 'user', select: 'name email' } })
      .sort({ createdAt: -1 });
    res.json({ withdrawals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/withdrawals/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { action, adminNote } = req.body;
    const withdrawal = await WithdrawRequest.findById(req.params.id);
    if (!withdrawal) return res.status(404).json({ error: 'طلب غير موجود' });
    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ error: 'تمت معالجة هذا الطلب مسبقاً' });
    }

    const teacher = await Teacher.findById(withdrawal.teacher);
    if (!teacher) return res.status(404).json({ error: 'المعلم غير موجود' });

    if (action === 'approve') {
      if (teacher.earnings.pendingEarnings < withdrawal.amount) {
        return res.status(400).json({ error: 'رصيد المعلم غير كافٍ' });
      }
      teacher.earnings.pendingEarnings -= withdrawal.amount;
      teacher.earnings.withdrawnEarnings += withdrawal.amount;
      await teacher.save();
      withdrawal.status = 'approved';
    } else if (action === 'reject') {
      withdrawal.status = 'rejected';
    } else {
      return res.status(400).json({ error: 'action يجب أن يكون approve أو reject' });
    }

    if (adminNote) withdrawal.adminNote = adminNote;
    await withdrawal.save();
    res.json({ success: true, withdrawal });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
