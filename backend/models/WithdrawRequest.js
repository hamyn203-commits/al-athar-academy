const mongoose = require('mongoose');

const WithdrawRequestSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  amount: { type: Number, required: true, min: 50 },
  method: { type: String, enum: ['vodafone_cash', 'instapay', 'bank'], default: 'vodafone_cash' },
  accountInfo: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminNote: { type: String, default: '' },
}, { timestamps: true });

WithdrawRequestSchema.index({ teacher: 1, createdAt: -1 });
WithdrawRequestSchema.index({ status: 1 });

module.exports = mongoose.model('WithdrawRequest', WithdrawRequestSchema);
