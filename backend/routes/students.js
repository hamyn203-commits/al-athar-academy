const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const mongoose = require('mongoose');
const Teacher = require('../models/Teacher');
const Session = require('../models/Session');
const { protect, authorize } = require('../middleware/auth');

const isDBConnected = () => mongoose.connection.readyState === 1;

router.get('/', protect, authorize('admin', 'supervisor'), async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.json([]);
    }
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    
    const studentUserId = student.user ? String(student.user) : null;
    let allowed = req.user.role === 'admin' || req.user.role === 'supervisor';

    if (req.user.role === 'student') {
      allowed = studentUserId === String(req.user.id);
    } else if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user.id }).select('_id');
      if (teacher && studentUserId) {
        allowed = Boolean(await Session.exists({
          teacher: teacher._id,
          student: studentUserId,
          status: { $in: ['accepted', 'completed'] }
        }));
      }
    }

    if (!allowed) {
      return res.status(403).json({ error: 'غير مصرح بالوصول إلى بيانات هذا الطالب' });
    }

    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, authorize('admin'), async (req, res) => {
  const student = new Student(req.body);
  try {
    const newStudent = await student.save();
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch('/:id', protect, async (req, res) => {
  try {
    const existingStudent = await Student.findById(req.params.id);
    if (!existingStudent) return res.status(404).json({ message: 'Student not found' });

    // Only admin or the student themselves can update (and students cannot modify administrative fields)
    if (req.user.role !== 'admin' && (!existingStudent.user || existingStudent.user.toString() !== req.user.id)) {
      return res.status(403).json({ error: 'غير مصرح بتعديل بيانات هذا الطالب' });
    }

    // If student updating themselves, prevent elevating points or changing plan unilaterally
    let updates = { ...req.body };
    if (req.user.role === 'student') {
      const allowedSelfFields = ['dailyHabits'];
      updates = Object.fromEntries(
        Object.entries(updates).filter(([key]) => allowedSelfFields.includes(key))
      );
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    res.json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
