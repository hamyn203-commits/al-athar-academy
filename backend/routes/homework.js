const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const HomeworkSubmission = require('../models/HomeworkSubmission');
const TeacherTask = require('../models/TeacherTask');
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
      'teacherEvaluation.assignedHomework.0': { $exists: true },
    }).select('teacherEvaluation.assignedHomework');

    const homework = [];
    sessions.forEach((session) => {
      if (session.teacherEvaluation?.assignedHomework) {
        session.teacherEvaluation.assignedHomework.forEach((hw, index) => {
          homework.push({
            _id: `${session._id}-${index}`,
            sessionId: session._id,
            title: hw.type === 'memorization' ? 'حفظ' :
              hw.type === 'review-recent' ? 'مراجعة قريبة' :
              hw.type === 'review-far' ? 'مراجعة بعيدة' :
              hw.type === 'review' ? 'مراجعة' :
              hw.type === 'audio' ? 'تسجيل صوتي' : 'اختبار',
            description: hw.description,
            dueDate: hw.dueDate,
            status: 'pending',
          });
        });
      }
    });

    const tasks = await TeacherTask.find({ student: req.user.id }).sort({ createdAt: -1 });
    tasks.forEach((t) => {
      homework.push({
        _id: t._id,
        sessionId: t.session,
        title: t.title,
        description: t.description,
        dueDate: t.dueDate,
        status: t.status,
        type: t.type,
      });
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

    const submission = await HomeworkSubmission.create({
      homeworkId: req.params.homeworkId,
      sessionId: req.body.sessionId,
      student: req.user.id,
      filePath: req.file.path,
      fileName: req.file.originalname,
      fileSize: req.file.size
    });

    res.json({ 
      success: true, 
      message: 'Homework submitted successfully',
      submission
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;