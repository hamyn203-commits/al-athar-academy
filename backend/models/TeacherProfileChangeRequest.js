const mongoose = require('mongoose');

const TeacherProfileChangeRequestSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true,
  },
  proposed: {
    personalInfo: {
      fullName: String,
      city: String,
    },
    academicInfo: {
      university: String,
      faculty: String,
      qualification: String,
    },
    quranInfo: {
      teachingExperience: Number,
      numberOfIjazat: Number,
    },
    user: {
      bio: String,
    },
    media: {
      profilePhoto: String,
      introductionVideo: String,
      recitationVideo: String,
      teachingMethodVideo: String,
    },
  },
  changedFields: [{ type: String, trim: true }],
  adminNote: { type: String, default: '', trim: true, maxlength: 1500 },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
}, { timestamps: true });

TeacherProfileChangeRequestSchema.index({ teacher: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('TeacherProfileChangeRequest', TeacherProfileChangeRequestSchema);
