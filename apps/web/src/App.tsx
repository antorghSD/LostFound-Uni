import { Routes, Route } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import HomePage from '@/features/items/pages/HomePage';
import PostItemPage from '@/features/items/pages/PostItemPage';
import ItemDetailPage from '@/features/items/pages/ItemDetailPage';
import MyItemsPage from '@/features/items/pages/MyItemsPage';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import ProfilePage from '@/features/profile/pages/ProfilePage';
import MyClaimsPage from '@/features/claims/pages/MyClaimsPage';
import ClaimDetailPage from '@/features/claims/pages/ClaimDetailPage';
import NotificationsPage from '@/features/notifications/pages/NotificationsPage';
import MatchesPage from '@/features/matches/pages/MatchesPage';
import NotFoundPage from '@/pages/NotFoundPage';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/item/:id" element={<ItemDetailPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/post" element={<PostItemPage />} />
            <Route path="/my-items" element={<MyItemsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/claims" element={<MyClaimsPage />} />
            <Route path="/claims/:id" element={<ClaimDetailPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/matches/:itemId" element={<MatchesPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}