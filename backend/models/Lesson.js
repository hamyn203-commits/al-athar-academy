const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  title: {
    ar: { type: String, required: true },
    en: { type: String, required: true },
    fr: { type: String },
    de: { type: String },
    tr: { type: String },
    ur: { type: String },
    id: { type: String },
    ms: { type: String }
  },
  description: {
    ar: { type: String },
    en: { type: String },
    fr: { type: String },
    de: { type: String },
    tr: { type: String },
    ur: { type: String },
    id: { type: String },
    ms: { type: String }
  },
  slug: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['video', 'text', 'audio', 'quiz', 'assignment', 'live'],
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 0
  },
  content: {
    video: {
      url: String,
      thumbnail: String,
      duration: Number,
      provider: {
        type: String,
        enum: ['youtube', 'vimeo', 'cloudinary', 'self-hosted']
      }
    },
    text: {
      ar: String,
      en: String,
      fr: String,
      de: String,
      tr: String,
      ur: String,
      id: String,
      ms: String
    },
    audio: {
      url: String,
      duration: Number
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz'
    },
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment'
    }
  },
  resources: [{
    title: {
      ar: String,
      en: String
    },
    type: {
      type: String,
      enum: ['pdf', 'doc', 'link', 'image', 'audio']
    },
    url: String,
    size: Number
  }],
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  isFree: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  stats: {
    views: {
      type: Number,
      default: 0
    },
    completions: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
LessonSchema.index({ course: 1, order: 1 });
LessonSchema.index({ slug: 1 });
LessonSchema.index({ type: 1 });
LessonSchema.index({ isPublished: 1 });

// Static method to get lessons by course with order
LessonSchema.statics.getByCourse = function(courseId) {
  return this.find({ course: courseId, isPublished: true })
    .sort({ order: 1 })
    .populate('quiz assignment');
};

// Method to check if user has access to this lesson
LessonSchema.methods.hasAccess = function(userId, enrollment) {
  if (this.isFree) return true;
  if (!enrollment) return false;
  return enrollment.status === 'active';
};

module.exports = mongoose.model('Lesson', LessonSchema);
