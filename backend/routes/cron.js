const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { connectDB } = require('../config/database');
const { checkUpcomingSessions } = require('../services/scheduler');

function safeEqual(a, b) {
  const left = Buffer.from(String(a || ''));
  const right = Buffer.from(String(b || ''));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

router.get('/reminders', async (req, res) => {
  const secret = process.env.CRON_SECRET;
  const supplied = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');

  if (!secret || !safeEqual(secret, supplied)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const connected = await connectDB();
    if (!connected) return res.status(503).json({ error: 'Database unavailable' });

    await checkUpcomingSessions();
    return res.json({ success: true, ranAt: new Date().toISOString() });
  } catch (error) {
    console.error('Reminder cron failed:', error.message);
    return res.status(500).json({ error: 'Reminder job failed' });
  }
});

module.exports = router;
