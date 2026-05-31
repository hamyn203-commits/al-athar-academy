const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['session-request', 'session-accepted', 'session-rejected', 'session-completed', 'homework-assigned', 'homework-submitted', 'review-received', 'payment-received', 'system'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed
  },
  read: {
    type: Boolean,
    default: false
  },
  channels: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    inApp: { type: Boolean, default: true }
  }
}, { timestamps: true });

NotificationSchema.index({ user: 1, createdAt: -1 });
NotificationSchema.index({ user: 1, read: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);
