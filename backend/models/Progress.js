const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  enrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment',
    required: true
  },
  lessonProgress: [{
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed'],
      default: 'not-started'
    },
    startedAt: Date,
    completedAt: Date,
    timeSpent: {
      type: Number,
      default: 0
    },
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    attempts: {
      type: Number,
      default: 0
    },
    notes: String,
    bookmarks: [{
      timestamp: Number,
      note: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  overallProgress: {
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    completedLessons: {
      type: Number,
      default: 0
    },
    totalLessons: {
      type: Number,
      default: 0
    },
    totalTimeSpent: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    }
  },
  milestones: [{
    type: {
      type: String,
      enum: ['lesson-completed', 'quiz-passed', 'assignment-submitted', 'course-completed', 'streak', 'achievement']
    },
    title: {
      ar: String,
      en: String
    },
    description: {
      ar: String,
      en: String
    },
    achievedAt: {
      type: Date,
      default: Date.now
    },
    points: Number,
    badge: String
  }],
  streak: {
    current: {
      type: Number,
      default: 0
    },
    longest: {
      type: Number,
      default: 0
    },
    lastActivity: Date
  },
  weeklyActivity: [{
    weekStart: Date,
    lessonsCompleted: Number,
    timeSpent: Number,
    quizzesTaken: Number,
    assignmentsSubmitted: Number
  }],
  strengths: [{
    area: String,
    score: Number,
    description: {
      ar: String,
      en: String
    }
  }],
  weaknesses: [{
    area: String,
    score: Number,
    description: {
      ar: String,
      en: String
    },
    recommendations: [{
      ar: String,
      en: String
    }]
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

ProgressSchema.index({ student: 1, course: 1 }, { unique: true });
ProgressSchema.index({ 'overallProgress.percentage': -1 });
ProgressSchema.index({ 'streak.current': -1 });
ProgressSchema.index({ lastUpdated: -1 });

ProgressSchema.methods.updateLessonProgress = function(lessonId, status, score = null, timeSpent = 0) {
  const lessonIndex = this.lessonProgress.findIndex(lp => lp.lesson.toString() === lessonId);
  
  if (lessonIndex === -1) {
    this.lessonProgress.push({
      lesson: lessonId,
      status,
      startedAt: status !== 'not-started' ? new Date() : null,
      completedAt: status === 'completed' ? new Date() : null,
      score,
      timeSpent,
      attempts: 1
    });
  } else {
    const lesson = this.lessonProgress[lessonIndex];
    lesson.status = status;
    if (status === 'in-progress' && !lesson.startedAt) {
      lesson.startedAt = new Date();
    }
    if (status === 'completed') {
      lesson.completedAt = new Date();
      lesson.attempts += 1;
    }
    if (score !== null) {
      lesson.score = score;
    }
    lesson.timeSpent += timeSpent;
  }

  this.calculateOverallProgress();
  this.updateStreak();
  this.lastUpdated = new Date();
  
  return this.save();
};

ProgressSchema.methods.calculateOverallProgress = function() {
  const completedLessons = this.lessonProgress.filter(lp => lp.status === 'completed').length;
  const totalLessons = this.lessonProgress.length;
  
  this.overallProgress.completedLessons = completedLessons;
  this.overallProgress.totalLessons = totalLessons;
  this.overallProgress.percentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  
  const totalTime = this.lessonProgress.reduce((sum, lp) => sum + (lp.timeSpent || 0), 0);
  this.overallProgress.totalTimeSpent = totalTime;
  
  const scores = this.lessonProgress.filter(lp => lp.score !== null && lp.score !== undefined);
  if (scores.length > 0) {
    const avgScore = scores.reduce((sum, lp) => sum + lp.score, 0) / scores.length;
    this.overallProgress.averageScore = avgScore;
  }
};

ProgressSchema.methods.updateStreak = function() {
  const now = new Date();
  const lastActivity = this.streak.lastActivity;
  
  if (!lastActivity) {
    this.streak.current = 1;
    this.streak.longest = 1;
    this.streak.lastActivity = now;
    return;
  }
  
  const daysDiff = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 0) {
    return;
  } else if (daysDiff === 1) {
    this.streak.current += 1;
    if (this.streak.current > this.streak.longest) {
      this.streak.longest = this.streak.current;
    }
  } else {
    this.streak.current = 1;
  }
  
  this.streak.lastActivity = now;
};

ProgressSchema.methods.addMilestone = function(type, title, description, points = 0, badge = null) {
  this.milestones.push({
    type,
    title,
    description,
    achievedAt: new Date(),
    points,
    badge
  });
  
  return this.save();
};

ProgressSchema.methods.addBookmark = function(lessonId, timestamp, note) {
  const lessonIndex = this.lessonProgress.findIndex(lp => lp.lesson.toString() === lessonId);
  
  if (lessonIndex === -1) {
    throw new Error('Lesson not found in progress');
  }
  
  this.lessonProgress[lessonIndex].bookmarks.push({
    timestamp,
    note,
    createdAt: new Date()
  });
  
  return this.save();
};

ProgressSchema.methods.updateWeeklyActivity = function(weekStart, activity) {
  const weekIndex = this.weeklyActivity.findIndex(wa => wa.weekStart.getTime() === weekStart.getTime());
  
  if (weekIndex === -1) {
    this.weeklyActivity.push({
      weekStart,
      ...activity
    });
  } else {
    Object.assign(this.weeklyActivity[weekIndex], activity);
  }
  
  return this.save();
};

ProgressSchema.methods.analyzeStrengthsAndWeaknesses = function() {
  const lessonScores = this.lessonProgress
    .filter(lp => lp.score !== null && lp.score !== undefined)
    .map(lp => ({
      lesson: lp.lesson,
      score: lp.score
    }));
  
  if (lessonScores.length === 0) return;
  
  const avgScore = lessonScores.reduce((sum, ls) => sum + ls.score, 0) / lessonScores.length;
  
  this.strengths = lessonScores
    .filter(ls => ls.score >= avgScore + 10)
    .map(ls => ({
      area: ls.lesson.toString(),
      score: ls.score,
      description: {
        ar: 'أداء ممتاز',
        en: 'Excellent performance'
      }
    }));
  
  this.weaknesses = lessonScores
    .filter(ls => ls.score < avgScore - 10)
    .map(ls => ({
      area: ls.lesson.toString(),
      score: ls.score,
      description: {
        ar: 'يحتاج تحسين',
        en: 'Needs improvement'
      },
      recommendations: [{
        ar: 'راجع الدرس مرة أخرى',
        en: 'Review the lesson again'
      }]
    }));
  
  return this.save();
};

const Progress = mongoose.model('Progress', ProgressSchema);

module.exports = Progress;
