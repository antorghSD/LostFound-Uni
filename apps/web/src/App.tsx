import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import PageTransition from '@/components/PageTransition';
import LoadingBar from '@/components/LoadingBar';
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
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col">
      <LoadingBar />
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/login"
              element={
                <PageTransition>
                  <LoginPage />
                </PageTransition>
              }
            />
            <Route
              path="/register"
              element={
                <PageTransition>
                  <RegisterPage />
                </PageTransition>
              }
            />
            <Route
              path="/"
              element={
                <PageTransition>
                  <HomePage />
                </PageTransition>
              }
            />
            <Route
              path="/item/:id"
              element={
                <PageTransition>
                  <ItemDetailPage />
                </PageTransition>
              }
            />

            <Route element={<ProtectedRoute />}>
              <Route
                path="/post"
                element={
                  <PageTransition>
                    <PostItemPage />
                  </PageTransition>
                }
              />
              <Route
                path="/my-items"
                element={
                  <PageTransition>
                    <MyItemsPage />
                  </PageTransition>
                }
              />
              <Route
                path="/profile"
                element={
                  <PageTransition>
                    <ProfilePage />
                  </PageTransition>
                }
              />
              <Route
                path="/claims"
                element={
                  <PageTransition>
                    <MyClaimsPage />
                  </PageTransition>
                }
              />
              <Route
                path="/claims/:id"
                element={
                  <PageTransition>
                    <ClaimDetailPage />
                  </PageTransition>
                }
              />
              <Route
                path="/notifications"
                element={
                  <PageTransition>
                    <NotificationsPage />
                  </PageTransition>
                }
              />
              <Route
                path="/matches/:itemId"
                element={
                  <PageTransition>
                    <MatchesPage />
                  </PageTransition>
                }
              />
            </Route>

            <Route
              path="*"
              element={
                <PageTransition>
                  <NotFoundPage />
                </PageTransition>
              }
            />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}