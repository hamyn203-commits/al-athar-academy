import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useRequireAuth(allowedRoles = []) {
  const navigate = useNavigate();
  const allowedRolesKey = allowedRoles.join(',');
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    const stored = localStorage.getItem('user');
    if (!token || !stored) {
      navigate('/login');
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      const roles = allowedRolesKey ? allowedRolesKey.split(',') : [];
      if (roles.length && !roles.includes(parsed.role)) {
        navigate('/');
        return;
      }
      setUser(parsed);
    } catch {
      navigate('/login');
      return;
    }
    setReady(true);
  }, [navigate, allowedRolesKey]);

  const logout = () => {
    ['token', 'accessToken', 'refreshToken', 'user'].forEach((k) => localStorage.removeItem(k));
    navigate('/login');
  };

  return { user, ready, logout };
}
