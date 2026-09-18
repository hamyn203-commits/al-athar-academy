const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  circle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GroupCircle'
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  type: {
    type: String,
    enum: ['trial', 'regular', 'assessment', 'group_circle'],
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
  recordingUrl: String,
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
      dueDate: Date,
      status: { type: String, enum: ['pending', 'submitted', 'done'], default: 'pending' },
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
  },
  attendance: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['attended', 'absent', 'excused', 'pending'], default: 'pending' },
    excuseReason: String,
    excusedAt: Date,
    eligibleForCompensation: { type: Boolean, default: false }
  }],
  studentReports: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    memorizationScore: { type: Number, min: 0, max: 10 },
    tajweedScore: { type: Number, min: 0, max: 10 },
    surahRecited: String,
    fromAyah: Number,
    toAyah: Number,
    nextHomework: String,
    notes: String,
    sentToWhatsApp: { type: Boolean, default: false },
    sentAt: Date
  }],
  reminders: {
    dayBeforeSent: { type: Boolean, default: false },
    dayBeforeSentAt: Date,
    halfHourSent: { type: Boolean, default: false },
    halfHourSentAt: Date
  }
}, { timestamps: true });

SessionSchema.index({ student: 1, scheduledAt: -1 });
SessionSchema.index({ teacher: 1, scheduledAt: -1 });
SessionSchema.index({ status: 1, scheduledAt: 1 });
SessionSchema.index({ type: 1 });

module.exports = mongoose.model('Session', SessionSchema);