const mongoose = require('mongoose');

const StudentTutorPreferenceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  favoriteTeachers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
  }],
  matching: {
    goals: [{ type: String, trim: true }],
    preferredGender: {
      type: String,
      enum: ['any', 'male', 'female'],
      default: 'any',
    },
    language: {
      type: String,
      trim: true,
      default: '',
    },
  },
}, { timestamps: true });

module.exports = mongoose.model('StudentTutorPreference', StudentTutorPreferenceSchema);
