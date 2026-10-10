const test = require('node:test');
const assert = require('node:assert/strict');
const { boundedMediaRange, DEFAULT_CHUNK_BYTES } = require('../utils/mediaByteRange');

test('video starts with bounded partial response even when browser sends no Range', () => {
  assert.deepEqual(
    boundedMediaRange(undefined, 53 * 1024 * 1024),
    { start: 0, end: DEFAULT_CHUNK_BYTES - 1, size: 53 * 1024 * 1024, partial: true },
  );
});

test('open-ended browser range never exceeds 2 MiB', () => {
  const result = boundedMediaRange('bytes=2097152-', 53 * 1024 * 1024);
  assert.equal(result.start, 2097152);
  assert.equal(result.end, 4194303);
});

test('seeking into tail responds with final bytes', () => {
  assert.deepEqual(
    boundedMediaRange('bytes=9999998-', 10000000),
    { start: 9999998, end: 9999999, size: 10000000, partial: true },
  );
});

test('small explicit range is honored exactly', () => {
  assert.deepEqual(
    boundedMediaRange('bytes=0-31', 10000000),
    { start: 0, end: 31, size: 10000000, partial: true },
  );
});

test('suffix ranges have a bounded response', () => {
  assert.deepEqual(
    boundedMediaRange('bytes=-1024', 10000000),
    { start: 9998976, end: 9999999, size: 10000000, partial: true },
  );
});

test('reject invalid / multiple / out of bounds ranges', () => {
  for (const range of ['bytes=100-', 'bytes=5-4', 'bytes=-0', 'bytes=0-10,20-30', 'bytes=NaN-', 'items=0-', 'bytes=1.5-']) {
    assert.throws(() => boundedMediaRange(range, 100), RangeError, range);
  }
});

test('reject oversized chunks to protect serverless function', () => {
  assert.throws(() => boundedMediaRange(null, 50000000, 4 * 1024 * 1024), RangeError);
});
