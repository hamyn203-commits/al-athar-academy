const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Session = require('../models/Session');
const Teacher = require('../models/Teacher');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('student'), async (req, res) => {
  try {
    const { teacherId, sessionId, rating, comment, categories, isAnonymous } = req.body;

    const session = await Session.findOne({
      _id: sessionId,
      student: req.user.id,
      status: 'completed'
    });

    if (!session) {
      return res.status(404).json({ error: 'Completed session not found' });
    }

    const existingReview = await Review.findOne({
      student: req.user.id,
      session: sessionId
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You already reviewed this session' });
    }

    const review = await Review.create({
      student: req.user.id,
      teacher: teacherId,
      session: sessionId,
      rating,
      comment,
      categories,
      isAnonymous: isAnonymous || false
    });

    await Review.updateTeacherRating(teacherId);

    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      Review.find({ teacher: req.params.teacherId, isApproved: true })
        .populate('student', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments({ teacher: req.params.teacherId, isApproved: true })
    ]);

    const formattedReviews = reviews.map(review => {
      const obj = review.toObject();
      if (obj.isAnonymous) {
        obj.student = { name: 'طالب مجهول', avatar: '' };
      }
      return obj;
    });

    res.json({
      reviews: formattedReviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved: req.body.isApproved },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    await Review.updateTeacherRating(review.teacher);

    res.json({ success: true, review });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;