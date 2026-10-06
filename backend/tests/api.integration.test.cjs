'use strict';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');

process.env.NODE_ENV = 'test';
process.env.DISABLE_RATE_LIMIT = 'true';
process.env.JWT_SECRET = 't03-test-access-secret-1234567890-abcdef';
process.env.JWT_REFRESH_SECRET = 't03-test-refresh-secret-1234567890-abcdef';
delete process.env.MONGODB_URI;
delete process.env.MONGODB_URL;

const app = require('../app');

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve, reject) => {
    server = app.listen(0, '127.0.0.1', () => {
      const address = server.address();
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
    server.once('error', reject);
  });
});

after(async () => {
  if (!server) return;
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  return { response, body };
}

function jsonOptions(method, body, headers = {}) {
  return {
    method,
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  };
}

function cookiePair(setCookie) {
  return String(setCookie || '').split(';')[0];
}

test('health endpoint stays public and unknown routes fail closed', async () => {
  const health = await request('/api/health');
  assert.equal(health.response.status, 200);
  assert.equal(health.body.status, 'ok');
  assert.equal(health.body.service, 'wahy-wa-namaa-api');

  const missing = await request('/api/route-that-does-not-exist');
  assert.equal(missing.response.status, 404);
  assert.equal(missing.body.error, 'Route not found');
});

test('launch readiness fails closed until external launch proofs exist', async () => {
  const result = await request('/api/launch-readiness');

  assert.equal(result.response.status, 503);
  assert.equal(result.body.ready, false);
  assert.equal(result.body.mode, 'public');
  assert.deepEqual(result.body.requiredFeatures, ['email', 'manual-payment', 'livekit', 'whatsapp']);
  assert.equal(Array.isArray(result.body.blockers), true);
  assert.equal(result.body.blockers.length > 0, true);
  assert.equal(JSON.stringify(result.body).includes('JWT_SECRET'), false);
  assert.equal(JSON.stringify(result.body).includes('PAYMOB_SECRET_KEY'), false);
  assert.equal(JSON.stringify(result.body).includes('RESEND_API_KEY'), false);
});

test('CORS rejects an untrusted browser origin', async () => {
  const result = await request('/api/health', {
    headers: { Origin: 'https://evil.example' },
  });

  assert.equal(result.response.status, 403);
  assert.equal(result.body.error, 'Origin not allowed');
});

test('minor trial requests require a guardian while adult requests remain allowed', async () => {
  const baseTrial = {
    studentName: 'Safeguarding Student',
    whatsappPhone: '+201000000001',
    gender: 'male',
    preferredTrack: 'memorization',
  };

  const minorWithoutGuardian = await request('/api/trials', jsonOptions('POST', {
    ...baseTrial,
    age: 12,
  }));
  assert.equal(minorWithoutGuardian.response.status, 400);
  assert.match(minorWithoutGuardian.body.error, /ولي الأمر/);

  const minorWithGuardian = await request('/api/trials', jsonOptions('POST', {
    ...baseTrial,
    age: 12,
    guardianName: 'Responsible Guardian',
  }));
  assert.equal(minorWithGuardian.response.status, 201);
  assert.equal(minorWithGuardian.body.trial.guardianName, 'Responsible Guardian');

  const adultWithoutGuardian = await request('/api/trials', jsonOptions('POST', {
    ...baseTrial,
    studentName: 'Adult Student',
    age: 22,
  }));
  assert.equal(adultWithoutGuardian.response.status, 201);
});

test('manual payment config fails closed until a transfer destination is configured', async () => {
  const result = await request('/api/payments/config');

  assert.equal(result.response.status, 200);
  assert.equal(result.body.provider, 'manual');
  assert.equal(result.body.configured, false);
  assert.equal(result.body.checkoutMode, 'manual-review');
  assert.deepEqual(result.body.methods, []);
});

test('public donation stats do not invent paid totals in mock mode', async () => {
  const result = await request('/api/donations/stats');

  assert.equal(result.response.status, 200);
  assert.equal(result.body.totalDonors, 0);
  assert.deepEqual(result.body.totalsByCurrency, {});
  assert.deepEqual(result.body.byCategory, {});
  assert.equal(result.body.totalAmount, undefined);
});

test('public registration cannot create a privileged role', async () => {
  const result = await request('/api/auth/register', jsonOptions('POST', {
    name: 'Privilege Escalation Attempt',
    email: 'attempt-admin@example.test',
    password: 'StrongPass123!',
    role: 'admin',
  }));

  assert.equal(result.response.status, 400);
  assert.equal(result.body.error, 'This role cannot be self-registered');
});

test('auth, role isolation, refresh, logout revocation, and admin guard work end-to-end', async () => {
  const suffix = Date.now();
  const studentEmail = `student-${suffix}@example.test`;
  const adminEmail = `admin-${suffix}@example.test`;
  const adminPassword = 'AdminPass123!';

  const registration = await request('/api/auth/register', jsonOptions('POST', {
    name: 'T03 Student',
    email: studentEmail,
    password: 'StudentPass123!',
    role: 'student',
  }));

  assert.equal(registration.response.status, 201);
  assert.equal(registration.body.user.role, 'student');
  assert.equal(registration.body.user.password, undefined);
  assert.ok(registration.body.accessToken);

  const studentCookie = registration.response.headers.get('set-cookie');
  assert.match(studentCookie || '', /wn_refresh=/);
  assert.match(studentCookie || '', /HttpOnly/i);
  assert.match(studentCookie || '', /SameSite=Lax/i);

  const deniedAdmin = await request('/api/admin', {
    headers: { Authorization: `Bearer ${registration.body.accessToken}` },
  });
  assert.equal(deniedAdmin.response.status, 403);
  assert.equal(deniedAdmin.body.error, 'Insufficient permissions');

  const setupAdmin = await request('/api/setup/admin', jsonOptions('POST', {
    name: 'T03 Admin',
    email: adminEmail,
    password: adminPassword,
  }));
  assert.equal(setupAdmin.response.status, 201);

  const login = await request('/api/auth/login', jsonOptions('POST', {
    email: adminEmail,
    password: adminPassword,
  }));
  assert.equal(login.response.status, 200);
  assert.equal(login.body.user.role, 'admin');
  assert.ok(login.body.accessToken);

  const adminAllowed = await request('/api/admin', {
    headers: { Authorization: `Bearer ${login.body.accessToken}` },
  });
  assert.equal(adminAllowed.response.status, 200);
  assert.equal(adminAllowed.body.ok, true);

  const initialRefreshCookie = cookiePair(login.response.headers.get('set-cookie'));
  assert.match(initialRefreshCookie, /^wn_refresh=/);

  const refreshed = await request('/api/auth/refresh', {
    method: 'POST',
    headers: { Cookie: initialRefreshCookie },
  });
  assert.equal(refreshed.response.status, 200);
  assert.ok(refreshed.body.accessToken);

  const rotatedRefreshCookie = cookiePair(refreshed.response.headers.get('set-cookie'));
  assert.match(rotatedRefreshCookie, /^wn_refresh=/);

  const logout = await request('/api/auth/logout', {
    method: 'POST',
    headers: { Cookie: rotatedRefreshCookie },
  });
  assert.equal(logout.response.status, 200);

  const revokedRefresh = await request('/api/auth/refresh', {
    method: 'POST',
    headers: { Cookie: rotatedRefreshCookie },
  });
  assert.equal(revokedRefresh.response.status, 401);
  assert.equal(revokedRefresh.body.error, 'Refresh session has been revoked');
});