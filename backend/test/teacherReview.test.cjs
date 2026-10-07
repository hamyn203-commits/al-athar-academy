const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildTeacherReviewGate,
  sanitizeChecklistStatus,
} = require('../services/teacherReview');

function completeTeacher() {
  return {
    personalInfo: {
      fullName: 'Teacher',
      age: 30,
      gender: 'male',
      country: 'Egypt',
      city: 'Cairo',
      phone: '+201000000000',
    },
    academicInfo: {
      university: 'Al-Azhar',
      faculty: 'Quran',
      graduationYear: 2020,
      specialization: 'Tajweed',
      qualification: 'BA',
    },
    quranInfo: {
      memorizedParts: 30,
      teachingExperience: 5,
    },
    documents: {
      idCardFront: '/id-front.jpg',
      idCardBack: '/id-back.jpg',
      graduationCertificateAvailable: false,
      tajweedCertificatesAvailable: false,
      ijazatAvailable: false,
    },
    media: {
      profilePhoto: '/photo.jpg',
      introductionVideo: '/intro.mp4',
      recitationVideo: '/recitation.mp4',
      teachingMethodVideo: '/method.mp4',
    },
    reviewChecklist: [],
  };
}

test('teacher approval stays blocked until all required review items are approved', () => {
  const teacher = completeTeacher();
  let gate = buildTeacherReviewGate(teacher);
  assert.equal(gate.approvalReady, false);
  assert.equal(gate.readiness, 0);

  teacher.reviewChecklist = gate.items
    .filter((item) => item.requiredForTeacher)
    .map((item) => ({ key: item.key, status: 'approved' }));

  gate = buildTeacherReviewGate(teacher);
  assert.equal(gate.approvalReady, true);
  assert.equal(gate.readiness, 100);
});

test('missing required media blocks approval even when checklist says approved', () => {
  const teacher = completeTeacher();
  teacher.media.recitationVideo = '';
  teacher.reviewChecklist = buildTeacherReviewGate(teacher).items
    .filter((item) => item.requiredForTeacher)
    .map((item) => ({ key: item.key, status: 'approved' }));

  const gate = buildTeacherReviewGate(teacher);
  assert.equal(gate.approvalReady, false);
  assert.ok(gate.blockers.some((item) => item.key === 'recitation-video'));
});

test('placeholder teacher assets never satisfy approval readiness', () => {
  const teacher = completeTeacher();
  teacher.media.profilePhoto = '/uploads/teachers/placeholder.jpg';

  teacher.reviewChecklist = buildTeacherReviewGate(teacher).items
    .filter((item) => item.requiredForTeacher)
    .map((item) => ({ key: item.key, status: 'approved' }));

  const gate = buildTeacherReviewGate(teacher);
  assert.equal(gate.approvalReady, false);
  assert.ok(gate.blockers.some((item) => item.key === 'profile-photo'));
});

test('required checklist items cannot be marked not-applicable', () => {
  assert.equal(sanitizeChecklistStatus('not-applicable', true), null);
  assert.equal(sanitizeChecklistStatus('approved', true), 'approved');
  assert.equal(sanitizeChecklistStatus('not-applicable', false), 'not-applicable');
});
