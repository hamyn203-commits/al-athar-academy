const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/teachers');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
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
  }
});

router.post('/register', upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'idCard', maxCount: 1 },
  { name: 'graduationCertificate', maxCount: 1 },
  { name: 'tajweedCertificates', maxCount: 5 },
  { name: 'ijazat', maxCount: 5 },
  { name: 'introductionVideo', maxCount: 1 },
  { name: 'recitationVideo', maxCount: 5 },
  { name: 'teachingMethodVideo', maxCount: 1 },
  { name: 'additionalVideos', maxCount: 10 },
  { name: 'audioRecordings', maxCount: 5 }
]), async (req, res) => {
  try {
    const { personalInfo, academicInfo, quranInfo, languages, availability, email, password } = req.body;

    let userId = req.user?.id;

    if (!userId && email && password) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      
      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const user = await User.create({
        name: JSON.parse(personalInfo).fullName,
        email,
        password,
        phone: JSON.parse(personalInfo).phone,
        role: 'teacher'
      });

      userId = user._id;
    }

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const existingTeacher = await Teacher.findOne({ user: userId });
    if (existingTeacher) {
      return res.status(400).json({ error: 'Teacher profile already exists' });
    }

    const documents = {
      idCard: req.files?.idCard?.[0]?.path || req.files?.profilePhoto?.[0]?.path || '/uploads/teachers/placeholder.jpg',
      graduationCertificate: req.files?.graduationCertificate?.[0]?.path || req.files?.profilePhoto?.[0]?.path || '/uploads/teachers/placeholder.jpg',
      tajweedCertificates: req.files?.tajweedCertificates?.map(f => f.path) || [],
      ijazat: req.files?.ijazat?.map(f => f.path) || [],
    };

    const recitationFiles = req.files?.recitationVideo || [];
    const mainVideo = recitationFiles[0]?.path
      || req.files?.additionalVideos?.[0]?.path
      || req.files?.profilePhoto?.[0]?.path
      || '/uploads/teachers/placeholder.jpg';

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

    const parsedPersonal = JSON.parse(personalInfo);
    const parsedAcademic = JSON.parse(academicInfo);
    const parsedQuran = JSON.parse(quranInfo || '{}');

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
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

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