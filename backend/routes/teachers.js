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
const { resolveOwnedTeacherAssets } = require('../utils/teacherAssetLifecycle');
const { sendEmail } = require('../services/notificationDispatcher');
const { notifyAdmins } = require('../utils/notify');
const AdminAuditLog = require('../models/AdminAuditLog');
const { logAdminAction } = require('../services/adminAudit');
const {
  REVIEW_ITEMS,
  buildTeacherReviewGate,
  sanitizeChecklistStatus,
  itemRequiredForTeacher,
} = require('../services/teacherReview');
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

function createTeacherApplicationStatusToken({ userId, teacherId, email }) {
  return jwt.sign(
    {
      purpose: 'teacher-application-status',
      userId: String(userId),
      teacherId: String(teacherId),
      email: String(email || '').trim().toLowerCase(),
    },
    process.env.JWT_SECRET || 'wahy-namaa-dev-access-secret-change-me',
    { expiresIn: '7d' }
  );
}

const publicUploadDir = path.join(__dirname, '..', 'uploads', 'teachers', 'public');
const privateUploadDir = path.join(__dirname, '..', 'uploads', 'private', 'teachers');
const privateFields = new Set(['idCard', 'idCardFront', 'idCardBack', 'graduationCertificate', 'tajweedCertificates', 'ijazat']);

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

async function streamAdminTeacherAsset(reference, res, { fallbackContentType = 'application/octet-stream' } = {}) {
  reference = objectStorage.unwrapPublicProxyReference(reference);
  if (!reference || reference === 'not-provided' || reference === '/default-teacher.png') {
    return res.status(404).json({ error: 'Asset not found' });
  }

  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (/^https?:\/\//i.test(reference)) {
    // External object-storage references stay private and are streamed through
    // this authenticated admin endpoint.
    const result = await objectStorage.getPrivateObject(reference, {
      ifNoneMatch: res.req?.headers?.['if-none-match'],
    }).catch(() => null);

    if (result) {
      if (result.statusCode === 304) return res.status(304).end();
      res.setHeader('Content-Type', result.blob?.contentType || fallbackContentType);
      if (result.blob?.etag) res.setHeader('ETag', result.blob.etag);

      if (result.stream?.pipe) return result.stream.pipe(res);
      const reader = result.stream?.getReader?.();
      if (!reader) return res.status(404).json({ error: 'Asset not found' });
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(Buffer.from(value));
      }
      return res.end();
    }

    try {
      const parsed = new URL(reference);
      reference = parsed.pathname;
    } catch {
      return res.status(404).json({ error: 'Asset not found' });
    }
  }

  const normalized = String(reference).replace(/^\/+/, '');
  let absolutePath = null;

  if (normalized.startsWith('uploads/teachers/public/')) {
    absolutePath = path.join(publicUploadDir, path.basename(normalized));
  } else if (normalized.startsWith('private/teachers/')) {
    absolutePath = path.join(privateUploadDir, path.basename(normalized));
  }

  if (!absolutePath || !fs.existsSync(absolutePath)) {
    return res.status(404).json({ error: 'Asset not found' });
  }

  return res.sendFile(absolutePath);
}

function teacherDossierPayload(teacher, gate, auditEntries = [], activity = {}) {
  const raw = teacher.toObject ? teacher.toObject() : teacher;
  const documents = raw.documents || {};
  const media = raw.media || {};

  return {
    teacher: {
      _id: raw._id,
      user: raw.user,
      personalInfo: raw.personalInfo,
      academicInfo: raw.academicInfo,
      quranInfo: raw.quranInfo,
      languages: raw.languages || [],
      hourlyRate: raw.hourlyRate,
      availabilityTimezone: raw.availabilityTimezone,
      status: raw.status,
      isVerified: raw.isVerified,
      reviewNotes: raw.reviewNotes || [],
      reviewChecklist: raw.reviewChecklist || [],
      reviewStartedAt: raw.reviewStartedAt,
      reviewCompletedAt: raw.reviewCompletedAt,
      rating: raw.rating,
      stats: raw.stats,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      documents: {
        idCard: Boolean(documents.idCard && documents.idCard !== 'not-provided'),
        idCardFront: Boolean(documents.idCardFront && documents.idCardFront !== 'not-provided'),
        idCardBack: Boolean(documents.idCardBack && documents.idCardBack !== 'not-provided'),
        graduationCertificateAvailable: Boolean(documents.graduationCertificateAvailable),
        graduationCertificate: Boolean(documents.graduationCertificate && documents.graduationCertificate !== 'not-provided'),
        tajweedCertificatesAvailable: Boolean(documents.tajweedCertificatesAvailable),
        tajweedCertificatesCount: (documents.tajweedCertificates || []).filter(Boolean).length,
        ijazatAvailable: Boolean(documents.ijazatAvailable),
        ijazatCount: (documents.ijazat || []).filter(Boolean).length,
      },
      media: {
        profilePhoto: Boolean(media.profilePhoto && media.profilePhoto !== '/default-teacher.png'),
        introductionVideo: Boolean(media.introductionVideo && media.introductionVideo !== '/default-teacher.png'),
        recitationVideo: Boolean(media.recitationVideo && media.recitationVideo !== '/default-teacher.png'),
        teachingMethodVideo: Boolean(media.teachingMethodVideo && media.teachingMethodVideo !== '/default-teacher.png'),
        additionalVideosCount: (media.additionalVideos || []).filter(Boolean).length,
        audioRecordingsCount: (media.audioRecordings || []).filter(Boolean).length,
      },
    },
    gate,
    activity,
    audit: auditEntries.map((entry) => ({
      _id: entry._id,
      action: entry.action,
      reason: entry.reason,
      metadata: entry.metadata,
      actor: entry.actor,
      createdAt: entry.createdAt,
    })),
  };
}

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
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|jfif|png|pdf|mp4|webm|mov|quicktime|mp3|wav/;
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
    { name: 'idCardFront', maxCount: 1 },
    { name: 'idCardBack', maxCount: 1 },
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
      const {
        personalInfo, academicInfo, quranInfo, languages, availability,
        email, password, verificationToken, phoneVerificationToken
      } = req.body;
      const uploadedFiles = req.body.uploadedFiles
        ? (typeof req.body.uploadedFiles === 'string' ? JSON.parse(req.body.uploadedFiles) : req.body.uploadedFiles)
        : {};
      const documentAvailability = req.body.documentAvailability
        ? (typeof req.body.documentAvailability === 'string'
          ? JSON.parse(req.body.documentAvailability)
          : req.body.documentAvailability)
        : {};
      const declaredDocuments = {
        graduationCertificate: documentAvailability.graduationCertificate === true,
        tajweedCertificates: documentAvailability.tajweedCertificates === true,
        ijazat: documentAvailability.ijazat === true,
      };

      const uploadedFileCount = Object.values(req.files || {}).reduce((sum, list) => sum + (Array.isArray(list) ? list.length : 0), 0);
      if (externalStorage && uploadedFileCount > 0) {
        return res.status(503).json({ error: 'External file storage is not configured yet', code: 'FILE_STORAGE_NOT_READY' });
      }

      let userId = req.user?.id;
      let uploadOwner = req.user?.id || null;
      const parsedPersonalForVerification = personalInfo ? JSON.parse(personalInfo) : {};

      if (!userId) {
        const teacherVerificationToken = verificationToken || phoneVerificationToken;
        if (!teacherVerificationToken) {
          return res.status(400).json({ error: 'Email verification is required' });
        }

        try {
          const verification = jwt.verify(
            teacherVerificationToken,
            process.env.JWT_SECRET || 'wahy-namaa-dev-access-secret-change-me'
          );
          const normalizedEmail = String(email || '').trim().toLowerCase();

          if (verification.purpose === 'teacher-email-verification') {
            if (!normalizedEmail || verification.email !== normalizedEmail) {
              return res.status(400).json({ error: 'Email verification does not match this application' });
            }
            uploadOwner = verification.email;
          } else if (
            phoneVerificationToken &&
            verification.purpose === 'teacher-phone-verification' &&
            verification.phone === parsedPersonalForVerification.phone
          ) {
            // Transitional support for verification tokens issued before the email-OTP rollout.
            uploadOwner = verification.phone;
          } else {
            return res.status(400).json({ error: 'Verification does not match this application' });
          }
        } catch {
          return res.status(400).json({ error: 'Email verification is invalid or expired' });
        }
      }

      const validUploadedFiles =
        validateDirectUpload(uploadedFiles.profilePhoto, 'teacher-public', uploadOwner) &&
        validateDirectUpload(uploadedFiles.introductionVideo, 'teacher-public', uploadOwner) &&
        validateDirectUpload(uploadedFiles.teachingMethodVideo, 'teacher-public', uploadOwner) &&
        validateDirectUpload(uploadedFiles.idCard, 'teacher-private', uploadOwner) &&
        validateDirectUpload(uploadedFiles.idCardFront, 'teacher-private', uploadOwner) &&
        validateDirectUpload(uploadedFiles.idCardBack, 'teacher-private', uploadOwner) &&
        validateDirectUpload(uploadedFiles.graduationCertificate, 'teacher-private', uploadOwner) &&
        validateDirectUploadList(uploadedFiles.recitationVideo, 'teacher-public', uploadOwner) &&
        validateDirectUploadList(uploadedFiles.additionalVideos, 'teacher-public', uploadOwner) &&
        validateDirectUploadList(uploadedFiles.audioRecordings, 'teacher-public', uploadOwner) &&
        validateDirectUploadList(uploadedFiles.tajweedCertificates, 'teacher-private', uploadOwner) &&
        validateDirectUploadList(uploadedFiles.ijazat, 'teacher-private', uploadOwner);

      if (!validUploadedFiles) {
        return res.status(400).json({ error: 'One or more uploaded files do not belong to this application' });
      }

      const hasDirectOrLegacy = (directValue, legacyFiles) => Boolean(
        directReference(directValue) || legacyFiles?.[0]
      );
      const hasDirectOrLegacyList = (directValues, legacyFiles) => Boolean(
        (Array.isArray(directValues) && directValues.length) ||
        (Array.isArray(legacyFiles) && legacyFiles.length)
      );

      if (!hasDirectOrLegacy(uploadedFiles.profilePhoto, req.files?.profilePhoto)) {
        return res.status(400).json({
          error: 'Profile photo is required',
          code: 'TEACHER_PROFILE_PHOTO_REQUIRED',
        });
      }

      if (!hasDirectOrLegacy(uploadedFiles.idCardFront, req.files?.idCardFront)) {
        return res.status(400).json({
          error: 'ID card front is required',
          code: 'TEACHER_ID_FRONT_REQUIRED',
        });
      }

      if (!hasDirectOrLegacy(uploadedFiles.idCardBack, req.files?.idCardBack)) {
        return res.status(400).json({
          error: 'ID card back is required',
          code: 'TEACHER_ID_BACK_REQUIRED',
        });
      }

      if (!hasDirectOrLegacy(uploadedFiles.introductionVideo, req.files?.introductionVideo)) {
        return res.status(400).json({
          error: 'Introduction video is required',
          code: 'TEACHER_INTRODUCTION_VIDEO_REQUIRED',
        });
      }

      if (!hasDirectOrLegacyList(uploadedFiles.recitationVideo, req.files?.recitationVideo)) {
        return res.status(400).json({
          error: 'At least one recitation video is required',
          code: 'TEACHER_RECITATION_VIDEO_REQUIRED',
        });
      }

      if (!hasDirectOrLegacy(uploadedFiles.teachingMethodVideo, req.files?.teachingMethodVideo)) {
        return res.status(400).json({
          error: 'Teaching method video is required',
          code: 'TEACHER_TEACHING_METHOD_VIDEO_REQUIRED',
        });
      }

      if (
        !['graduationCertificate', 'tajweedCertificates', 'ijazat']
          .every((field) => typeof documentAvailability[field] === 'boolean')
      ) {
        return res.status(400).json({
          error: 'Document availability declarations are required',
          code: 'TEACHER_DOCUMENT_DECLARATION_REQUIRED',
        });
      }

      if (
        declaredDocuments.graduationCertificate &&
        !hasDirectOrLegacy(uploadedFiles.graduationCertificate, req.files?.graduationCertificate)
      ) {
        return res.status(400).json({
          error: 'Graduation certificate was marked available but no file was uploaded',
          code: 'TEACHER_GRADUATION_CERTIFICATE_REQUIRED',
        });
      }

      if (
        declaredDocuments.tajweedCertificates &&
        !hasDirectOrLegacyList(uploadedFiles.tajweedCertificates, req.files?.tajweedCertificates)
      ) {
        return res.status(400).json({
          error: 'Tajweed certificates were marked available but no file was uploaded',
          code: 'TEACHER_TAJWEED_CERTIFICATE_REQUIRED',
        });
      }

      if (
        declaredDocuments.ijazat &&
        !hasDirectOrLegacyList(uploadedFiles.ijazat, req.files?.ijazat)
      ) {
        return res.status(400).json({
          error: 'Ijazat were marked available but no file was uploaded',
          code: 'TEACHER_IJAZA_REQUIRED',
        });
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
          status: 'pending',
          isVerified: false,
        });

        return res.status(201).json({
          success: true,
          message: 'تم إرسال طلب تسجيل المعلم بنجاح وهو الآن في انتظار موافقة الإدارة.',
          applicationStatus: 'pending',
          applicationStatusToken: createTeacherApplicationStatusToken({
            userId,
            teacherId: mockT._id,
            email: normalizedEmail,
          }),
          teacher: mockT,
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

      const idCardFront =
        directRef(uploadedFiles.idCardFront) ||
        privateDocumentPath(req.files?.idCardFront?.[0]) ||
        'not-provided';
      const idCardBack =
        directRef(uploadedFiles.idCardBack) ||
        privateDocumentPath(req.files?.idCardBack?.[0]) ||
        'not-provided';

      const documents = {
        // Keep the legacy field pointed at the front side for older admin tools.
        idCard: idCardFront,
        idCardFront,
        idCardBack,
        graduationCertificateAvailable: declaredDocuments.graduationCertificate,
        graduationCertificate: declaredDocuments.graduationCertificate
          ? (directRef(uploadedFiles.graduationCertificate) || privateDocumentPath(req.files?.graduationCertificate?.[0]) || 'not-provided')
          : 'not-provided',
        tajweedCertificatesAvailable: declaredDocuments.tajweedCertificates,
        tajweedCertificates: declaredDocuments.tajweedCertificates
          ? (
            uploadedFiles.tajweedCertificates?.map(directRef).filter(Boolean)
            || req.files?.tajweedCertificates?.map(privateDocumentPath).filter(Boolean)
            || []
          )
          : [],
        ijazatAvailable: declaredDocuments.ijazat,
        ijazat: declaredDocuments.ijazat
          ? (
            uploadedFiles.ijazat?.map(directRef).filter(Boolean)
            || req.files?.ijazat?.map(privateDocumentPath).filter(Boolean)
            || []
          )
          : [],
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
        introductionVideo: directPublic(uploadedFiles.introductionVideo) || publicMediaPath(req.files?.introductionVideo?.[0]),
        recitationVideo: mainVideo,
        teachingMethodVideo: directPublic(uploadedFiles.teachingMethodVideo) || publicMediaPath(req.files?.teachingMethodVideo?.[0]),
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
      storageOwner: externalStorage && uploadOwner ? String(uploadOwner) : undefined,
      hourlyRate: 50,
    });

    await User.findByIdAndUpdate(userId, { role: 'teacher' });

    notifyAdmins({
      type: 'system',
      title: { ar: 'طلب انضمام معلم جديد', en: 'New tutor application' },
      message: {
        ar: `وصل طلب معلم جديد من ${parsedPersonal.fullName || 'معلم جديد'} ويحتاج مراجعة المستندات والاعتماد.`,
        en: `A new tutor application from ${parsedPersonal.fullName || 'a new tutor'} requires document review and approval.`,
      },
      data: {
        actionUrl: '/admin?tab=teachers',
        metadata: { teacherId: String(teacher._id) },
      },
      priority: 'high',
    }).catch((error) => {
      console.warn('Admin teacher application notification failed:', error.message);
    });

    if (email) {
      sendEmail({
        to: String(email).trim().toLowerCase(),
        subject: 'تم استلام طلبك كمعلم — وَحْيٌ وَنَمَاء',
        text: 'تم استلام طلبك كمعلم وهو الآن في انتظار مراجعة الإدارة. لن يتم فتح لوحة المعلم قبل اعتماد الطلب.',
        html: '<div dir="rtl"><h2>تم استلام طلبك ✅</h2><p>طلبك كمعلم في أكاديمية وَحْيٌ وَنَمَاء أصبح الآن قيد مراجعة الإدارة.</p><p>لن يتم فتح لوحة المعلم قبل اعتماد الطلب، وسنرسل لك تحديثًا عند تغيير الحالة.</p></div>',
      }).catch((error) => {
        console.warn('Teacher application acknowledgement email failed:', error.message);
      });
    }

    res.status(201).json({
      success: true,
      message: 'Teacher registration submitted successfully. Awaiting admin review.',
      applicationStatus: 'pending',
      applicationStatusToken: createTeacherApplicationStatusToken({
        userId,
        teacherId: teacher._id,
        email: String(email || '').trim().toLowerCase(),
      }),
      teacher
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/application-status', async (req, res) => {
  try {
    const token = String(req.body?.token || '');
    if (!token) {
      return res.status(400).json({ error: 'Application status token is required' });
    }

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || 'wahy-namaa-dev-access-secret-change-me'
    );

    if (
      payload.purpose !== 'teacher-application-status' ||
      !payload.userId ||
      !payload.teacherId
    ) {
      return res.status(400).json({ error: 'Invalid application status token' });
    }

    if (isMockMode && !isDBConnected()) {
      const teacher = findMockTeacherByUserId(payload.userId);
      if (!teacher || String(teacher._id) !== String(payload.teacherId)) {
        return res.status(404).json({ error: 'Teacher application not found' });
      }
      return res.json({
        applicationStatus: teacher.status || 'pending',
        approved: teacher.status === 'approved' && teacher.isVerified === true,
      });
    }

    const teacher = await Teacher.findOne({
      _id: payload.teacherId,
      user: payload.userId,
    }).select('status isVerified updatedAt').lean();

    if (!teacher) {
      return res.status(404).json({ error: 'Teacher application not found' });
    }

    return res.json({
      applicationStatus: teacher.status || 'pending',
      approved: teacher.status === 'approved' && teacher.isVerified === true,
      updatedAt: teacher.updatedAt || null,
    });
  } catch (error) {
    const status = error?.name === 'TokenExpiredError' ? 401 : 400;
    return res.status(status).json({
      error: error?.name === 'TokenExpiredError'
        ? 'Application status token expired'
        : 'Invalid application status token',
    });
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
      search,
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

    if (search && String(search).trim()) {
      const escaped = String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [
        { 'personalInfo.fullName': regex },
        { 'academicInfo.specialization': regex },
        { 'quranInfo.specializations': regex },
        { languages: regex },
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const SORT_MAP = {
      rating: 'rating.average',
      experience: 'quranInfo.teachingExperience',
      price: 'hourlyRate',
      students: 'stats.totalStudents',
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

router.get('/admin/:id/review-dossier', protect, authorize('admin'), async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('user', 'name email phone avatar bio createdAt lastLogin')
      .populate('reviewChecklist.reviewedBy', 'name email')
      .populate('reviewNotes.admin', 'name email');

    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

    const [auditEntries, activityAgg, distinctStudents] = await Promise.all([
      AdminAuditLog.find({ entityType: 'teacher', entityId: String(teacher._id) })
        .populate('actor', 'name email')
        .sort({ createdAt: -1 })
        .limit(100)
        .lean(),
      Session.aggregate([
        { $match: { teacher: teacher._id } },
        {
          $group: {
            _id: null,
            totalSessions: { $sum: 1 },
            completedSessions: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            acceptedSessions: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
          },
        },
      ]),
      Session.find({ teacher: teacher._id, student: { $ne: null } }).distinct('student'),
    ]);

    const gate = buildTeacherReviewGate(teacher);
    return res.json(teacherDossierPayload(
      teacher,
      gate,
      auditEntries,
      {
        totalSessions: activityAgg[0]?.totalSessions || 0,
        completedSessions: activityAgg[0]?.completedSessions || 0,
        acceptedSessions: activityAgg[0]?.acceptedSessions || 0,
        distinctStudents: distinctStudents.length,
      },
    ));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.put('/admin/:id/review-checklist/:key', protect, authorize('admin'), async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

    const itemDefinition = REVIEW_ITEMS.find((item) => item.key === req.params.key);
    if (!itemDefinition) {
      return res.status(400).json({ error: 'Invalid review checklist item', code: 'INVALID_REVIEW_ITEM' });
    }

    const requiredForTeacher = itemRequiredForTeacher(teacher, itemDefinition);
    const status = sanitizeChecklistStatus(req.body.status, requiredForTeacher);
    if (!status) {
      return res.status(400).json({ error: 'Invalid checklist status', code: 'INVALID_REVIEW_STATUS' });
    }

    const note = String(req.body.note || '').trim().slice(0, 1000);
    if (status === 'changes-requested' && !note) {
      return res.status(400).json({
        error: 'A note is required when requesting changes',
        code: 'REVIEW_NOTE_REQUIRED',
      });
    }

    const existing = teacher.reviewChecklist.find((item) => item.key === itemDefinition.key);
    if (existing) {
      existing.status = status;
      existing.note = note;
      existing.reviewedBy = req.user.id;
      existing.reviewedAt = new Date();
    } else {
      teacher.reviewChecklist.push({
        key: itemDefinition.key,
        status,
        note,
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
      });
    }

    if (!teacher.reviewStartedAt) teacher.reviewStartedAt = new Date();
    if (status === 'changes-requested') {
      teacher.status = 'under-review';
      teacher.isVerified = false;
    }
    await teacher.save();

    const gate = buildTeacherReviewGate(teacher);
    await logAdminAction({
      req,
      action: 'teacher.review-checklist.updated',
      entityType: 'teacher',
      entityId: teacher._id,
      reason: note,
      metadata: {
        checklistKey: itemDefinition.key,
        checklistStatus: status,
        readiness: gate.readiness,
      },
    });

    return res.json({ success: true, gate, reviewChecklist: teacher.reviewChecklist });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.get('/admin/:id/media/:kind{/:index}', protect, authorize('admin'), async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).select('media');
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

    const allowed = ['profilePhoto', 'introductionVideo', 'recitationVideo', 'teachingMethodVideo', 'additionalVideos', 'audioRecordings'];
    const { kind } = req.params;
    if (!allowed.includes(kind)) return res.status(400).json({ error: 'Invalid media type' });

    let stored = teacher.media?.[kind];
    if (Array.isArray(stored)) {
      const index = Number(req.params.index || 0);
      if (!Number.isInteger(index) || index < 0 || index >= stored.length) {
        return res.status(404).json({ error: 'Media not found' });
      }
      stored = stored[index];
    }

    if (!stored) return res.status(404).json({ error: 'Media not found' });

    await logAdminAction({
      req,
      action: 'teacher.sensitive-media.viewed',
      entityType: 'teacher',
      entityId: teacher._id,
      reason: String(req.query.reason || '').trim(),
      metadata: { kind, index: req.params.index || null },
    }).catch(() => {});

    return streamAdminTeacherAsset(stored, res, {
      fallbackContentType: kind === 'profilePhoto' ? 'image/jpeg' : kind === 'audioRecordings' ? 'audio/mpeg' : 'video/mp4',
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load teacher media' });
  }
});

router.get('/admin/pending', protect, authorize('admin'), async (req, res) => {
  if (isMockMode && !isDBConnected()) {
    return res.json([]);
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
  const { action } = req.body;
  const note = String(req.body.note || '').trim().slice(0, 1000);
  const statusMap = {
    approve: 'approved',
    reject: 'rejected',
    'request-changes': 'under-review'
  };

  if (!Object.prototype.hasOwnProperty.call(statusMap, action)) {
    return res.status(400).json({
      error: 'Invalid teacher review action',
      code: 'INVALID_TEACHER_REVIEW_ACTION',
    });
  }

  if (['reject', 'request-changes'].includes(action) && !note) {
    return res.status(400).json({
      error: 'ملاحظة الإدارة مطلوبة لهذا القرار',
      code: 'TEACHER_REVIEW_NOTE_REQUIRED',
    });
  }

  if (isMockMode && !isDBConnected()) {
    return res.json({
      success: true,
      teacher: {
        _id: req.params.id,
        status: statusMap[action],
        isVerified: action === 'approve',
        reviewNotes: [{ admin: req.user?.id || 'admin', note, date: new Date() }]
      }
    });
  }

  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

    const gate = buildTeacherReviewGate(teacher);
    if (action === 'approve' && !gate.approvalReady) {
      await logAdminAction({
        req,
        action: 'teacher.review.approval-blocked',
        entityType: 'teacher',
        entityId: teacher._id,
        reason: 'Approval attempted before all required review items were complete.',
        metadata: {
          readiness: gate.readiness,
          blockers: gate.blockers.map((item) => item.key),
        },
      }).catch(() => {});

      return res.status(409).json({
        error: 'لا يمكن اعتماد المعلم قبل اكتمال قائمة المراجعة الإلزامية',
        code: 'TEACHER_REVIEW_GATE_INCOMPLETE',
        gate,
      });
    }

    teacher.status = statusMap[action];
    teacher.isVerified = action === 'approve';
    teacher.reviewNotes.push({
      admin: req.user.id,
      note: note || (action === 'approve' ? 'تم اعتماد الملف بعد اكتمال قائمة المراجعة.' : ''),
      date: new Date(),
    });
    if (!teacher.reviewStartedAt) teacher.reviewStartedAt = new Date();
    if (action === 'approve') teacher.reviewCompletedAt = new Date();
    await teacher.save();

    await logAdminAction({
      req,
      action: `teacher.review.${action}`,
      entityType: 'teacher',
      entityId: teacher._id,
      reason: note,
      metadata: {
        previousStatus: req.body.previousStatus || null,
        newStatus: teacher.status,
        readiness: gate.readiness,
      },
    });

    const teacherUser = await User.findByIdAndUpdate(
      teacher.user,
      { $inc: { refreshTokenVersion: 1 } },
      { new: true }
    ).select('name email');

    if (teacherUser?.email) {
      const notification = {
        approve: {
          subject: 'تم قبول طلبك كمعلم — وَحْيٌ وَنَمَاء',
          text: 'تم اعتماد طلبك كمعلم. يمكنك الآن تسجيل الدخول إلى حسابك.',
          html: '<div dir="rtl"><h2>تم قبول طلبك ✅</h2><p>تم اعتماد طلبك كمعلم في أكاديمية وَحْيٌ وَنَمَاء.</p><p>يمكنك الآن تسجيل الدخول إلى حسابك.</p></div>',
        },
        'request-changes': {
          subject: 'طلبك كمعلم يحتاج استكمال — وَحْيٌ وَنَمَاء',
          text: `طلبك يحتاج استكمال أو تعديل قبل الاعتماد. ملاحظة الإدارة: ${note}`,
          html: `<div dir="rtl"><h2>طلبك يحتاج استكمال</h2><p>تحتاج الإدارة إلى استكمال أو تعديل بعض البيانات قبل الاعتماد.</p><p><strong>ملاحظة الإدارة:</strong> ${String(note).replace(/[<>&"]/g, '')}</p></div>`,
        },
        reject: {
          subject: 'تحديث حالة طلب المعلم — وَحْيٌ وَنَمَاء',
          text: `تعذر اعتماد طلبك كمعلم في الوقت الحالي. ملاحظة الإدارة: ${note}`,
          html: `<div dir="rtl"><h2>تحديث حالة الطلب</h2><p>تعذر اعتماد طلبك كمعلم في الوقت الحالي.</p><p><strong>ملاحظة الإدارة:</strong> ${String(note).replace(/[<>&"]/g, '')}</p></div>`,
        },
      }[action];

      sendEmail({
        to: teacherUser.email,
        subject: notification.subject,
        text: notification.text,
        html: notification.html,
      }).catch((error) => {
        console.warn('Teacher review email failed:', error.message);
      });
    }

    return res.json({
      success: true,
      teacher,
      applicationStatus: teacher.status,
      gate: buildTeacherReviewGate(teacher),
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.delete('/admin/:id/assets', protect, authorize('admin'), async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .select('+storageOwner documents media status user isVerified assetsPurgedAt')
      .populate('user', 'email');

    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    if (!['rejected', 'suspended'].includes(teacher.status)) {
      return res.status(409).json({
        error: 'Teacher assets can only be purged for rejected or suspended records',
        code: 'TEACHER_ASSET_PURGE_NOT_ALLOWED'
      });
    }

    if (teacher.assetsPurgedAt) {
      return res.status(409).json({
        error: 'Teacher assets were already purged',
        code: 'TEACHER_ASSETS_ALREADY_PURGED'
      });
    }

    let lifecycle;
    try {
      lifecycle = resolveOwnedTeacherAssets({
        teacher,
        user: teacher.user,
      });
    } catch (error) {
      if (error.code === 'ASSET_OWNERSHIP_UNRESOLVED') {
        return res.status(409).json({
          error: 'One or more teacher assets cannot be proven to belong to this application',
          code: error.code,
          field: error.asset?.field,
        });
      }
      throw error;
    }

    const localAssets = lifecycle.skipped.filter((asset) => ![
      'not-provided',
      '/default-teacher.png',
    ].includes(asset.reference));

    if (localAssets.length) {
      return res.status(409).json({
        error: 'Legacy local teacher assets require manual cleanup before this record can be purged',
        code: 'LEGACY_LOCAL_ASSETS_REQUIRE_MANUAL_CLEANUP',
        fields: localAssets.map((asset) => asset.field),
      });
    }

    await Promise.all(
      lifecycle.resolved.map((asset) => (
        objectStorage.deleteOwnedObject(asset.reference, asset.purpose, asset.owner)
      ))
    );

    teacher.documents = {
      idCard: 'not-provided',
      idCardFront: 'not-provided',
      idCardBack: 'not-provided',
      graduationCertificateAvailable: false,
      graduationCertificate: 'not-provided',
      tajweedCertificatesAvailable: false,
      tajweedCertificates: [],
      ijazatAvailable: false,
      ijazat: [],
    };
    teacher.media = {
      profilePhoto: '/default-teacher.png',
      introductionVideo: '/default-teacher.png',
      recitationVideo: '/default-teacher.png',
      teachingMethodVideo: '/default-teacher.png',
      additionalVideos: [],
      audioRecordings: [],
    };
    teacher.assetsPurgedAt = new Date();
    teacher.storageOwner = undefined;
    teacher.isVerified = false;
    await teacher.save();

    return res.json({
      success: true,
      deletedAssets: lifecycle.resolved.length,
      assetsPurgedAt: teacher.assetsPurgedAt,
    });
  } catch (error) {
    console.error('Teacher asset purge failed:', error.message);
    return res.status(500).json({ error: 'Failed to purge teacher assets' });
  }
});

router.get('/admin/:id/document/:kind{/:index}', protect, authorize('admin'), async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).select('documents');
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

    const { kind } = req.params;
    const allowed = ['idCard', 'idCardFront', 'idCardBack', 'graduationCertificate', 'tajweedCertificates', 'ijazat'];
    if (!allowed.includes(kind)) return res.status(400).json({ error: 'Invalid document type' });

    let stored = teacher.documents?.[kind];
    if (kind === 'idCardFront' && (!stored || stored === 'not-provided')) {
      stored = teacher.documents?.idCard;
    }
    if (Array.isArray(stored)) {
      const index = Number(req.params.index || 0);
      stored = stored[index];
    }

    if (!stored || stored === 'not-provided') {
      return res.status(404).json({ error: 'Document not found' });
    }

    await logAdminAction({
      req,
      action: 'teacher.sensitive-document.viewed',
      entityType: 'teacher',
      entityId: teacher._id,
      reason: String(req.query.reason || '').trim(),
      metadata: { kind, index: req.params.index || null },
    }).catch(() => {});

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