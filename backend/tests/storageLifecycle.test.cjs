'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const objectStorage = require('../services/objectStorage');
const {
  assertLocalReference,
  deleteStoredReference,
} = require('../utils/storageLifecycle');

test('owned object references bind purpose and owner', () => {
  const ref = 'https://store.private.blob.vercel-storage.com/uploads/homework/student-1/file.mp3';

  assert.equal(
    objectStorage.isOwnedObjectReference(ref, 'homework', 'student-1', 'vercel-blob'),
    true
  );
  assert.equal(
    objectStorage.isOwnedObjectReference(ref, 'assignment', 'student-1', 'vercel-blob'),
    false
  );
  assert.equal(
    objectStorage.isOwnedObjectReference(ref, 'homework', 'student-2', 'vercel-blob'),
    false
  );
  assert.equal(
    objectStorage.isOwnedObjectReference(
      'https://blob.vercel-storage.com.evil.example/uploads/homework/student-1/file.mp3',
      'homework',
      'student-1',
      'vercel-blob'
    ),
    false
  );
});

test('S3 object keys remain owner and purpose scoped', () => {
  assert.equal(
    objectStorage.isOwnedObjectReference(
      'uploads/assignment/student-1/submission.pdf',
      'assignment',
      'student-1',
      's3'
    ),
    true
  );
  assert.equal(
    objectStorage.isOwnedObjectReference(
      'uploads/assignment/student-2/submission.pdf',
      'assignment',
      'student-1',
      's3'
    ),
    false
  );
});

test('local lifecycle deletion only removes files inside the allowed root', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'wn-lifecycle-'));
  const nested = path.join(root, 'student');
  fs.mkdirSync(nested, { recursive: true });

  const file = path.join(nested, 'submission.mp3');
  fs.writeFileSync(file, 'test');

  const result = await deleteStoredReference({
    reference: file,
    purpose: 'homework',
    owner: 'student-1',
    localRoot: root,
  });

  assert.equal(result.deleted, true);
  assert.equal(fs.existsSync(file), false);

  fs.rmSync(root, { recursive: true, force: true });
});

test('local lifecycle rejects traversal outside the allowed root', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'wn-lifecycle-root-'));
  const outside = path.join(path.dirname(root), 'foreign-file.txt');

  assert.throws(
    () => assertLocalReference(outside, root),
    /outside the allowed root/
  );

  fs.rmSync(root, { recursive: true, force: true });
});
