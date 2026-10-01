const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Guardian = require('../models/Guardian');
const User = require('../models/User');
const Student = require('../models/Student');
const Session = require('../models/Session');
const GroupCircle = require('../models/GroupCircle');
const Progress = require('../models/Progress');
const { protect, authorize } = require('../middleware/auth');
const { getMockGuardianChildren, addMockGuardianChild } = require('../mockStore');

const isDBConnected = () => mongoose.connection.readyState === 1;
const isValidObjectId = (id) => id && mongoose.Types.ObjectId.isValid(id);

/**
 * @route   GET /api/guardian/children
 * @desc    جلب أبناء ولي الأمر المسجلين مع تفاصيل حلقاتهم ونسب الحضور وآخر التقييمات
 * @access  Private (Guardian, Admin)
 */
router.get('/children', protect, authorize('guardian', 'admin'), async (req, res) => {
  try {
    if (!isDBConnected() || !isValidObjectId(req.user.id)) {
      const mockKids = getMockGuardianChildren(req.user.id);
      return res.json({
        success: true,
        children: mockKids
      });
    }

    let guardian = await Guardian.findOne({ user: req.user.id })
      .populate({
        path: 'children.student',
        select: 'name email phone avatar circle currentLevel preferredTrack'
      });

    // If guardian document doesn't exist yet, look up in User.children
    if (!guardian) {
      const user = await User.findById(req.user.id).populate('children', 'name email phone avatar circle currentLevel preferredTrack');
      if (user && user.children && user.children.length > 0) {
        guardian = new Guardian({
          user: req.user.id,
          children: user.children.map(child => ({
            student: child._id,
            relationship: 'guardian'
          }))
        });
        await guardian.save();
        await guardian.populate({
          path: 'children.student',
          select: 'name email phone avatar circle currentLevel preferredTrack'
        });
      }
    }

    if (!guardian || !guardian.children || guardian.children.length === 0) {
      return res.json({
        success: true,
        children: []
      });
    }

    const childrenDetails = await Promise.all(guardian.children.map(async (childItem) => {
      const studentUser = childItem.student;
      if (!studentUser) return null;

      const studentId = studentUser._id;

      // 1. Fetch Student profile (gamification, points, level, etc.)
      const studentProfile = await Student.findOne({ user: studentId }).lean();

      // 2. Fetch Group Circle details if enrolled
      let circleInfo = null;
      if (studentUser.circle) {
        circleInfo = await GroupCircle.findById(studentUser.circle)
          .select('name level schedule capacity')
          .lean();
      }

      // 3. Fetch all sessions for this student to compute attendance rate
      const sessions = await Session.find({
        $or: [
          { student: studentId },
          { 'attendance.student': studentId }
        ],
        status: { $in: ['completed', 'accepted'] }
      }).select('scheduledAt status attendance studentReports').lean();

      let totalSessions = 0;
      let attendedSessions = 0;
      let excusedSessions = 0;
      let absentSessions = 0;

      sessions.forEach(sess => {
        totalSessions++;
        const att = sess.attendance?.find(a => a.student && a.student.toString() === studentId.toString());
        if (att) {
          if (att.status === 'attended') attendedSessions++;
          else if (att.status === 'excused') excusedSessions++;
          else if (att.status === 'absent') absentSessions++;
          else attendedSessions++; // Default if completed
        } else if (sess.status === 'completed') {
          attendedSessions++;
        }
      });

      const attendanceRate = totalSessions > 0 
        ? Math.round((attendedSessions / totalSessions) * 100) 
        : 100;

      // 4. Fetch latest evaluation report across sessions
      const sessionWithReport = await Session.findOne({
        $or: [
          { student: studentId },
          { 'studentReports.student': studentId }
        ],
        'studentReports.0': { $exists: true }
      }).sort({ scheduledAt: -1 }).lean();

      let latestReport = null;
      if (sessionWithReport && sessionWithReport.studentReports) {
        const rep = sessionWithReport.studentReports.find(
          r => r.student && r.student.toString() === studentId.toString()
        );
        if (rep) {
          latestReport = {
            memorizationScore: rep.memorizationScore,
            tajweedScore: rep.tajweedScore,
            surahRecited: rep.surahRecited,
            fromAyah: rep.fromAyah,
            toAyah: rep.toAyah,
            nextHomework: rep.nextHomework,
            notes: rep.notes,
            date: sessionWithReport.scheduledAt
          };
        }
      }

      // 5. Course progress summary if any
      const progressList = await Progress.find({ student: studentId })
        .populate('course', 'title')
        .lean();

      return {
        studentId: studentUser._id,
        name: studentUser.name,
        email: studentUser.email,
        phone: studentUser.phone,
        avatar: studentUser.avatar,
        relationship: childItem.relationship,
        permissions: childItem.permissions,
        circle: circleInfo,
        studentProfile: {
          plan: studentProfile?.plan || 'حفظ القرآن الكريم',
          currentSurah: studentProfile?.currentSurah || 'سورة الفاتحة',
          points: studentProfile?.points || 0,
          streak: studentProfile?.streak || 0,
          level: studentProfile?.level || studentUser.currentLevel || 'مبتدئ'
        },
        attendance: {
          rate: attendanceRate,
          total: totalSessions,
          attended: attendedSessions,
          excused: excusedSessions,
          absent: absentSessions
        },
        latestEvaluation: latestReport,
        coursesProgress: progressList.map(p => ({
          courseTitle: p.course?.title,
          percentage: p.overallProgress?.percentage || 0
        }))
      };
    }));

    res.json({
      success: true,
      children: childrenDetails.filter(Boolean)
    });
  } catch (error) {
    console.error('Get guardian children error:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب بيانات الأبناء' });
  }
});

/**
 * @route   POST /api/guardian/link-child
 * @desc    ربط حساب طالب بحساب ولي الأمر بواسطة كود الطالب أو إيميله
 * @access  Private (Guardian, Admin)
 */
router.post('/link-child', protect, authorize('guardian', 'admin'), async (req, res) => {
  try {
    const { studentCode, email, studentEmail, relationship = 'guardian' } = req.body;
    const targetEmail = (email || studentEmail || '').toLowerCase().trim();

    if (!studentCode && !targetEmail) {
      return res.status(400).json({ error: 'يرجى تقديم البريد الإلكتروني أو كود الطالب للربط' });
    }

    if (!isDBConnected() || !isValidObjectId(req.user.id)) {
      const childName = targetEmail ? targetEmail.split('@')[0] : (studentCode || 'طالب جديد');
      const childEmail = targetEmail || `${studentCode.toLowerCase()}@student.athar.com`;
      const linked = addMockGuardianChild(req.user.id, {
        name: childName,
        email: childEmail,
        relationship: relationship || 'guardian'
      });
      return res.status(201).json({
        success: true,
        message: `تم ربط الطالب ${linked.name} بحسابك بنجاح`,
        child: {
          id: linked.studentId,
          _id: linked.studentId,
          name: linked.name,
          email: linked.email,
          relationship: linked.relationship
        }
      });
    }

    const query = { role: 'student' };
    if (targetEmail) {
      query.email = targetEmail;
    } else if (studentCode) {
      query.$or = [
        { referralCode: studentCode.trim().toUpperCase() },
        { studentCode: studentCode.trim() },
        { _id: studentCode.match(/^[0-9a-fA-F]{24}$/) ? studentCode : null }
      ];
    }

    const student = await User.findOne(query);
    if (!student) {
      return res.status(404).json({ error: 'لم يتم العثور على طالب مطابق للمعلومات المدخلة' });
    }

    // Check or create Guardian document
    let guardian = await Guardian.findOne({ user: req.user.id });
    if (!guardian) {
      guardian = new Guardian({
        user: req.user.id,
        children: []
      });
    }

    const alreadyLinked = guardian.children.some(
      c => c.student && c.student.toString() === student._id.toString()
    );

    if (alreadyLinked) {
      return res.status(400).json({ error: 'هذا الطالب مربوط بالفعل بحسابك' });
    }

    await guardian.addChild(student._id.toString(), relationship, {
      viewProgress: true,
      viewGrades: true,
      viewAttendance: true,
      receiveNotifications: true
    });

    // Link bidirectional references
    student.guardian = req.user.id;
    await student.save();

    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { children: student._id }
    });

    res.status(201).json({
      success: true,
      message: `تم ربط الطالب ${student.name} بحسابك بنجاح`,
      child: {
        id: student._id,
        name: student.name,
        email: student.email,
        relationship
      }
    });
  } catch (error) {
    console.error('Link child error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route   GET /api/guardian/reports/:studentId
 * @desc    جلب التاريخ الكامل لتقارير الطالب
 * @access  Private (Guardian, Admin)
 */
router.get('/reports/:studentId', protect, authorize('guardian', 'admin'), async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!isDBConnected() || !isValidObjectId(req.user.id) || !isValidObjectId(studentId)) {
      return res.json({
        success: true,
        student: {
          id: studentId,
          name: 'عبد الله أحمد',
          email: 'abdallah@student.athar.com'
        },
        reportsCount: 2,
        reports: [
          {
            sessionId: 'sess-mock-1',
            scheduledAt: new Date(Date.now() - 86400000),
            teacherName: 'الشيخ أحمد منصور',
            memorizationScore: 9.5,
            tajweedScore: 9,
            surahRecited: 'سورة الملك',
            fromAyah: 1,
            toAyah: 15,
            nextHomework: 'حفظ من آية 16 إلى 30 مع المراجعة',
            notes: 'ما شاء الله تبارك الله، تميز واضح في مخارج الحروف وأحكام القلقلة',
            sentToWhatsApp: true,
            sentAt: new Date(Date.now() - 86400000 + 3600000)
          },
          {
            sessionId: 'sess-mock-2',
            scheduledAt: new Date(Date.now() - 86400000 * 3),
            teacherName: 'الشيخ أحمد منصور',
            memorizationScore: 9,
            tajweedScore: 8.5,
            surahRecited: 'سورة التحريم',
            fromAyah: 1,
            toAyah: 12,
            nextHomework: 'مراجعة سورة التحريم كاملة',
            notes: 'يرجى التركيز على مد الصلة الكبرى وتثبيت الآيات الأخيرة',
            sentToWhatsApp: true,
            sentAt: new Date(Date.now() - 86400000 * 3 + 3600000)
          }
        ]
      });
    }

    // Verify guardian has authority over this child (unless admin)
    if (req.user.role !== 'admin') {
      const guardian = await Guardian.findOne({
        user: req.user.id,
        'children.student': studentId
      });

      if (!guardian) {
        return res.status(403).json({ error: 'غير مصرح بالاطلاع على تقارير هذا الطالب' });
      }
    }

    const studentUser = await User.findById(studentId).select('name email phone');
    if (!studentUser) {
      return res.status(404).json({ error: 'الطالب غير موجود' });
    }

    // Fetch all sessions containing reports for this student
    const sessions = await Session.find({
      $or: [
        { student: studentId },
        { 'studentReports.student': studentId }
      ],
      'studentReports.0': { $exists: true }
    })
    .populate('teacher', 'name')
    .sort({ scheduledAt: -1 })
    .lean();

    const reportsHistory = [];

    sessions.forEach(sess => {
      const rep = sess.studentReports?.find(
        r => r.student && r.student.toString() === studentId.toString()
      );
      if (rep) {
        reportsHistory.push({
          sessionId: sess._id,
          scheduledAt: sess.scheduledAt,
          teacherName: sess.teacher?.name || 'المعلم',
          memorizationScore: rep.memorizationScore,
          tajweedScore: rep.tajweedScore,
          surahRecited: rep.surahRecited,
          fromAyah: rep.fromAyah,
          toAyah: rep.toAyah,
          nextHomework: rep.nextHomework,
          notes: rep.notes,
          sentToWhatsApp: rep.sentToWhatsApp,
          sentAt: rep.sentAt
        });
      }
    });

    res.json({
      success: true,
      student: {
        id: studentUser._id,
        name: studentUser.name,
        email: studentUser.email
      },
      reportsCount: reportsHistory.length,
      reports: reportsHistory
    });
  } catch (error) {
    console.error('Get student reports error:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب تاريخ التقارير' });
  }
});

/**
 * @route   GET /api/guardian/upcoming-sessions
 * @desc    جلب الحصص والحلقات القادمة لجميع أبناء ولي الأمر مع حالة الحضور والاعتذار
 * @access  Private (Guardian, Admin)
 */
router.get('/upcoming-sessions', protect, authorize('guardian', 'admin'), async (req, res) => {
  try {
    if (!isDBConnected() || !isValidObjectId(req.user.id)) {
      const now = new Date();
      const sess1Date = new Date(now.getTime() + 86400000 * 2);
      const sess2Date = new Date(now.getTime() + 86400000 * 4);
      const diff1 = (sess1Date.getTime() - now.getTime()) / (1000 * 60 * 60);
      const diff2 = (sess2Date.getTime() - now.getTime()) / (1000 * 60 * 60);

      const { getMockSessionRsvp } = require('../mockStore');
      const sess1Rsvp = getMockSessionRsvp('sess-up-1')?.status || 'confirmed';
      const sess2Rsvp = getMockSessionRsvp('sess-up-2')?.status || 'pending';

      return res.json({
        success: true,
        sessions: [
          {
            _id: 'sess-up-1',
            scheduledAt: sess1Date,
            duration: 45,
            type: 'regular',
            status: 'accepted',
            meetingLink: '/live/room-circle-1?role=guardian&observer=true',
            circleName: 'حلقة الإمام قالون (بنين - مبتدئ)',
            child: { id: 'mock-child-1', name: 'عبد الله أحمد' },
            teacher: {
              name: 'الشيخ أحمد منصور',
              phone: '+201012345678'
            },
            rsvp: sess1Rsvp,
            canExcuseWithCompensation: diff1 >= 6,
            hoursUntilSession: Math.round(diff1 * 10) / 10
          },
          {
            _id: 'sess-up-2',
            scheduledAt: sess2Date,
            duration: 45,
            type: 'regular',
            status: 'accepted',
            meetingLink: '/live/room-circle-1?role=guardian&observer=true',
            circleName: 'حلقة الإمام قالون (بنين - مبتدئ)',
            child: { id: 'mock-child-1', name: 'عبد الله أحمد' },
            teacher: {
              name: 'الشيخ أحمد منصور',
              phone: '+201012345678'
            },
            rsvp: sess2Rsvp,
            canExcuseWithCompensation: diff2 >= 6,
            hoursUntilSession: Math.round(diff2 * 10) / 10
          }
        ]
      });
    }

    let guardian = await Guardian.findOne({ user: req.user.id });
    let childIds = [];
    if (guardian && guardian.children && guardian.children.length > 0) {
      childIds = guardian.children.map(c => c.student);
    } else {
      const user = await User.findById(req.user.id);
      if (user && user.children && user.children.length > 0) {
        childIds = user.children;
      }
    }

    if (childIds.length === 0) {
      return res.json({ success: true, sessions: [] });
    }

    // Also find any circles where children are enrolled
    const childrenUsers = await User.find({ _id: { $in: childIds } }).select('_id name circle');
    const circleIds = childrenUsers.map(c => c.circle).filter(Boolean);

    const now = new Date();
    // Fetch upcoming sessions from 2 hours ago to future
    const threshold = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    const upcoming = await Session.find({
      $or: [
        { student: { $in: childIds } },
        { circle: { $in: circleIds } },
        { 'attendance.student': { $in: childIds } }
      ],
      scheduledAt: { $gte: threshold },
      status: { $in: ['pending', 'accepted'] }
    })
    .populate('teacher', 'personalInfo')
    .populate('circle', 'name level schedule capacity')
    .sort({ scheduledAt: 1 })
    .limit(10)
    .lean();

    const formattedSessions = upcoming.map(sess => {
      // Determine which child this belongs to
      let child = null;
      if (sess.student) {
        child = childrenUsers.find(c => c._id.toString() === sess.student.toString());
      } else if (sess.circle) {
        child = childrenUsers.find(c => c.circle && c.circle.toString() === sess.circle._id.toString());
      }

      // Check RSVP / attendance status
      const att = sess.attendance?.find(a => child && a.student && a.student.toString() === child._id.toString());
      
      const teacherName = sess.teacher?.personalInfo?.fullName || 'معلم الأكاديمية';
      const teacherPhone = sess.teacher?.personalInfo?.whatsapp || sess.teacher?.personalInfo?.phone || '';

      const diffMs = new Date(sess.scheduledAt).getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      return {
        _id: sess._id,
        scheduledAt: sess.scheduledAt,
        duration: sess.duration,
        meetingLink: sess.meetingLink || `/live/session-${sess._id}?role=guardian&observer=true`,
        type: sess.type,
        status: sess.status,
        circleName: sess.circle?.name || (sess.type === 'trial' ? 'حصة تجريبية مجانية' : 'حلقة فردية'),
        child: child ? { id: child._id, name: child.name } : null,
        teacher: {
          name: teacherName,
          phone: teacherPhone
        },
        rsvp: att ? att.status : 'pending', // 'confirmed', 'excused', 'attended', 'pending'
        canExcuseWithCompensation: diffHours >= 6,
        hoursUntilSession: Math.round(diffHours * 10) / 10
      };
    });

    res.json({ success: true, sessions: formattedSessions });
  } catch (error) {
    console.error('Get upcoming sessions error:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الحصص القادمة' });
  }
});

module.exports = router;


