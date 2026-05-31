const mongoose = require('mongoose');

const ReferralRewardSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referral: { type: mongoose.Schema.Types.ObjectId, ref: 'Referral' },
  type: { type: String, enum: ['signup', 'first_session', 'milestone'], default: 'signup' },
  points: { type: Number, required: true },
  description: { type: String, default: '' },
}, { timestamps: true });

ReferralRewardSchema.index({ user: 1 });

module.exports = mongoose.model('ReferralReward', ReferralRewardSchema);
