const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  type: {
    type: String,
    enum: ['trial', 'regular', 'assessment'],
    default: 'regular'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled', 'no-show'],
    default: 'pending'
  },
  scheduledAt: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    default: 60
  },
  timezone: {
    type: String,
    default: 'Africa/Cairo'
  },
  meetingLink: String,
  meetingProvider: { type: String, enum: ['jitsi', 'google_meet', 'zoom'], default: 'jitsi' },
  notes: String,
  studentFeedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    wouldContinue: Boolean
  },
  teacherEvaluation: {
    attendance: { type: Number, min: 1, max: 5 },
    memorization: { type: Number, min: 1, max: 5 },
    tajweed: { type: Number, min: 1, max: 5 },
    behavior: { type: Number, min: 1, max: 5 },
    commitment: { type: Number, min: 1, max: 5 },
    overallNotes: String,
    assignedHomework: [{
      type: { type: String, enum: ['memorization', 'review-recent', 'review-far', 'review', 'audio', 'test'] },
      description: String,
      dueDate: Date
    }]
  },
  earnings: {
    amount: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending' }
  },
  cancellationReason: String,
  rescheduledFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  }
}, { timestamps: true });

SessionSchema.index({ student: 1, scheduledAt: -1 });
SessionSchema.index({ teacher: 1, scheduledAt: -1 });
SessionSchema.index({ status: 1, scheduledAt: 1 });
SessionSchema.index({ type: 1 });

module.exports = mongoose.model('Session', SessionSchema);