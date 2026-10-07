'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  zonedParts,
  localDateTimeToUtc,
  parseRequestedDateTime,
  teacherAvailabilityDecision,
  overlaps,
  generateTeacherSlotStarts,
} = require('../services/sessionScheduling');

test('local teacher time round-trips through an IANA timezone', () => {
  const utc = localDateTimeToUtc('2026-10-12T18:30:00', 'Africa/Cairo');
  assert.ok(utc instanceof Date);
  const parts = zonedParts(utc, 'Africa/Cairo');
  assert.equal(parts.year, 2026);
  assert.equal(parts.month, 10);
  assert.equal(parts.day, 12);
  assert.equal(parts.hour, 18);
  assert.equal(parts.minute, 30);
});

test('booking parser treats offset-free values as wall time in the supplied timezone', () => {
  const parsed = parseRequestedDateTime('2026-10-12T18:30:00', 'Asia/Riyadh');
  const parts = zonedParts(parsed, 'Asia/Riyadh');
  assert.equal(parts.hour, 18);
  assert.equal(parts.minute, 30);
});

test('teacher availability requires the whole session to fit inside a configured slot', () => {
  const teacher = {
    availabilityTimezone: 'Africa/Cairo',
    availability: [{
      day: 'monday',
      slots: [{ startTime: '18:00', endTime: '20:00' }],
    }],
  };

  const inside = localDateTimeToUtc('2026-10-12T18:30:00', 'Africa/Cairo');
  const tooLate = localDateTimeToUtc('2026-10-12T19:30:00', 'Africa/Cairo');

  assert.equal(teacherAvailabilityDecision(teacher, inside, 60).allowed, true);
  assert.equal(teacherAvailabilityDecision(teacher, tooLate, 60).allowed, false);
});

test('session overlap detection catches partial and exact collisions', () => {
  const first = new Date('2026-10-12T15:00:00.000Z');
  assert.equal(overlaps(first, 60, new Date('2026-10-12T15:30:00.000Z'), 60), true);
  assert.equal(overlaps(first, 60, new Date('2026-10-12T16:00:00.000Z'), 60), false);
  assert.equal(overlaps(first, 60, first, 60), true);
});

test('slot generation respects weekly availability and session duration', () => {
  const teacher = {
    availabilityTimezone: 'Africa/Cairo',
    availability: [{
      day: 'monday',
      slots: [{ startTime: '18:00', endTime: '20:00' }],
    }],
  };

  const now = localDateTimeToUtc('2026-10-12T12:00:00', 'Africa/Cairo');
  const slots = generateTeacherSlotStarts(teacher, {
    days: 1,
    intervalMinutes: 30,
    durationMinutes: 60,
    now,
  });

  assert.deepEqual(
    slots.map((slot) => slot.teacherLocalTime),
    ['18:00', '18:30', '19:00'],
  );
});
