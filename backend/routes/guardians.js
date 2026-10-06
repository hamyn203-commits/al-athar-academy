const express = require('express');
const router = express.Router();
const Guardian = require('../models/Guardian');
const User = require('../models/User');
const Progress = require('../models/Progress');
const Enrollment = require('../models/Enrollment');
const Session = require('../models/Session');
const TeacherTask = require('../models/TeacherTask');
const { protect, authorize } = require('../middleware/auth');
const {
  findChildAccess,
  hasChildPermission,
  filterReportForPermissions,
} = require('../utils/guardianSafeguarding');

// @route   GET /api/guardians/my-children
// @desc    Get all children for the current guardian
// @access  Private (Guardian)
router.get('/my-children', protect, authorize('guardian', 'admin'), async (req, res) => {
  try {
    const guardian = await Guardian.findOne({ user: req.user.id })
      .populate({
        path: 'children.student',
        select: 'name email avatar'
      });

    if (!guardian) {
      return res.status(404).json({ error: 'Guardian profile not found' });
    }

    res.json(guardian.children);
  } catch (error) {
    console.error('Get my children error:', error);
    res.status(500).json({ error: 'Failed to fetch children' });
  }
});

// @route   POST /api/guardians/add-child
// @desc    Add a child to guardian
// @access  Private (Guardian)
router.post('/add-child', protect, authorize('guardian', 'admin'), (_req, res) => {
  return res.status(410).json({
    error: 'هذا المسار تم إيقافه. استخدم كود ربط ولي الأمر من حساب الطالب.'
  });
});

// @route   DELETE /api/guardians/remove-child/:studentId
// @desc    Remove a child from guardian
// @access  Private (Guardian)
router.delete('/remove-child/:studentId', protect, authorize('guardian'), async (req, res) => {
  try {
    const guardian = await Guardian.findOne({
      user: req.user.id,
      'children.student': req.params.studentId,
    });

    if (!guardian) {
      return res.status(404).json({ error: 'Linked child not found' });
    }

    await guardian.removeChild(req.params.studentId);

    await Promise.all([
      User.findByIdAndUpdate(req.user.id, {
        $pull: { children: req.params.studentId },
      }),
      User.updateOne(
        { _id: req.params.studentId, guardian: req.user.id },
        { $unset: { guardian: 1, guardianLinkCode: 1 } }
      ),
    ]);

    res.json({ message: 'Child removed successfully' });
  } catch (error) {
    console.error('Remove child error:', error);
    res.status(400).json({ error: error.message });
  }
});

// @route   PUT /api/guardians/permissions/:studentId
// @desc    Update permissions for a child
// @access  Private (Guardian)
router.put('/permissions/:studentId', protect, authorize('guardian', 'admin'), async (req, res) => {
  try {
    const { permissions } = req.body;
    const guardian = await Guardian.findOne({ user: req.user.id });

    if (!guardian) {
      return res.status(404).json({ error: 'Guardian profile not found' });
    }

    if (!permissions || typeof permissions !== 'object' || Array.isArray(permissions)) {
      return res.status(400).json({ error: 'Permissions object is required' });
    }

    const allowedPermissionKeys = new Set([
      'viewProgress',
      'viewGrades',
      'viewAttendance',
      'receiveNotifications',
      'approveEnrollments',
    ]);
    const normalizedPermissions = {};

    for (const [key, value] of Object.entries(permissions)) {
      if (!allowedPermissionKeys.has(key) || typeof value !== 'boolean') {
        return res.status(400).json({ error: 'Invalid guardian permission value' });
      }
      normalizedPermissions[key] = value;
    }

    if (!Object.keys(normalizedPermissions).length) {
      return res.status(400).json({ error: 'At least one permission is required' });
    }

    await guardian.updatePermissions(req.params.studentId, normalizedPermissions);

    res.json(guardian);
  } catch (error) {
    console.error('Update permissions error:', error);
    res.status(400).json({ error: error.message });
  }
});

// @route   GET /api/guardians/child/:studentId/progress
// @desc    Get child's progress
// @access  Private (Guardian)
router.get('/child/:studentId/progress', protect, authorize('guardian', 'admin'), async (req, res) => {
  try {
    const guardian = await Guardian.findOne({ user: req.user.id });

    if (!guardian) {
      return res.status(404).json({ error: 'Guardian profile not found' });
    }

    if (!hasChildPermission(guardian, req.params.studentId, 'viewProgress')) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const progress = await Progress.find({ student: req.params.studentId })
      .populate('course', 'title image slug')
      .populate({
        path: 'lessonProgress.lesson',
        select: 'title type order'
      })
      .sort({ lastUpdated: -1 });

    res.json(progress);
  } catch (error) {
    console.error('Get child progress error:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// @route   GET /api/guardians/child/:studentId/enrollments
// @desc    Get child's enrollments
// @access  Private (Guardian)
router.get('/child/:studentId/enrollments', protect, authorize('guardian', 'admin'), async (req, res) => {
  try {
    const guardian = await Guardian.findOne({ user: req.user.id });

    if (!guardian) {
      return res.status(404).json({ error: 'Guardian profile not found' });
    }

    if (!hasChildPermission(guardian, req.params.studentId, 'viewProgress')) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const enrollments = await Enrollment.find({ student: req.params.studentId })
      .populate({
        path: 'course',
        populate: { path: 'instructor', select: 'name' }
      })
      .sort({ enrolledAt: -1 });

    res.json(enrollments);
  } catch (error) {
    console.error('Get child enrollments error:', error);
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
});

// @route   GET /api/guardians/child/:studentId/achievements
// @desc    Get child's achievements
// @access  Private (Guardian)
router.get('/child/:studentId/achievements', protect, authorize('guardian', 'admin'), async (req, res) => {
  try {
    const guardian = await Guardian.findOne({ user: req.user.id });

    if (!guardian) {
      return res.status(404).json({ error: 'Guardian profile not found' });
    }

    if (!hasChildPermission(guardian, req.params.studentId, 'viewProgress')) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const progress = await Progress.find({ student: req.params.studentId })
      .populate('course', 'title');

    const achievements = progress.flatMap(p => 
      p.milestones.map(m => ({
        ...m.toObject(),
        course: p.course
      }))
    ).sort((a, b) => b.achievedAt - a.achievedAt);

    res.json(achievements);
  } catch (error) {
    console.error('Get child achievements error:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// @route   POST /api/guardians/report/:studentId
// @desc    Generate a report for a child
// @access  Private (Guardian)
router.post('/report/:studentId', protect, authorize('guardian', 'admin'), async (req, res) => {
  try {
    const { type = 'weekly' } = req.body;
    const guardian = await Guardian.findOne({ user: req.user.id });

    if (!guardian) {
      return res.status(404).json({ error: 'Guardian profile not found' });
    }

    const access = findChildAccess(guardian, req.params.studentId);
    if (!access?.permissions.viewProgress) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    await guardian.generateReport(req.params.studentId, type);

    const latestReport = guardian.reports[guardian.reports.length - 1];
    res.status(201).json(filterReportForPermissions(latestReport, access.permissions));
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(400).json({ error: error.message });
  }
});

// @route   GET /api/guardians/reports
// @desc    Get all reports for guardian's children
// @access  Private (Guardian)
router.get('/reports', protect, authorize('guardian', 'admin'), async (req, res) => {
  try {
    const guardian = await Guardian.findOne({ user: req.user.id })
      .populate('reports.childId', 'name');

    if (!guardian) {
      return res.status(404).json({ error: 'Guardian profile not found' });
    }

    const visibleReports = guardian.reports
      .map((report) => {
        const childId = report.childId?._id || report.childId;
        const access = findChildAccess(guardian, childId);
        if (!access) return null;

        const hasAnyReportPermission =
          access.permissions.viewProgress ||
          access.permissions.viewGrades ||
          access.permissions.viewAttendance;

        return hasAnyReportPermission
          ? filterReportForPermissions(report, access.permissions)
          : null;
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));

    res.json(visibleReports);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// @route   PUT /api/guardians/settings
// @desc    Update guardian settings
// @access  Private (Guardian)
router.put('/settings', protect, authorize('guardian', 'admin'), async (req, res) => {
  try {
    const { notificationPreferences, settings } = req.body;
    
    let guardian = await Guardian.findOne({ user: req.user.id });

    if (!guardian) {
      guardian = new Guardian({
        user: req.user.id,
        children: []
      });
    }

    if (notificationPreferences) {
      guardian.notificationPreferences = notificationPreferences;
    }

    if (settings) {
      guardian.settings = { ...guardian.settings, ...settings };
    }

    await guardian.save();

    res.json(guardian);
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(400).json({ error: error.message });
  }
});

// @route   GET /api/guardians/child/:studentId/weekly-summary
router.get('/child/:studentId/weekly-summary', protect, authorize('guardian', 'admin'), async (req, res) => {
  try {
    const guardian = await Guardian.findOne({ user: req.user.id });
    if (!guardian) return res.status(404).json({ error: 'Guardian profile not found' });

    const access = findChildAccess(guardian, req.params.studentId);
    if (!access || (!access.permissions.viewProgress && !access.permissions.viewAttendance)) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const studentId = req.params.studentId;

    const [completed, missed, homeworkPending, homeworkDone, recentSessions] = await Promise.all([
      access.permissions.viewAttendance
        ? Session.countDocuments({ student: studentId, status: 'completed', updatedAt: { $gte: weekAgo } })
        : Promise.resolve(null),
      access.permissions.viewAttendance
        ? Session.countDocuments({ student: studentId, status: { $in: ['no-show', 'cancelled'] }, updatedAt: { $gte: weekAgo } })
        : Promise.resolve(null),
      access.permissions.viewProgress
        ? TeacherTask.countDocuments({ student: studentId, status: 'pending' })
        : Promise.resolve(null),
      access.permissions.viewProgress
        ? TeacherTask.countDocuments({ student: studentId, status: { $in: ['submitted', 'done'] }, updatedAt: { $gte: weekAgo } })
        : Promise.resolve(null),
      access.permissions.viewAttendance
        ? Session.find({ student: studentId, status: 'completed', updatedAt: { $gte: weekAgo } })
            .populate({ path: 'teacher', populate: { path: 'user', select: 'name' } })
            .sort({ scheduledAt: -1 })
            .limit(10)
        : Promise.resolve([]),
    ]);

    res.json({
      week: {
        completed,
        missed,
        homeworkPending,
        homeworkDone,
      },
      recentSessions,
      permissions: access.permissions,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/guardians/dashboard
// @desc    Get guardian dashboard overview
// @access  Private (Guardian)
router.get('/dashboard', protect, authorize('guardian', 'admin'), async (req, res) => {
  try {
    const guardian = await Guardian.findOne({ user: req.user.id })
      .populate({
        path: 'children.student',
        select: 'name email avatar'
      });

    if (!guardian) {
      return res.status(404).json({ error: 'Guardian profile not found' });
    }

    const childrenData = await Promise.all(
      guardian.children.map(async (child) => {
        const studentId = child.student?._id || child.student;
        const access = findChildAccess(guardian, studentId);
        const canViewProgress = Boolean(access?.permissions.viewProgress);

        const progress = canViewProgress
          ? await Progress.find({ student: studentId }).populate('course', 'title')
          : [];

        const enrollments = canViewProgress
          ? await Enrollment.find({ student: studentId, status: 'active' }).countDocuments()
          : null;

        const totalProgress = progress.reduce((sum, p) => sum + p.overallProgress.percentage, 0);
        const avgProgress = progress.length > 0 ? totalProgress / progress.length : 0;

        const recentAchievements = canViewProgress
          ? progress.flatMap(p => p.milestones)
              .sort((a, b) => b.achievedAt - a.achievedAt)
              .slice(0, 5)
          : [];

        return {
          student: child.student,
          relationship: child.relationship,
          permissions: access?.permissions || null,
          stats: canViewProgress ? {
            enrolledCourses: enrollments,
            averageProgress: avgProgress,
            totalAchievements: progress.reduce((sum, p) => sum + p.milestones.length, 0),
            currentStreak: Math.max(...progress.map(p => p.streak.current), 0)
          } : null,
          recentAchievements
        };
      })
    );

    res.json({
      children: childrenData,
      totalChildren: guardian.children.length,
      notificationPreferences: guardian.notificationPreferences
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

module.exports = router;