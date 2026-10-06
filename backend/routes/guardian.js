const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Guardian = require('../models/Guardian');
const User = require('../models/User');
const Student = require('../models/Student');
const Session = require('../models/Session');
const GroupCircle = require('../models/GroupCircle');
const LiveSession = require('../models/LiveSession');
const Progress = require('../models/Progress');
const { protect, authorize } = require('../middleware/auth');
const { findChildAccess, hasChildPermission } = require('../utils/guardianSafeguarding');


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
      return res.status(503).json({ error: 'Guardian data is temporarily unavailable' });
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

      const access = findChildAccess(guardian, studentId);
      const permissions = access?.permissions || {
        viewProgress: false,
        viewGrades: false,
        viewAttendance: false,
        receiveNotifications: false,
        approveEnrollments: false,
      };

      // Query only the data this guardian is currently allowed to view.
      const studentProfile = permissions.viewProgress
        ? await Student.findOne({ user: studentId }).lean()
        : null;

      // Circle membership is needed for scheduling context and does not expose grades.
      let circleInfo = null;
      if (studentUser.circle) {
        circleInfo = await GroupCircle.findById(studentUser.circle)
          .select('name level schedule capacity')
          .lean();
      }

      let totalSessions = 0;
      let attendedSessions = 0;
      let excusedSessions = 0;
      let absentSessions = 0;

      if (permissions.viewAttendance) {
        const sessions = await Session.find({
          $or: [
            { student: studentId },
            { 'attendance.student': studentId }
          ],
          status: { $in: ['completed', 'accepted'] }
        }).select('scheduledAt status attendance').lean();

        sessions.forEach((sess) => {
          totalSessions += 1;
          const att = sess.attendance?.find(
            (entry) => entry.student && entry.student.toString() === studentId.toString()
          );
          if (att) {
            if (att.status === 'attended') attendedSessions += 1;
            else if (att.status === 'excused') excusedSessions += 1;
            else if (att.status === 'absent') absentSessions += 1;
            else attendedSessions += 1;
          } else if (sess.status === 'completed') {
            attendedSessions += 1;
          }
        });
      }

      const attendanceRate = permissions.viewAttendance && totalSessions > 0
        ? Math.round((attendedSessions / totalSessions) * 100)
        : null;

      let latestReport = null;
      if (permissions.viewGrades) {
        const sessionWithReport = await Session.findOne({
          $or: [
            { student: studentId },
            { 'studentReports.student': studentId }
          ],
          'studentReports.0': { $exists: true }
        }).sort({ scheduledAt: -1 }).lean();

        if (sessionWithReport?.studentReports) {
          const rep = sessionWithReport.studentReports.find(
            (entry) => entry.student && entry.student.toString() === studentId.toString()
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
      }

      const progressList = permissions.viewProgress
        ? await Progress.find({ student: studentId }).populate('course', 'title').lean()
        : [];

      return {
        studentId: studentUser._id,
        name: studentUser.name,
        email: studentUser.email,
        phone: studentUser.phone,
        avatar: studentUser.avatar,
        relationship: childItem.relationship,
        permissions,
        circle: circleInfo,
        studentProfile: permissions.viewProgress ? {
          plan: studentProfile?.plan || 'حفظ القرآن الكريم',
          currentSurah: studentProfile?.currentSurah || 'سورة الفاتحة',
          points: studentProfile?.points || 0,
          streak: studentProfile?.streak || 0,
          level: studentProfile?.level || studentUser.currentLevel || 'مبتدئ'
        } : null,
        attendance: permissions.viewAttendance ? {
          rate: attendanceRate,
          total: totalSessions,
          attended: attendedSessions,
          excused: excusedSessions,
          absent: absentSessions
        } : null,
        latestEvaluation: permissions.viewGrades ? latestReport : null,
        coursesProgress: permissions.viewProgress ? progressList.map(p => ({
          courseTitle: p.course?.title,
          percentage: p.overallProgress?.percentage || 0
        })) : []
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
    const { studentCode, relationship = 'guardian' } = req.body;
    const normalizedCode = String(studentCode || '').trim().toUpperCase();

    if (!/^WN-[A-F0-9]{8}$/.test(normalizedCode)) {
      return res.status(400).json({ error: 'كود ربط الطالب غير صالح' });
    }

    if (!isDBConnected() || !isValidObjectId(req.user.id)) {
      return res.status(503).json({ error: 'ربط ولي الأمر يتطلب اتصال قاعدة البيانات' });
    }

    const student = await User.findOne({
      role: 'student',
      guardianLinkCode: normalizedCode
    }).select('+guardianLinkCode guardian name');

    if (!student) {
      return res.status(404).json({ error: 'كود الربط غير صحيح أو تم استخدامه من قبل' });
    }

    if (student.guardian && String(student.guardian) !== String(req.user.id)) {
      return res.status(409).json({ error: 'هذا الطالب مرتبط بالفعل بولي أمر آخر' });
    }

    let guardianProfile = await Guardian.findOne({ user: req.user.id });
    if (!guardianProfile) {
      guardianProfile = new Guardian({ user: req.user.id, children: [] });
    }

    const alreadyLinked = guardianProfile.children.some(
      (child) => child.student && String(child.student) === String(student._id)
    );

    if (alreadyLinked) {
      return res.status(409).json({ error: 'هذا الطالب مربوط بالفعل بحسابك' });
    }

    await guardianProfile.addChild(student._id.toString(), relationship, {
      viewProgress: true,
      viewGrades: true,
      viewAttendance: true,
      receiveNotifications: true
    });

    student.guardian = req.user.id;
    student.guardianLinkCode = undefined;
    await student.save();

    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { children: student._id }
    });

    return res.status(201).json({
      success: true,
      message: `تم ربط الطالب ${student.name} بحسابك بنجاح`,
      child: {
        id: student._id,
        name: student.name,
        relationship
      }
    });
  } catch (error) {
    console.error('Link child error:', error);
    return res.status(400).json({ error: error.message });
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
      return res.status(503).json({ error: 'Guardian reports are temporarily unavailable' });
    }

    // Reports contain grades/evaluations, so linked-child membership alone is not enough.
    if (req.user.role !== 'admin') {
      const guardian = await Guardian.findOne({
        user: req.user.id,
        'children.student': studentId
      });

      if (!guardian || !hasChildPermission(guardian, studentId, 'viewGrades')) {
        return res.status(403).json({ error: 'غير مصرح بالاطلاع على تقييمات هذا الطالب' });
      }
    }

    const studentUser = await User.findById(studentId).select('name email');
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
      return res.status(503).json({ error: 'Guardian sessions are temporarily unavailable' });
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

    const attendancePermissionByChild = new Map(
      childIds.map((childId) => {
        const access = guardian ? findChildAccess(guardian, childId) : null;
        // Legacy User.children links predate granular permissions; preserve access until migrated.
        return [String(childId), access ? access.permissions.viewAttendance : true];
      })
    );

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
    .populate({
      path: 'teacher',
      select: 'personalInfo.fullName media.profilePhoto user',
      populate: { path: 'user', select: 'name avatar' }
    })
    .populate('circle', 'name level schedule capacity')
    .sort({ scheduledAt: 1 })
    .limit(10)
    .lean();

    const liveSessions = await LiveSession.find({
      session: { $in: upcoming.map((session) => session._id) }
    }).select('session roomId').lean();

    const liveRoomBySession = new Map(
      liveSessions.map((live) => [String(live.session), live.roomId])
    );

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
      
      const teacherName =
        sess.teacher?.user?.name ||
        sess.teacher?.personalInfo?.fullName ||
        'معلم الأكاديمية';

      const diffMs = new Date(sess.scheduledAt).getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      return {
        _id: sess._id,
        scheduledAt: sess.scheduledAt,
        duration: sess.duration,
        meetingLink: liveRoomBySession.get(String(sess._id))
          ? `/live/${liveRoomBySession.get(String(sess._id))}`
          : null,
        type: sess.type,
        status: sess.status,
        circleName: sess.circle?.name || (sess.type === 'trial' ? 'حصة تجريبية مجانية' : 'حلقة فردية'),
        child: child ? { id: child._id, name: child.name } : null,
        teacher: {
          id: sess.teacher?._id || null,
          name: teacherName,
          avatar: sess.teacher?.media?.profilePhoto || sess.teacher?.user?.avatar || null
        },
        rsvp: child && attendancePermissionByChild.get(String(child._id))
          ? (att ? att.status : 'pending')
          : null,
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

