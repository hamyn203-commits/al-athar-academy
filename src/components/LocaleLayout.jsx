import { useEffect } from 'react';
import { Outlet, useParams, Navigate, useLocation } from 'react-router-dom';
import { useI18n } from '../i18n';
import { DEFAULT_LOCALE, isValidLocale, localizedPath } from '../lib/locale';

export default function LocaleLayout() {
  const { locale } = useParams();
  const { changeLocale } = useI18n();
  const location = useLocation();

  useEffect(() => {
    if (locale && isValidLocale(locale)) changeLocale(locale);
  }, [locale, changeLocale]);

  if (locale && !isValidLocale(locale)) {
    return <Navigate to={localizedPath(location.pathname.replace(`/${locale}`, ''), DEFAULT_LOCALE)} replace />;
  }

  return <Outlet />;
}
