const express = require('express');
const router = express.Router();
const TrialRequest = require('../models/TrialRequest');
const Session = require('../models/Session');
const Teacher = require('../models/Teacher');
const GroupCircle = require('../models/GroupCircle');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const meetingService = require('../services/meetingService');
const { notifyUser } = require('../utils/notify');

// Phone & WhatsApp sanitization helper
function normalizePhone(rawPhone) {
  if (!rawPhone) return '';
  return String(rawPhone).replace(/[^\d+]/g, '').trim();
}

// @route   POST /api/trials
// @desc    Public trial booking funnel (No login required)
// @access  Public
router.post('/', async (req, res) => {
  try {
    const {
      studentName,
      guardianName,
      whatsappPhone,
      phone,
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

    if (!whatsappPhone || !whatsappPhone.trim()) {
      return res.status(400).json({ error: 'رقم الواتساب مطلوب للتواصل وإرسال رابط الحصة' });
    }

    const cleanWhatsApp = normalizePhone(whatsappPhone);
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

    const validTracks = ['memorization', 'tajweed_ijazah', 'kids_foundation'];
    const track = validTracks.includes(preferredTrack) ? preferredTrack : 'memorization';

    const validTeacherGenders = ['male', 'female', 'any'];
    const teacherGender = validTeacherGenders.includes(preferredTeacherGender) ? preferredTeacherGender : 'any';

    const trial = new TrialRequest({
      studentName: studentName.trim(),
      guardianName: guardianName ? guardianName.trim() : '',
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
  try {
    const { status, track, gender, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (track) filter.preferredTrack = track;
    if (gender) filter.gender = gender;

    // If teacher, show trials assigned to them or unassigned pending trials
    if (req.user.role === 'teacher') {
      const teacherDoc = await Teacher.findOne({ user: req.user.id });
      if (teacherDoc) {
        filter.$or = [
          { assignedTeacher: teacherDoc._id },
          { status: 'pending', assignedTeacher: { $exists: false } },
          { status: 'pending', assignedTeacher: null }
        ];
      }
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

    res.json({
      success: true,
      trial
    });
  } catch (error) {
    res.status(500).json({ error: 'فشل جلب تفاصيل الحصة التجريبية', details: error.message });
  }
});

// @route   PUT /api/trials/:id/assign
// @desc    Assign teacher, schedule session & create Session record (Admin only)
// @access  Protected (admin only)
router.put('/:id/assign', protect, authorize('admin'), async (req, res) => {
  try {
    const { teacherId, scheduledAt, timezone, meetingProvider, notes } = req.body;

    if (!teacherId || !scheduledAt) {
      return res.status(400).json({ error: 'يجب تحديد المعلم وموعد الجلسة' });
    }

    const trial = await TrialRequest.findById(req.params.id);
    if (!trial) {
      return res.status(404).json({ error: 'طلب الحصة التجريبية غير موجود' });
    }

    const teacher = await Teacher.findById(teacherId).populate('user');
    if (!teacher) {
      return res.status(404).json({ error: 'المعلم المحدد غير موجود' });
    }

    // Attempt to match or find student User account by email or phone
    let studentUser = null;
    if (trial.email) {
      studentUser = await User.findOne({ email: trial.email });
    }
    if (!studentUser && trial.whatsappPhone) {
      studentUser = await User.findOne({ 
        $or: [{ whatsappPhone: trial.whatsappPhone }, { phone: trial.whatsappPhone }] 
      });
    }

    const sessionDate = new Date(scheduledAt);
    const provider = meetingProvider || process.env.DEFAULT_MEETING_PROVIDER || 'jitsi';

    // Create session record in Session model
    const session = new Session({
      teacher: teacher._id,
      student: studentUser ? studentUser._id : undefined,
      type: 'trial',
      status: 'accepted',
      scheduledAt: sessionDate,
      duration: 30, // Free trial standard duration: 30 mins
      timezone: timezone || 'Africa/Cairo',
      notes: notes || ('حصة تجريبية للطالب: ' + trial.studentName + ' - واتساب: ' + trial.whatsappPhone)
    });

    // Attach meeting link using meetingService
    meetingService.attachToSession(session, provider);
    await session.save();

    // Update TrialRequest record
    trial.assignedTeacher = teacher._id;
    trial.scheduledSession = session._id;
    trial.status = 'scheduled';
    if (notes) trial.notes = notes;
    await trial.save();

    // Notify teacher if user object exists
    if (teacher.user) {
      try {
        await notifyUser(teacher.user._id || teacher.user, {
          type: 'session_scheduled',
          title: 'حصة تجريبية جديدة مسندة إليك',
          message: 'تم تعيين حصة تجريبية للطالب ' + trial.studentName + ' في موعد ' + sessionDate.toLocaleString('ar-EG'),
          data: { sessionId: session._id, trialId: trial._id }
        });
      } catch (notifyErr) {
        console.warn('Trial assign notification error:', notifyErr.message);
      }
    }

    res.json({
      success: true,
      message: 'تم تعيين المعلم وجدولة الحصة التجريبية بنجاح',
      trial,
      session
    });
  } catch (error) {
    res.status(500).json({ error: 'فشل تعيين المعلم وجدولة الحصة', details: error.message });
  }
});

// @route   PUT /api/trials/:id/assess
// @desc    Record teacher assessment, mark trial completed, and auto-enroll into circle if provided
// @access  Protected (teacher, admin)
router.put('/:id/assess', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { level, recommendedTrack, notes, assignedCircleId } = req.body;

    const trial = await TrialRequest.findById(req.params.id);
    if (!trial) {
      return res.status(404).json({ error: 'طلب الحصة التجريبية غير موجود' });
    }

    // Resolve teacher profile
    let teacherProfileId = null;
    if (req.user.role === 'teacher') {
      const teacherDoc = await Teacher.findOne({ user: req.user.id });
      if (!teacherDoc) {
        return res.status(400).json({ error: 'لم يتم العثور على بروفايل المعلم الخاص بك' });
      }
      teacherProfileId = teacherDoc._id;
    } else if (trial.assignedTeacher) {
      teacherProfileId = trial.assignedTeacher;
    }

    // Build assessment object
    trial.assessment = {
      evaluatedBy: teacherProfileId,
      level: level || 'beginner',
      recommendedTrack: recommendedTrack || trial.preferredTrack || 'memorization',
      notes: notes || '',
      assignedCircle: assignedCircleId || undefined,
      evaluatedAt: new Date()
    };

    trial.status = 'completed';

    // Mark associated Session as completed if exists
    if (trial.scheduledSession) {
      await Session.findByIdAndUpdate(trial.scheduledSession, { status: 'completed' });
    }

    let enrolledCircle = null;
    let enrollmentNote = '';

    // If assignedCircleId provided, attempt auto-enrollment
    if (assignedCircleId) {
      const circle = await GroupCircle.findById(assignedCircleId);
      if (circle) {
        // Find or create User for student to link to circle
        let studentUser = null;
        if (trial.email) {
          studentUser = await User.findOne({ email: trial.email });
        }
        if (!studentUser && trial.whatsappPhone) {
          studentUser = await User.findOne({
            $or: [{ whatsappPhone: trial.whatsappPhone }, { phone: trial.whatsappPhone }]
          });
        }

        const circleStudents = circle.students || [];
        const capacity = circle.capacity || 10;

        if (circleStudents.length >= capacity) {
          enrollmentNote = 'الحلقة المختارة ممتلئة بالفعل (10 طلاب)';
        } else if (studentUser) {
          const alreadyJoined = circleStudents.some(
            (sId) => sId.toString() === studentUser._id.toString()
          );

          if (!alreadyJoined) {
            circle.students.push(studentUser._id);
            if (circle.students.length >= capacity) {
              circle.status = 'full';
            }
            await circle.save();

            studentUser.circle = circle._id;
            studentUser.currentLevel = level || studentUser.currentLevel;
            await studentUser.save();

            enrolledCircle = {
              circleId: circle._id,
              name: circle.name,
              code: circle.code,
              studentsCount: circle.students.length
            };
            enrollmentNote = 'تم إلحاق الطالب بالحلقة الجماعية بنجاح';
          } else {
            enrollmentNote = 'الطالب منضم بالفعل لهذه الحلقة';
          }
        } else {
          enrollmentNote = 'تم تسجيل التقييم وترشيح الحلقة؛ سيتم ربط الطالب فور إنشاء حسابه على المنصة';
        }
      }
    }

    await trial.save();

    res.json({
      success: true,
      message: 'تم تسجيل تقييم الحصة التجريبية بنجاح وتحديث حالتها إلى مكتملة',
      trial,
      enrolledCircle,
      enrollmentNote
    });
  } catch (error) {
    res.status(500).json({ error: 'فشل تسجيل تقييم الحصة التجريبية', details: error.message });
  }
});

module.exports = router;
