const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { verifyGoogleCredential } = require('../services/googleIdentity');

test('Google verifier checks signature, audience, email verification and expiration', async () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const jwk = publicKey.export({ format: 'jwk' });
  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    headers: { get: () => 'public, max-age=30' },
    json: async () => ({ keys: [{ ...jwk, kid: 'test-key', use: 'sig' }] }),
  });
  const token = (claims = {}) => {
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', kid: 'test-key' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({
      iss: 'https://accounts.google.com', aud: 'academy-client',
      sub: 'google-123', email: 'student@gmail.com', email_verified: true,
      iat: Math.floor(Date.now() / 1000) - 5,
      exp: Math.floor(Date.now() / 1000) + 120,
      ...claims,
    })).toString('base64url');
    const signature = crypto.sign('RSA-SHA256', Buffer.from(header + '.' + payload), privateKey).toString('base64url');
    return [header, payload, signature].join('.');
  };
  try {
    const identity = await verifyGoogleCredential(token(), 'academy-client');
    assert.equal(identity.email, 'student@gmail.com');
    await assert.rejects(verifyGoogleCredential(token({ aud: 'other' }), 'academy-client'));
    await assert.rejects(verifyGoogleCredential(token({ email_verified: false }), 'academy-client'));
    await assert.rejects(verifyGoogleCredential(token({ exp: 1 }), 'academy-client'));
    const valid = token();
    await assert.rejects(verifyGoogleCredential(valid.slice(0, -2) + 'aa', 'academy-client'));
  } finally {
    global.fetch = originalFetch;
  }
});
