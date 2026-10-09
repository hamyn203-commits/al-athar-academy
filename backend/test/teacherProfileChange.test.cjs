const test = require('node:test');
const assert = require('node:assert/strict');
const {
  sanitizeTeacherProfileChange,
  listChangedFields,
  mergeTeacherMedia,
  applyTeacherProfileChange,
} = require('../services/teacherProfileChange');

test('teacher profile change sanitizer only accepts public editable fields', () => {
  const proposed = sanitizeTeacherProfileChange({
    personalInfo: { fullName: '  Ahmed Tutor  ', city: ' Cairo ', phone: 'hijack' },
    academicInfo: { university: 'Al-Azhar', faculty: 'Quran', qualification: 'BA', graduationYear: 1900 },
    quranInfo: { teachingExperience: 8, numberOfIjazat: 2, memorizedParts: 0 },
    user: { bio: 'Teacher bio', role: 'admin' },
    status: 'approved',
  });

  assert.equal(proposed.personalInfo.fullName, 'Ahmed Tutor');
  assert.equal(proposed.personalInfo.city, 'Cairo');
  assert.equal(proposed.personalInfo.phone, undefined);
  assert.equal(proposed.academicInfo.graduationYear, undefined);
  assert.equal(proposed.quranInfo.memorizedParts, undefined);
  assert.equal(proposed.user.role, undefined);
});

test('teacher profile change tracks fields and merges only supplied media', () => {
  const proposed = sanitizeTeacherProfileChange({ personalInfo: { city: 'Giza' } });
  proposed.media.profilePhoto = '/new-photo.png';
  assert.deepEqual(listChangedFields(proposed).sort(), ['media.profilePhoto', 'personalInfo.city']);

  const merged = mergeTeacherMedia(
    { profilePhoto: '/old.png', introductionVideo: '/intro.mp4', recitationVideo: '/rec.mp4', teachingMethodVideo: '/method.mp4' },
    { profilePhoto: '/new-photo.png' },
  );
  assert.equal(merged.profilePhoto, '/new-photo.png');
  assert.equal(merged.introductionVideo, '/intro.mp4');
});

test('approved change mutates teacher/user without touching protected fields', () => {
  const values = {};
  const teacher = { set: (path, value) => { values[path] = value; } };
  const user = { name: 'Old', bio: '' };
  applyTeacherProfileChange(teacher, user, {
    personalInfo: { fullName: 'New', city: 'Cairo' },
    quranInfo: { teachingExperience: 10 },
    user: { bio: 'Updated bio' },
    media: { profilePhoto: '/new.png' },
  });

  assert.equal(values['personalInfo.fullName'], 'New');
  assert.equal(values['quranInfo.teachingExperience'], 10);
  assert.equal(values['media.profilePhoto'], '/new.png');
  assert.equal(user.name, 'New');
  assert.equal(user.bio, 'Updated bio');
});
