import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth.jsx';

export function useRequireAuth(allowedRoles = []) {
  const navigate = useNavigate();
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
      navigate('/login', { replace: true });
      return;
    }

    if (!roleAllowed) {
      navigate('/', { replace: true });
    }
  }, [isLoading, isAuthenticated, user, roleAllowed, navigate]);

  const logout = useCallback(() => {
    void authLogout();
    navigate('/login', { replace: true });
  }, [authLogout, navigate]);

  return {
    user: roleAllowed ? user : null,
    ready: !isLoading && isAuthenticated && roleAllowed,
    logout,
  };
}
