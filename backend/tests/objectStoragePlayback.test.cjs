const test = require('node:test');
const assert = require('node:assert/strict');
const storage = require('../services/objectStorage');

const envKeys = [
  'BLOB_READ_WRITE_TOKEN',
  'S3_BUCKET',
  'S3_REGION',
  'S3_ACCESS_KEY_ID',
  'S3_SECRET_ACCESS_KEY',
  'S3_ENDPOINT',
  'FILE_STORAGE_DRIVER',
];

function withStorageEnv(values, fn) {
  const old = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
  for (const key of envKeys) delete process.env[key];
  Object.assign(process.env, values);
  return Promise.resolve().then(fn).finally(() => {
    for (const key of envKeys) {
      if (old[key] === undefined) delete process.env[key];
      else process.env[key] = old[key];
    }
  });
}

test('private playback does not disclose a raw Blob URL from an unrecognized host', async () => {
  await withStorageEnv({ BLOB_READ_WRITE_TOKEN: 'fake-test-token' }, async () => {
    assert.equal(await storage.createTemporaryReadUrl('https://example.com/uploads/teacher/video.mp4'), null);
    assert.equal(await storage.createTemporaryReadUrl('http://test.private.blob.vercel-storage.com/uploads/video.mp4'), null);
    assert.equal(await storage.createTemporaryReadUrl('/uploads/teacher/video.mp4'), null);
  });
});

test('local files are not exposed as signed public URLs', async () => {
  await withStorageEnv({ FILE_STORAGE_DRIVER: 'filesystem' }, async () => {
    assert.equal(await storage.createTemporaryReadUrl('private/teachers/id-card.jpg'), null);
  });
});

test('S3 playback only grants a bounded temporary GET for one object', async () => {
  await withStorageEnv({
    S3_BUCKET: 'demo-teacher-media',
    S3_REGION: 'us-east-1',
    S3_ACCESS_KEY_ID: 'test-access-key',
    S3_SECRET_ACCESS_KEY: 'test-only-signing-secret',
  }, async () => {
    const result = await storage.createTemporaryReadUrl('uploads/teacher-media/teacher-abc.mp4', { expiresIn: 4000 });
    assert.ok(result?.url?.startsWith('https://'));
    const url = new URL(result.url);
    assert.ok(url.pathname.includes('teacher-abc.mp4'));
    assert.equal(url.searchParams.get('X-Amz-Expires'), '1800');
    assert.equal(url.searchParams.get('X-Amz-SignedHeaders'), 'host');
    assert.ok(result.expiresAt > Date.now());
    assert.ok(result.expiresAt <= Date.now() + 1800000);
  });
});
