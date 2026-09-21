/** هوية الأكاديمية الرسمية + بيانات SEO العالمية — وَحْيٌ وَنَمَاء */
export const SITE_URL = 'https://wahy-wa-namaa.academy';

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

/** أسماء العلامة الرسمية والبحثية المعتمدة لـ «وَحْيٌ وَنَمَاء» */
export const ALTERNATE_NAMES = [
  'وَحْيٌ وَنَمَاء',
  'وحي ونماء',
  'أكاديمية وَحْيٌ وَنَمَاء',
  'أكاديمية وحي ونماء',
  'WAHY WA NAMAA',
  'Wahy Wa Namaa',
  'Wahy Wa Namaa Academy',
  'Académie WAHY WA NAMAA',
  'Wahy Wa Namaa Akademie',
  'Wahy Wa Namaa Akademisi',
  'Akademi WAHY WA NAMAA',
  'اکیڈمی وحی و نماء',
  'وحی و نماء',
  'ئەکادیمیای وەحی و نەما',
  'وەحی و نەما',
];

export const ALTERNATE_SLOGANS = [
  'نتعلم القرآن، نحفظه، وننمو به.',
  'نتعلم القران نحفظه وننمو به',
  'Learn the Quran. Memorize it. Grow through it.',
  'Quranic Learning. Lifelong Growth.',
  'Apprendre le Coran, le mémoriser, et grandir avec lui.',
  'Lerne den Koran, bewahre ihn, und wachse durch ihn.',
  'Kuran\'ı öğreniyoruz, ezberliyoruz ve onunla büyüyoruz.',
  'قرآن سیکھیں، حفظ کریں اور اس کے ذریعے نمو پائیں۔',
  'Pelajari Al-Quran, hafalkan, dan bertumbuh dengannya.',
  'Pelajari Al-Quran, hafalkannya, dan berkembang melaluinya.',
  'فێری قورئان دەبین، لەبەری دەکەین، و گەشەی پێ دەکەین.',
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
