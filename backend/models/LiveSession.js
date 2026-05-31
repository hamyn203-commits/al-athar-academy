const mongoose = require('mongoose');

const LiveSessionSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  subject: { type: String, default: 'general' },
  isLive: { type: Boolean, default: false },
  isHost: { type: Boolean, default: true },
  participants: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('LiveSession', LiveSessionSchema);
