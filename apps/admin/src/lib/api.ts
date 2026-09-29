import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('admin_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_refresh_token');
      localStorage.removeItem('admin_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============ TYPES ============
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'STAFF' | 'STUDENT';
  isVerified: boolean;
  reputationScore: number;
}

export interface Stats {
  totalUsers: number;
  totalItems: number;
  openItems: number;
  resolvedItems: number;
  totalClaims: number;
  pendingClaims: number;
  totalMatches: number;
  pendingReports: number;
}

export interface AdminUserRow {
  id: string;
  email: string;
  name: string;
  role: string;
  studentId: string | null;
  department: string | null;
  year: number | null;
  isEmailVerified: boolean;
  isVerified: boolean;
  isBanned: boolean;
  reputationScore: number;
  createdAt: string;
  _count: { items: number; claims: number };
}

export interface AdminItemRow {
  id: string;
  title: string;
  description: string;
  type: 'LOST' | 'FOUND';
  status: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
  category: { id: string; name: string };
  _count: { claims: number };
}

export interface AdminClaimRow {
  id: string;
  status: string;
  message: string;
  createdAt: string;
  item: { id: string; title: string };
  claimant: { id: string; name: string; email: string };
  owner: { id: string; name: string; email: string };
}

export interface AdminReportRow {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
  reporter: { id: string; name: string; email: string };
}

export interface AuditLogRow {
  id: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  metadata: any;
  createdAt: string;
  actor: { id: string; name: string; email: string } | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  isActive: boolean;
  _count: { items: number };
}

export interface Location {
  id: string;
  name: string;
  building: string | null;
  room: string | null;
  isActive: boolean;
}