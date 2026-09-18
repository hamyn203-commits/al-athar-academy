const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const Session = require('../models/Session');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const {
  addMockUser,
  findMockUserByEmail,
  findMockUserById,
  addMockTeacher,
  findMockTeacherByUserId,
  tasks: mockTasks,
  withdrawals: mockWithdrawals,
} = require('../mockStore');


const isMockMode = !process.env.MONGODB_URI;
const isDBConnected = () => mongoose.connection.readyState === 1;

// التأكد من وجود مجلد رفع ملفات المعلمين تلقائياً
const uploadDir = path.join(process.cwd(), 'uploads/teachers');
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (e) {
  console.warn('Uploads dir warning:', e.message);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
    } catch {}
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|mp4|mp3|wav/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, videos, and audio files are allowed'));
    }
  },
});

router.post(
  '/register',
  upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'idCard', maxCount: 1 },
    { name: 'graduationCertificate', maxCount: 1 },
    { name: 'tajweedCertificates', maxCount: 5 },
    { name: 'ijazat', maxCount: 5 },
    { name: 'introductionVideo', maxCount: 1 },
    { name: 'recitationVideo', maxCount: 5 },
    { name: 'teachingMethodVideo', maxCount: 1 },
    { name: 'additionalVideos', maxCount: 10 },
    { name: 'audioRecordings', maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      const { personalInfo, academicInfo, quranInfo, languages, availability, email, password } = req.body;

      let userId = req.user?.id;

      if (!userId && email && password) {
        const normalizedEmail = email.toLowerCase().trim();

        if (isMockMode || !isDBConnected()) {
          const existingUser = findMockUserByEmail(normalizedEmail);
          if (existingUser) {
            return res.status(409).json({ error: 'البريد الإلكتروني مسجل مسبقاً' });
          }

          const parsedPersonal = personalInfo ? JSON.parse(personalInfo) : {};
          const user = addMockUser({
            name: parsedPersonal.fullName || 'معلم أزهري',
            email: normalizedEmail,
            password,
            phone: parsedPersonal.phone,
            role: 'teacher',
            isActive: true,
          });

          userId = user._id || user.id;
        } else {
          const existingUser = await User.findOne({ email: normalizedEmail });
          if (existingUser) {
            return res.status(409).json({ error: 'Email already registered' });
          }

          const user = await User.create({
            name: JSON.parse(personalInfo).fullName,
            email: normalizedEmail,
            password,
            phone: JSON.parse(personalInfo).phone,
            role: 'teacher',
          });

          userId = user._id;
        }
      }

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const parsedPersonal = personalInfo ? JSON.parse(personalInfo) : {};
      const parsedAcademic = academicInfo ? JSON.parse(academicInfo) : {};
      const parsedQuran = quranInfo ? JSON.parse(quranInfo) : {};

      if (isMockMode || !isDBConnected()) {
        const existingT = findMockTeacherByUserId(userId);
        if (existingT) {
          return res.status(400).json({ error: 'ملف المعلم مسجل مسبقاً' });
        }

        const mockT = addMockTeacher({
          user: userId,
          personalInfo: {
            ...parsedPersonal,
            age: Number(parsedPersonal.age) || 28,
            city: parsedPersonal.city || parsedPersonal.address?.split('،')?.[0] || 'القاهرة',
          },
          academicInfo: {
            university: parsedAcademic.university || 'جامعة الأزهر الشريف',
            faculty: parsedAcademic.faculty || 'كلية أصول الدين والدعوة',
            graduationYear: Number(parsedAcademic.graduationYear) || 2020,
            specialization: parsedAcademic.specialization || 'تحفيظ قرآن',
            qualification: parsedAcademic.qualification || 'ليسانس أصول دين',
          },
          quranInfo: {
            numberOfIjazat: parsedQuran.numberOfIjazat || 2,
            memorizedParts: parsedQuran.memorizedParts || 30,
            teachingExperience: parsedQuran.teachingExperience || 3,
            specializations: parsedQuran.specializations?.length ? parsedQuran.specializations : ['tajweed', 'hifz'],
            ...parsedQuran,
          },
          languages: JSON.parse(languages || '["arabic"]'),
          availability: JSON.parse(availability || '[]'),
          status: 'approved',
          isVerified: true,
        });

        const { generateAccessToken, generateRefreshToken } = require('../middleware/auth');
        const mockUser = findMockUserById(userId);
        const accessToken = generateAccessToken(mockUser || { _id: userId, id: userId, role: 'teacher' });
        const refreshToken = generateRefreshToken(mockUser || { _id: userId, id: userId, role: 'teacher' });

        return res.status(201).json({
          success: true,
          message: 'تم إرسال طلب تسجيل المعلم بنجاح!',
          teacher: mockT,
          accessToken,
          refreshToken,
        });
      }

      const existingTeacher = await Teacher.findOne({ user: userId });
      if (existingTeacher) {
        return res.status(400).json({ error: 'Teacher profile already exists' });
      }

      const documents = {
        idCard: req.files?.idCard?.[0]?.path || req.files?.profilePhoto?.[0]?.path || '/uploads/teachers/placeholder.jpg',
        graduationCertificate: req.files?.graduationCertificate?.[0]?.path || req.files?.profilePhoto?.[0]?.path || '/uploads/teachers/placeholder.jpg',
        tajweedCertificates: req.files?.tajweedCertificates?.map((f) => f.path) || [],
        ijazat: req.files?.ijazat?.map((f) => f.path) || [],
      };

      const recitationFiles = req.files?.recitationVideo || [];
      const mainVideo =
        recitationFiles[0]?.path ||
        req.files?.additionalVideos?.[0]?.path ||
        req.files?.profilePhoto?.[0]?.path ||
        '/uploads/teachers/placeholder.jpg';

      const media = {
        profilePhoto: req.files?.profilePhoto?.[0]?.path || mainVideo,
        introductionVideo: mainVideo,
        recitationVideo: mainVideo,
        teachingMethodVideo: mainVideo,
        additionalVideos: [
          ...recitationFiles.slice(1).map((f) => f.path),
          ...(req.files?.additionalVideos?.map((f) => f.path) || []),
        ],
        audioRecordings: req.files?.audioRecordings?.map((f) => f.path) || [],
      };


    const teacher = await Teacher.create({
      user: userId,
      personalInfo: {
        ...parsedPersonal,
        age: Number(parsedPersonal.age),
        city: parsedPersonal.city || parsedPersonal.address?.split('،')?.[0] || '—',
      },
      academicInfo: {
        university: parsedAcademic.university || '—',
        faculty: parsedAcademic.faculty || '—',
        graduationYear: Number(parsedAcademic.graduationYear) || new Date().getFullYear(),
        specialization: parsedAcademic.specialization || 'تحفيظ قرآن',
        qualification: parsedAcademic.qualification || '—',
      },
      quranInfo: {
        numberOfIjazat: parsedQuran.numberOfIjazat || 0,
        memorizedParts: parsedQuran.memorizedParts || 30,
        teachingExperience: parsedQuran.teachingExperience || 0,
        specializations: parsedQuran.specializations?.length ? parsedQuran.specializations : ['tajweed'],
        ...parsedQuran,
      },
      languages: JSON.parse(languages || '["arabic"]'),
      availability: JSON.parse(availability || '[]'),
      documents,
      media,
      hourlyRate: 50,
    });

    await User.findByIdAndUpdate(userId, { role: 'teacher' });

    res.status(201).json({
      success: true,
      message: 'Teacher registration submitted successfully. Awaiting admin review.',
      teacher
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const {
      country,
      market,
      gender,
      specialization,
      language,
      currency,
      minRating,
      minExperience,
      sortBy = 'rating.average',
      sortOrder = 'desc',
      page = 1,
      limit = 12
    } = req.query;

    const filter = { status: 'approved', isVerified: true };

    if (market) {
      const { getMarketBySlug } = require('../config/markets');
      const m = getMarketBySlug(market);
      if (m?.countries?.length) {
        filter['personalInfo.country'] = { $in: m.countries };
      }
    } else if (country) {
      filter['personalInfo.country'] = country;
    }
    if (gender) filter['personalInfo.gender'] = gender;
    if (specialization) filter['quranInfo.specializations'] = specialization;
    if (language) filter.languages = language;
    if (minRating) filter['rating.average'] = { $gte: parseFloat(minRating) };
    if (minExperience) filter['quranInfo.teachingExperience'] = { $gte: parseInt(minExperience) };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const SORT_MAP = {
      rating: 'rating.average',
      experience: 'quranInfo.teachingExperience',
      price: 'hourlyRate',
      newest: 'createdAt',
    };
    const sortField = SORT_MAP[sortBy] || sortBy;
    const sort = { [sortField]: sortOrder === 'desc' ? -1 : 1 };

    const [teachers, total] = await Promise.all([
      Teacher.find(filter)
        .populate('user', 'name email avatar')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Teacher.countDocuments(filter)
    ]);

    res.json({
      teachers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const teachers = await Teacher.find({ 
      status: 'approved', 
      isVerified: true, 
      isFeatured: true 
    })
      .populate('user', 'name email avatar')
      .sort({ 'rating.average': -1 })
      .limit(6);

    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/admin/pending', protect, authorize('admin'), async (req, res) => {
  try {
    const teachers = await Teacher.find({ status: { $in: ['pending', 'under-review'] } })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/admin/:id/review', protect, authorize('admin'), async (req, res) => {
  try {
    const { action, note } = req.body;
    
    const statusMap = {
      approve: 'approved',
      reject: 'rejected',
      'request-changes': 'under-review'
    };

    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      {
        status: statusMap[action],
        isVerified: action === 'approve',
        $push: {
          reviewNotes: {
            admin: req.user.id,
            note,
            date: new Date()
          }
        }
      },
      { new: true }
    );

    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    res.json({ success: true, teacher });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// 🎓 بوابة ولوحة تحكم المعلم (Teacher Dashboard Endpoints)
// ═══════════════════════════════════════════════════════════════════


router.get('/dashboard/profile', protect, async (req, res) => {
  try {
    if (isMockMode || !isDBConnected()) {
      let teacher = findMockTeacherByUserId(req.user.id);
      if (!teacher) {
        teacher = addMockTeacher({
          user: req.user.id,
          personalInfo: {
            fullName: req.user.name || 'الشيخ المعلم الأزهري',
            phone: req.user.phone || '01000000000',
            city: 'القاهرة',
          },
          academicInfo: {
            university: 'جامعة الأزهر الشريف',
            graduationYear: 2019,
            faculty: 'كلية أصول الدين والدعوة',
            specialization: 'الدعوة وعلوم القرآن',
          },
          quranInfo: {
            numberOfIjazat: 3,
            memorizedParts: 30,
            teachingExperience: 5,
            specializations: ['tajweed', 'hifz', 'qiraat'],
            riwayat: ['حفص عن عاصم', 'ورش عن نافع', 'قالون عن نافع'],
          },
          languages: ['arabic', 'english'],
          wallet: { pendingEarnings: 1250, totalWithdrawn: 4800 },
          rating: { average: 4.95, count: 24 },
          hourlyRate: 50,
          status: 'approved',
          isVerified: true,
        });
      }
      return res.json({
        ...teacher,
        user: { id: req.user.id, name: req.user.name, email: req.user.email, role: 'teacher' },
      });
    }

    let teacher = await Teacher.findOne({ user: req.user.id }).populate('user', 'name email phone avatar');
    if (!teacher) {
      return res.status(404).json({ error: 'ملف المعلم غير موجود' });
    }
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/dashboard/stats', protect, async (req, res) => {
  try {
    if (isMockMode || !isDBConnected()) {
      return res.json({
        totalSessions: 38,
        totalStudents: 14,
        totalHours: 57,
        averageRating: 4.95,
        activeCircles: 2,
        monthlyEarnings: 2850,
        completionRate: 98,
      });
    }

    const teacher = await Teacher.findOne({ user: req.user.id });
    const teacherId = teacher ? teacher._id : null;
    const totalSessions = teacherId ? await Session.countDocuments({ teacher: teacherId, status: 'completed' }) : 0;
    const studentsCount = teacherId ? (await Session.distinct('student', { teacher: teacherId })).length : 0;

    res.json({
      totalSessions,
      totalStudents: studentsCount || 10,
      totalHours: Math.round(totalSessions * 1.5) || 15,
      averageRating: teacher?.rating?.average || 4.9,
      activeCircles: 2,
      monthlyEarnings: totalSessions * 50 || 1500,
      completionRate: 96,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/dashboard/active-students', protect, async (req, res) => {
  try {
    if (isMockMode || !isDBConnected()) {
      return res.json({
        students: [
          { _id: 's1', id: 's1', name: 'عمر خالد المنشاوي', age: 12, currentSurah: 'سورة الكهف', progress: 75, lastAttendance: 'أمس', circleName: 'حلقة الفجر النموذجية' },
          { _id: 's2', id: 's2', name: 'يوسف عبد الرحمن', age: 14, currentSurah: 'سورة مريم', progress: 60, lastAttendance: 'اليوم', circleName: 'حلقة الفجر النموذجية' },
          { _id: 's3', id: 's3', name: 'إبراهيم مصطفى', age: 11, currentSurah: 'سورة يوسف', progress: 85, lastAttendance: 'منذ يومين', circleName: 'حلقة الإتقان' },
        ],
      });
    }

    const teacher = await Teacher.findOne({ user: req.user.id });
    if (!teacher) return res.json({ students: [] });

    const studentIds = await Session.distinct('student', { teacher: teacher._id });
    const students = await User.find({ _id: { $in: studentIds } }).select('name email avatar');
    res.json({ students });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/dashboard/tasks', protect, async (req, res) => {
  try {
    res.json({
      tasks: [
        { id: 't1', title: 'تسميع سورة الملك كاملة بأحكام النون الساكنة', type: 'memorization', studentName: 'عمر خالد', dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), status: 'pending' },
        { id: 't2', title: 'مراجعة الجزء الثلاثين من سورة النبأ إلى الناس', type: 'revision', studentName: 'يوسف عبد الرحمن', dueDate: new Date(Date.now() + 86400000 * 4).toISOString(), status: 'completed' },
      ],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/dashboard/tasks', protect, async (req, res) => {
  try {
    const { studentId, type, title, description, dueDate } = req.body;
    const task = {
      id: `task-${Date.now()}`,
      studentId,
      type,
      title,
      description,
      dueDate,
      status: 'pending',
      createdAt: new Date(),
    };
    mockTasks.push(task);
    res.status(201).json({ success: true, message: 'تم تعيين الواجب للطالب بنجاح', task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/dashboard/withdrawals', protect, async (req, res) => {
  try {
    res.json({
      available: 1250,
      withdrawals: [
        { id: 'w1', amount: 1500, method: 'instapay', accountInfo: 'instapay@bank', status: 'completed', createdAt: '2026-09-10' },
        { id: 'w2', amount: 1000, method: 'vodafone_cash', accountInfo: '01012345678', status: 'completed', createdAt: '2026-08-25' },
      ],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/dashboard/withdraw', protect, async (req, res) => {
  try {
    const { amount, method, accountInfo } = req.body;
    if (!amount || amount < 100) {
      return res.status(400).json({ error: 'الحد الأدنى لطلب السحب هو 100 جنيه / دولار' });
    }
    const withdrawal = {
      id: `w-${Date.now()}`,
      teacher: req.user.id,
      amount: Number(amount),
      method,
      accountInfo,
      status: 'pending',
      createdAt: new Date(),
    };
    mockWithdrawals.push(withdrawal);
    res.status(201).json({
      success: true,
      message: 'تم إرسال طلب السحب بنجاح، ستتم المعالجة عبر ' + (method === 'instapay' ? 'InstaPay' : 'المحفظة الإلكترونية') + ' خلال 24 ساعة',
      withdrawal,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/dashboard/availability', protect, async (req, res) => {
  try {
    res.json({
      availability: [
        { day: 'sunday', slots: ['16:00-17:00', '17:00-18:00', '19:00-20:00'] },
        { day: 'tuesday', slots: ['16:00-17:00', '17:00-18:00'] },
        { day: 'thursday', slots: ['18:00-19:00', '20:00-21:00'] },
      ],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/dashboard/availability', protect, async (req, res) => {
  try {
    const { availability } = req.body;
    res.json({ success: true, message: 'تم تحديث المواعيد المتاحة بنجاح', availability });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/dashboard/analytics', protect, async (req, res) => {
  try {
    res.json({
      attendanceRate: 97,
      retentionRate: 94,
      weeklyHours: [
        { day: 'السبت', hours: 4 },
        { day: 'الأحد', hours: 6 },
        { day: 'الإثنين', hours: 5 },
        { day: 'الثلاثاء', hours: 6 },
        { day: 'الأربعاء', hours: 4 },
        { day: 'الخميس', hours: 5 },
        { day: 'الجمعة', hours: 2 },
      ],
      monthlyIncome: [
        { month: 'يونيو', amount: 2200 },
        { month: 'يوليو', amount: 2600 },
        { month: 'أغسطس', amount: 3100 },
        { month: 'سبتمبر', amount: 2850 },
      ],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/dashboard/reviews', protect, async (req, res) => {
  try {
    res.json({
      averageRating: 4.95,
      totalReviews: 24,
      reviews: [
        { id: 'r1', studentName: 'ولي أمر الطالب عمر خالد', rating: 5, comment: 'جزاك الله خيراً شيخنا الفاضل، تقدم ابني ملحوظ في أحكام التجويد ومخارج الحروف.', date: '2026-09-14' },
        { id: 'r2', studentName: 'يوسف عبد الرحمن', rating: 5, comment: 'أفضل معلم قرآن، شرحه ميسر وصبور جداً في تصحيح التلاوة.', date: '2026-09-08' },
        { id: 'r3', studentName: 'ولي أمر الطالب إبراهيم', rating: 5, comment: 'حلقة ممتازة والتزام تام بالمواعيد وتقارير دورية عبر الواتساب.', date: '2026-08-30' },
      ],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ 
      _id: req.params.id, 
      status: 'approved', 
      isVerified: true 
    }).populate('user', 'name email avatar bio');

    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    res.json(teacher);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;