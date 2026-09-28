import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoginPage from '@/features/auth/pages/LoginPage';
import DashboardPage from '@/features/dashboard/pages/DashboardPage';
import UsersPage from '@/features/users/pages/UsersPage';
import ItemsPage from '@/features/items/pages/ItemsPage';
import ClaimsPage from '@/features/claims/pages/ClaimsPage';
import ReportsPage from '@/features/reports/pages/ReportsPage';
import AuditPage from '@/features/audit/pages/AuditPage';
import CategoriesPage from '@/features/categories/pages/CategoriesPage';
import LocationsPage from '@/features/locations/pages/LocationsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/items" element={<ItemsPage />} />
          <Route path="/claims" element={<ClaimsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/audit" element={<AuditPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/locations" element={<LocationsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}