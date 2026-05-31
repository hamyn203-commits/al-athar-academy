const markets = [
  {
    slug: 'arab-world',
    region: 'العالم العربي',
    regionEn: 'Arab World',
    countries: ['مصر', 'السعودية', 'الإمارات', 'الكويت', 'قطر', 'البحرين', 'عمان', 'الأردن', 'العراق', 'المغرب', 'الجزائر', 'تونس'],
    currency: 'SAR',
    language: 'ar',
    timezone: 'Asia/Riyadh',
    locale: 'ar',
  },
  {
    slug: 'americas',
    region: 'السوق الأمريكي',
    regionEn: 'Americas',
    countries: ['الولايات المتحدة', 'كندا', 'United States', 'Canada', 'USA'],
    currency: 'USD',
    language: 'en',
    timezone: 'America/New_York',
    locale: 'en',
  },
  {
    slug: 'europe',
    region: 'السوق الأوروبي',
    regionEn: 'Europe',
    countries: ['بريطانيا', 'فرنسا', 'ألمانيا', 'هولندا', 'بلجيكا', 'السويد', 'United Kingdom', 'France', 'Germany'],
    currency: 'EUR',
    language: 'fr',
    timezone: 'Europe/London',
    locale: 'fr',
  },
  {
    slug: 'turkey',
    region: 'السوق التركي',
    regionEn: 'Turkey',
    countries: ['تركيا', 'Turkey', 'Türkiye'],
    currency: 'TRY',
    language: 'tr',
    timezone: 'Europe/Istanbul',
    locale: 'tr',
  },
  {
    slug: 'indonesia-malaysia',
    region: 'السوق الإندونيسي والماليزي',
    regionEn: 'Indonesia & Malaysia',
    countries: ['إندونيسيا', 'ماليزيا', 'Indonesia', 'Malaysia'],
    currency: 'IDR',
    language: 'id',
    timezone: 'Asia/Jakarta',
    locale: 'id',
  },
  {
    slug: 'south-asia',
    region: 'السوق الباكستاني والهندي',
    regionEn: 'South Asia',
    countries: ['باكستان', 'الهند', 'Pakistan', 'India'],
    currency: 'PKR',
    language: 'ur',
    timezone: 'Asia/Karachi',
    locale: 'ur',
  },
];

function getMarketBySlug(slug) {
  return markets.find((m) => m.slug === slug) || null;
}

function getMarketByLocale(locale) {
  const map = { ar: 'arab-world', en: 'americas', fr: 'europe', de: 'europe', tr: 'turkey', ur: 'south-asia', id: 'indonesia-malaysia', ms: 'indonesia-malaysia', ku: 'arab-world' };
  return getMarketBySlug(map[locale] || 'arab-world');
}

function detectMarketFromAcceptLanguage(header = '') {
  const lang = (header.split(',')[0] || 'ar').split('-')[0].toLowerCase();
  return getMarketByLocale(lang);
}

module.exports = { markets, getMarketBySlug, getMarketByLocale, detectMarketFromAcceptLanguage };
