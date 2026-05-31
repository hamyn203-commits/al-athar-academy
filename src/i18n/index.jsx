import { createContext, useContext, useState, useEffect } from 'react';
import ar from './ar';
import en from './en';
import fr from './fr';
import de from './de';
import tr from './tr';
import ur from './ur';
import id from './id';
import ms from './ms';

const I18nContext = createContext();

const translations = { ar, en, fr, de, tr, ur, id, ms };

// اللغات التي تكتب من اليمين لليسار
const rtlLanguages = ['ar', 'ur'];

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    const saved = localStorage.getItem('locale');
    // التحقق من أن اللغة المحفوظة مدعومة
    return saved && translations[saved] ? saved : 'ar';
  });

  useEffect(() => {
    localStorage.setItem('locale', locale);
    document.documentElement.dir = rtlLanguages.includes(locale) ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
  }, [locale]);

  const t = translations[locale];

  const changeLocale = (newLocale) => {
    if (translations[newLocale]) {
      setLocale(newLocale);
    }
  };

  const isRTL = rtlLanguages.includes(locale);

  return (
    <I18nContext.Provider value={{ locale, t, changeLocale, isRTL }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
