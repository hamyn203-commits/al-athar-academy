const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  amount: { type: Number, required: true, min: 1 },
  currency: { type: String, default: 'USD', enum: ['USD', 'EUR', 'GBP', 'SAR', 'AED', 'EGP'] },
  category: {
    type: String,
    enum: ['student', 'teacher', 'halaqa', 'general'],
    default: 'general',
  },
  message: { type: String, maxlength: 500 },
  isAnonymous: { type: Boolean, default: false },
  status: { type: String, enum: ['pledged', 'confirmed', 'cancelled'], default: 'pledged' },
}, { timestamps: true });

DonationSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Donation', DonationSchema);
