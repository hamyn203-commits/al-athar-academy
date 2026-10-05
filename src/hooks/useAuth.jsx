import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { API_BASE_URL } from '../config';

function decodeTokenPayload(token) {
  try {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const payload = decodeTokenPayload(token);
  return !payload?.exp || Date.now() >= payload.exp * 1000;
}

function readStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function readStoredAccessToken() {
  return localStorage.getItem('accessToken') || localStorage.getItem('token');
}

function persistAccessToken(token) {
  if (!token) return;
  localStorage.setItem('accessToken', token);
  localStorage.setItem('token', token);
}

function clearLocalSession() {
  ['token', 'accessToken', 'refreshToken', 'user'].forEach((key) => {
    localStorage.removeItem(key);
  });
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser());
  const [accessToken, setAccessToken] = useState(() => readStoredAccessToken());
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const clearSessionState = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setIsAuthenticated(false);
    clearLocalSession();
  }, []);

  const logout = useCallback(async () => {
    clearSessionState();
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Local session is already cleared. Server cookie will expire naturally
      // if the network is unavailable.
    }
  }, [clearSessionState]);

  const refreshAccessToken = useCallback(async (legacyRefreshToken = '') => {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        legacyRefreshToken ? { refreshToken: legacyRefreshToken } : {}
      ),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh session');
    }

    const data = await response.json();
    if (!data.accessToken) {
      throw new Error('Refresh response did not include an access token');
    }

    setAccessToken(data.accessToken);
    persistAccessToken(data.accessToken);
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(true);
    return data.accessToken;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const storedUser = readStoredUser();
      const localAccess = readStoredAccessToken();
      const legacyRefresh = localStorage.getItem('refreshToken') || '';

      if (!storedUser) {
        clearLocalSession();
        if (!cancelled) {
          setUser(null);
          setAccessToken(null);
          setIsAuthenticated(false);
          setIsLoading(false);
        }
        return;
      }

      if (!cancelled) setUser(storedUser);

      try {
        // If a legacy refresh token exists, migrate it immediately into the
        // HttpOnly cookie even when the current access token has not expired.
        if (legacyRefresh || !localAccess || isTokenExpired(localAccess)) {
          await refreshAccessToken(legacyRefresh);
        } else if (!cancelled) {
          setAccessToken(localAccess);
          setIsAuthenticated(true);
        }
      } catch (error) {
        const networkFailure =
          error instanceof TypeError ||
          error.message?.includes('fetch') ||
          error.message?.includes('NetworkError');

        if (networkFailure && localAccess && !isTokenExpired(localAccess)) {
          if (!cancelled) {
            setAccessToken(localAccess);
            setIsAuthenticated(true);
          }
        } else if (!cancelled) {
          clearSessionState();
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [clearSessionState, refreshAccessToken]);

  const saveAuthenticatedSession = useCallback((data) => {
    setUser(data.user);
    setAccessToken(data.accessToken);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(data.user));
    persistAccessToken(data.accessToken);
    localStorage.removeItem('refreshToken');
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');

      saveAuthenticatedSession(data);
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [saveAuthenticatedSession]);

  const register = useCallback(async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');

      saveAuthenticatedSession(data);
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [saveAuthenticatedSession]);

  const updateProfile = useCallback(async (updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Update failed');

      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [accessToken]);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Password change failed');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [accessToken]);

  const forgotPassword = useCallback(async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Request failed');
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const authFetch = useCallback(async (url, options = {}) => {
    if (!accessToken) throw new Error('Not authenticated');

    const makeRequest = (token) => fetch(url, {
      ...options,
      credentials: options.credentials || 'include',
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });

    let response = await makeRequest(accessToken);

    if (response.status === 401) {
      const errorData = await response.clone().json().catch(() => ({}));
      if (errorData.code === 'TOKEN_EXPIRED') {
        try {
          const nextToken = await refreshAccessToken();
          response = await makeRequest(nextToken);
          return response;
        } catch {
          await logout();
          throw new Error('Session expired');
        }
      }

      await logout();
      throw new Error('Session expired');
    }

    return response;
  }, [accessToken, logout, refreshAccessToken]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    accessToken,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    authFetch,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
