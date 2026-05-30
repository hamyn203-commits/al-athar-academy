const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const Teacher = require('../models/Teacher');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, authorize('teacher'), async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id });
    
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher profile not found' });
    }

    const totalSessions = await Session.countDocuments({ teacher: teacher._id });
    const completedSessions = await Session.countDocuments({ 
      teacher: teacher._id, 
      status: 'completed' 
    });

    const totalHours = Math.round(teacher.stats.totalHours);
    const totalEarnings = teacher.earnings.totalEarned + teacher.earnings.withdrawnEarnings;

    res.json({
      totalStudents: teacher.stats.totalStudents,
      totalSessions: completedSessions,
      totalHours,
      pendingEarnings: teacher.earnings.pendingEarnings,
      totalEarnings,
      averageRating: teacher.rating.average
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/students', protect, authorize('teacher'), async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id });
    
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher profile not found' });
    }

    const sessions = await Session.find({ 
      teacher: teacher._id, 
      status: 'completed' 
    }).populate('student', 'name email avatar');

    const studentMap = {};
    sessions.forEach(session => {
      const studentId = session.student._id.toString();
      if (!studentMap[studentId]) {
        studentMap[studentId] = {
          _id: session.student._id,
          name: session.student.name,
          email: session.student.email,
          avatar: session.student.avatar,
          sessionCount: 0
        };
      }
      studentMap[studentId].sessionCount++;
    });

    const students = Object.values(studentMap);
    res.json({ students });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;