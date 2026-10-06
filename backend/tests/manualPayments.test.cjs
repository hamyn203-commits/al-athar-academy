'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateUploadMetadata } = require('../config/uploadPolicy');
const manualPayments = require('../config/manualPayments');

function withEnv(values, fn) {
  const previous = {};
  for (const [key, value] of Object.entries(values)) {
    previous[key] = process.env[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }

  try {
    return fn();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test('manual payment config fails closed without an enabled destination', () => {
  withEnv({
    MANUAL_PAYMENT_ENABLED: 'false',
    MANUAL_PAYMENT_INSTAPAY: 'example@instapay',
    MANUAL_PAYMENT_VODAFONE_CASH: undefined,
    MANUAL_PAYMENT_BANK_DETAILS: undefined,
  }, () => {
    const config = manualPayments.getPublicConfig();
    assert.equal(config.provider, 'manual');
    assert.equal(config.configured, false);
    assert.deepEqual(config.methods, []);
  });
});

test('manual payment config exposes only configured payer destinations', () => {
  withEnv({
    MANUAL_PAYMENT_ENABLED: 'true',
    MANUAL_PAYMENT_RECIPIENT_NAME: 'Wahy Wa Namaa',
    MANUAL_PAYMENT_INSTAPAY: 'wahy@example',
    MANUAL_PAYMENT_VODAFONE_CASH: '01000000000',
    MANUAL_PAYMENT_BANK_DETAILS: undefined,
  }, () => {
    const config = manualPayments.getPublicConfig();
    assert.equal(config.configured, true);
    assert.equal(config.checkoutMode, 'manual-review');
    assert.equal(config.recipientName, 'Wahy Wa Namaa');
    assert.deepEqual(config.methods.map((item) => item.id), ['instapay', 'vodafone_cash']);
    assert.equal(manualPayments.getMethod('instapay').destination, 'wahy@example');
    assert.equal(manualPayments.getMethod('bank_transfer'), null);
  });
});

test('payment proof uploads are private-purpose student files only', () => {
  const accepted = validateUploadMetadata({
    purpose: 'payment-proof',
    role: 'student',
    filename: 'receipt.png',
    contentType: 'image/png',
    size: 1024,
  });
  assert.equal(accepted.contentType, 'image/png');

  assert.throws(() => validateUploadMetadata({
    purpose: 'payment-proof',
    role: 'teacher',
    filename: 'receipt.png',
    contentType: 'image/png',
    size: 1024,
  }), /Not allowed/);
});
