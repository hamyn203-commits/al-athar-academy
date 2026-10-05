const base = String(process.env.API_URL || 'https://wahy-wa-namaa-api.vercel.app').replace(/\/$/, '');
const requireReady = process.env.REQUIRE_READY === 'true';

async function probe(path) {
  const response = await fetch(base + path, { redirect: 'manual' });
  let body = null;
  try { body = await response.json(); } catch { body = await response.text(); }
  return { status: response.status, body };
}

const health = await probe('/api/health');
console.log('health', health.status, JSON.stringify(health.body));
if (health.status !== 200) process.exit(1);

const readiness = await probe('/api/readiness');
console.log('readiness', readiness.status, JSON.stringify(readiness.body));

if (requireReady && readiness.status !== 200) {
  console.error('Backend is not ready for cutover.');
  process.exit(2);
}

if (readiness.status === 200) {
  const courses = await probe('/api/courses?limit=1');
  console.log('courses', courses.status);
  if (courses.status !== 200) process.exit(3);
}

console.log(readiness.status === 200 ? 'CUTOVER_READY' : 'DEPLOYED_NOT_READY');
