const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderRole: { type: String, enum: ['student', 'admin'], required: true },
  clientId: { type: String, required: true, maxlength: 80 },
  text: { type: String, required: true, maxlength: 2000 },
  readAt: { type: Date, default: null },
}, { timestamps: true });
schema.index({ sender: 1, clientId: 1 }, { unique: true });
schema.index({ student: 1, _id: -1 });
schema.index({ student: 1, senderRole: 1, readAt: 1 });
module.exports = mongoose.model('SupportMessage', schema);
