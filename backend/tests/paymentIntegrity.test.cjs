'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  normalizeCurrency,
  toMinorUnits,
  canTransitionPayment,
  assertPaymentTransition,
  providerEventKey,
} = require('../utils/paymentIntegrity');

const Payment = require('../models/Payment');
const PaymentWebhookEvent = require('../models/PaymentWebhookEvent');

test('payment amounts are normalized to integer minor units', () => {
  assert.equal(normalizeCurrency('egp'), 'EGP');
  assert.equal(toMinorUnits(100, 'EGP'), 10000);
  assert.equal(toMinorUnits('12.34', 'USD'), 1234);
  assert.equal(toMinorUnits(1.005, 'USD'), 101);

  assert.throws(() => toMinorUnits(0, 'USD'), /greater than zero/);
  assert.throws(() => toMinorUnits(10, 'BTC'), /Unsupported payment currency/);
});

test('payment state machine allows only monotonic settlement transitions', () => {
  assert.equal(canTransitionPayment('created', 'pending'), true);
  assert.equal(canTransitionPayment('created', 'failed'), true);
  assert.equal(canTransitionPayment('pending', 'succeeded'), true);
  assert.equal(canTransitionPayment('pending', 'failed'), true);
  assert.equal(canTransitionPayment('succeeded', 'refunded'), true);

  assert.equal(canTransitionPayment('succeeded', 'pending'), false);
  assert.equal(canTransitionPayment('refunded', 'succeeded'), false);
  assert.equal(canTransitionPayment('failed', 'pending'), false);

  assert.equal(assertPaymentTransition('pending', 'succeeded'), true);
  assert.throws(
    () => assertPaymentTransition('succeeded', 'pending'),
    (error) => error?.code === 'INVALID_PAYMENT_TRANSITION'
  );
});

test('provider event keys require stable provider and event ids', () => {
  assert.equal(providerEventKey(' PayMob ', 'evt_123 '), 'paymob:evt_123');
  assert.throws(() => providerEventKey('', 'evt_123'), /required/);
  assert.throws(() => providerEventKey('paymob', ''), /required/);
});

test('course payment records require student, course and integer minor amount', async () => {
  const missingRelations = new Payment({
    kind: 'course_enrollment',
    amountMinor: 10000,
    currency: 'EGP',
  });

  await assert.rejects(
    () => missingRelations.validate(),
    /Course payments require student and course/
  );

  const invalidMinorAmount = new Payment({
    kind: 'course_enrollment',
    student: '507f1f77bcf86cd799439011',
    course: '507f191e810c19729de860ea',
    amountMinor: 100.5,
    currency: 'USD',
  });

  await assert.rejects(
    () => invalidMinorAmount.validate(),
    /safe integer/
  );

  const valid = new Payment({
    kind: 'course_enrollment',
    student: '507f1f77bcf86cd799439011',
    course: '507f191e810c19729de860ea',
    amountMinor: 2500,
    currency: 'USD',
    idempotencyKey: 'course:student:attempt-1',
  });

  await valid.validate();
  assert.equal(valid.status, 'created');
  assert.equal(valid.provider, 'unassigned');
});

test('donation payment records require a donation reference', async () => {
  const payment = new Payment({
    kind: 'donation',
    amountMinor: 5000,
    currency: 'EGP',
  });

  await assert.rejects(
    () => payment.validate(),
    /Donation payments require a donation reference/
  );
});

test('webhook events require a payload hash and enforce provider-event uniqueness contract', async () => {
  const invalid = new PaymentWebhookEvent({
    provider: 'paymob',
    eventId: 'evt-1',
    eventType: 'payment.succeeded',
    payloadHash: 'not-a-sha256',
  });

  await assert.rejects(() => invalid.validate());

  const indexes = PaymentWebhookEvent.schema.indexes();
  const uniqueProviderEvent = indexes.find(([fields, options]) => (
    fields.provider === 1 &&
    fields.eventId === 1 &&
    options.unique === true
  ));

  assert.ok(uniqueProviderEvent, 'provider + eventId unique index must exist');
});