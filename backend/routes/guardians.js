const express = require('express');
const router = express.Router();
const Guardian = require('../models/Guardian');
const User = require('../models/User');
const Progress = require('../models/Progress');
const Enrollment = require('../models/Enrollment');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/guardians/my-children
// @desc    Get all children for the current guardian
// @access  Private (Guardian)
router.get('/my-children', protect, async (req, res) => {
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
router.post('/add-child', protect, async (req, res) => {
  try {
    const { studentId, relationship, permissions } = req.body;

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ error: 'Student not found' });
    }

    let guardian = await Guardian.findOne({ user: req.user.id });

    if (!guardian) {
      guardian = new Guardian({
        user: req.user.id,
        children: []
      });
    }

    await guardian.addChild(studentId, relationship, permissions);

    res.status(201).json(guardian);
  } catch (error) {
    console.error('Add child error:', error);
    res.status(400).json({ error: error.message });
  }
});

// @route   DELETE /api/guardians/remove-child/:studentId
// @desc    Remove a child from guardian
// @access  Private (Guardian)
router.delete('/remove-child/:studentId', protect, async (req, res) => {
  try {
    const guardian = await Guardian.findOne({ user: req.user.id });

    if (!guardian) {
      return res.status(404).json({ error: 'Guardian profile not found' });
    }

    await guardian.removeChild(req.params.studentId);

    res.json({ message: 'Child removed successfully' });
  } catch (error) {
    console.error('Remove child error:', error);
    res.status(400).json({ error: error.message });
  }
});

// @route   PUT /api/guardians/permissions/:studentId
// @desc    Update permissions for a child
// @access  Private (Guardian)
router.put('/permissions/:studentId', protect, async (req, res) => {
  try {
    const { permissions } = req.body;
    const guardian = await Guardian.findOne({ user: req.user.id });

    if (!guardian) {
      return res.status(404).json({ error: 'Guardian profile not found' });
    }

    await guardian.updatePermissions(req.params.studentId, permissions);

    res.json(guardian);
  } catch (error) {
    console.error('Update permissions error:', error);
    res.status(400).json({ error: error.message });
  }
});

// @route   GET /api/guardians/child/:studentId/progress
// @desc    Get child's progress
// @access  Private (Guardian)
router.get('/child/:studentId/progress', protect, async (req, res) => {
  try {
    const guardian = await Guardian.findOne({ user: req.user.id });

    if (!guardian) {
      return res.status(404).json({ error: 'Guardian profile not found' });
    }

    if (!guardian.hasPermission(req.params.studentId, 'viewProgress')) {
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
router.get('/child/:studentId/enrollments', protect, async (req, res) => {
  try {
    const guardian = await Guardian.findOne({ user: req.user.id });

    if (!guardian) {
      return res.status(404).json({ error: 'Guardian profile not found' });
    }

    if (!guardian.hasPermission(req.params.studentId, 'viewProgress')) {
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
router.get('/child/:studentId/achievements', protect, async (req, res) => {
  try {
    const guardian = await Guardian.findOne({ user: req.user.id });

    if (!guardian) {
      return res.status(404).json({ error: 'Guardian profile not found' });
    }

    if (!guardian.hasPermission(req.params.studentId, 'viewProgress')) {
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
router.post('/report/:studentId', protect, async (req, res) => {
  try {
    const { type = 'weekly' } = req.body;
    const guardian = await Guardian.findOne({ user: req.user.id });

    if (!guardian) {
      return res.status(404).json({ error: 'Guardian profile not found' });
    }

    if (!guardian.hasPermission(req.params.studentId, 'viewProgress')) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    await guardian.generateReport(req.params.studentId, type);

    const latestReport = guardian.reports[guardian.reports.length - 1];

    res.status(201).json(latestReport);
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(400).json({ error: error.message });
  }
});

// @route   GET /api/guardians/reports
// @desc    Get all reports for guardian's children
// @access  Private (Guardian)
router.get('/reports', protect, async (req, res) => {
  try {
    const guardian = await Guardian.findOne({ user: req.user.id })
      .populate('reports.childId', 'name');

    if (!guardian) {
      return res.status(404).json({ error: 'Guardian profile not found' });
    }

    res.json(guardian.reports.sort((a, b) => b.generatedAt - a.generatedAt));
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// @route   PUT /api/guardians/settings
// @desc    Update guardian settings
// @access  Private (Guardian)
router.put('/settings', protect, async (req, res) => {
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

// @route   GET /api/guardians/dashboard
// @desc    Get guardian dashboard overview
// @access  Private (Guardian)
router.get('/dashboard', protect, async (req, res) => {
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
        const progress = await Progress.find({ student: child.student._id })
          .populate('course', 'title');

        const enrollments = await Enrollment.find({ 
          student: child.student._id, 
          status: 'active' 
        }).countDocuments();

        const totalProgress = progress.reduce((sum, p) => sum + p.overallProgress.percentage, 0);
        const avgProgress = progress.length > 0 ? totalProgress / progress.length : 0;

        const recentAchievements = progress.flatMap(p => p.milestones)
          .sort((a, b) => b.achievedAt - a.achievedAt)
          .slice(0, 5);

        return {
          student: child.student,
          relationship: child.relationship,
          stats: {
            enrolledCourses: enrollments,
            averageProgress: avgProgress,
            totalAchievements: progress.reduce((sum, p) => sum + p.milestones.length, 0),
            currentStreak: Math.max(...progress.map(p => p.streak.current), 0)
          },
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
