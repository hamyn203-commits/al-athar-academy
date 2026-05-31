const mongoose = require('mongoose');

const JobApplicationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  position: { type: String, required: true },
  coverLetter: { type: String, maxlength: 2000 },
  resumeUrl: { type: String, default: '' },
  experience: { type: Number, default: 0 },
  languages: [String],
  status: { type: String, enum: ['new', 'reviewing', 'interview', 'hired', 'rejected'], default: 'new' },
}, { timestamps: true });

JobApplicationSchema.index({ position: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('JobApplication', JobApplicationSchema);
