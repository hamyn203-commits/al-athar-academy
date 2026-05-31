const mongoose = require('mongoose');

const ContactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, default: '' },
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true },
  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'closed'],
    default: 'new',
  },
  adminReply: { type: String, default: '' },
  repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  repliedAt: Date,
}, { timestamps: true });

ContactMessageSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('ContactMessage', ContactMessageSchema);
