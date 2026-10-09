const test = require('node:test');
const assert = require('node:assert/strict');

const {
  sessionParticipantWindow,
  meetingVisibleToRole,
} = require('../services/sessionAccess');

const scheduledAt = new Date('2026-10-09T06:30:00.000Z');

function session(overrides = {}) {
  return {
    scheduledAt,
    duration: 60,
    status: 'accepted',
    ...overrides,
  };
}

test('join window opens 30 minutes before and closes one hour after lesson duration', () => {
  assert.equal(sessionParticipantWindow(session(), new Date('2026-10-09T05:59:59.000Z')).within, false);
  assert.equal(sessionParticipantWindow(session(), new Date('2026-10-09T06:00:00.000Z')).within, true);
  assert.equal(sessionParticipantWindow(session(), new Date('2026-10-09T08:30:00.000Z')).within, true);
  assert.equal(sessionParticipantWindow(session(), new Date('2026-10-09T08:30:00.001Z')).within, false);
});

test('non-admin meeting link is hidden outside accepted session join window', () => {
  assert.equal(meetingVisibleToRole(session(), 'student', new Date('2026-10-09T05:30:00.000Z')), false);
  assert.equal(meetingVisibleToRole(session(), 'teacher', new Date('2026-10-09T09:00:00.000Z')), false);
  assert.equal(meetingVisibleToRole(session(), 'student', new Date('2026-10-09T07:00:00.000Z')), true);
  assert.equal(meetingVisibleToRole(session({ status: 'completed' }), 'student', new Date('2026-10-09T07:00:00.000Z')), false);
});

test('admin can inspect meeting metadata regardless of participant join window', () => {
  assert.equal(meetingVisibleToRole(session({ status: 'completed' }), 'admin', new Date('2026-10-10T07:00:00.000Z')), true);
});
