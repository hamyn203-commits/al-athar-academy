#!/usr/bin/env node
/** إرسال كل روابط Sitemap إلى IndexNow (Bing, Yandex, Seznam...) */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE = 'https://al-athar-academy.vercel.app';
const KEY = 'alathartayyib2026seokey01';
const LOCALES = ['ar', 'en', 'fr', 'de', 'tr', 'ur', 'id', 'ms', 'ku'];
const PAGES = ['', '/teachers', '/courses', '/blog', '/contact', '/about', '/teacher/register', '/login', '/faq'];

const urls = [];
LOCALES.forEach((loc) => {
  PAGES.forEach((p) => {
    urls.push(`${SITE}/${loc}${p}`);
  });
});

const body = {
  host: 'al-athar-academy.vercel.app',
  key: KEY,
  keyLocation: `${SITE}/${KEY}.txt`,
  urlList: urls,
};

async function submit(endpoint) {
  const r = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  });
  return { endpoint, status: r.status, ok: r.ok };
}

const results = await Promise.all([
  submit('https://api.indexnow.org/indexnow'),
  submit('https://www.bing.com/indexnow'),
]);

console.log('IndexNow — submitted', urls.length, 'URLs');
results.forEach((r) => console.log(`  ${r.endpoint}: ${r.status} ${r.ok ? 'OK' : 'FAIL'}`));

// حفظ robots.txt hint if missing IndexNow comment
const robotsPath = resolve(__dirname, '../public/robots.txt');
if (existsSync(robotsPath)) {
  let robots = readFileSync(robotsPath, 'utf8');
  if (!robots.includes('IndexNow')) {
    robots += `\n# IndexNow key: ${SITE}/${KEY}.txt\n`;
    writeFileSync(robotsPath, robots);
  }
}
