const base = String(process.env.API_URL || 'https://wahy-wa-namaa-api.vercel.app').replace(/\/$/, '');
const requireReady = process.env.REQUIRE_READY === 'true';

async function probe(path, options = {}) {
  const response = await fetch(base + path, {
    redirect: 'manual',
    ...options,
    headers: {
      'content-type': 'application/json',
      ...(options.headers || {}),
    },
  });

  let body = null;
  try { body = await response.json(); } catch { body = await response.text(); }
  return { status: response.status, body };
}

function assertStatus(label, result, allowed) {
  const expected = Array.isArray(allowed) ? allowed : [allowed];
  console.log(label, result.status, JSON.stringify(result.body));
  if (!expected.includes(result.status)) {
    console.error(`${label} expected ${expected.join('/')} but received ${result.status}`);
    process.exit(10);
  }
}

const health = await probe('/api/health');
assertStatus('health', health, 200);

const readiness = await probe('/api/readiness');
console.log('readiness', readiness.status, JSON.stringify(readiness.body));

if (requireReady && readiness.status !== 200) {
  console.error('Backend is not ready for cutover.');
  process.exit(2);
}

if (readiness.status === 200) {
  const courses = await probe('/api/courses?limit=1');
  assertStatus('courses', courses, 200);

  const storage = await probe('/api/uploads/status');
  assertStatus('storage', storage, 200);
  if (!storage.body?.configured) {
    console.error('Object storage is not configured.');
    process.exit(3);
  }
}

const adminBootstrap = await probe('/api/setup/ensure-admin', {
  method: 'POST',
  body: JSON.stringify({}),
});
assertStatus('admin-bootstrap-closed', adminBootstrap, [400, 403, 404]);

const demoBootstrap = await probe('/api/system/bootstrap', {
  method: 'POST',
  body: JSON.stringify({}),
});
assertStatus('demo-bootstrap-closed', demoBootstrap, [403, 404]);

const liveDemo = await probe('/api/live/demo-room', {
  method: 'POST',
  body: JSON.stringify({}),
});
assertStatus('live-demo-protected', liveDemo, [401, 404]);

const refreshWithoutCookie = await probe('/api/auth/refresh', {
  method: 'POST',
  body: JSON.stringify({}),
});
assertStatus('refresh-cookie-required', refreshWithoutCookie, 401);

console.log(readiness.status === 200 ? 'CUTOVER_READY' : 'DEPLOYED_NOT_READY');
