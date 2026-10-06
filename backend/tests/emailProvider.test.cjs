'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { getEmailProviderStatus } = require('../config/emailProvider');

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

test('selected SMTP provider fails closed until all SMTP credentials exist', () => {
  withEnv({
    EMAIL_PROVIDER: 'smtp',
    SMTP_USER: 'sender@example.com',
    SMTP_PASS: undefined,
    RESEND_API_KEY: 'resend-present-but-not-selected',
  }, () => {
    assert.deepEqual(getEmailProviderStatus(), {
      provider: 'smtp',
      configured: false,
    });
  });
});

test('selected SMTP provider becomes configured with app-password credentials', () => {
  withEnv({
    EMAIL_PROVIDER: 'smtp',
    SMTP_USER: 'sender@example.com',
    SMTP_PASS: 'example-app-password',
    RESEND_API_KEY: undefined,
  }, () => {
    assert.deepEqual(getEmailProviderStatus(), {
      provider: 'smtp',
      configured: true,
    });
  });
});

test('Resend remains available when explicitly selected', () => {
  withEnv({
    EMAIL_PROVIDER: 'resend',
    SMTP_USER: undefined,
    SMTP_PASS: undefined,
    EMAIL_FROM: 'Sender <noreply@example.com>',
    RESEND_API_KEY: 'resend-key-present',
  }, () => {
    assert.deepEqual(getEmailProviderStatus(), {
      provider: 'resend',
      configured: true,
    });
  });
});
