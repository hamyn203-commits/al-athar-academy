'use strict';

const mongoose = require('mongoose');
const User = require('../models/User');
const Teacher = require('../models/Teacher');
const Session = require('../models/Session');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wahy_playwright';
const PASSWORD = 'Playwright123!';

function assertSafeTestDatabase(uri) {
  const withoutQuery = String(uri || '').split('?')[0];
  const databaseName = withoutQuery.slice(withoutQuery.lastIndexOf('/') + 1);
  if (!/(playwright|e2e|test)/i.test(databaseName)) {
    throw new Error(`Refusing to reset unsafe database "${databaseName || '(missing)'}". Use a database name containing playwright, e2e, or test.`);
  }
}

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const availability = DAYS.map((day) => ({
  day,
  slots: [{ startTime: '07:00', endTime: '23:00', isBooked: false }],
}));

async function createUser({ name, email, phone, role = 'student' }) {
  return User.create({
    name,
    email,
    phone,
    password: PASSWORD,
    role,
    isActive: true,
    emailVerified: true,
    onboarding: {
      required: false,
      completed: true,
      trackSelected: role === 'student',
      teacherApplicationReady: role === 'teacher',
    },
    ...(role === 'student' ? {
      preferredTrack: 'memorization',
      currentLevel: 'beginner',
      memorizedJuz: 0,
      age: 21,
      gender: 'male',
    } : {}),
  });
}

async function createTeacher(index) {
  const user = await createUser({
    name: `E2E Teacher ${['One', 'Two', 'Three'][index - 1]}`,
    email: `e2e.teacher${index}@example.test`,
    phone: `+20100000010${index}`,
    role: 'teacher',
  });

  const teacher = await Teacher.create({
    user: user._id,
    personalInfo: {
      fullName: user.name,
      age: 35 + index,
      gender: 'male',
      country: 'Egypt',
      city: 'Cairo',
      phone: user.phone,
    },
    academicInfo: {
      university: 'Al-Azhar University',
      faculty: 'Quran Studies',
      graduationYear: 2014,
      specialization: 'Quran and Tajweed',
      qualification: 'BA',
    },
    quranInfo: {
      numberOfIjazat: 2,
      memorizedParts: 30,
      teachingExperience: 8,
      specializations: ['tajweed', 'adults'],
    },
    documents: {
      idCardFront: 'e2e-private-id-front',
      idCardBack: 'e2e-private-id-back',
    },
    media: {
      profilePhoto: '/default-teacher.png',
      introductionVideo: '/e2e-introduction.mp4',
      recitationVideo: '/e2e-recitation.mp4',
      teachingMethodVideo: '/e2e-method.mp4',
    },
    status: 'approved',
    isVerified: true,
    availabilityTimezone: 'Africa/Cairo',
    availability,
    languages: ['arabic', 'english'],
    rating: { average: 0, count: 0 },
  });

  return { user, teacher };
}

async function main() {
  assertSafeTestDatabase(MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  await mongoose.connection.dropDatabase();

  const postTrialStudent = await createUser({
    name: 'E2E Post Trial Student',
    email: 'e2e.posttrial@example.test',
    phone: '+201000001001',
  });

  const bookingStudent = await createUser({
    name: 'E2E Booking Student',
    email: 'e2e.booking@example.test',
    phone: '+201000001002',
  });

  const limitStudent = await createUser({
    name: 'E2E Trial Limit Student',
    email: 'e2e.limit@example.test',
    phone: '+201000001003',
  });

  const [teacherOne, teacherTwo, teacherThree] = await Promise.all([
    createTeacher(1),
    createTeacher(2),
    createTeacher(3),
  ]);

  await Session.create({
    student: postTrialStudent._id,
    teacher: teacherOne.teacher._id,
    type: 'trial',
    status: 'accepted',
    scheduledAt: new Date(Date.now() - 5 * 60 * 1000),
    duration: 60,
    timezone: 'Africa/Cairo',
    notes: 'Playwright completion flow',
  });

  const completedAt = Date.now() - 24 * 60 * 60 * 1000;
  for (const [index, teacher] of [teacherOne, teacherTwo, teacherThree].entries()) {
    await Session.create({
      student: limitStudent._id,
      teacher: teacher.teacher._id,
      type: 'trial',
      status: 'completed',
      scheduledAt: new Date(completedAt - index * 24 * 60 * 60 * 1000),
      duration: 60,
      timezone: 'Africa/Cairo',
      teacherEvaluation: {
        attendance: 4,
        memorization: 4,
        tajweed: 4,
        behavior: 4,
        commitment: 4,
        surahRecited: 'اختبار Playwright',
        fromAyah: 1,
        toAyah: 2,
        nextHomework: 'مراجعة اختبارية',
        overallNotes: 'بيانات اختبار آلية فقط',
      },
      earnings: { amount: 50, status: 'pending' },
    });
  }

  console.log(JSON.stringify({
    seeded: true,
    database: mongoose.connection.name,
    accounts: {
      postTrialStudent: postTrialStudent.email,
      bookingStudent: bookingStudent.email,
      trialLimitStudent: limitStudent.email,
      teacher: teacherOne.user.email,
    },
  }));

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error('Playwright seed failed:', error);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
