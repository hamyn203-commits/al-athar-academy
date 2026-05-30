const mongoose = require('mongoose');

const AssessmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: {
    age: { type: Number, required: true },
    readingLevel: { type: String, enum: ['none', 'basic', 'intermediate', 'advanced'], required: true },
    memorizationLevel: { type: String, enum: ['none', 'some-parts', 'half', 'most', 'complete'], required: true },
    tajweedLevel: { type: String, enum: ['none', 'basic', 'good', 'excellent'], required: true },
    previousExperience: { type: Boolean, default: false },
    goals: [{ type: String, enum: ['memorization', 'tajweed', 'ijaza', 'arabic-language', 'review'] }],
    preferredTeacherGender: { type: String, enum: ['male', 'female', 'any'], default: 'any' },
    availableDays: [{ type: String, enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] }],
    preferredTimeSlots: [{ type: String, enum: ['morning', 'afternoon', 'evening'] }]
  },
  result: {
    calculatedLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    recommendedPlan: {
      sessionsPerWeek: Number,
      sessionDuration: Number,
      estimatedMonths: Number
    },
    suggestedTeachers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher'
    }]
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'reviewed'],
    default: 'in-progress'
  }
}, { timestamps: true });

AssessmentSchema.index({ user: 1 });
AssessmentSchema.index({ status: 1 });

module.exports = mongoose.model('Assessment', AssessmentSchema);