import {
  DEFAULT_LOCALE,
  getLocaleFromPath,
  isValidLocale,
  localizedPath,
} from './locale';

const INTERNAL_BASE_ORIGIN = 'https://wahy.local';

export const DASHBOARD_ROUTE_BY_ROLE = Object.freeze({
  student: '/student/dashboard',
  teacher: '/teacher/dashboard',
  guardian: '/guardian/dashboard',
  admin: '/admin',
});

export function normalizeNavigationLocale(locale) {
  return isValidLocale(locale) ? locale : DEFAULT_LOCALE;
}

export function dashboardPathForRole(role, locale = DEFAULT_LOCALE) {
  const activeLocale = normalizeNavigationLocale(locale);
  const route = DASHBOARD_ROUTE_BY_ROLE[role];

  return route
    ? localizedPath(route, activeLocale)
    : localizedPath('/', activeLocale);
}

export function loginPathForLocale(locale = DEFAULT_LOCALE) {
  return localizedPath('/login', normalizeNavigationLocale(locale));
}

export function homePathForLocale(locale = DEFAULT_LOCALE) {
  return localizedPath('/', normalizeNavigationLocale(locale));
}

export function isSafeInternalRedirect(value) {
  if (typeof value !== 'string') return false;

  const target = value.trim();
  if (!target.startsWith('/') || target.startsWith('//') || target.includes('\\')) {
    return false;
  }

  try {
    const parsed = new URL(target, INTERNAL_BASE_ORIGIN);
    return parsed.origin === INTERNAL_BASE_ORIGIN && parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function postAuthDestination({
  redirect,
  role,
  locale = DEFAULT_LOCALE,
} = {}) {
  const activeLocale = normalizeNavigationLocale(locale);

  if (!isSafeInternalRedirect(redirect)) {
    return dashboardPathForRole(role, activeLocale);
  }

  const parsed = new URL(redirect.trim(), INTERNAL_BASE_ORIGIN);
  const pathname = getLocaleFromPath(parsed.pathname)
    ? parsed.pathname
    : localizedPath(parsed.pathname || '/', activeLocale);

  return `${pathname}${parsed.search}${parsed.hash}`;
}
