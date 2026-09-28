import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_BASE = '/api/v1';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
let refreshing: Promise<string | null> | null = null;

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }
    original._retry = true;

    try {
      if (!refreshing) {
        refreshing = (async () => {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) return null;
          const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
          const accessToken = data.data.accessToken;
          const newRefresh = data.data.refreshToken;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefresh);
          return accessToken;
        })();
      }
      const newToken = await refreshing;
      refreshing = null;
      if (!newToken) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch {
      refreshing = null;
      localStorage.clear();
      window.location.href = '/login';
      return Promise.reject(error);
    }
  }
);