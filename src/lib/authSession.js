import { API_BASE_URL } from '../config';

let accessToken = null;
let refreshPromise = null;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token) {
  accessToken = token || null;
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
}

export async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });

    if (!response.ok) {
      clearAccessToken();
      throw new Error('Failed to refresh session');
    }

    const data = await response.json();
    if (!data.accessToken) {
      clearAccessToken();
      throw new Error('Refresh response did not include an access token');
    }

    setAccessToken(data.accessToken);
    return data.accessToken;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

export function clearLegacyAuthStorage() {
  ['token', 'accessToken', 'refreshToken', 'user'].forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore storage access failures.
    }
  });
}
