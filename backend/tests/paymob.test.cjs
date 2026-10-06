'use strict';

const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const paymob = require('../services/paymob');

const ENV_KEYS = [
  'PAYMOB_ENABLED',
  'PAYMOB_BASE_URL',
  'PAYMOB_SECRET_KEY',
  'PAYMOB_PUBLIC_KEY',
  'PAYMOB_HMAC_SECRET',
  'PAYMOB_INTEGRATION_IDS',
  'PAYMOB_INTEGRATION_ID_CARD',
];

const originalEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
});

function configurePaymob() {
  process.env.PAYMOB_ENABLED = 'true';
  process.env.PAYMOB_BASE_URL = 'https://accept.paymob.com';
  process.env.PAYMOB_SECRET_KEY = 'sk_test_example';
  process.env.PAYMOB_PUBLIC_KEY = 'pk_test_example';
  process.env.PAYMOB_HMAC_SECRET = 'hmac-test-secret';
  process.env.PAYMOB_INTEGRATION_IDS = '123,456,123';
}

function sampleTransaction() {
  return {
    amount_cents: 100,
    created_at: '2020-03-25T18:39:44.719228',
    currency: 'EGP',
    error_occured: false,
    has_parent_transaction: false,
    id: 2556706,
    integration_id: 6741,
    is_3d_secure: true,
    is_auth: false,
    is_capture: false,
    is_refunded: false,
    is_standalone_payment: true,
    is_voided: false,
    order: { id: 4778239, merchant_order_id: '507f1f77bcf86cd799439011' },
    owner: 4705,
    pending: false,
    source_data: {
      pan: 2346,
      sub_type: 'MasterCard',
      type: 'card',
    },
    success: true,
  };
}

test('Paymob remains disabled until every required merchant credential is configured', () => {
  delete process.env.PAYMOB_ENABLED;
  delete process.env.PAYMOB_SECRET_KEY;
  delete process.env.PAYMOB_PUBLIC_KEY;
  delete process.env.PAYMOB_HMAC_SECRET;
  delete process.env.PAYMOB_INTEGRATION_IDS;

  assert.equal(paymob.isConfigured(), false);

  configurePaymob();
  assert.equal(paymob.isConfigured(), true);
  assert.deepEqual(paymob.getIntegrationIds(), [123, 456]);
});

test('Paymob base URL is restricted to official regional HTTPS hosts', () => {
  assert.equal(
    paymob.normalizeBaseUrl('https://accept.paymob.com/path'),
    'https://accept.paymob.com'
  );

  assert.throws(
    () => paymob.normalizeBaseUrl('https://accept.paymob.com.evil.example'),
    /Unsupported Paymob base URL/
  );

  assert.throws(
    () => paymob.normalizeBaseUrl('http://accept.paymob.com'),
    /Unsupported Paymob base URL/
  );
});

test('transaction HMAC uses the documented 20-field Paymob order', () => {
  const obj = sampleTransaction();
  const concatenated = paymob.transactionHmacValues(obj).map(String).join('');

  assert.equal(
    concatenated,
    '1002020-03-25T18:39:44.719228EGPfalsefalse25567066741truefalsefalsefalsetruefalse47782394705false2346MasterCardcardtrue'
  );

  const secret = 'merchant-hmac-secret';
  const expected = crypto
    .createHmac('sha512', secret)
    .update(concatenated)
    .digest('hex');

  assert.equal(paymob.computeTransactionHmac(obj, secret), expected);
  assert.equal(paymob.verifyTransactionPostHmac(obj, expected, secret), true);

  const tampered = { ...obj, amount_cents: 101 };
  assert.equal(paymob.verifyTransactionPostHmac(tampered, expected, secret), false);
});

test('transaction classification never treats a pending callback as settled', () => {
  const obj = sampleTransaction();
  assert.equal(paymob.classifyTransaction(obj), 'succeeded');
  assert.equal(paymob.classifyTransaction({ ...obj, pending: true }), 'pending');
  assert.equal(paymob.classifyTransaction({ ...obj, success: false }), 'failed');
  assert.equal(paymob.classifyTransaction({ ...obj, is_voided: true }), 'cancelled');
  assert.equal(paymob.classifyTransaction({ ...obj, is_refunded: true }), 'refunded');
});

test('Paymob intention uses Token auth, configured methods and server supplied callbacks', async () => {
  configurePaymob();

  let request = null;
  const fetchImpl = async (url, options) => {
    request = { url, options, body: JSON.parse(options.body) };
    return {
      ok: true,
      status: 201,
      async json() {
        return {
          id: 'pi_test_123',
          intention_order_id: 998877,
          client_secret: 'client_secret_123',
        };
      },
    };
  };

  const result = await paymob.createIntention({
    amountMinor: 12500,
    currency: 'EGP',
    specialReference: '507f1f77bcf86cd799439011',
    customer: {
      firstName: 'Hossam',
      lastName: 'Amin',
      email: 'customer@example.com',
      phone: '+201000000000',
      country: 'EGY',
    },
    items: [{
      name: 'Course',
      amount: 12500,
      quantity: 1,
      description: 'Course checkout',
    }],
    notificationUrl: 'https://api.example.com/api/payments/paymob/webhook',
    redirectionUrl: 'https://example.com/ar/payment/return?payment=507f1f77bcf86cd799439011',
  }, { fetchImpl });

  assert.equal(request.url, 'https://accept.paymob.com/v1/intention/');
  assert.equal(request.options.headers.Authorization, 'Token sk_test_example');
  assert.equal(request.body.amount, 12500);
  assert.equal(request.body.currency, 'EGP');
  assert.deepEqual(request.body.payment_methods, [123, 456]);
  assert.equal(request.body.billing_data.phone_number, '+201000000000');
  assert.equal(request.body.special_reference, '507f1f77bcf86cd799439011');
  assert.equal(request.body.notification_url, 'https://api.example.com/api/payments/paymob/webhook');
  assert.match(request.body.redirection_url, /payment\/return/);
  assert.equal(result.id, 'pi_test_123');
  assert.equal(result.orderId, '998877');
  assert.match(result.checkoutUrl, /^https:\/\/accept\.paymob\.com\/unifiedcheckout\//);
  assert.match(result.checkoutUrl, /publicKey=pk_test_example/);
  assert.match(result.checkoutUrl, /clientSecret=client_secret_123/);
});

test('customer name splitting always supplies Paymob first and last names', () => {
  assert.deepEqual(
    paymob.splitCustomerName('Hossam Amin'),
    { firstName: 'Hossam', lastName: 'Amin' }
  );
  assert.deepEqual(
    paymob.splitCustomerName('Hossam'),
    { firstName: 'Hossam', lastName: 'Hossam' }
  );
});
