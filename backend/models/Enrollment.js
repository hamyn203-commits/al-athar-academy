const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled', 'expired'],
    default: 'active'
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  },
  progress: {
    completedLessons: [{
      lesson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson'
      },
      completedAt: {
        type: Date,
        default: Date.now
      },
      score: {
        type: Number,
        min: 0,
        max: 100
      }
    }],
    currentLesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    timeSpent: {
      type: Number,
      default: 0
    }
  },
  certificate: {
    issued: {
      type: Boolean,
      default: false
    },
    issuedAt: {
      type: Date
    },
    certificateId: {
      type: String,
      unique: true,
      sparse: true
    },
    qrCode: {
      type: String
    }
  },
  payment: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: {
      type: String
    },
    paidAt: {
      type: Date
    }
  },
  notes: [{
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastAccessedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate enrollments
EnrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
EnrollmentSchema.index({ status: 1 });
EnrollmentSchema.index({ expiresAt: 1 });
EnrollmentSchema.index({ 'certificate.certificateId': 1 });

// Virtual for completion percentage
EnrollmentSchema.virtual('completionPercentage').get(function() {
  return this.progress.percentage;
});

// Method to update progress
EnrollmentSchema.methods.updateProgress = async function(lessonId, score = 100) {
  const Course = mongoose.model('Course');
  const course = await Course.findById(this.course);
  
  if (!course) return;

  // Check if lesson already completed
  const alreadyCompleted = this.progress.completedLessons.some(
    cl => cl.lesson.toString() === lessonId.toString()
  );

  if (!alreadyCompleted) {
    this.progress.completedLessons.push({
      lesson: lessonId,
      completedAt: new Date(),
      score: score
    });

    // Calculate new percentage
    const totalLessons = course.lessons.length;
    const completedCount = this.progress.completedLessons.length;
    this.progress.percentage = Math.round((completedCount / totalLessons) * 100);

    // Update current lesson
    this.progress.currentLesson = lessonId;

    // Check if course is completed
    if (this.progress.percentage === 100) {
      this.status = 'completed';
      this.completedAt = new Date();
      
      // Issue certificate if enabled
      if (course.certificate.enabled && !this.certificate.issued) {
        this.certificate.issued = true;
        this.certificate.issuedAt = new Date();
        this.certificate.certificateId = `CERT-${Date.now()}-${this._id}`;
      }
    }

    this.lastAccessedAt = new Date();
    await this.save();
  }
};

// Method to check if lesson is accessible
EnrollmentSchema.methods.canAccessLesson = function(lessonId) {
  if (this.status !== 'active' && this.status !== 'completed') {
    return false;
  }
  return true;
};

// Ensure virtuals are included in JSON output
EnrollmentSchema.set('toJSON', { virtuals: true });
EnrollmentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Enrollment', EnrollmentSchema);
