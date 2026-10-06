const mongoose = require('mongoose');

const PaymentWebhookEventSchema = new mongoose.Schema({
  provider: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 64,
  },
  eventId: {
    type: String,
    required: true,
    trim: true,
    maxlength: 256,
  },
  eventType: {
    type: String,
    required: true,
    trim: true,
    maxlength: 128,
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
  },
  status: {
    type: String,
    enum: ['received', 'processed', 'ignored', 'failed'],
    default: 'received',
    index: true,
  },
  payloadHash: {
    type: String,
    required: true,
    match: /^[a-f0-9]{64}$/i,
    select: false,
  },
  processedAt: Date,
  failureCode: {
    type: String,
    trim: true,
    maxlength: 128,
  },
}, { timestamps: true });

PaymentWebhookEventSchema.index(
  { provider: 1, eventId: 1 },
  { unique: true }
);
PaymentWebhookEventSchema.index({ payment: 1, createdAt: -1 });

module.exports = mongoose.model('PaymentWebhookEvent', PaymentWebhookEventSchema);
