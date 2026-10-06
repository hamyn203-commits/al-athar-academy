import { useCallback, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from './useAuth.jsx';
import { useI18n } from '../i18n';
import {
  dashboardPathForRole,
  loginPathForLocale,
} from '../lib/navigation';

export function useRequireAuth(allowedRoles = []) {
  const navigate = useNavigate();
  const location = useLocation();
  const { locale: paramLocale } = useParams();
  const { locale: uiLocale } = useI18n();
  const activeLocale = paramLocale || uiLocale;
  const { user, isAuthenticated, isLoading, logout: authLogout } = useAuth();
  const allowedRolesKey = allowedRoles.join(',');

  const roles = useMemo(
    () => (allowedRolesKey ? allowedRolesKey.split(',') : []),
    [allowedRolesKey]
  );

  const roleAllowed = Boolean(
    user && (!roles.length || roles.includes(user.role))
  );

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      const redirect = encodeURIComponent(
        `${location.pathname}${location.search}${location.hash}`
      );
      navigate(
        `${loginPathForLocale(activeLocale)}?redirect=${redirect}`,
        { replace: true }
      );
      return;
    }

    if (!roleAllowed) {
      navigate(dashboardPathForRole(user.role, activeLocale), { replace: true });
    }
  }, [
    isLoading,
    isAuthenticated,
    user,
    roleAllowed,
    navigate,
    location.pathname,
    location.search,
    location.hash,
    activeLocale,
  ]);

  const logout = useCallback(() => {
    void authLogout();
    navigate(loginPathForLocale(activeLocale), { replace: true });
  }, [authLogout, navigate, activeLocale]);

  return {
    user: roleAllowed ? user : null,
    ready: !isLoading && isAuthenticated && roleAllowed,
    logout,
  };
}
