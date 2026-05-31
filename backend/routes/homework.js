const express = require('express');
const mongoose = require('mongoose');
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

function parseSessionHomeworkId(homeworkId) {
  const match = String(homeworkId).match(/^([a-f0-9]{24})-(\d+)$/);
  if (!match) return null;
  return { sessionId: match[1], index: Number(match[2]) };
}

router.get('/student', protect, authorize('student'), async (req, res) => {
  try {
    const sessions = await Session.find({
      student: req.user.id,
      status: 'completed',
      'teacherEvaluation.assignedHomework.0': { $exists: true },
    }).select('teacherEvaluation.assignedHomework');

    const sessionHomeworkIds = [];
    const homework = [];

    sessions.forEach((session) => {
      if (session.teacherEvaluation?.assignedHomework) {
        session.teacherEvaluation.assignedHomework.forEach((hw, index) => {
          const id = `${session._id}-${index}`;
          sessionHomeworkIds.push(id);
          homework.push({
            _id: id,
            sessionId: session._id,
            title: hw.type === 'memorization' ? 'حفظ' :
              hw.type === 'review-recent' ? 'مراجعة قريبة' :
              hw.type === 'review-far' ? 'مراجعة بعيدة' :
              hw.type === 'review' ? 'مراجعة' :
              hw.type === 'audio' ? 'تسجيل صوتي' : 'اختبار',
            description: hw.description,
            dueDate: hw.dueDate,
            status: hw.status || 'pending',
            type: hw.type,
          });
        });
      }
    });

    if (sessionHomeworkIds.length) {
      const subs = await HomeworkSubmission.find({
        student: req.user.id,
        homeworkId: { $in: sessionHomeworkIds },
      }).select('homeworkId status');
      const subMap = Object.fromEntries(subs.map((s) => [s.homeworkId, s.status]));
      homework.forEach((hw) => {
        if (subMap[hw._id]) hw.status = subMap[hw._id] === 'submitted' ? 'submitted' : hw.status;
      });
    }

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

    const { homeworkId } = req.params;

    if (mongoose.Types.ObjectId.isValid(homeworkId)) {
      const task = await TeacherTask.findOneAndUpdate(
        { _id: homeworkId, student: req.user.id, status: { $in: ['pending', 'submitted'] } },
        { status: 'submitted', submissionFile: req.file.path },
        { new: true },
      );
      if (task) {
        return res.json({ success: true, message: 'تم تسليم الواجب', task });
      }
    }

    const parsed = parseSessionHomeworkId(homeworkId);
    if (parsed) {
      const session = await Session.findOne({ _id: parsed.sessionId, student: req.user.id });
      if (!session?.teacherEvaluation?.assignedHomework?.[parsed.index]) {
        return res.status(404).json({ error: 'Homework not found' });
      }

      const existing = await HomeworkSubmission.findOne({ homeworkId, student: req.user.id });
      if (existing) {
        return res.status(400).json({ error: 'تم تسليم هذا الواجب مسبقاً' });
      }

      const submission = await HomeworkSubmission.create({
        homeworkId,
        sessionId: parsed.sessionId,
        student: req.user.id,
        filePath: req.file.path,
        fileName: req.file.originalname,
        fileSize: req.file.size,
      });

      session.teacherEvaluation.assignedHomework[parsed.index].status = 'submitted';
      await session.save();

      return res.json({
        success: true,
        message: 'تم تسليم الواجب بنجاح',
        submission,
      });
    }

    const sessionId = req.body.sessionId;
    if (!sessionId || !mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ error: 'Invalid homework reference' });
    }

    const submission = await HomeworkSubmission.create({
      homeworkId,
      sessionId,
      student: req.user.id,
      filePath: req.file.path,
      fileName: req.file.originalname,
      fileSize: req.file.size,
    });

    res.json({
      success: true,
      message: 'Homework submitted successfully',
      submission,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
