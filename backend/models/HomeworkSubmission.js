const mongoose = require('mongoose');

const HomeworkSubmissionSchema = new mongoose.Schema({
  homeworkId: { type: String, required: true },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filePath: { type: String, required: true },
  fileName: { type: String },
  fileSize: { type: Number },
  status: { type: String, enum: ['submitted', 'reviewed', 'graded'], default: 'submitted' },
  grade: { type: Number, min: 0, max: 100 },
  feedback: { type: String }
}, { timestamps: true });

HomeworkSubmissionSchema.index({ homeworkId: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('HomeworkSubmission', HomeworkSubmissionSchema);
