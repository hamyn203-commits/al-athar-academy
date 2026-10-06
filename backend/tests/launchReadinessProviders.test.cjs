'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { getFeatureProofs } = require('../config/launchReadiness');

const KEYS = [
  'WHATSAPP_CLOUD_TOKEN',
  'WHATSAPP_TOKEN',
  'WHATSAPP_PHONE_NUMBER_ID',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_WHATSAPP_FROM',
  'WHATSAPP_E2E_VERIFIED',
];

function withCleanWhatsAppEnv(fn) {
  const snapshot = Object.fromEntries(KEYS.map((key) => [key, process.env[key]]));
  for (const key of KEYS) delete process.env[key];

  try {
    return fn();
  } finally {
    for (const [key, value] of Object.entries(snapshot)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test('launch readiness accepts Meta WhatsApp Cloud configuration', () => {
  withCleanWhatsAppEnv(() => {
    process.env.WHATSAPP_CLOUD_TOKEN = 'test-token';
    process.env.WHATSAPP_PHONE_NUMBER_ID = '123456789';

    const proof = getFeatureProofs().whatsapp;
    assert.equal(proof.configured, true);
    assert.equal(proof.provider, 'meta-cloud');
    assert.equal(proof.e2eVerified, false);
  });
});

test('launch readiness accepts Twilio WhatsApp configuration', () => {
  withCleanWhatsAppEnv(() => {
    process.env.TWILIO_ACCOUNT_SID = 'AC-test';
    process.env.TWILIO_AUTH_TOKEN = 'test-token';
    process.env.TWILIO_WHATSAPP_FROM = 'whatsapp:+10000000000';

    const proof = getFeatureProofs().whatsapp;
    assert.equal(proof.configured, true);
    assert.equal(proof.provider, 'twilio');
  });
});

test('WhatsApp launch proof remains fail-closed without a complete provider config', () => {
  withCleanWhatsAppEnv(() => {
    process.env.WHATSAPP_CLOUD_TOKEN = 'token-without-phone-id';

    const proof = getFeatureProofs().whatsapp;
    assert.equal(proof.configured, false);
    assert.equal(proof.provider, null);
  });
});
