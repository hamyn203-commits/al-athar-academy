const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const JobApplication = require('../models/JobApplication');
const VideoAsset = require('../models/VideoAsset');
const Referral = require('../models/Referral');
const { protect, authorize } = require('../middleware/auth');

router.get('/summary', protect, authorize('admin'), async (_req, res) => {
  try {
    const [donations, applications, videos, referrals] = await Promise.all([
      Donation.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$amount' } } },
      ]),
      JobApplication.countDocuments({ status: 'new' }),
      VideoAsset.countDocuments({ isPublished: true }),
      Referral.countDocuments(),
    ]);
    res.json({
      donations: donations.reduce((a, d) => ({ ...a, [d._id]: { count: d.count, total: d.total } }), {}),
      newApplications: applications,
      publishedVideos: videos,
      totalReferrals: referrals,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
