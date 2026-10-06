const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const TrialRequest = require('../models/TrialRequest');
const Session = require('../models/Session');
const Teacher = require('../models/Teacher');
const GroupCircle = require('../models/GroupCircle');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const meetingService = require('../services/meetingService');
const { notifyUser } = require('../utils/notify');
const rateLimit = require('express-rate-limit');

const publicTrialLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.TRIAL_RATE_LIMIT_MAX || 8),
  message: { error: 'Too many trial requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const { isMockMode } = require('../config/runtime');
const isDBConnected = () => mongoose.connection.readyState === 1;

const MOCK_TRIALS = [
  {
    _id: 'mock-trial-1',
    studentName: 'عمر خالد',
    guardianName: 'خالد عبد الرحمن',
    whatsappPhone: '+201012345678',
    phone: '+201012345678',
    email: 'khaled@example.com',
    age: 10,
    gender: 'male',
    preferredTrack: 'memorization',
    preferredTeacherGender: 'male',
    country: 'مصر',
    city: 'القاهرة',
    status: 'pending',
    createdAt: new Date().toISOString()
  }
];

// Phone & WhatsApp sanitization helper
function normalizePhone(rawPhone) {
  if (!rawPhone) return '';
  return String(rawPhone).replace(/[^\d+]/g, '').trim();
}

// @route   POST /api/trials
// @desc    Public trial booking funnel (No login required)
// @access  Public
router.post('/', publicTrialLimiter, async (req, res) => {
  try {
    const {
      studentName,
      guardianName,
      whatsappPhone,
      phone,
      whatsapp,
      email,
      age,
      gender,
      preferredTrack,
      preferredTeacherGender,
      country,
      city,
      preferredDate,
      preferredTimeSlot,
      notes
    } = req.body;

    // Strict validation
    if (!studentName || !studentName.trim()) {
      return res.status(400).json({ error: 'اسم الطالب مطلوب' });
    }

    const rawWhatsApp = whatsappPhone || whatsapp || phone;
    if (!rawWhatsApp || !String(rawWhatsApp).trim()) {
      return res.status(400).json({ error: 'رقم الواتساب مطلوب للتواصل وإرسال رابط الحصة' });
    }

    const cleanWhatsApp = normalizePhone(rawWhatsApp);
    if (cleanWhatsApp.replace(/\D/g, '').length < 8) {
      return res.status(400).json({ error: 'يرجى إدخال رقم واتساب صحيح يبدأ بكود الدولة' });
    }

    if (!gender || !['male', 'female'].includes(gender)) {
      return res.status(400).json({ error: 'يرجى تحديد جنس الطالب بدقة (male أو female)' });
    }

    const parsedAge = parseInt(age, 10);
    if (!parsedAge || parsedAge < 4 || parsedAge > 100) {
      return res.status(400).json({ error: 'يجب أن يكون عمر الطالب بين 4 سنوات و 100 سنة' });
    }

    const cleanGuardianName = String(guardianName || '').trim();
    if (parsedAge < 18 && cleanGuardianName.length < 2) {
      return res.status(400).json({
        error: 'اسم ولي الأمر مطلوب للطلاب أقل من 18 سنة'
      });
    }

    const incomingTrack = preferredTrack || req.body.track || 'memorization';
    const trackMap = {
      'memorization': 'memorization',
      'ijaza': 'tajweed_ijazah',
      'tajweed_ijazah': 'tajweed_ijazah',
      'foundation': 'kids_foundation',
      'kids_foundation': 'kids_foundation'
    };
    const track = trackMap[incomingTrack] || 'memorization';

    const validTeacherGenders = ['male', 'female', 'any'];
    const teacherGender = validTeacherGenders.includes(preferredTeacherGender) ? preferredTeacherGender : 'any';

    if (isMockMode && !isDBConnected()) {
      const mockTrialId = 'mock-trial-' + Date.now();
      const mockObj = {
        _id: mockTrialId,
        studentName: studentName.trim(),
        guardianName: cleanGuardianName,
        whatsappPhone: cleanWhatsApp,
        age: parsedAge,
        gender,
        preferredTrack: track,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      MOCK_TRIALS.unshift(mockObj);
      return res.status(201).json({
        success: true,
        message: 'تم استقبال طلب الحصة التجريبية المجانية بنجاح! سيتواصل معك منسق الأكاديمية عبر الواتساب لتأكيد الموعد.',
        trialId: mockTrialId,
        trial: mockObj
      });
    }

    const trial = new TrialRequest({
      studentName: studentName.trim(),
      guardianName: cleanGuardianName,
      whatsappPhone: cleanWhatsApp,
      phone: phone ? normalizePhone(phone) : cleanWhatsApp,
      email: email ? String(email).toLowerCase().trim() : '',
      age: parsedAge,
      gender,
      preferredTrack: track,
      preferredTeacherGender: teacherGender,
      country: country || 'مصر',
      city: city || 'القاهرة',
      preferredDate: preferredDate ? new Date(preferredDate) : undefined,
      preferredTimeSlot: preferredTimeSlot || 'evening',
      status: 'pending',
      notes: notes || ''
    });

    await trial.save();

    res.status(201).json({
      success: true,
      message: 'تم استقبال طلب الحصة التجريبية المجانية بنجاح! سيتواصل معك منسق الأكاديمية عبر الواتساب لتأكيد الموعد.',
      trialId: trial._id,
      trial
    });
  } catch (error) {
    res.status(400).json({ error: 'فشل تسجيل طلب الحصة التجريبية', details: error.message });
  }
});

// @route   GET /api/trials
// @desc    Get all trial requests with filters (status, track)
// @access  Protected (admin, teacher)
router.get('/', protect, authorize('admin', 'teacher'), async (req, res) => {
  const { status, track, gender, page = 1, limit = 20 } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));

  if (isMockMode && !isDBConnected()) {
    let filtered = [...MOCK_TRIALS];
    if (status) filtered = filtered.filter(t => t.status === status);
    if (track) filtered = filtered.filter(t => t.preferredTrack === track);
    if (gender) filtered = filtered.filter(t => t.gender === gender);
    return res.json({
      success: true,
      trials: filtered,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filtered.length,
        pages: 1
      }
    });
  }
  try {
    const filter = {};

    if (status) filter.status = status;
    if (track) filter.preferredTrack = track;
    if (gender) filter.gender = gender;

    // Teachers may only access trial requests explicitly assigned to them.
    if (req.user.role === 'teacher') {
      const teacherDoc = await Teacher.findOne({ user: req.user.id }).select('_id');
      if (!teacherDoc) {
        return res.status(403).json({ error: 'Teacher profile is required' });
      }
      filter.assignedTeacher = teacherDoc._id;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [trials, total] = await Promise.all([
      TrialRequest.find(filter)
        .populate({
          path: 'assignedTeacher',
          select: 'personalInfo academicInfo rating',
          populate: { path: 'user', select: 'name email' }
        })
        .populate('scheduledSession', 'scheduledAt meetingLink status meetingProvider')
        .populate('assessment.assignedCircle', 'name code track level')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      TrialRequest.countDocuments(filter)
    ]);

    res.json({
      success: true,
      trials,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'فشل جلب طلبات الحصص التجريبية', details: error.message });
  }
});

// @route   GET /api/trials/:id
// @desc    Get trial request details
// @access  Protected (admin, teacher)
router.get('/:id', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const trial = await TrialRequest.findById(req.params.id)
      .populate({
        path: 'assignedTeacher',
        select: 'personalInfo academicInfo rating user',
        populate: { path: 'user', select: 'name email phone' }
      })
      .populate('scheduledSession')
      .populate('assessment.assignedCircle')
      .populate('assessment.evaluatedBy', 'personalInfo user');

    if (!trial) {
      return res.status(404).json({ error: 'طلب الحصة التجريبية غير موجود' });
    }

    if (req.user.role === 'teacher') {
      const teacherDoc = await Teacher.findOne({ user: req.user.id }).select('_id');
      if (!teacherDoc || !trial.assignedTeacher || String(trial.assignedTeacher._id || trial.assignedTeacher) !== String(teacherDoc._id)) {
        return res.status(403).json({ error: 'غير مصرح بالاطلاع على هذا الطلب' });