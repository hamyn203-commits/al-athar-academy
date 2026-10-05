const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..', '..');
const failures = [];

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function requireContains(rel, label, pattern) {
  const text = read(rel);
  if (!pattern.test(text)) failures.push(`${rel}: ${label}`);
}

function requireAbsent(rel, label, pattern) {
  const text = read(rel);
  if (pattern.test(text)) failures.push(`${rel}: ${label}`);
}

// P0: public users cannot self-register privileged roles.
requireContains(
  'backend/routes/auth.js',
  'public registration must restrict roles to student/guardian',
  /allowedRoles\s*=\s*\[['"]student['"],\s*['"]guardian['"]\]/
);
requireContains(
  'backend/routes/auth.js',
  'privileged self-registration must be rejected',
  /This role cannot be self-registered/
);

// P0: bootstrap and demo routes must be closed in production.
requireContains(
  'backend/routes/setup.js',
  'admin bootstrap must be production-gated',
  /ALLOW_ADMIN_BOOTSTRAP/
);
requireContains(
  'backend/routes/live.js',
  'demo room must be disabled in production',
  /NODE_ENV\s*===\s*['"]production['"][\s\S]{0,180}Route not found/
);
requireContains(
  'backend/routes/system.js',
  'demo bootstrap must be disabled in production',
  /router\.post\(['"]\/bootstrap['"][\s\S]{0,220}NODE_ENV\s*===\s*['"]production['"]/
);

// LiveKit: host/publish permissions are server-derived.
requireContains(
  'backend/routes/live.js',
  'live token must resolve server-side room access',
  /getRoomAccess\(liveSession, req\.user\)/
);
requireAbsent(
  'backend/routes/live.js',
  'live token must not trust client isHost',
  /req\.body\.isHost|\{[^}]*isHost[^}]*\}\s*=\s*req\.body/
);
requireAbsent(
  'backend/routes/live.js',
  'ordinary participant tokens must not grant room admin/record/create',
  /roomRecord\s*:\s*true|roomCreate\s*:\s*true|roomAdmin\s*:\s*true/
);

// Auth: refresh token lives in HttpOnly cookie; access token must not persist in browser storage.
requireContains(
  'backend/routes/auth.js',
  'refresh cookie must be HttpOnly',
  /HttpOnly/
);
requireContains(
  'backend/routes/auth.js',
  'logout must revoke refresh token version',
  /refreshTokenVersion[\s\S]{0,120}\+\s*1|\$inc:\s*\{\s*refreshTokenVersion:\s*1/
);
requireAbsent(
  'src/lib/fileUpload.js',
  'upload helper must not read access tokens from localStorage',
  /localStorage\.(?:getItem|setItem)\(['"](?:accessToken|token|refreshToken)['"]/
);

// Runtime: production mock mode must fail closed and support either Mongo env name.
requireContains(
  'backend/config/runtime.js',
  'runtime must recognize MongoDB integration variables',
  /MONGODB_URI\s*\|\|\s*process\.env\.MONGODB_URL/
);
requireContains(
  'backend/config/runtime.js',
  'mock mode must be disabled in production',
  /isMockMode\s*=\s*!isProduction\s*&&\s*!hasDatabaseConfig/
);
requireAbsent(
  'backend/routes/finance.js',
  'finance must not implement its own Mongo-only mock switch',
  /isMockMode\s*=\s*!process\.env\.MONGODB_URI/
);

// Storage: teacher IDs and certificates must stay behind private storage.
requireContains(
  'backend/routes/teachers.js',
  'teacher private documents must use authorized object-storage reads',
  /getPrivateObject\(stored/
);
requireContains(
  'backend/routes/uploads.js',
  'Blob uploads must be private by default',
  /privateByDefault/
);

// Removed public mock confirmation route.
const routeFiles = fs.readdirSync(path.join(root, 'backend', 'routes')).filter((f) => f.endsWith('.js'));
for (const file of routeFiles) {
  const content = read(`backend/routes/${file}`);
  if (/confirm-mock/.test(content)) failures.push(`backend/routes/${file}: public mock confirmation endpoint exists`);
}

// T02: production JWT secrets must reject placeholders/reuse.
requireContains(
  'backend/middleware/auth.js',
  'production JWT secrets must reject weak placeholders',
  /isWeakProductionSecret/
);
requireContains(
  'backend/middleware/auth.js',
  'access and refresh JWT secrets must be distinct',
  /JWT_SECRET\s*===\s*JWT_REFRESH_SECRET/
);

// T02: browser credential origins fail closed in production.
requireContains(
  'backend/app.js',
  'CORS must use centralized trusted-origin policy',
  /isTrustedOrigin\(origin\)/
);
requireContains(
  'backend/app.js',
  'refresh endpoint must require trusted Origin',
  /app\.use\(['"]\/api\/auth\/refresh['"],\s*requireTrustedOrigin\)/
);
requireContains(
  'backend/app.js',
  'logout endpoint must require trusted Origin',
  /app\.use\(['"]\/api\/auth\/logout['"],\s*requireTrustedOrigin\)/
);
requireContains(
  'backend/config/origins.js',
  'Vercel preview origins must be explicit opt-in',
  /ALLOW_VERCEL_PREVIEW_ORIGINS\s*===\s*['"]true['"]/
);

// T02: privileged frontend routes must have a centralized role guard.
requireContains(
  'src/App.jsx',
  'admin route must be guarded centrally',
  /path=["']admin["'][\s\S]{0,160}ProtectedRoute\s+roles=\{\[['"]admin['"]\]\}/
);
requireContains(
  'src/App.jsx',
  'student dashboard must be guarded centrally',
  /path=["']student\/dashboard["'][\s\S]{0,180}ProtectedRoute\s+roles=\{\[['"]student['"]\]\}/
);
requireContains(
  'src/App.jsx',
  'teacher dashboard must be guarded centrally',
  /path=["']teacher\/dashboard["'][\s\S]{0,180}ProtectedRoute\s+roles=\{\[['"]teacher['"]\]\}/
);
requireContains(
  'src/App.jsx',
  'guardian dashboard must be guarded centrally',
  /path=["']guardian\/dashboard["'][\s\S]{0,180}ProtectedRoute\s+roles=\{\[['"]guardian['"]\]\}/
);

// T02: public circles must not expose member/contact PII and guardian joins need ownership.
requireContains(
  'backend/routes/circles.js',
  'public circle responses must use a sanitizer',
  /sanitizePublicCircle/
);
requireAbsent(
  'backend/routes/circles.js',
  'public circle route must not populate student PII',
  /\.populate\(['"]students['"]/
);
requireContains(
  'backend/routes/circles.js',
  'guardian circle joins must verify linked child ownership',
  /Guardian\.exists\([\s\S]{0,180}['"]children\.student['"]/
);
requireContains(
  'backend/routes/circles.js',
  'circle joins must restrict actor roles',
  /router\.post\(['"]\/:id\/join['"],\s*protect,\s*authorize\(['"]student['"],\s*['"]guardian['"],\s*['"]admin['"]\)/
);

// T02: assignment reads must enforce enrollment/instructor ownership.
requireContains(
  'backend/routes/assignments.js',
  'assignment list must have explicit role authorization',
  /router\.get\(['"]\/['"],\s*protect,\s*attachTeacherProfile,\s*authorize\(['"]student['"],\s*['"]teacher['"],\s*['"]admin['"]\)/
);
requireContains(
  'backend/routes/assignments.js',
  'student assignment reads must use enrollment ownership',
  /Enrollment\.find\([\s\S]{0,220}student:\s*req\.user\.id/
);

// T02: paid LMS content/enrollment must fail closed.
requireContains(
  'backend/routes/lms.js',
  'paid course enrollment must require a payment flow',
  /PAYMENT_REQUIRED/
);
requireContains(
  'backend/routes/lms.js',
  'LMS course content must require an active or completed enrollment',
  /ENROLLMENT_REQUIRED/
);
requireContains(
  'backend/routes/lms.js',
  'lesson payload must hide quiz answer keys',
  /select:\s*['"]-questions\.correctAnswer -questions\.options\.isCorrect['"]/
);

// Dynamic contract: production without DB config must never enable mock mode.
const runtimeProbe = spawnSync(
  process.execPath,
  ['-e', "process.env.NODE_ENV='production'; delete process.env.MONGODB_URI; delete process.env.MONGODB_URL; const r=require('./config/runtime'); if(r.isMockMode) process.exit(7);"],
  { cwd: path.join(root, 'backend'), encoding: 'utf8' }
);
if (runtimeProbe.status !== 0) {
  failures.push('backend/config/runtime.js: production runtime can enable mock mode');
}

const weakSecretProbe = spawnSync(
  process.execPath,
  ['-e', "process.env.NODE_ENV='production'; process.env.JWT_SECRET='change-me-in-production-min-32-chars'; process.env.JWT_REFRESH_SECRET='abcdefghijklmnopqrstuvwxyz0123456789-refresh'; require('./middleware/auth');"],
  { cwd: path.join(root, 'backend'), encoding: 'utf8' }
);
if (weakSecretProbe.status === 0) {
  failures.push('backend/middleware/auth.js: production accepted a placeholder JWT secret');
}

const originProbe = spawnSync(
  process.execPath,
  ['-e', "process.env.NODE_ENV='production'; process.env.ALLOWED_ORIGINS='https://wahy-wa-namaa-academy.vercel.app'; const o=require('./config/origins'); if(!o.isTrustedOrigin('https://wahy-wa-namaa-academy.vercel.app')) process.exit(2); if(o.isTrustedOrigin('http://localhost:5173')) process.exit(3); if(o.isTrustedOrigin('https://wahy-wa-namaa-academy-random.vercel.app')) process.exit(4);"],
  { cwd: path.join(root, 'backend'), encoding: 'utf8' }
);
if (originProbe.status !== 0) {
  failures.push('backend/config/origins.js: production trusted-origin policy is not fail-closed');
}

if (failures.length) {
  console.error('Security contracts failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Security contracts passed.');
