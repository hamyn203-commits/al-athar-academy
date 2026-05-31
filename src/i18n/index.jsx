import { createContext, useContext, useState, useEffect } from 'react';
import ar from './ar';
import en from './en';

const I18nContext = createContext();

const translations = { ar, en };

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    const saved = localStorage.getItem('locale');
    return saved || 'ar';
  });

  useEffect(() => {
    localStorage.setItem('locale', locale);
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
  }, [locale]);

  const t = translations[locale];

  const changeLocale = (newLocale) => {
    setLocale(newLocale);
  };

  return (
    <I18nContext.Provider value={{ locale, t, changeLocale }}>
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
