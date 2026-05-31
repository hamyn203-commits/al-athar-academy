const express = require('express');
const router = express.Router();
const { Assignment, AssignmentSubmission } = require('../models/Assignment');
const Enrollment = require('../models/Enrollment');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/assignments');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|mp3|mp4|wav|ogg|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  }
});

// @route   GET /api/assignments
// @desc    Get all assignments for a course
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { courseId, status = 'published' } = req.query;

    const filter = { status };
    if (courseId) filter.course = courseId;

    const assignments = await Assignment.find(filter)
      .populate('instructor', 'name')
      .sort({ dueDate: 1 });

    res.json(assignments);
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// @route   GET /api/assignments/:id
// @desc    Get a single assignment
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('instructor', 'name')
      .populate('course', 'title');

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json(assignment);
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ error: 'Failed to fetch assignment' });
  }
});

// @route   POST /api/assignments
// @desc    Create a new assignment
// @access  Private (Teacher/Admin)
router.post('/', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const assignmentData = {
      ...req.body,
      instructor: req.user.role === 'teacher' ? req.user.teacherProfile : req.body.instructor
    };

    const assignment = new Assignment(assignmentData);
    await assignment.save();

    res.status(201).json(assignment);
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(400).json({ error: error.message });
  }
});

// @route   PUT /api/assignments/:id
// @desc    Update an assignment
// @access  Private (Teacher/Admin)
router.put('/:id', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    if (req.user.role === 'teacher' && assignment.instructor.toString() !== req.user.teacherProfile.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    Object.assign(assignment, req.body);
    await assignment.save();

    res.json(assignment);
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(400).json({ error: error.message });
  }
});

// @route   DELETE /api/assignments/:id
// @desc    Delete an assignment
// @access  Private (Teacher/Admin)
router.delete('/:id', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    if (req.user.role === 'teacher' && assignment.instructor.toString() !== req.user.teacherProfile.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await assignment.deleteOne();

    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
});

// @route   POST /api/assignments/:id/submit
// @desc    Submit an assignment
// @access  Private (Student)
router.post('/:id/submit', protect, upload.single('file'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: assignment.course,
      status: 'active'
    });

    if (!enrollment) {
      return res.status(403).json({ error: 'Not enrolled in this course' });
    }

    const existingSubmission = await AssignmentSubmission.findOne({
      assignment: req.params.id,
      student: req.user.id
    });

    if (existingSubmission) {
      return res.status(400).json({ error: 'Assignment already submitted' });
    }

    const submissionData = {
      assignment: req.params.id,
      student: req.user.id,
      enrollment: enrollment._id,
      submissionType: req.body.submissionType || 'text',
      content: {}
    };

    if (req.file) {
      submissionData.content.file = {
        name: req.file.originalname,
        url: req.file.path,
        type: req.file.mimetype,
        size: req.file.size
      };
      submissionData.submissionType = 'file';
    } else if (req.body.text) {
      submissionData.content.text = req.body.text;
    } else if (req.body.url) {
      submissionData.content.url = req.body.url;
    }

    const submission = new AssignmentSubmission(submissionData);
    await submission.save();

    assignment.stats.submissions += 1;
    await assignment.save();

    res.status(201).json(submission);
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(400).json({ error: error.message });
  }
});

// @route   GET /api/assignments/:id/submissions
// @desc    Get all submissions for an assignment
// @access  Private (Teacher/Admin)
router.get('/:id/submissions', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const submissions = await AssignmentSubmission.find({ assignment: req.params.id })
      .populate('student', 'name email')
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// @route   PUT /api/assignments/submissions/:submissionId/grade
// @desc    Grade a submission
// @access  Private (Teacher/Admin)
router.put('/submissions/:submissionId/grade', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { score, feedback } = req.body;
    const submission = await AssignmentSubmission.findById(req.params.submissionId)
      .populate('assignment');

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    submission.grade = {
      score,
      maxScore: submission.assignment.points,
      percentage: (score / submission.assignment.points) * 100,
      feedback,
      gradedBy: req.user.role === 'teacher' ? req.user.teacherProfile : req.body.gradedBy,
      gradedAt: new Date()
    };
    submission.status = 'graded';
    await submission.save();

    const assignment = await Assignment.findById(submission.assignment._id);
    const allSubmissions = await AssignmentSubmission.find({ 
      assignment: assignment._id, 
      status: 'graded' 
    });
    
    const totalScore = allSubmissions.reduce((sum, sub) => sum + (sub.grade.percentage || 0), 0);
    assignment.stats.averageScore = totalScore / allSubmissions.length;
    assignment.stats.graded = allSubmissions.length;
    await assignment.save();

    res.json(submission);
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(400).json({ error: error.message });
  }
});

// @route   GET /api/assignments/my-submissions
// @desc    Get all submissions for the current user
// @access  Private
router.get('/my-submissions', protect, async (req, res) => {
  try {
    const submissions = await AssignmentSubmission.find({ student: req.user.id })
      .populate({
        path: 'assignment',
        populate: { path: 'course', select: 'title' }
      })
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    console.error('Get my submissions error:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

module.exports = router;
