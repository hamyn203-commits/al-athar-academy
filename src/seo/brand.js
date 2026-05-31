/** هوية الأكاديمية + بيانات SEO العالمية */
export const SITE_URL = 'https://al-athar-academy.vercel.app';

export const SEO_LOCALES = ['ar', 'en', 'fr', 'de', 'tr', 'ur', 'id', 'ms', 'ku'];

export const OG_LOCALE = {
  ar: 'ar_EG',
  en: 'en_US',
  fr: 'fr_FR',
  de: 'de_DE',
  tr: 'tr_TR',
  ur: 'ur_PK',
  id: 'id_ID',
  ms: 'ms_MY',
  ku: 'ku_IQ',
};

/** كل الأسماء التي قد يبحث عنها المستخدم بأي لغة */
export const ALTERNATE_NAMES = [
  'الأثر الطيب',
  'أكاديمية الأثر الطيب',
  'اكاديمية الاثر الطيب',
  'الاثر الطيب',
  'Al-Athar Al-Tayyib',
  'Al Athar Al Tayyib',
  'Al-Athar Academy',
  'Al Athar Academy',
  'Académie Al-Athar Al-Tayyib',
  'Academie Al-Athar Al-Tayyib',
  'Akademie Al-Athar Al-Tayyib',
  'Al-Athar Al-Tayyib Akademisi',
  'Akademiya Athar Al-Tayyib',
  'Akademiya Esar Al-Tayyib',
  'ئاكademyيا ئەثر الطیب',
  'ئەثر الطیب',
  'اکیڈمی الاثر الطیب',
  'الاثر الطیب',
  'Akademi Al-Athar Al-Tayyib',
  'Akademi Al-Athar Al-Tayyib',
];

export const ALTERNATE_SLOGANS = [
  'أثر يساوي حياة',
  'اثر يساوي حياة',
  'Impact Equals Life',
  'A Legacy Worth a Life',
  "L'impact égale la vie",
  'Wirkung ist Leben',
  'Etki Hayata Eşittir',
  'اثر زندگی کے برابر',
  'Dampak Setara Kehidupan',
  'Impak Sama Dengan Kehidupan',
  'ئێشک یەکسانە بە ژیان',
];

export function localePath(locale, path = '/') {
  const clean = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}/${locale}${clean}`;
}

export function hreflangLinks(path = '/') {
  const links = SEO_LOCALES.map((loc) => ({
    rel: 'alternate',
    hreflang: loc,
    href: localePath(loc, path),
  }));
  links.push({ rel: 'alternate', hreflang: 'x-default', href: localePath('ar', path) });
  return links;
}
