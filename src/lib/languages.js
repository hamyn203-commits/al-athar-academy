export const LANG_LABELS = {
  ar: { ar: 'العربية', en: 'Arabic' },
  en: { ar: 'English', en: 'English' },
  fr: { ar: 'Français', en: 'French' },
  de: { ar: 'Deutsch', en: 'German' },
  tr: { ar: 'Türkçe', en: 'Turkish' },
  ur: { ar: 'اردو', en: 'Urdu' },
  id: { ar: 'Bahasa Indonesia', en: 'Indonesian' },
  ms: { ar: 'Bahasa Melayu', en: 'Malay' },
  ku: { ar: 'کوردی', en: 'Kurdish' },
};

export const LANG_CODES = Object.keys(LANG_LABELS);

export function langLabel(code, uiLocale = 'ar') {
  return LANG_LABELS[code]?.[uiLocale] || code;
}
