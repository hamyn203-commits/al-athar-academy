const express = require('express');
const router = express.Router();
const { Quiz, QuizAttempt } = require('../models/Quiz');
const Enrollment = require('../models/Enrollment');
const { protect, authorize, attachTeacherProfile } = require('../middleware/auth');

// @route   GET /api/quizzes
// @desc    Get all quizzes for a course
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { courseId, status = 'published' } = req.query;

    const filter = { status };
    if (courseId) filter.course = courseId;

    const quizzes = await Quiz.find(filter)
      .populate('instructor', 'name')
      .select('-questions.options.isCorrect -questions.correctAnswer')
      .sort({ createdAt: -1 });

    res.json(quizzes);
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

router.get('/my-attempts/list', protect, async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ student: req.user.id })
      .populate({ path: 'quiz', select: 'title type', populate: { path: 'course', select: 'title' } })
      .sort({ submittedAt: -1 });
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/quizzes/:id
// @desc    Get a single quiz
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('instructor', 'name')
      .populate('course', 'title');

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    if (req.user.role === 'student') {
      quiz.questions = quiz.questions.map((q) => {
        const question = q.toObject();
        delete question.correctAnswer;
        if (question.options) {
          question.options = question.options.map((opt) => ({
            _id: opt._id,
            text: opt.text,
          }));
        }
        return question;
      });
    }

    res.json(quiz);
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

// @route   POST /api/quizzes
// @desc    Create a new quiz
// @access  Private (Teacher/Admin)
router.post('/', protect, attachTeacherProfile, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const quizData = {
      ...req.body,
      instructor: req.user.role === 'teacher' ? req.user.teacherProfile : req.body.instructor
    };

    const quiz = new Quiz(quizData);
    await quiz.save();

    res.status(201).json(quiz);
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(400).json({ error: error.message });
  }
});

// @route   PUT /api/quizzes/:id
// @desc    Update a quiz
// @access  Private (Teacher/Admin)
router.put('/:id', protect, attachTeacherProfile, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    if (req.user.role === 'teacher' && quiz.instructor.toString() !== req.user.teacherProfile.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    Object.assign(quiz, req.body);
    await quiz.save();

    res.json(quiz);
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(400).json({ error: error.message });
  }
});

// @route   DELETE /api/quizzes/:id
// @desc    Delete a quiz
// @access  Private (Teacher/Admin)
router.delete('/:id', protect, attachTeacherProfile, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    if (req.user.role === 'teacher' && quiz.instructor.toString() !== req.user.teacherProfile.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await quiz.deleteOne();

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
});

// @route   POST /api/quizzes/:id/start
// @desc    Start a quiz attempt
// @access  Private (Student)
router.post('/:id/start', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    if (!quiz.isAvailableNow()) {
      return res.status(400).json({ error: 'Quiz is not available' });
    }

    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: quiz.course,
      status: 'active'
    });

    if (!enrollment) {
      return res.status(403).json({ error: 'Not enrolled in this course' });
    }

    const previousAttempts = await QuizAttempt.countDocuments({
      quiz: req.params.id,
      student: req.user.id
    });

    if (previousAttempts >= quiz.settings.maxAttempts) {
      return res.status(400).json({ error: 'Maximum attempts reached' });
    }

    const attempt = new QuizAttempt({
      quiz: req.params.id,
      student: req.user.id,
      enrollment: enrollment._id,
      attemptNumber: previousAttempts + 1,
      answers: quiz.questions.map(q => ({
        question: q._id,
        answer: null,
        isCorrect: false,
        points: q.points
      }))
    });

    await attempt.save();

    quiz.stats.attempts += 1;
    await quiz.save();

    res.status(201).json(attempt);
  } catch (error) {
    console.error('Start quiz error:', error);
    res.status(400).json({ error: error.message });
  }
});

// @route   PUT /api/quizzes/attempts/:attemptId/answer
// @desc    Submit an answer for a question
// @access  Private (Student)
router.put('/attempts/:attemptId/answer', protect, async (req, res) => {
  try {
    const { questionId, answer } = req.body;
    const attempt = await QuizAttempt.findById(req.params.attemptId)
      .populate('quiz');

    if (!attempt) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    if (attempt.student.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (attempt.status !== 'in-progress') {
      return res.status(400).json({ error: 'Attempt already submitted' });
    }

    const question = attempt.quiz.questions.id(questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const answerIndex = attempt.answers.findIndex(a => a.question.toString() === questionId);
    if (answerIndex === -1) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    attempt.answers[answerIndex].answer = answer;
    await attempt.save();

    res.json(attempt);
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(400).json({ error: error.message });
  }
});

// @route   POST /api/quizzes/attempts/:attemptId/submit
// @desc    Submit a quiz attempt
// @access  Private (Student)
router.post('/attempts/:attemptId/submit', protect, async (req, res) => {
  try {
    const attempt = await QuizAttempt.findById(req.params.attemptId)
      .populate('quiz');

    if (!attempt) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    if (attempt.student.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (attempt.status !== 'in-progress') {
      return res.status(400).json({ error: 'Attempt already submitted' });
    }

    attempt.answers.forEach(answer => {
      const question = attempt.quiz.questions.id(answer.question);
      if (question) {
        if (question.type === 'multiple-choice' || question.type === 'true-false') {
          const correctOption = question.options.find(opt => opt.isCorrect);
          if (correctOption) {
            const correctTexts = [
              correctOption.text?.en,
              correctOption.text?.ar,
              correctOption.text?.fr,
              correctOption.text?.es
            ].filter(Boolean).map(t => t.toLowerCase().trim());
            answer.isCorrect = correctTexts.includes((answer.answer || '').toLowerCase().trim());
          } else {
            answer.isCorrect = false;
          }
        } else if (question.type === 'short-answer' || question.type === 'fill-blank') {
          const expected = (question.correctAnswer || '').toLowerCase().trim();
          answer.isCorrect = expected && answer.answer?.toLowerCase().trim() === expected;
        } else if (question.type === 'essay') {
          answer.isCorrect = null;
        }
      }
    });

    attempt.calculateScore();
    attempt.checkPassing(attempt.quiz.settings.passingScore);
    attempt.status = 'graded';
    attempt.submittedAt = new Date();
    attempt.timeSpent = (attempt.submittedAt - attempt.startedAt) / 1000;
    await attempt.save();

    const quiz = await Quiz.findById(attempt.quiz._id);
    quiz.stats.completions += 1;
    
    const allAttempts = await QuizAttempt.find({ 
      quiz: quiz._id, 
      status: 'graded' 
    });
    
    const totalScore = allAttempts.reduce((sum, att) => sum + (att.score.percentage || 0), 0);
    quiz.stats.averageScore = totalScore / allAttempts.length;
    
    const passedAttempts = allAttempts.filter(att => att.isPassed).length;
    quiz.stats.passRate = (passedAttempts / allAttempts.length) * 100;
    
    await quiz.save();

    res.json(attempt);
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(400).json({ error: error.message });
  }
});

// @route   GET /api/quizzes/attempts/:attemptId
// @desc    Get a quiz attempt with results
// @access  Private
router.get('/attempts/:attemptId', protect, async (req, res) => {
  try {
    const attempt = await QuizAttempt.findById(req.params.attemptId)
      .populate({
        path: 'quiz',
        populate: { path: 'questions' }
      });

    if (!attempt) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    if (attempt.student.toString() !== req.user.id && req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json(attempt);
  } catch (error) {
    console.error('Get attempt error:', error);
    res.status(500).json({ error: 'Failed to fetch attempt' });
  }
});

// @route   GET /api/quizzes/:id/attempts
// @desc    Get all attempts for a quiz
// @access  Private (Teacher/Admin)
router.get('/:id/attempts', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ quiz: req.params.id })
      .populate('student', 'name email')
      .sort({ submittedAt: -1 });

    res.json(attempts);
  } catch (error) {
    console.error('Get attempts error:', error);
    res.status(500).json({ error: 'Failed to fetch attempts' });
  }
});

// @route   GET /api/quizzes/my-attempts
// @desc    Get all quiz attempts for the current user
// @access  Private
router.get('/my-attempts', protect, async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ student: req.user.id })
      .populate({
        path: 'quiz',
        select: 'title type',
        populate: { path: 'course', select: 'title' }
      })
      .sort({ submittedAt: -1 });

    res.json(attempts);
  } catch (error) {
    console.error('Get my attempts error:', error);
    res.status(500).json({ error: 'Failed to fetch attempts' });
  }
});

module.exports = router;
