'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  validateUploadMetadata,
  normalizeContentType,
} = require('../config/uploadPolicy');
const storage = require('../services/objectStorage');

test('upload policy accepts a valid teacher-private PDF', () => {
  const result = validateUploadMetadata({
    purpose: 'teacher-private',
    role: 'teacher-registration',
    filename: 'graduation-certificate.pdf',
    contentType: 'application/pdf',
    size: 2 * 1024 * 1024,
  });

  assert.equal(result.contentType, 'application/pdf');
  assert.equal(result.extension, '.pdf');
});

test('upload policy normalizes content type parameters and case', () => {
  assert.equal(
    normalizeContentType(' Image/JPEG ; charset=binary '),
    'image/jpeg'
  );

  const result = validateUploadMetadata({
    purpose: 'teacher-public',
    role: 'teacher',
    filename: 'profile.JPEG',
    contentType: 'IMAGE/JPEG',
    size: 200_000,
  });

  assert.equal(result.contentType, 'image/jpeg');
  assert.equal(result.extension, '.jpeg');
});

test('upload policy rejects extension and MIME spoofing', () => {
  assert.throws(
    () => validateUploadMetadata({
      purpose: 'teacher-public',
      role: 'teacher',
      filename: 'avatar.html',
      contentType: 'image/jpeg',
      size: 100_000,
    }),
    /File extension does not match content type/
  );

  assert.throws(
    () => validateUploadMetadata({
      purpose: 'teacher-private',
      role: 'teacher',
      filename: 'identity.jpg',
      contentType: 'application/pdf',
      size: 100_000,
    }),
    /File extension does not match content type/
  );
});

test('upload policy enforces role, purpose, type and maximum size', () => {
  assert.throws(
    () => validateUploadMetadata({
      purpose: 'course-media',
      role: 'student',
      filename: 'lesson.mp4',
      contentType: 'video/mp4',
      size: 1_000_000,
    }),
    /Not allowed for this upload purpose/
  );

  assert.throws(
    () => validateUploadMetadata({
      purpose: 'teacher-private',
      role: 'teacher',
      filename: 'archive.zip',
      contentType: 'application/zip',
      size: 50_000,
    }),
    /File type is not allowed/
  );

  assert.throws(
    () => validateUploadMetadata({
      purpose: 'teacher-private',
      role: 'teacher',
      filename: 'identity.pdf',
      contentType: 'application/pdf',
      size: 26 * 1024 * 1024,
    }),
    /Invalid file size/
  );

  assert.throws(
    () => validateUploadMetadata({
      purpose: 'unknown-purpose',
      role: 'admin',
      filename: 'file.pdf',
      contentType: 'application/pdf',
      size: 100,
    }),
    /Unsupported upload purpose/
  );
});

test('object references reject unsafe paths and enforce owner prefix', () => {
  assert.equal(
    storage.isSafeObjectPath('uploads/teacher-private/user-1/id.pdf'),
    true
  );
  assert.equal(
    storage.isSafeObjectPath('uploads/teacher-private/user-1/../user-2/id.pdf'),
    false
  );
  assert.equal(
    storage.isSafeObjectPath('uploads/teacher-private/user-1//id.pdf'),
    false
  );
  assert.equal(
    storage.isSafeObjectPath('uploads\\teacher-private\\user-1\\id.pdf'),
    false
  );

  assert.equal(
    storage.referenceMatches(
      'uploads/teacher-private/user-1/id.pdf',
      'teacher-private',
      'user-1'
    ),
    true
  );
  assert.equal(
    storage.referenceMatches(
      'uploads/teacher-private/user-2/id.pdf',
      'teacher-private',
      'user-1'
    ),
    false
  );
});

test('Vercel Blob references require HTTPS and the expected host suffix', () => {
  assert.equal(
    storage.isVercelBlobReference('https://store.private.blob.vercel-storage.com/uploads/file.pdf'),
    true
  );
  assert.equal(
    storage.isVercelBlobReference('http://store.private.blob.vercel-storage.com/uploads/file.pdf'),
    false
  );
  assert.equal(
    storage.isVercelBlobReference('https://blob.vercel-storage.com.evil.example/uploads/file.pdf'),
    false
  );
});


test('teacher public video allows 100 MB and rejects anything larger', () => {
  const allowed = validateUploadMetadata({
    purpose: 'teacher-public',
    role: 'teacher-registration',
    filename: 'recitation.mp4',
    contentType: 'video/mp4',
    size: 100 * 1024 * 1024,
  });

  assert.equal(allowed.size, 100 * 1024 * 1024);

  assert.throws(
    () => validateUploadMetadata({
      purpose: 'teacher-public',
      role: 'teacher-registration',
      filename: 'recitation.mp4',
      contentType: 'video/mp4',
      size: (100 * 1024 * 1024) + 1,
    }),
    /Invalid file size/
  );
});

test('teacher JPEG uploads accept JFIF extension', () => {
  const result = validateUploadMetadata({
    purpose: 'teacher-public',
    role: 'teacher-registration',
    filename: 'profile.jfif',
    contentType: 'image/jpeg',
    size: 500_000,
  });

  assert.equal(result.extension, '.jfif');
});
