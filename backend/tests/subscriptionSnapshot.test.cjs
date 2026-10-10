'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const StudentSubscription = require('../models/StudentSubscription');
const { quoteSubscription } = require('../config/subscriptionPlans');
test('community checkout snapshots validate the approved twenty-learner capacity', async () => {
  for (const sessionCount of [4, 8, 12, 24]) {
    const quote = quoteSubscription({ planKey: 'community', sessionCount });
    const subscription = new StudentSubscription({
      student: new mongoose.Types.ObjectId(), planKey: 'community', section: 'men_children',
      sessionCount, sessionsUsed: 0, sessionsRemaining: sessionCount,
      pricePerSessionMinor: quote.pricePerSessionMinor, totalAmountMinor: quote.totalAmountMinor,
      pricingSnapshot: { minStudents: quote.plan.minStudents, maxStudents: quote.plan.maxStudents },
    });
    await subscription.validate();
    assert.equal(subscription.pricingSnapshot.maxStudents, 20);
    assert.equal(subscription.totalAmountMinor, sessionCount * 1000);
  }
});
