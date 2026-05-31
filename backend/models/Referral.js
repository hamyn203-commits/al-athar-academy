const mongoose = require('mongoose');

const ReferralSchema = new mongoose.Schema({
  referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  code: { type: String, required: true, uppercase: true },
  status: { type: String, enum: ['pending', 'active', 'rewarded'], default: 'pending' },
  rewardPoints: { type: Number, default: 50 },
}, { timestamps: true });

ReferralSchema.index({ referrer: 1 });
ReferralSchema.index({ code: 1 });

module.exports = mongoose.model('Referral', ReferralSchema);
