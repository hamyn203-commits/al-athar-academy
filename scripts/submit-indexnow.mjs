#!/usr/bin/env node
/** إرسال روابط Sitemap إلى Bing IndexNow (202 = مقبول) */
const SITE = 'https://wahy-wa-namaa-academy.vercel.app';
const KEY = 'wahywanamaa2026indexnow01';
const LOCALES = ['ar', 'en', 'fr', 'de', 'tr', 'ur', 'id', 'ms', 'ku'];
const PAGES = ['', '/free-trial', '/teachers', '/courses', '/blog', '/contact', '/about', '/register/teacher', '/login', '/faq'];

const urls = [];
LOCALES.forEach((loc) => {
  PAGES.forEach((p) => urls.push(`${SITE}/${loc}${p}`));
});

let ok = 0;
let fail = 0;

const chunkSize = 10;
for (let i = 0; i < urls.length; i += chunkSize) {
  const batch = urls.slice(i, i + chunkSize);
  await Promise.all(batch.map(async (url) => {
    const api = `https://www.bing.com/indexnow?url=${encodeURIComponent(url)}&key=${KEY}`;
    try {
      const r = await fetch(api, { signal: AbortSignal.timeout(2000) });
      if (r.status === 200 || r.status === 202) ok++;
      else fail++;
    } catch {
      fail++;
    }
  }));
}

// POST batch لـ IndexNow (بعض الشبكات)
try {
  const r = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: 'wahy-wa-namaa-academy.vercel.app',
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
