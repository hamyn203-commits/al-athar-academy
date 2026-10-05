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

// Dynamic contract: production without DB config must never enable mock mode.
const runtimeProbe = spawnSync(
  process.execPath,
  ['-e', "process.env.NODE_ENV='production'; delete process.env.MONGODB_URI; delete process.env.MONGODB_URL; const r=require('./config/runtime'); if(r.isMockMode) process.exit(7);"],
  { cwd: path.join(root, 'backend'), encoding: 'utf8' }
);
if (runtimeProbe.status !== 0) {
  failures.push('backend/config/runtime.js: production runtime can enable mock mode');
}

if (failures.length) {
  console.error('Security contracts failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Security contracts passed.');
