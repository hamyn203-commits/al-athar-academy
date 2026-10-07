const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Session = require('../models/Session');
const Teacher = require('../models/Teacher');
const GroupCircle = require('../models/GroupCircle');
const { protect, authorize } = require('../middleware/auth');
const meetingService = require('../services/meetingService');
const {
  notifyTeacherForSessionRequest,
  notifySessionAccepted,
  notifyGuardiansForStudent,
  notifyUser,
} = require('../utils/notify');

const { isMockMode } = require('../config/runtime');
const isDBConnected = () => mongoose.connection.readyState === 1;

async function sessionIncludesStudent(session, studentId) {
  if (!session || !studentId) return false;
  const id = String(studentId);

  if (session.student && String(session.student) === id) return true;
  if (session.attendance?.some((entry) => entry.student && String(entry.student) === id)) return true;

  if (session.circle) {
    return Boolean(await GroupCircle.exists({ _id: session.circle, students: studentId }));
  }

  return false;
}


router.post('/trial', protect, authorize('student'), async (req, res) => {
  try {
    const { teacherId, scheduledAt, timezone, notes } = req.body;

    const teacher = await Teacher.findOne({ 
      _id: teacherId, 
      status: 'approved', 
      isVerified: true 
    });

    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found or not available' });
    }

    const completedTrial = await Session.findOne({
      student: req.user.id,
      teacher: teacherId,
      type: 'trial',
      status: 'completed',
    });

    if (completedTrial) {
      return res.status(409).json({
        error: 'Trial already completed with this teacher',
        code: 'TRIAL_ALREADY_COMPLETED_WITH_TEACHER',
        existingSession: {
          _id: completedTrial._id,
          teacher: completedTrial.teacher,
          status: completedTrial.status,
          scheduledAt: completedTrial.scheduledAt,
          type: completedTrial.type,
        },
        nextActions: ['continue-with-teacher', 'try-another-teacher'],
      });
    }

    const existingTrial = await Session.findOne({
      student: req.user.id,
      teacher: teacherId,
      type: 'trial',
      status: { $in: ['pending', 'accepted'] }
    });

    if (existingTrial) {
      return res.status(409).json({
        error: 'You already have an active trial session with this teacher',
        code: 'TRIAL_ALREADY_EXISTS',
        existingSession: {
          _id: existingTrial._id,
          teacher: existingTrial.teacher,
          status: existingTrial.status,
          scheduledAt: existingTrial.scheduledAt,
          timezone: existingTrial.timezone,
          type: existingTrial.type,
        },
      });
    }

    const session = await Session.create({
      student: req.user.id,
      teacher: teacherId,
      type: 'trial',
      scheduledAt: new Date(scheduledAt),
      timezone: timezone || 'Africa/Cairo',
      notes,
      status: 'pending'
    });

    try {
      await notifyTeacherForSessionRequest(session, teacher.user);
    } catch (e) {
      console.warn('Session request notification:', e.message);
    }

    res.status(201).json({
      success: true,
      message: 'Trial session request sent successfully',
      session
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/regular', protect, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { teacherId, scheduledAt, timezone, notes } = req.body;
    const teacher = await Teacher.findOne({ _id: teacherId, status: 'approved', isVerified: true });
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found or not available' });
    }

    const prior = await Session.findOne({
      student: req.user.id,
      teacher: teacherId,
      status: 'completed',
    });
    if (!prior) {
      return res.status(400).json({ error: 'يجب إجراء حصة تجريبية أو حصة سابقة مع هذا المعلم أولاً' });
    }

    const existing = await Session.findOne({
      student: req.user.id,
      teacher: teacherId,
      type: 'regular',
      status: { $in: ['pending', 'accepted'] },
    });
    if (existing) {
      return res.status(400).json({ error: 'لديك حصة منتظمة قيد الانتظار أو مقبولة مع هذا المعلم' });
    }

    const session = await Session.create({
      student: req.user.id,
      teacher: teacherId,
      type: 'regular',
      scheduledAt: new Date(scheduledAt),
      timezone: timezone || 'Africa/Cairo',
      notes,
      status: 'pending',
    });

    try {
      await notifyTeacherForSessionRequest(session, teacher.user);
    } catch (e) {
      console.warn('Regular session notification:', e.message);
    }

    res.status(201).json({ success: true, message: 'تم إرسال طلب الحصة', session });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/my-sessions', protect, async (req, res) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;

    if (isMockMode && !isDBConnected()) {
      return res.json({
        sessions: [],
        pagination: { page: 1, limit: Number(limit), total: 0, pages: 0 },
      });
    }

    const filter = {};

    if (req.user.role === 'student') {
      filter.student = req.user.id;
    } else if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user.id });
      if (!teacher) {
        return res.status(404).json({ error: 'Teacher profile not found' });
      }
      filter.teacher = teacher._id;
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }


    if (status) filter.status = status;
    if (type) filter.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [sessions, total] = await Promise.all([
      Session.find(filter)
        .populate('student', 'name email avatar')
        .populate({
          path: 'teacher',
          populate: { path: 'user', select: 'name email avatar' }
        })
        .sort({ scheduledAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Session.countDocuments(filter)
    ]);

    res.json({
      sessions,
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

router.put('/:id/respond', protect, authorize('teacher'), async (req, res) => {
  try {
    const { action, rescheduledDate, reason } = req.body;

    if (!['accept', 'reject', 'reschedule'].includes(action)) {
      return res.status(400).json({ error: 'Invalid session response action' });
    }

    const teacher = await Teacher.findOne({ user: req.user.id });

    if (!teacher) {
      return res.status(404).json({ error: 'Teacher profile not found' });
    }

    const session = await Session.findOne({
      _id: req.params.id,
      teacher: teacher._id
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (action === 'accept') {
      session.status = 'accepted';
      const provider = req.body.provider || process.env.DEFAULT_MEETING_PROVIDER || 'jitsi';
      meetingService.attachToSession(session, provider);
    } else if (action === 'reject') {
      session.status = 'rejected';
      session.cancellationReason = reason;
    } else if (action === 'reschedule') {
      const proposedDate = new Date(rescheduledDate);
      if (!rescheduledDate || Number.isNaN(proposedDate.getTime()) || proposedDate <= new Date()) {
        return res.status(400).json({ error: 'A valid future reschedule date is required' });
      }

      const source = session.toObject();
      delete source._id;
      delete source.createdAt;
      delete source.updatedAt;
      delete source.meetingLink;
      delete source.recordingUrl;

      const newSession = await Session.create({
        ...source,
        scheduledAt: proposedDate,
        status: 'pending',
        rescheduledFrom: session._id,
        cancellationReason: undefined,
      });
      
      session.status = 'cancelled';
      session.cancellationReason = 'Rescheduled';
      await session.save();

      try {
        const payload = {
          type: 'session-rescheduled',
          title: { ar: 'اقتراح موعد جديد للحصة', en: 'New session time proposed' },
          message: {
            ar: `اقترح المعلم موعدًا جديدًا: ${proposedDate.toLocaleString('ar-EG')}`,
            en: `Your tutor proposed a new time: ${proposedDate.toLocaleString('en-US')}`,
          },
          data: {
            session: newSession._id,
            actionUrl: `/student/dashboard?tab=${newSession.type === 'trial' ? 'trials' : 'sessions'}&session=${newSession._id}`,
          },
          priority: 'high',
        };
        await notifyUser(session.student, payload);
        await notifyGuardiansForStudent(session.student, {
          ...payload,
          data: { ...payload.data, actionUrl: '/guardian/dashboard' },
        });
      } catch (e) {
        console.warn('Session reschedule notification:', e.message);
      }

      return res.json({ success: true, session: newSession });
    }

    await session.save();

    try {
      if (action === 'accept') {
        await notifySessionAccepted(session, session.student, session.meetingLink);
        await notifyGuardiansForStudent(session.student, {
          type: 'session-accepted',
          title: { ar: 'تم تأكيد حصة الطالب', en: 'Student session confirmed' },
          message: {
            ar: `تم تأكيد الحصة بتاريخ ${new Date(session.scheduledAt).toLocaleString('ar-EG')}`,
            en: `The session was confirmed for ${new Date(session.scheduledAt).toLocaleString('en-US')}`,
          },
          data: { session: session._id, actionUrl: '/guardian/dashboard' },
          priority: 'high',
        });
      } else if (action === 'reject') {
        const payload = {
          type: 'session-rejected',
          title: { ar: 'تم رفض الحصة', en: 'Session rejected' },
          message: {
            ar: reason || 'لم يتم قبول طلب الحصة',
            en: reason || 'Your session request was not accepted',
          },
          data: {
            session: session._id,
            actionUrl: `/student/dashboard?tab=${session.type === 'trial' ? 'trials' : 'sessions'}`,
          },
        };
        await notifyUser(session.student, payload);
        await notifyGuardiansForStudent(session.student, {
          ...payload,
          data: { ...payload.data, actionUrl: '/guardian/dashboard' },
        });
      }
    } catch (e) {
      console.warn('Session respond notification:', e.message);
    }

    res.json({ success: true, session });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id/complete', protect, authorize('teacher'), async (req, res) => {
  try {
    const { evaluation } = req.body;
    const teacher = await Teacher.findOne({ user: req.user.id });

    if (!teacher) {
      return res.status(404).json({ error: 'Teacher profile not found' });
    }

    const session = await Session.findOne({
      _id: req.params.id,
      teacher: teacher._id,
      status: 'accepted'
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found or not accepted' });
    }

    const SESSION_RATE = 50;
    session.status = 'completed';
    session.duration = 60;
    session.teacherEvaluation = evaluation;
    session.earnings.amount = SESSION_RATE;
    session.earnings.status = 'pending';
    
    await session.save();

    const { processReferralFirstSession } = require('./referrals');
    if (session.student) {
      processReferralFirstSession(session.student.toString()).catch(() => {});
    }

    await Teacher.findByIdAndUpdate(teacher._id, {
      $inc: {
        'stats.totalSessions': 1,
        'stats.totalHours': 1,
        'earnings.pendingEarnings': SESSION_RATE,
      },
    });

    try {
      const isTrial = session.type === 'trial';
      const payload = {
        type: 'session-completed',
        title: {
          ar: isTrial ? 'اكتملت حصتك التجريبية' : 'اكتملت حصتك',
          en: isTrial ? 'Your trial session is complete' : 'Your session is complete',
        },
        message: {
          ar: isTrial
            ? 'يمكنك الآن الاستمرار مع نفس المعلم أو تجربة معلم آخر.'
            : 'تم تسجيل الحصة كتجربة مكتملة ويمكنك مراجعة التقييم والواجب.',
          en: isTrial
            ? 'You can now continue with this tutor or try another tutor.'
            : 'The session is complete. Review your evaluation and homework.',
        },
        data: {
          session: session._id,
          actionUrl: isTrial
            ? `/student/dashboard?tab=trials&postTrial=${session._id}`
            : '/student/dashboard?tab=evaluations',
        },
        priority: 'high',
      };

      await notifyUser(session.student, payload);
      await notifyGuardiansForStudent(session.student, {
        ...payload,
        title: {
          ar: isTrial ? 'اكتملت الحصة التجريبية للطالب' : 'اكتملت حصة الطالب',
          en: isTrial ? 'Student trial session completed' : 'Student session completed',
        },
        data: { ...payload.data, actionUrl: '/guardian/dashboard' },
      });
    } catch (e) {
      console.warn('Session completion notification:', e.message);
    }

    res.json({ success: true, session });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id/feedback', protect, authorize('student'), async (req, res) => {
  try {
    const { rating, comment, wouldContinue } = req.body;

    const session = await Session.findOne({
      _id: req.params.id,
      student: req.user.id,
      status: 'completed'
    });

    if (!session) {
      return res.status(404).json({ error: 'Completed session not found' });
    }

    session.studentFeedback = { rating, comment, wouldContinue };
    await session.save();

    res.json({ success: true, session });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/admin/all', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (type) filter.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [sessions, total] = await Promise.all([
      Session.find(filter)
        .populate('student', 'name email')
        .populate({
          path: 'teacher',
          populate: { path: 'user', select: 'name email' }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Session.countDocuments(filter)
    ]);

    res.json({
      sessions,
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

// @route   POST /api/sessions/:id/rsvp
// @desc    Confirm attendance or excuse absence (with 6-hour policy check)
// @access  Private (Student, Guardian, Admin)
router.post('/:id/rsvp', protect, async (req, res) => {
  try {
    const { status, excuseReason } = req.body;
    const studentId = req.body.studentId || req.user.id;

    if (!status || !['confirmed', 'excused'].includes(status)) {
      return res.status(400).json({ error: 'الحالة غير صالحة. يجب أن تكون confirmed أو excused' });
    }

    if (isMockMode && (!isDBConnected() || !isValidObjectId(req.params.id))) {
      const now = new Date();
      const scheduledTime = new Date(now.getTime() + 48 * 60 * 60 * 1000);
      const diffHours = (scheduledTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      const eligibleForCompensation = status === 'excused' && diffHours >= 6;

      const { setMockSessionRsvp } = require('../mockStore');
      setMockSessionRsvp(req.params.id, {
        status: status === 'confirmed' ? 'confirmed' : 'excused',
        excuseReason: excuseReason || (status === 'confirmed' ? 'تأكيد الحضور مسبقاً' : ''),
        eligibleForCompensation
      });

      return res.json({
        success: true,
        message: status === 'confirmed'
          ? 'تم تأكيد الحضور بنجاح'
          : (eligibleForCompensation
              ? 'تم قبول الاعتذار مسبقاً واحتساب حق التعويض (قبل الموعد بأكثر من 6 ساعات)'
              : 'تم تسجيل الاعتذار المتأخر (أقل من 6 ساعات - لا يشمل التعويض)'),
        status,
        eligibleForCompensation,
        compensationEligible: eligibleForCompensation,
        lateExcuse: status === 'excused' && !eligibleForCompensation,
        diffHours: Math.round(diffHours * 10) / 10,
        attendance: {
          student: studentId,
          status: status === 'confirmed' ? 'confirmed' : 'excused',
          eligibleForCompensation,
          compensationEligible: eligibleForCompensation,
          excuseReason: excuseReason || (status === 'confirmed' ? 'تأكيد الحضور مسبقاً' : '')
        }
      });
    }

    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'الحصة غير موجودة' });
    }

    const belongsToSession = await sessionIncludesStudent(session, studentId);
    if (!belongsToSession) {
      return res.status(403).json({ error: 'الطالب غير مسجل في هذه الحصة' });
    }

    // Verify actor permission: the student, their linked guardian, or an admin.
    if (req.user.role !== 'admin' && String(req.user.id) !== String(studentId)) {
      const Guardian = require('../models/Guardian');
      const guardian = await Guardian.findOne({ user: req.user.id, 'children.student': studentId });
      if (!guardian) {
        return res.status(403).json({ error: 'غير مصرح بتعديل حضور هذا الطالب' });
      }
    }

    const now = new Date();
    const scheduledTime = new Date(session.scheduledAt);
    const diffHours = (scheduledTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    let eligibleForCompensation = false;
    let lateExcuse = false;

    if (status === 'excused') {
      if (diffHours >= 6) {
        eligibleForCompensation = true;
      } else {
        lateExcuse = true;
      }
    }

    // Update or insert attendance record for this student
    if (!session.attendance) {
      session.attendance = [];
    }

    const existingIndex = session.attendance.findIndex(
      (a) => a.student && a.student.toString() === studentId.toString()
    );

    const attendanceStatus = status === 'confirmed' ? 'confirmed' : 'excused';

    const attendanceRecord = {
      student: studentId,
      status: attendanceStatus,
      excuseReason: excuseReason || (status === 'confirmed' ? 'تأكيد الحضور مسبقاً' : ''),
      excusedAt: status === 'excused' ? now : undefined,
      eligibleForCompensation
    };

    if (existingIndex > -1) {
      session.attendance[existingIndex].status = attendanceStatus;
      session.attendance[existingIndex].excuseReason = attendanceRecord.excuseReason;
      if (status === 'excused') {
        session.attendance[existingIndex].excusedAt = now;
        session.attendance[existingIndex].eligibleForCompensation = eligibleForCompensation;
      }
    } else {
      session.attendance.push(attendanceRecord);
    }

    await session.save();

    // Update student model if exists
    const Student = require('../models/Student');
    const studentRecord = await Student.findOne({ user: studentId });
    if (studentRecord) {
      studentRecord.lastUpdate = status === 'excused' ? (eligibleForCompensation ? 'معتذر (مستحق تعويض)' : 'معتذر (متأخر)') : 'مؤكد الحضور';
      await studentRecord.save();
    }

    res.json({
      success: true,
      message: status === 'confirmed'
        ? 'تم تأكيد الحضور بنجاح'
        : (eligibleForCompensation
            ? 'تم قبول الاعتذار بنجاح ومستحق لحصة تعويضية (قبل 6 ساعات)'
            : 'تم تسجيل الاعتذار، ولكنه اعتذار متأخر (أقل من 6 ساعات قبل موعد الحصة)'),
      status,
      eligibleForCompensation,
      compensationEligible: eligibleForCompensation,
      lateExcuse,
      diffHours: Math.round(diffHours * 10) / 10
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   POST /api/sessions/:id/report
// @desc    Save session evaluation report and immediately dispatch WhatsApp report card
// @access  Private (Teacher, Admin)
router.post('/:id/report', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { studentReports } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ error: 'الحصة غير موجودة' });
    }

    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user.id }).select('_id');
      if (!teacher || String(session.teacher) !== String(teacher._id)) {
        return res.status(403).json({ error: 'غير مصرح بكتابة تقرير لهذه الحصة' });
      }
    }

    const reportsInput = Array.isArray(studentReports) ? studentReports : [req.body];
    if (reportsInput.length === 0 || (!reportsInput[0].student && !session.student)) {
      return res.status(400).json({ error: 'بيانات التقرير أو معرف الطالب مطلوبة' });
    }

    const { sendSessionReport } = require('../services/whatsapp');
    const { resolveGuardianOrStudentPhone } = require('../services/scheduler');
    const User = require('../models/User');

    if (!session.studentReports) {
      session.studentReports = [];
    }

    const results = [];

    for (const reportItem of reportsInput) {
      const studentId = reportItem.student || reportItem.studentId || session.student;
      if (!studentId) continue;

      if (!(await sessionIncludesStudent(session, studentId))) {
        return res.status(403).json({ error: 'لا يمكن إضافة تقرير لطالب غير مسجل في هذه الحصة' });
      }

      const studentUser = await User.findById(studentId).select('name phone whatsappPhone guardian');
      if (!studentUser) {
        return res.status(404).json({ error: 'الطالب غير موجود' });
      }

      const memScore = reportItem.memorizationScore != null ? Number(reportItem.memorizationScore) : undefined;
      const tajScore = reportItem.tajweedScore != null ? Number(reportItem.tajweedScore) : undefined;

      const reportData = {
        student: studentId,
        memorizationScore: memScore,
        tajweedScore: tajScore,
        surahRecited: reportItem.surahRecited || '',
        fromAyah: reportItem.fromAyah ? Number(reportItem.fromAyah) : undefined,
        toAyah: reportItem.toAyah ? Number(reportItem.toAyah) : undefined,
        nextHomework: reportItem.nextHomework || reportItem.homework || '',
        notes: reportItem.notes || '',
        sentToWhatsApp: false,
        sentAt: undefined
      };

      // Dispatch WhatsApp report to guardian/student
      try {
        const recipientPhone = await resolveGuardianOrStudentPhone(studentUser);
        if (recipientPhone) {
          const waResult = await sendSessionReport(session, studentUser, reportData, recipientPhone);
          if (waResult?.success) {
            reportData.sentToWhatsApp = true;
            reportData.sentAt = new Date();
          }
        } else {
          console.warn(`⚠️ [Session Report] No phone found for student ${studentUser?.name} (${studentId})`);
        }
      } catch (waErr) {
        console.error('❌ [Session Report] WhatsApp dispatch failed:', waErr.message);
      }

      // Upsert report in session.studentReports
      const existingIdx = session.studentReports.findIndex(
        (r) => r.student && r.student.toString() === studentId.toString()
      );
      if (existingIdx > -1) {
        session.studentReports[existingIdx] = { ...session.studentReports[existingIdx].toObject(), ...reportData };
      } else {
        session.studentReports.push(reportData);
      }

      results.push({
        studentId,
        studentName: studentUser?.name,
        sentToWhatsApp: reportData.sentToWhatsApp
      });
    }

    await session.save();

    res.json({
      success: true,
      message: 'تم حفظ تقرير الحصة وإرساله بنجاح',
      sessionReports: session.studentReports,
      dispatchSummary: results
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;