import { v4Markets } from '../data/v4Data';
import { detectBrowserLocale } from './locale';

const LOCALE_MARKET = {
  ar: 'arab-world',
  en: 'americas',
  fr: 'europe',
  de: 'europe',
  tr: 'turkey',
  ur: 'south-asia',
  id: 'indonesia-malaysia',
  ms: 'indonesia-malaysia',
  ku: 'arab-world',
};

export function getMarketBySlug(slug) {
  return v4Markets.find((m) => m.slug === slug) || null;
}

export function getMarketByLocale(locale) {
  return getMarketBySlug(LOCALE_MARKET[locale] || LOCALE_MARKET.ar);
}

export function detectMarket(locale) {
  const loc = locale || detectBrowserLocale();
  return getMarketByLocale(loc);
}

export function getStoredMarketPrefs() {
  try {
    const raw = localStorage.getItem('market_prefs');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveMarketPrefs(prefs) {
  localStorage.setItem('market_prefs', JSON.stringify(prefs));
}

export function resolveMarketPrefs(locale) {
  const stored = getStoredMarketPrefs();
  const detected = detectMarket(locale);
  return {
    marketSlug: stored?.marketSlug || detected?.slug || 'arab-world',
    currency: stored?.currency || detected?.currency || 'SAR',
    timezone: stored?.timezone || detected?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

export { v4Markets as markets };
