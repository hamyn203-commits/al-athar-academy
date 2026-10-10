'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { attendanceDecision } = require('../services/subscriptionUsage');

test('eligible early excuse preserves the subscription credit', () => {
  assert.deepEqual(
    attendanceDecision({ status: 'excused', eligibleForCompensation: true }),
    { outcome: 'compensated', reason: 'eligible_excuse' }
  );
});

test('late excuse and absence consume the subscription credit', () => {
  assert.deepEqual(
    attendanceDecision({ status: 'excused', eligibleForCompensation: false }),
    { outcome: 'consumed', reason: 'late_excuse' }
  );
  assert.deepEqual(
    attendanceDecision({ status: 'absent' }),
    { outcome: 'consumed', reason: 'absent' }
  );
});

test('attended confirmed and pending roster entries consume one credit', () => {
  assert.deepEqual(
    attendanceDecision({ status: 'attended' }),
    { outcome: 'consumed', reason: 'attended' }
  );
  assert.deepEqual(
    attendanceDecision({ status: 'confirmed' }),
    { outcome: 'consumed', reason: 'confirmed' }
  );
  assert.deepEqual(
    attendanceDecision({ status: 'pending' }),
    { outcome: 'consumed', reason: 'pending' }
  );
});
