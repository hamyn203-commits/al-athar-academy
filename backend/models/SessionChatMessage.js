const mongoose = require('mongoose');

const SessionChatMessageSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, default: '' },
  text: { type: String, required: true, trim: true },
  lang: { type: String, default: 'ar' },
  translations: { type: Map, of: String, default: {} },
}, { timestamps: true });

SessionChatMessageSchema.index({ session: 1, createdAt: -1 });

module.exports = mongoose.model('SessionChatMessage', SessionChatMessageSchema);
