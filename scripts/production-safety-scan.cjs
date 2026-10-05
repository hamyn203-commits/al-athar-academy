const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const failures = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return [full];
  });
}

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function checkFile(file, rules) {
  const content = read(file);
  for (const [label, pattern] of rules) {
    if (pattern.test(content)) {
      failures.push(`${path.relative(root, file)}: ${label}`);
    }
  }
}

const sourceFiles = [
  ...walk(path.join(root, 'src')),
  ...walk(path.join(root, 'backend', 'routes')),
].filter((file) => /\.(js|jsx|ts|tsx)$/.test(file));

for (const file of sourceFiles) {
  checkFile(file, [
    ['browser access token persistence is forbidden', /localStorage\.(?:getItem|setItem)\(['"](?:accessToken|token|refreshToken)['"]/],
    ['mock donation confirmation endpoint is forbidden', /confirm-mock/],
    ['legacy placeholder WhatsApp number is forbidden', /201234567890/],
  ]);
}

checkFile(path.join(root, 'vercel.json'), [
  ['frontend must not proxy production API to retired Azure backend', /al-athar-api\.azurewebsites\.net/i],
]);

checkFile(path.join(root, 'src', 'config', 'social.js'), [
  ['legacy Al-Athar social/contact identity is forbidden', /alathar/i],
]);

if (failures.length) {
  console.error('Production safety scan failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Production safety scan passed.');
