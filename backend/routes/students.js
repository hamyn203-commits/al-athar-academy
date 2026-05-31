const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const mongoose = require('mongoose');
const { protect, authorize } = require('../middleware/auth');

const isDBConnected = () => mongoose.connection.readyState === 1;

const mockStudents = [
  {
    id: 1,
    name: 'أحمد محمد',
    plan: 'حفظ القرآن كاملاً',
    currentSurah: 'سورة البقرة',
    progress: 15,
    sheikh: 'الشيخ عبد الرحمن الشريف',
    lastGrade: 'جيد جداً',
    status: 'نشط',
    homework: 'حفظ الوجه الأول من سورة البقرة',
    points: 150,
    level: 'متعلم',
    streak: 5,
    dailyHabits: { adhkar: true, werd: true, murajaah: false },
    activityData: [
      { name: 'السبت', points: 20 },
      { name: 'الأحد', points: 30 },
      { name: 'الإثنين', points: 25 },
      { name: 'الثلاثاء', points: 40 },
      { name: 'الأربعاء', points: 35 },
      { name: 'الخميس', points: 0 },
      { name: 'الجمعة', points: 0 }
    ]
  }
];

router.get('/', async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.json(mockStudents);
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
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!student) return res.status(404).json({ message: 'Student not found' });
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
