'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { calculateSessionEarning } = require('../services/teacherFinance');

test('teacher earning scales from the hourly rate by session duration', () => {
  assert.equal(calculateSessionEarning(50, 60), 50);
  assert.equal(calculateSessionEarning(50, 90), 75);
  assert.equal(calculateSessionEarning(50, 120), 100);
  assert.equal(calculateSessionEarning(50, 30), 25);
});

test('teacher earning supports custom hourly rates and rejects invalid inputs', () => {
  assert.equal(calculateSessionEarning(80, 90), 120);
  assert.throws(() => calculateSessionEarning(-1, 60));
  assert.throws(() => calculateSessionEarning(50, 0));
});
