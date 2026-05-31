const mongoose = require('mongoose');
const crypto = require('crypto');

const ScoreBlockSchema = {
  score: { type: Number, min: 0, max: 100 },
  notes: [String],
};

const RecitationReportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportId: {
    type: String,
    unique: true,
    default: () => `REC-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
  },
  filename: String,
  mimeType: String,
  size: Number,
  overallScore: { type: Number, min: 0, max: 100 },
  tajweed: ScoreBlockSchema,
  makhraj: ScoreBlockSchema,
  waqf: ScoreBlockSchema,
  mad: ScoreBlockSchema,
  recommendations: [String],
  provider: { type: String, default: 'local-heuristic' },
  source: String,
}, { timestamps: true });

RecitationReportSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('RecitationReport', RecitationReportSchema);
