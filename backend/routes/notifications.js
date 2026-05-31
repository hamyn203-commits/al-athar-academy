const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/notifications
// @desc    Get user's notifications
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { 
      limit = 20, 
      unreadOnly = false, 
      type,
      page = 1 
    } = req.query;

    const filter = { user: req.user.id };
    
    if (unreadOnly === 'true') {
      filter.isRead = false;
    }
    
    if (type) {
      filter.type = type;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .populate('data.course', 'title slug')
        .populate('data.lesson', 'title')
        .populate('data.assignment', 'title')
        .populate('data.quiz', 'title')
        .populate('data.badge', 'name icon')
        .populate('data.certificate', 'certificateId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Notification.countDocuments(filter)
    ]);

    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      isRead: false
    });

    res.json({
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// @route   GET /api/notifications/unread-count
// @desc    Get unread notifications count
// @access  Private
router.get('/unread-count', protect, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user.id,
      isRead: false
    });

    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to fetch count' });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await notification.markAsRead();

    res.json(notification);
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(400).json({ error: error.message });
  }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(400).json({ error: error.message });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(400).json({ error: error.message });
  }
});

// @route   DELETE /api/notifications/clear-all
// @desc    Delete all notifications
// @access  Private
router.delete('/clear-all', protect, async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user.id });

    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    console.error('Clear all error:', error);
    res.status(400).json({ error: error.message });
  }
});

// @route   PUT /api/notifications/preferences
// @desc    Update notification preferences
// @access  Private
router.put('/preferences', protect, async (req, res) => {
  try {
    const { preferences } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.notificationPreferences = {
      ...user.notificationPreferences,
      ...preferences
    };

    await user.save();

    res.json(user.notificationPreferences);
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(400).json({ error: error.message });
  }
});

// @route   GET /api/notifications/preferences
// @desc    Get notification preferences
// @access  Private
router.get('/preferences', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.notificationPreferences || {});
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// @route   POST /api/notifications/push-token
// @desc    Register push notification token
// @access  Private
router.post('/push-token', protect, async (req, res) => {
  try {
    const { token, platform } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.pushToken = token;
    user.pushPlatform = platform;
    await user.save();

    res.json({ message: 'Push token registered' });
  } catch (error) {
    console.error('Register push token error:', error);
    res.status(400).json({ error: error.message });
  }
});

// @route   POST /api/notifications/telegram-id
// @desc    Register Telegram ID
// @access  Private
router.post('/telegram-id', protect, async (req, res) => {
  try {
    const { telegramId } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.telegramId = telegramId;
    await user.save();

    res.json({ message: 'Telegram ID registered' });
  } catch (error) {
    console.error('Register telegram ID error:', error);
    res.status(400).json({ error: error.message });
  }
});

// @route   POST /api/notifications/send
// @desc    Send notification (Admin/Teacher)
// @access  Private (Admin/Teacher)
router.post('/send', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { userIds, notification } = req.body;

    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ error: 'userIds must be an array' });
    }

    const notifications = await Notification.sendBulk(userIds, notification);

    res.status(201).json({
      message: `Sent ${notifications.length} notifications`,
      notifications
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(400).json({ error: error.message });
  }
});

// @route   POST /api/notifications/send-all
// @desc    Send notification to all users (Admin only)
// @access  Private (Admin)
router.post('/send-all', protect, authorize('admin'), async (req, res) => {
  try {
    const { notification, filter = {} } = req.body;

    const users = await User.find(filter).select('_id');
    const userIds = users.map(u => u._id);

    const notifications = await Notification.sendBulk(userIds, notification);

    res.status(201).json({
      message: `Sent ${notifications.length} notifications`,
      count: notifications.length
    });
  } catch (error) {
    console.error('Send all error:', error);
    res.status(400).json({ error: error.message });
  }
});

// @route   GET /api/notifications/stats
// @desc    Get notification statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const total = await Notification.countDocuments({ user: req.user.id });
    const unread = await Notification.countDocuments({ 
      user: req.user.id, 
      isRead: false 
    });
    const read = total - unread;

    const byType = await Notification.aggregate([
      { $match: { user: req.user.id } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const recent = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      total,
      unread,
      read,
      byType: byType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      recent
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
