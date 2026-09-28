import { create } from 'zustand';
import { api, type AdminUser } from '@/lib/api';

interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: (() => {
    const u = localStorage.getItem('admin_user');
    return u ? JSON.parse(u) : null;
  })(),
  isAuthenticated: !!localStorage.getItem('admin_access_token'),
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const user = data.data.user;

      // Role check
      if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
        throw new Error('Access denied. Admin only.');
      }

      localStorage.setItem('admin_access_token', data.data.accessToken);
      localStorage.setItem('admin_refresh_token', data.data.refreshToken);
      localStorage.setItem('admin_user', JSON.stringify(user));

      set({ user, isAuthenticated: true, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('admin_refresh_token');
      if (refreshToken) await api.post('/auth/logout', { refreshToken });
    } catch {}
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_user');
    set({ user: null, isAuthenticated: false });
  },
}));