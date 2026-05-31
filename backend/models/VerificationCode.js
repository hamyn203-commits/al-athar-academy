const mongoose = require('mongoose');

const VerificationCodeSchema = new mongoose.Schema({
  phone: { type: String, required: true, index: true },
  code: { type: String, required: true },
  method: { type: String, enum: ['whatsapp', 'telegram', 'sms'], required: true },
  expires: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  attempts: { type: Number, default: 0 },
  verified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('VerificationCode', VerificationCodeSchema);
