'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const plans = require('../config/subscriptionPlans');
function loadService(name, dependencies) {
  const module = { exports: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../services', name), 'utf8'), {
    module, exports: module.exports, require: id => {
      if (id === '../config/subscriptionPlans') return plans;
      if (!(id in dependencies)) throw new Error('Missing test dependency: ' + id);
      return dependencies[id];
    }, Intl, Date, Set, Map,
  });
  return module.exports;
}
const query = value => ({ session: async () => value });
function startFixture(count, status = 'ready') {
  const circle = { _id: 'circle', subscriptionPlanKey: 'community', status, students: Array.from({ length: count }, (_, i) => 's' + i), teacher: 'teacher', save: async () => {} };
  let activations = 0;
  const service = loadService('subscriptionPlacement.js', {
    mongoose: { startSession: async () => ({ withTransaction: async fn => fn(), endSession: async () => {} }) },
    '../models/GroupCircle': { findById: () => query(circle) },
    '../models/Teacher': { findOne: () => query({ user: 't' }) },
    '../models/User': {},
    '../models/StudentSubscription': { find: () => query(circle.students.map(student => ({ _id: student, student }))), updateMany: async () => { activations++; } },
  });
  return { circle, service, activations: () => activations };
}
const schedule = [{ day: 'Saturday', startTime: '18:00', endTime: '19:00' }];
test('14 learners cannot start; 15 can start without charging credits', async () => {
  const small = startFixture(14);
  await assert.rejects(small.service.startSubscriptionCircle({ circleId: 'circle', schedule }), { code: 'CIRCLE_NOT_READY' });
  assert.equal(small.activations(), 0);
  const ready = startFixture(15);
  const result = await ready.service.startSubscriptionCircle({ circleId: 'circle', schedule });
  assert.equal(ready.circle.status, 'active');
  assert.equal(ready.circle.capacity, 20);
  assert.equal(result.studentIds.length, 15);
  assert.equal(ready.activations(), 1);
});
test('full group requires explicit start and repeated start activates once', async () => {
  const ready = startFixture(20);
  await ready.service.startSubscriptionCircle({ circleId: 'circle', schedule });
  assert.equal(ready.circle.status, 'full');
  const repeat = await ready.service.startSubscriptionCircle({ circleId: 'circle', schedule });
  assert.equal(repeat.alreadyStarted, true);
  assert.equal(ready.activations(), 1);
});
test('missing reversed short and invalid-zone schedules cannot activate subscriptions', async () => {
  const fixture = startFixture(15);
  for (const input of [[], [{ ...schedule[0], endTime: '17:00' }], [{ ...schedule[0], endTime: '18:30' }]]) {
    await assert.rejects(fixture.service.startSubscriptionCircle({ circleId: 'circle', schedule: input }));
  }
  await assert.rejects(fixture.service.startSubscriptionCircle({ circleId: 'circle', schedule, timezone: 'invalid/timezone' }), { code: 'CIRCLE_TIMEZONE_INVALID' });
  assert.equal(fixture.activations(), 0);
});
test('replaying an old lesson cannot consume a newly activated renewal', async () => {
  let reads = 0;
  const circleQuery = { select: () => ({ lean: async () => ({ students: ['student'], status: 'active', capacity: 20, subscriptionPlanKey: 'community' }) }) };
  const service = loadService('subscriptionUsage.js', {
    mongoose: { startSession: async () => ({ withTransaction: async fn => fn(), endSession: async () => {} }) },
    '../models/GroupCircle': { findById: () => circleQuery, updateOne: async () => {} },
    '../models/StudentSubscription': { findOne: () => { reads++; throw new Error('Renewal must not be read'); } },
    '../models/SubscriptionUsage': { findOne: filter => { assert.equal(filter.student, 'student'); assert.equal(filter.session, 'lesson'); return query({ outcome: 'consumed' }); } },
    '../models/Session': {}, '../models/User': {}, '../utils/notify': { notifyUser: async () => {} },
  });
  const result = await service.settleSubscriptionUsageForSession({ _id: 'lesson', type: 'group_circle', circle: 'circle', attendance: [{ student: 'student', status: 'attended' }] });
  assert.equal(result.usages[0].alreadyProcessed, true);
  assert.equal(reads, 0);
});
test('placing the fifteenth learner marks the circle ready and leaves all credits waiting', async () => {
  const circle = { _id: 'circle', name: 'Group', capacity: 15, status: 'forming', students: Array.from({ length: 14 }, (_, i) => 's' + i), save: async () => {} };
  const subscription = { _id: 'subscription', student: 'new', status: 'awaiting_placement', preferredTeacher: 'teacher', planKey: 'community', section: 'men_children', sessionsRemaining: 4, save: async () => {} };
  const student = { _id: 'new', name: 'New', gender: 'male', age: 20, save: async () => {} };
  const service = loadService('subscriptionPlacement.js', {
    mongoose: { startSession: async () => ({ withTransaction: async fn => fn(), endSession: async () => {} }) },
    '../models/GroupCircle': { findOne: () => query(circle) },
    '../models/Teacher': { findOne: () => query({ _id: 'teacher' }) },
    '../models/User': { findById: () => ({ select: () => query(student) }) },
    '../models/StudentSubscription': { findById: () => query(subscription), updateMany: async () => { throw new Error('Placement must not activate cohort'); } },
  });
  const result = await service.placeSubscription({ subscriptionId: 'subscription', existingCircleId: 'circle' });
  assert.equal(result.circleStatus, 'ready');
  assert.equal(subscription.status, 'placed');
  assert.equal(subscription.sessionsRemaining, 4);
  assert.equal(circle.capacity, 20);
  assert.equal(subscription.startedAt, undefined);
});
