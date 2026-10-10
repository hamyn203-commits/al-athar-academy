import test from 'node:test';
import assert from 'node:assert/strict';
import { uploadTeacherFiles } from '../src/lib/teacherUploadQueue.mjs';

const a = { name: 'a.mp4' }, b = { name: 'b.mp4' }, c = { name: 'c.mp4' };
const job = (file, key = 'video') => ({ key, label: 'فيديو التلاوة', purpose: 'teacher-public', files: [file] });

test('uploads one file at a time and preserves multiple/optional payload shapes', async () => {
  let active = 0, peak = 0;
  const progress = [];
  const result = await uploadTeacherFiles([
    { ...job(a, 'recitationVideo'), files: [a, b], multiple: true },
    { ...job(c, 'optional'), files: [] },
    job(c, 'teachingMethodVideo'),
  ], {
    cache: new Map(), onProgress: p => progress.push(p),
    upload: async file => {
      peak = Math.max(peak, ++active);
      await new Promise(resolve => setTimeout(resolve, 5));
      active--;
      return { url: file.name };
    },
  });
  assert.equal(peak, 1);
  assert.deepEqual(result.recitationVideo, [{ url: 'a.mp4' }, { url: 'b.mp4' }]);
  assert.equal(result.optional, null);
  assert.equal(progress.at(-1).completed, 3);
});

test('a failed upload stops the queue, and manual retry reuses completed files', async () => {
  const cache = new Map(), calls = [];
  let fail = true;
  const upload = async file => {
    calls.push(file);
    if (file === b && fail) throw new TypeError('Failed to fetch');
    return { url: file.name };
  };
  const jobs = [job(a, 'photo'), job(b, 'video'), job(c, 'method')];
  await assert.rejects(uploadTeacherFiles(jobs, { upload, cache }), /فيديو التلاوة.*خدمة رفع الملفات/);
  assert.deepEqual(calls, [a, b]);
  fail = false;
  const result = await uploadTeacherFiles(jobs, { upload, cache });
  assert.deepEqual(calls, [a, b, b, c]);
  assert.equal(result.photo.url, 'a.mp4');
});

test('a replacement File and a different purpose never reuse the old object', async () => {
  const cache = new Map(), calls = [];
  const upload = async (file, purpose) => { calls.push([file, purpose]); return { url: String(calls.length) }; };
  await uploadTeacherFiles([job(a)], { upload, cache });
  await uploadTeacherFiles([job({ ...a })], { upload, cache });
  await uploadTeacherFiles([{ ...job(a), purpose: 'teacher-private' }], { upload, cache });
  assert.equal(calls.length, 3);
});

test('stalled upload is aborted and never cached; later files are not started', async () => {
  const cache = new Map(), calls = [];
  await assert.rejects(uploadTeacherFiles([job(a), job(b)], {
    cache, idleMs: 15,
    upload: async (file, purpose, { abortSignal }) => {
      calls.push(file);
      return new Promise((resolve, reject) => {
        abortSignal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
      });
    },
  }), /توقف تقدم الرفع/);
  assert.equal(cache.size, 0);
  assert.deepEqual(calls, [a]);
});

test('forward byte progress renews the idle deadline and is visible to the UI', async () => {
  const progress = [];
  await uploadTeacherFiles([job(a)], {
    cache: new Map(), idleMs: 100,
    onProgress: p => progress.push(p),
    upload: async (file, purpose, { onUploadProgress }) => {
      onUploadProgress({ loaded: 50, percentage: 50 });
      onUploadProgress({ loaded: 100, percentage: 100 });
      return { url: file.name };
    },
  });
  assert.ok(progress.some(p => p.percentage === 50));
  assert.equal(progress.at(-1).completed, 1);
});

test('rejected authorization is contextual and does not leak provider details', async () => {
  await assert.rejects(uploadTeacherFiles([job(a)], {
    cache: new Map(),
    upload: async () => { throw new Error('provider secret detail'); },
  }), error => {
    assert.match(error.message, /فيديو التلاوة/);
    assert.doesNotMatch(error.message, /provider secret detail/);
    return true;
  });
});
