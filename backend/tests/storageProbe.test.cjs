'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const storage = require('../services/objectStorage');

test('disposable lifecycle probe keys stay inside the e2e prefix', () => {
  const key = storage.createLifecycleProbeKey();
  assert.match(key, /^uploads\/e2e\/[^/]+\/probe\.txt$/);
  assert.equal(storage.isSafeObjectPath(key), true);
});

test('e2e probe keys are unique', () => {
  const first = storage.createLifecycleProbeKey();
  const second = storage.createLifecycleProbeKey();
  assert.notEqual(first, second);
});
