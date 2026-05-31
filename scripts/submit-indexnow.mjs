#!/usr/bin/env node
/** إرسال روابط Sitemap إلى Bing IndexNow (202 = مقبول) */
const SITE = 'https://al-athar-academy.vercel.app';
const KEY = 'alathartayyib2026seokey01';
const LOCALES = ['ar', 'en', 'fr', 'de', 'tr', 'ur', 'id', 'ms', 'ku'];
const PAGES = ['', '/teachers', '/courses', '/blog', '/contact', '/about', '/teacher/register', '/login', '/faq'];

const urls = [];
LOCALES.forEach((loc) => {
  PAGES.forEach((p) => urls.push(`${SITE}/${loc}${p}`));
});

let ok = 0;
let fail = 0;

for (const url of urls) {
  const api = `https://www.bing.com/indexnow?url=${encodeURIComponent(url)}&key=${KEY}`;
  try {
    const r = await fetch(api);
    if (r.status === 200 || r.status === 202) ok++;
    else fail++;
  } catch {
    fail++;
  }
}

// POST batch لـ IndexNow (بعض الشبكات)
try {
  const r = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: 'al-athar-academy.vercel.app',
      key: KEY,
      keyLocation: `${SITE}/${KEY}.txt`,
      urlList: urls.slice(0, 10),
    }),
  });
  console.log(`IndexNow batch POST: ${r.status}`);
} catch (e) {
  console.log('IndexNow batch POST: skipped');
}

console.log(`Bing IndexNow — ${ok} OK, ${fail} fail, ${urls.length} total URLs`);
