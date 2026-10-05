const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const Session = require('../models/Session');
const { protect, authorize } = require('../middleware/auth');
const objectStorage = require('../services/objectStorage');
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


const { isMockMode } = require('../config/runtime');
const isDBConnected = () => mongoose.connection.readyState === 1;

const publicUploadDir = path.join(__dirname, '..', 'uploads', 'teachers', 'public');
const privateUploadDir = path.join(__dirname, '..', 'uploads', 'private', 'teachers');
const privateFields = new Set(['idCard', 'graduationCertificate', 'tajweedCertificates', 'ijazat']);

if (process.env.FILE_STORAGE_DRIVER !== 'external') {
  for (const dir of [publicUploadDir, privateUploadDir]) {
    try {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    } catch (e) {
      console.warn('Uploads dir warning:', e.message);
    }
  }
}

const externalStorage = process.env.FILE_STORAGE_DRIVER === 'external';

const diskStorage = multer.diskStorage({
  destination: (_req, file, cb) => {
    cb(null, privateFields.has(file.fieldname) ? privateUploadDir : publicUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const publicMediaPath = (file) => file ? `/uploads/teachers/public/${path.basename(file.path)}` : null;
const privateDocumentPath = (file) => file ? `private/teachers/${path.basename(file.path)}` : null;

function directReference(value) {
  return value?.url || value?.pathname || null;
}

function validateDirectUpload(value, purpose, owner) {
  if (!value) return true;
  const ref = directReference(value);
  if (!ref || !owner) return false;

  if (objectStorage.getDriver() === 'vercel-blob' && !objectStorage.isVercelBlobReference(ref)) {
    return false;
  }

  return objectStorage.referenceMatches(ref, purpose, owner);
}

function validateDirectUploadList(values, purpose, owner) {
  return (values || []).every((value) => validateDirectUpload(value, purpose, owner));
}

function sanitizePublicTeacher(doc) {
  const teacher = typeof doc?.toObject === 'function' ? doc.toObject() : { ...doc };

  delete teacher.documents;
  delete teacher.reviewNotes;
  delete teacher.earnings;

  if (teacher.personalInfo) {
    teacher.personalInfo = {
      fullName: teacher.personalInfo.fullName,
      age: teacher.personalInfo.age,
      gender: teacher.personalInfo.gender,
      country: teacher.personalInfo.country,
      city: teacher.personalInfo.city,
    };
  }

  if (teacher.user && typeof teacher.user === 'object') {
    teacher.user = {
      _id: teacher.user._id,
      name: teacher.user.name,
      avatar: teacher.user.avatar,
      bio: teacher.user.bio,
    };
  }

  return teacher;
}

const upload = multer({
  storage: externalStorage ? multer.memoryStorage() : diskStorage,
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
      const { personalInfo, academicInfo, quranInfo, languages, availability, email, password, phoneVerificationToken } = req.body;
      const uploadedFiles = req.body.uploadedFiles
        ? (typeof req.body.uploadedFiles === 'string' ? JSON.parse(req.body.uploadedFiles) : req.body.uploadedFiles)
        : {};

      const uploadedFileCount = Object.values(req.files || {}).reduce((sum, list) => sum + (Array.isArray(list) ? list.length : 0), 0);
      if (externalStorage && uploadedFileCount > 0) {
        return res.status(503).json({ error: 'External file storage is not configured yet', code: 'FILE_STORAGE_NOT_READY' });
      }

      let userId = req.user?.id;
      let uploadOwner = req.user?.id || null;
      const parsedPersonalForVerification = personalInfo ? JSON.parse(personalInfo) : {};

      if (!userId) {
        if (!phoneVerificationToken) {
          return res.status(400).json({ error: 'Phone verification is required' });
        }

        try {
          const verification = jwt.verify(
            phoneVerificationToken,
            process.env.JWT_SECRET || 'wahy-namaa-dev-access-secret-change-me'
          );

          if (
            verification.purpose !== 'teacher-phone-verification' ||
            verification.phone !== parsedPersonalForVerification.phone
          ) {
            return res.status(400).json({ error: 'Phone verification does not match this application' });
          }

          uploadOwner = verification.phone;
        } catch {
          return res.status(400).json({ error: 'Phone verification is invalid or expired' });
        }
      }

      const validUploadedFiles =
        validateDirectUpload(uploadedFiles.profilePhoto, 'teacher-public', uploadOwner) &&
        validateDirectUpload(uploadedFiles.introductionVideo, 'teacher-public', uploadOwner) &&
        validateDirectUpload(uploadedFiles.teachingMethodVideo, 'teacher-public', uploadOwner) &&
        validateDirectUpload(uploadedFiles.idCard, 'teacher-private', uploadOwner) &&
        validateDirectUpload(uploadedFiles.graduationCertificate, 'teacher-private', uploadOwner) &&
        validateDirectUploadList(uploadedFiles.recitationVideo, 'teacher-public', uploadOwner) &&
        validateDirectUploadList(uploadedFiles.additionalVideos, 'teacher-public', uploadOwner) &&
        validateDirectUploadList(uploadedFiles.audioRecordings, 'teacher-public', uploadOwner) &&
        validateDirectUploadList(uploadedFiles.tajweedCertificates, 'teacher-private', uploadOwner) &&
        validateDirectUploadList(uploadedFiles.ijazat, 'teacher-private', uploadOwner);

      if (!validUploadedFiles) {
        return res.status(400).json({ error: 'One or more uploaded files do not belong to this application' });
      }

      if (!userId && email && password) {
        const normalizedEmail = email.toLowerCase().trim();

        if (isMockMode && !isDBConnected()) {
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

      if (isMockMode && !isDBConnected()) {
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

      const directRef = directReference;
      const directPublic = (value) => {
        const ref = directRef(value);
        return ref ? objectStorage.publicProxyUrl(ref) : null;
      };

      const documents = {
        idCard: directRef(uploadedFiles.idCard) || privateDocumentPath(req.files?.idCard?.[0]) || 'not-provided',
        graduationCertificate: directRef(uploadedFiles.graduationCertificate) || privateDocumentPath(req.files?.graduationCertificate?.[0]) || 'not-provided',
        tajweedCertificates: uploadedFiles.tajweedCertificates?.map(directRef).filter(Boolean)
          || req.files?.tajweedCertificates?.map(privateDocumentPath).filter(Boolean)
          || [],
        ijazat: uploadedFiles.ijazat?.map(directRef).filter(Boolean)
          || req.files?.ijazat?.map(privateDocumentPath).filter(Boolean)
          || [],
      };

      const directRecitations = uploadedFiles.recitationVideo || [];
      const recitationFiles = req.files?.recitationVideo || [];
      const profilePhoto =
        directPublic(uploadedFiles.profilePhoto) ||
        publicMediaPath(req.files?.profilePhoto?.[0]);

      const mainVideo =
        directPublic(directRecitations[0]) ||
        publicMediaPath(recitationFiles[0]) ||
        profilePhoto ||
        '/default-teacher.png';

      const media = {
        profilePhoto: profilePhoto || '/default-teacher.png',
        introductionVideo: directPublic(uploadedFiles.introductionVideo) || publicMediaPath(req.files?.introductionVideo?.[0]) || mainVideo,
        recitationVideo: mainVideo,
        teachingMethodVideo: directPublic(uploadedFiles.teachingMethodVideo) || publicMediaPath(req.files?.teachingMethodVideo?.[0]) || mainVideo,
        additionalVideos: [
          ...directRecitations.slice(1).map(directPublic),
          ...(uploadedFiles.additionalVideos?.map(directPublic) || []),
          ...recitationFiles.slice(1).map(publicMediaPath),
          ...(req.files?.additionalVideos?.map(publicMediaPath) || []),
        ].filter(Boolean),
        audioRecordings: [
          ...(uploadedFiles.audioRecordings?.map(directPublic) || []),
          ...(req.files?.audioRecordings?.map(publicMediaPath) || []),
        ].filter(Boolean),
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
        .populate('user', 'name avatar bio')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Teacher.countDocuments(filter)
    ]);

    res.json({
      teachers: teachers.map(sanitizePublicTeacher),
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
      .populate('user', 'name avatar bio')
      .sort({ 'rating.average': -1 })
      .limit(6);

    res.json(teachers.map(sanitizePublicTeacher));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/admin/pending', protect, authorize('admin'), async (req, res) => {
  if (isMockMode && !isDBConnected()) {
    return res.json([
      {
        _id: 'mock-teacher-pending-1',
        user: { _id: 'mock-u2', name: 'الشيخ أحمد محمود', email: 'ahmed.m@alathar.com' },
        personalInfo: { fullName: 'أحمد محمود', phone: '+201011112222', country: 'مصر', city: 'القاهرة' },
        academicInfo: { university: 'الأزهر الشريف', qualification: 'ليسانس أصول الدين' },
        quranInfo: { memorizedParts: 30, teachingExperience: 7 },
        status: 'pending',
        createdAt: new Date().toISOString()
      }
    ]);
  }
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
  const { action, note } = req.body;
  const statusMap = {
    approve: 'approved',
    reject: 'rejected',
    'request-changes': 'under-review'
  };

  if (isMockMode && !isDBConnected()) {
    return res.json({
      success: true,
      teacher: {
        _id: req.params.id,
        status: statusMap[action] || 'approved',
        isVerified: action === 'approve',
        reviewNotes: [{ admin: req.user?.id || 'admin', note, date: new Date() }]
      }
    });
  }
  try {
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

router.get('/admin/:id/document/:kind{/:index}', protect, authorize('admin'), async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).select('documents');
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

    const { kind } = req.params;
    const allowed = ['idCard', 'graduationCertificate', 'tajweedCertificates', 'ijazat'];
    if (!allowed.includes(kind)) return res.status(400).json({ error: 'Invalid document type' });

    let stored = teacher.documents?.[kind];
    if (Array.isArray(stored)) {
      const index = Number(req.params.index || 0);
      stored = stored[index];
    }

    if (!stored || stored === 'not-provided') {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.setHeader('Cache-Control', 'private, no-store');

    if (/^https?:\/\//i.test(stored)) {
      const result = await objectStorage.getPrivateObject(stored, {
        ifNoneMatch: req.headers['if-none-match'],
      });
      if (!result) return res.status(404).json({ error: 'Document not found' });
      if (result.statusCode === 304) return res.status(304).end();

      res.setHeader('Content-Type', result.blob?.contentType || 'application/octet-stream');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      if (result.blob?.etag) res.setHeader('ETag', result.blob.etag);

      if (result.stream?.pipe) return result.stream.pipe(res);
      const reader = result.stream?.getReader?.();
      if (!reader) return res.status(404).json({ error: 'Document not found' });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(Buffer.from(value));
      }
      return res.end();
    }

    if (!stored.startsWith('private/teachers/')) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const filename = path.basename(stored);
    const absolutePath = path.join(privateUploadDir, filename);
    if (!fs.existsSync(absolutePath)) return res.status(404).json({ error: 'Document not found' });
    return res.sendFile(absolutePath);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load document' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ 
      _id: req.params.id, 
      status: 'approved', 
      isVerified: true 
    }).populate('user', 'name avatar bio');

    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    res.json(sanitizePublicTeacher(teacher));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;