'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const plans = require('../config/subscriptionPlans');
function fixture({ remaining = 3, queued = false, retry = false } = {}) {
  const notifications = [];
  const usages = new Map();
  const subscription = { _id: 'package', status: 'active', sessionCount: 8, sessionsUsed: 8 - remaining, sessionsRemaining: remaining, save: async () => {} };
  let renewal = queued ? { _id: 'renewal', status: 'renewal_queued', save: async () => {} } : null;
  const query = value => ({ session: async () => value });
  const circle = { students: ['student'], status: 'active', capacity: 20, subscriptionPlanKey: 'community' };
  const module = { exports: {} };
  const dependencies = {
    mongoose: { startSession: async () => ({ endSession: async () => {}, withTransaction: async fn => {
      if (retry) {
        const snapshot = { ...subscription };
        await fn();
        Object.assign(subscription, snapshot); delete subscription.lowBalanceNotifiedAt;
        usages.clear(); retry = false;
      }
      await fn();
    } }) },
    '../models/GroupCircle': { findById: () => ({ select: () => ({ lean: async () => circle }) }), updateOne: async () => {} },
    '../models/StudentSubscription': { findOne: filter => query(filter.renewalOf ? renewal : subscription) },
    '../models/SubscriptionUsage': {
      findOne: filter => query(usages.get(filter.session)),
      create: async ([usage]) => { usages.set(usage.session, usage); },
    },
    '../models/Session': { updateMany: async () => {} },
    '../models/User': { updateOne: async () => {} },
    '../config/subscriptionPlans': plans,
    '../utils/notify': { notifyUser: async (id, payload) => notifications.push(payload) },
  };
  vm.runInNewContext(fs.readFileSync(require.resolve('../services/subscriptionUsage'), 'utf8'), { module, require: id => dependencies[id], Date, Map, Set });
  return { subscription, notifications, service: module.exports, settle: id => module.exports.settleSubscriptionUsageForSession({ _id: id, type: 'group_circle', circle: 'circle', attendance: [{ student: 'student', status: 'attended' }] }) };
}
test('one alert at two remaining; no repeat at one or on lesson replay', async () => {
  const f = fixture();
  await f.settle('lesson-six');
  assert.equal(f.subscription.sessionsRemaining, 2);
  assert.ok(f.subscription.lowBalanceNotifiedAt);
  assert.equal(f.notifications.length, 1);
  await f.settle('lesson-six');
  await f.settle('lesson-seven');
  assert.equal(f.subscription.sessionsRemaining, 1);
  assert.equal(f.notifications.length, 1);
});
test('prepaid renewal suppresses reminder to pay again', async () => {
  const f = fixture({ queued: true });
  await f.settle('lesson-six');
  assert.equal(f.subscription.sessionsRemaining, 2);
  assert.equal(f.notifications.length, 0);
});
test('transaction retry sends one notification after commit', async () => {
  const f = fixture({ retry: true });
  await f.settle('lesson-six');
  assert.equal(f.subscription.sessionsRemaining, 2);
  assert.equal(f.notifications.length, 1);
});
test('eligible excuse keeps credit and does not trigger threshold alert', () => {
  const f = fixture();
  assert.equal(f.service.attendanceDecision({ status: 'excused', eligibleForCompensation: true }).outcome, 'compensated');
  assert.equal(f.service.shouldSendLowBalance({ sessionsRemaining: 3 }, null), false);
  assert.equal(f.service.shouldSendLowBalance({ sessionsRemaining: 2, lowBalanceNotifiedAt: new Date() }, null), false);
});
