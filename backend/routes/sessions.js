const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Session = require('../models/Session');
const Teacher = require('../models/Teacher');
const { protect, authorize } = require('../middleware/auth');
const meetingService = require('../services/meetingService');
const { notifyTeacherForSessionRequest, notifySessionAccepted, notifyUser } = require('../utils/notify');

const isMockMode = !process.env.MONGODB_URI;
const isDBConnected = () => mongoose.connection.readyState === 1;


router.post('/trial', protect, async (req, res) => {
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

    const existingTrial = await Session.findOne({
      student: req.user.id,
      teacher: teacherId,
      type: 'trial',
      status: { $in: ['pending', 'accepted'] }
    });

    if (existingTrial) {
      return res.status(400).json({ error: 'You already have a pending trial session with this teacher' });
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
      status: { $in: ['accepted', 'completed'] },
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

    if (isMockMode || !isDBConnected()) {
      const mockSessions = [
        {
          _id: 'mock-sess-1',
          id: 'mock-sess-1',
          type: 'regular',
          status: 'accepted',
          scheduledAt: new Date(Date.now() + 3600000 * 3).toISOString(),
          student: { _id: 'std-1', name: 'عمر خالد المنشاوي', email: 'omar@example.com' },
          teacher: { _id: 'tch-1', user: { name: req.user?.name || 'الشيخ المعلم' } },
          notes: 'حصة تسميع سورة الكهف والتدريب على أحكام الراءات',
          roomUrl: '/live/room-athar-demo',
        },
        {
          _id: 'mock-sess-2',
          id: 'mock-sess-2',
          type: 'trial',
          status: 'pending',
          scheduledAt: new Date(Date.now() + 3600000 * 24).toISOString(),
          student: { _id: 'std-2', name: 'ياسين محمود', email: 'yassine@example.com' },
          teacher: { _id: 'tch-1', user: { name: req.user?.name || 'الشيخ المعلم' } },
          notes: 'حصة تجريبية لتحديد المستوى وتأسيس نور البيان',
          roomUrl: '/live/room-trial-102',
        },
        {
          _id: 'mock-sess-3',
          id: 'mock-sess-3',
          type: 'regular',
          status: 'pending',
          scheduledAt: new Date(Date.now() + 3600000 * 48).toISOString(),
          student: { _id: 'std-3', name: 'إبراهيم مصطفى', email: 'ibrahim@example.com' },
          teacher: { _id: 'tch-1', user: { name: req.user?.name || 'الشيخ المعلم' } },
          notes: 'حلقة جماعية 10 طلاب - مسار الإتقان والتجويد',
          roomUrl: '/live/room-athar-group',
        },
      ].filter((s) => (!status || s.status === status) && (!type || s.type === type));

      return res.json({
        sessions: mockSessions,
        pagination: { page: 1, limit: 10, total: mockSessions.length, pages: 1 },
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
      const newSession = await Session.create({
        ...session.toObject(),
        _id: undefined,
        scheduledAt: new Date(rescheduledDate),
        status: 'pending',
        rescheduledFrom: session._id
      });
      
      session.status = 'cancelled';
      session.cancellationReason = 'Rescheduled';
      await session.save();

      return res.json({ success: true, session: newSession });
    }

    await session.save();

    try {
      if (action === 'accept') {
        await notifySessionAccepted(session, session.student, session.meetingLink);
      } else if (action === 'reject') {
        await notifyUser(session.student, {
          type: 'session-rejected',
          title: { ar: 'تم رفض الحصة', en: 'Session rejected' },
          message: {
            ar: reason || 'لم يتم قبول طلب الحصة',
            en: reason || 'Your session request was not accepted',
          },
          data: { session: session._id },
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

    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'الحصة غير موجودة' });
    }

    // Verify permission: student herself, or guardian of student, or admin
    if (req.user.role !== 'admin' && req.user.id !== studentId.toString()) {
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

    const attendanceStatus = status === 'confirmed' ? 'pending' : 'excused';

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

      const studentUser = await User.findById(studentId).select('name phone whatsappPhone guardian');

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