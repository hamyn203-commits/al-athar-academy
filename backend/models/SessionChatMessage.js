const mongoose = require('mongoose');

const SessionChatMessageSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, default: '' },
  kind: { type: String, enum: ['text', 'audio'], default: 'text' },
  text: { type: String, default: '', trim: true, maxlength: 4000 },
  lang: { type: String, default: 'ar' },
  translations: { type: Map, of: String, default: {} },
  audio: {
    reference: { type: String, default: '', select: false },
    contentType: { type: String, default: '' },
    size: { type: Number, default: 0 },
    durationSeconds: { type: Number, min: 0, max: 120, default: 0 },
  },
}, { timestamps: true });

SessionChatMessageSchema.index({ session: 1, createdAt: -1 });

module.exports = mongoose.model('SessionChatMessage', SessionChatMessageSchema);
