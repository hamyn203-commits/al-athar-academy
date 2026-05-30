const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/homework');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp3|wav|ogg|m4a/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    if (extname) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

router.get('/student', protect, authorize('student'), async (req, res) => {
  try {
    const sessions = await Session.find({
      student: req.user.id,
      status: 'completed',
      'teacherEvaluation.assignedHomework.0': { $exists: true }
    }).select('teacherEvaluation.assignedHomework');

    const homework = [];
    sessions.forEach(session => {
      if (session.teacherEvaluation && session.teacherEvaluation.assignedHomework) {
        session.teacherEvaluation.assignedHomework.forEach((hw, index) => {
          homework.push({
            _id: `${session._id}-${index}`,
            sessionId: session._id,
            title: hw.type === 'memorization' ? 'حفظ' : 
                   hw.type === 'review' ? 'مراجعة' :
                   hw.type === 'audio' ? 'تسجيل صوتي' : 'اختبار',
            description: hw.description,
            dueDate: hw.dueDate,
            status: 'pending'
          });
        });
      }
    });

    res.json({ homework });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:homeworkId/submit', protect, authorize('student'), upload.single('submission'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an audio file' });
    }

    res.json({ 
      success: true, 
      message: 'Homework submitted successfully',
      file: req.file.path 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;