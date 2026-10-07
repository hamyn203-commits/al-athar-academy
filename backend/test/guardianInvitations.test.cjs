const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizePhone, maskPhone } = require('../utils/phone');

test('normalizes Egyptian guardian phones consistently', () => {
  assert.equal(normalizePhone('010 1234 5678'), '+201012345678');
  assert.equal(normalizePhone('+20 10 1234 5678'), '+201012345678');
  assert.equal(normalizePhone('00201012345678'), '+201012345678');
  assert.equal(normalizePhone('201012345678'), '+201012345678');
});

test('rejects unusable phones and masks stored guardian identity', () => {
  assert.equal(normalizePhone('123'), '');
  assert.equal(normalizePhone(''), '');
  assert.equal(maskPhone('01012345678'), '+201••••5678');
});

test('keeps non-Egyptian international numbers canonical', () => {
  assert.equal(normalizePhone('+966 50 123 4567'), '+966501234567');
});
