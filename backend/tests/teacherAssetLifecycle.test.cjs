'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const objectStorage = require('../services/objectStorage');
const {
  collectTeacherAssetReferences,
  ownerCandidates,
  resolveOwnedTeacherAssets,
} = require('../utils/teacherAssetLifecycle');

test('public media proxy URLs unwrap to the original object reference', () => {
  const blob = 'https://store.private.blob.vercel-storage.com/uploads/teacher-public/verified-example.com/profile.jpg';
  const proxy = '/api/uploads/public?ref=' + encodeURIComponent(blob);

  assert.equal(objectStorage.unwrapPublicProxyReference(proxy), blob);
  assert.equal(
    objectStorage.unwrapPublicProxyReference('https://api.example.com' + proxy),
    blob
  );
});

test('teacher assets resolve against explicit storageOwner before deletion', () => {
  const owner = 'verified@example.com';
  const privateRef = 'https://store.private.blob.vercel-storage.com/uploads/teacher-private/verified-example.com/id.pdf';
  const publicRef = 'https://store.private.blob.vercel-storage.com/uploads/teacher-public/verified-example.com/profile.jpg';

  const teacher = {
    storageOwner: owner,
    documents: {
      idCard: privateRef,
      graduationCertificate: 'not-provided',
      tajweedCertificates: [],
      ijazat: [],
    },
    media: {
      profilePhoto: '/api/uploads/public?ref=' + encodeURIComponent(publicRef),
      introductionVideo: '/default-teacher.png',
      recitationVideo: '/default-teacher.png',
      teachingMethodVideo: '/default-teacher.png',
      additionalVideos: [],
      audioRecordings: [],
    },
  };

  const result = resolveOwnedTeacherAssets({
    teacher,
    user: { _id: 'user-1', email: owner },
    driver: 'vercel-blob',
  });

  assert.equal(result.resolved.length, 2);
  assert.ok(result.resolved.every((asset) => asset.owner === owner));
  assert.ok(result.skipped.some((asset) => asset.reference === 'not-provided'));
  assert.ok(result.skipped.some((asset) => asset.reference === '/default-teacher.png'));
});

test('legacy teacher assets can fall back to linked user email ownership', () => {
  const owner = 'legacy@example.com';
  const ref = 'https://store.private.blob.vercel-storage.com/uploads/teacher-private/legacy-example.com/id.pdf';

  const result = resolveOwnedTeacherAssets({
    teacher: {
      documents: { idCard: ref },
      media: {},
    },
    user: { _id: '507f1f77bcf86cd799439011', email: owner },
    driver: 'vercel-blob',
  });

  assert.equal(result.resolved.length, 1);
  assert.equal(result.resolved[0].owner, owner);
});

test('teacher asset lifecycle fails closed when ownership cannot be proven', () => {
  const foreignRef = 'https://store.private.blob.vercel-storage.com/uploads/teacher-private/foreign-owner/id.pdf';

  assert.throws(
    () => resolveOwnedTeacherAssets({
      teacher: {
        storageOwner: 'verified@example.com',
        documents: { idCard: foreignRef },
        media: {},
      },
      user: { _id: 'user-1', email: 'verified@example.com' },
      driver: 'vercel-blob',
    }),
    (error) => error?.code === 'ASSET_OWNERSHIP_UNRESOLVED'
  );
});

test('teacher asset collection deduplicates reused media references', () => {
  const ref = 'https://store.private.blob.vercel-storage.com/uploads/teacher-public/verified-example.com/shared.jpg';
  const teacher = {
    documents: {},
    media: {
      profilePhoto: ref,
      introductionVideo: ref,
      recitationVideo: ref,
    },
  };

  const assets = collectTeacherAssetReferences(teacher);
  assert.equal(assets.length, 1);
  assert.equal(assets[0].purpose, 'teacher-public');
});

test('owner candidates are normalized and deduplicated', () => {
  assert.deepEqual(
    ownerCandidates(
      { storageOwner: 'teacher@example.com' },
      { _id: 'abc', id: 'abc', email: 'teacher@example.com' }
    ),
    ['teacher@example.com', 'abc']
  );
});
