import { useEffect } from 'react';
import { Outlet, useParams, Navigate, useLocation } from 'react-router-dom';
import { useI18n } from '../i18n';
import { DEFAULT_LOCALE, isValidLocale, localizedPath, detectBrowserLocale, getLocaleFromPath } from '../lib/locale';

export default function LocaleLayout() {
  const { locale } = useParams();
  const { changeLocale, locale: currentLocale } = useI18n();
  const location = useLocation();

  useEffect(() => {
    if (locale && isValidLocale(locale)) changeLocale(locale);
  }, [locale, changeLocale]);

  if (locale && !isValidLocale(locale)) {
    return <Navigate to={localizedPath(location.pathname.replace(`/${locale}`, ''), DEFAULT_LOCALE)} replace />;
  }

  // توجيه / إلى /{locale} عند أول زيارة
  if (!getLocaleFromPath(location.pathname) && location.pathname === '/') {
    const target = localStorage.getItem('locale') || detectBrowserLocale() || currentLocale || DEFAULT_LOCALE;
    return <Navigate to={localizedPath('/', target)} replace />;
  }

  return <Outlet />;
}
