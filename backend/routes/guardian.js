const express = require('express');
const router = express.Router();
const Guardian = require('../models/Guardian');
const User = require('../models/User');
const Student = require('../models/Student');
const Session = require('../models/Session');
const GroupCircle = require('../models/GroupCircle');
const Progress = require('../models/Progress');
const { protect, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/guardian/children
 * @desc    جلب أبناء ولي الأمر المسجلين مع تفاصيل حلقاتهم ونسب الحضور وآخر التقييمات
 * @access  Private (Guardian, Admin)
 */
router.get('/children', protect, authorize('guardian', 'admin'), async (req, res) => {
  try {
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
    const { studentCode, email, relationship = 'guardian' } = req.body;

    if (!studentCode && !email) {
      return res.status(400).json({ error: 'يرجى تقديم البريد الإلكتروني أو كود الطالب للربط' });
    }

    const query = { role: 'student' };
    if (email) {
      query.email = email.toLowerCase().trim();
    } else if (studentCode) {
      query.$or = [
        { referralCode: studentCode.trim().toUpperCase() },
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

module.exports = router;
