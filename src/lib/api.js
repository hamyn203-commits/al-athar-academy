import { API_BASE_URL } from '../config';

class ApiClient {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  getToken() {
    return localStorage.getItem('accessToken') || localStorage.getItem('token');
  }

  async request(path, options = {}) {
    const { auth = false, json = true, body, headers = {}, ...rest } = options;
    const reqHeaders = { ...headers };

    if (json && body && !(body instanceof FormData)) {
      reqHeaders['Content-Type'] = 'application/json';
    }

    if (auth) {
      const token = this.getToken();
      if (token) reqHeaders.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...rest,
      headers: reqHeaders,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    });

    const data = json ? await response.json().catch(() => ({})) : null;

    if (!response.ok) {
      throw new Error(data?.error || data?.message || `HTTP ${response.status}`);
    }

    return data;
  }

  get(path, opts) { return this.request(path, { ...opts, method: 'GET' }); }
  post(path, body, opts) { return this.request(path, { ...opts, method: 'POST', body }); }
  put(path, body, opts) { return this.request(path, { ...opts, method: 'PUT', body }); }
  patch(path, body, opts) { return this.request(path, { ...opts, method: 'PATCH', body }); }
  delete(path, opts) { return this.request(path, { ...opts, method: 'DELETE' }); }
}

export const api = new ApiClient();
export default api;
