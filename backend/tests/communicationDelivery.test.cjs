'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');

function clearCommunicationProviders() {
  delete process.env.WHATSAPP_CLOUD_TOKEN;
  delete process.env.WHATSAPP_TOKEN;
  delete process.env.WHATSAPP_PHONE_NUMBER_ID;
  delete process.env.TWILIO_ACCOUNT_SID;
  delete process.env.TWILIO_AUTH_TOKEN;
  delete process.env.TWILIO_WHATSAPP_FROM;
  delete process.env.TELEGRAM_BOT_TOKEN;
  delete process.env.FCM_SERVER_KEY;
}

test('production communication fallbacks never claim external delivery', async () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousValues = {
    WHATSAPP_CLOUD_TOKEN: process.env.WHATSAPP_CLOUD_TOKEN,
    WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN,
    WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_WHATSAPP_FROM: process.env.TWILIO_WHATSAPP_FROM,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    FCM_SERVER_KEY: process.env.FCM_SERVER_KEY,
  };

  try {
    process.env.NODE_ENV = 'production';
    clearCommunicationProviders();

    const whatsapp = require('../services/whatsapp');
    const dispatcher = require('../services/notificationDispatcher');

    const rawWhatsApp = await whatsapp.sendRawWhatsAppMessage('+201001234567', 'test');
    assert.equal(rawWhatsApp.success, false);
    assert.equal(rawWhatsApp.provider, 'unavailable');
    assert.notEqual(rawWhatsApp.simulated, true);

    const dispatchedWhatsApp = await dispatcher.sendWhatsApp({
      phone: '+201001234567',
      text: 'test',
    });
    assert.equal(dispatchedWhatsApp.sent, false);
    assert.equal(dispatchedWhatsApp.provider, 'not-configured');

    const telegram = await dispatcher.sendTelegram({ chatId: '123', text: 'test' });
    assert.equal(telegram.sent, false);
    assert.equal(telegram.provider, 'not-configured');

    const push = await dispatcher.sendPush({ token: 'test-token', title: 'test', body: 'test' });
    assert.equal(push.sent, false);
    assert.equal(push.provider, 'not-configured');
  } finally {
    if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnv;

    for (const [key, value] of Object.entries(previousValues)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test('failed verification email removes the undelivered OTP record', async () => {
  const modelPath = require.resolve('../models/VerificationCode');
  const routePath = require.resolve('../routes/verification');
  const dispatcher = require('../services/notificationDispatcher');

  const previousModelCache = require.cache[modelPath];
  const previousRouteCache = require.cache[routePath];
  const originalSendEmail = dispatcher.sendEmail;

  let deleteCalls = 0;
  let createCalls = 0;

  require.cache[modelPath] = {
    id: modelPath,
    filename: modelPath,
    loaded: true,
    exports: {
      deleteMany: async () => { deleteCalls += 1; },
      create: async () => { createCalls += 1; },
    },
  };

  dispatcher.sendEmail = async () => {
    throw new Error('provider rejected message');
  };
  delete require.cache[routePath];

  const app = express();
  app.use(express.json());
  app.use('/api/verification', require('../routes/verification'));

  const server = await new Promise((resolve, reject) => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
    instance.once('error', reject);
  });

  try {
    const address = server.address();
    const response = await fetch(
      `http://127.0.0.1:${address.port}/api/verification/send-verification`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'teacher@example.test' }),
      }
    );
    const body = await response.json();

    assert.equal(response.status, 503);
    assert.equal(body.code, 'EMAIL_DELIVERY_FAILED');
    assert.equal(createCalls, 1);
    assert.equal(deleteCalls, 2);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    dispatcher.sendEmail = originalSendEmail;

    delete require.cache[routePath];
    if (previousRouteCache) require.cache[routePath] = previousRouteCache;

    delete require.cache[modelPath];
    if (previousModelCache) require.cache[modelPath] = previousModelCache;
  }
});
