'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  normalizeSchedule,
  circleGenderForStudent,
  ageGroupForStudent,
} = require('../services/subscriptionPlacement');

test('subscription placement derives the correct learner group profile', () => {
  assert.equal(circleGenderForStudent({ gender: 'male', age: 25 }, 'men_children'), 'men');
  assert.equal(circleGenderForStudent({ gender: 'female', age: 11 }, 'men_children'), 'girls');
  assert.equal(circleGenderForStudent({ gender: 'female', age: 28 }, 'ladies'), 'women');
  assert.equal(circleGenderForStudent({ gender: 'female', age: 14 }, 'ladies'), 'girls');

  assert.equal(ageGroupForStudent({ age: 6 }), 'kids_4_7');
  assert.equal(ageGroupForStudent({ age: 10 }), 'kids_8_12');
  assert.equal(ageGroupForStudent({ age: 15 }), 'teens_13_17');
  assert.equal(ageGroupForStudent({ age: 30 }), 'adults');
});

test('subscription placement keeps only valid schedule rows', () => {
  assert.deepEqual(
    normalizeSchedule([
      { day: 'Saturday', startTime: '18:00', endTime: '19:00' },
      { day: 'BadDay', startTime: '18:00', endTime: '19:00' },
      { day: 'Sunday', startTime: '99:00', endTime: '19:00' },
    ]),
    [{ day: 'Saturday', startTime: '18:00', endTime: '19:00' }]
  );
});
