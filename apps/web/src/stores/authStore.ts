import { create } from 'zustand';
import { api } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  department?: string;
  avatarUrl?: string;
  isVerified: boolean;
  reputationScore: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => void;
}

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  department?: string;
  year?: number;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: (() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  })(),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      set({ user: data.data.user, isAuthenticated: true, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  register: async (input) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/register', input);
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      set({ user: data.data.user, isAuthenticated: true, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) await api.post('/auth/logout', { refreshToken });
    } catch {}
    localStorage.clear();
    set({ user: null, isAuthenticated: false });
  },

  loadUser: () => {
    const u = localStorage.getItem('user');
    set({ user: u ? JSON.parse(u) : null, isAuthenticated: !!localStorage.getItem('accessToken') });
  },
}));