const mongoose = require('mongoose');
const { PAYMENT_STATUSES, SUPPORTED_CURRENCIES } = require('../utils/paymentIntegrity');

const PaymentSchema = new mongoose.Schema({
  kind: {
    type: String,
    enum: ['course_enrollment', 'donation'],
    required: true,
    index: true,
  },
  provider: {
    type: String,
    trim: true,
    lowercase: true,
    default: 'unassigned',
    maxlength: 64,
    index: true,
  },
  providerReference: {
    type: String,
    trim: true,
    maxlength: 256,
  },
  idempotencyKey: {
    type: String,
    trim: true,
    maxlength: 256,
    unique: true,
    sparse: true,
    index: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  },
  donation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
  },
  amountMinor: {
    type: Number,
    required: true,
    min: 1,
    validate: {
      validator: Number.isSafeInteger,
      message: 'Payment amountMinor must be a safe integer',
    },
  },
  currency: {
    type: String,
    enum: SUPPORTED_CURRENCIES,
    required: true,
    uppercase: true,
    trim: true,
  },
  status: {
    type: String,
    enum: PAYMENT_STATUSES,
    default: 'created',
    index: true,
  },
  settledAt: Date,
  failedAt: Date,
  cancelledAt: Date,
  refundedAt: Date,
  failureCode: {
    type: String,
    trim: true,
    maxlength: 128,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    select: false,
  },
}, { timestamps: true });

PaymentSchema.index(
  { provider: 1, providerReference: 1 },
  { unique: true, sparse: true }
);
PaymentSchema.index({ student: 1, course: 1, status: 1 });
PaymentSchema.index({ donation: 1, status: 1 });

PaymentSchema.pre('validate', function paymentRelationValidation(next) {
  if (this.kind === 'course_enrollment') {
    if (!this.student || !this.course) {
      return next(new Error('Course payments require student and course'));
    }
  }

  if (this.kind === 'donation' && !this.donation) {
    return next(new Error('Donation payments require a donation reference'));
  }

  return next();
});

module.exports = mongoose.model('Payment', PaymentSchema);
