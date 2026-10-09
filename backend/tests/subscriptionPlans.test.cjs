'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  SESSION_PACKS,
  SECTIONS,
  getPlan,
  quoteSubscription,
  publicPlanCatalog,
} = require('../config/subscriptionPlans');

test('subscription catalog exposes the five approved plans and package sizes', () => {
  const catalog = publicPlanCatalog();

  assert.deepEqual(catalog.sessionPacks, [4, 8, 12, 24]);
  assert.deepEqual(catalog.sections, ['men_children', 'ladies']);
  assert.equal(catalog.currency, 'EGP');
  assert.equal(catalog.plans.length, 5);

  assert.equal(getPlan('community').pricePerSessionMinor, 1000);
  assert.equal(getPlan('community').minStudents, 10);
  assert.equal(getPlan('community').maxStudents, 15);
  assert.equal(getPlan('community').durationMinMinutes, 60);
  assert.equal(getPlan('community').durationMaxMinutes, 120);

  assert.equal(getPlan('group').pricePerSessionMinor, 2000);
  assert.equal(getPlan('group').minStudents, 5);
  assert.equal(getPlan('group').maxStudents, 10);
  assert.equal(getPlan('group').durationMaxMinutes, 120);

  assert.equal(getPlan('focused').pricePerSessionMinor, 3500);
  assert.equal(getPlan('focused').durationMinMinutes, 90);
  assert.equal(getPlan('focused').durationMaxMinutes, 90);

  assert.equal(getPlan('mini').pricePerSessionMinor, 5000);
  assert.equal(getPlan('mini').maxStudents, 3);
  assert.equal(getPlan('mini').durationMaxMinutes, 60);

  assert.equal(getPlan('private').pricePerSessionMinor, 10000);
  assert.equal(getPlan('private').maxStudents, 1);
  assert.equal(getPlan('private').durationMaxMinutes, 60);

  assert.deepEqual(SESSION_PACKS, [4, 8, 12, 24]);
  assert.deepEqual(SECTIONS, ['men_children', 'ladies']);
});

test('subscription quote is server-derived for every approved session pack', () => {
  for (const count of [4, 8, 12, 24]) {
    const quote = quoteSubscription({ planKey: 'group', sessionCount: count });
    assert.equal(quote.pricePerSessionMinor, 2000);
    assert.equal(quote.totalAmountMinor, 2000 * count);
    assert.equal(quote.currency, 'EGP');
  }

  const community24 = quoteSubscription({ planKey: 'community', sessionCount: 24 });
  assert.equal(community24.totalAmountMinor, 24000);

  const private24 = quoteSubscription({ planKey: 'private', sessionCount: 24 });
  assert.equal(private24.totalAmountMinor, 240000);
});

test('subscription quote rejects unknown plans and arbitrary package sizes', () => {
  assert.throws(
    () => quoteSubscription({ planKey: 'fake', sessionCount: 8 }),
    (error) => error.code === 'SUBSCRIPTION_PLAN_INVALID'
  );

  assert.throws(
    () => quoteSubscription({ planKey: 'group', sessionCount: 7 }),
    (error) => error.code === 'SUBSCRIPTION_PACK_INVALID'
  );
});
