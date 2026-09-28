import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Bell, Globe, LogOut, Plus, User, Package, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { api } from '@/lib/api';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const { data: unreadCount } = useQuery({
    queryKey: ['unread-count'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/notifications/unread-count');
        return data.data.count as number;
      } catch {
        return 0;
      }
    },
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const toggleLang = () => {
    const next = i18n.language === 'bn' ? 'en' : 'bn';
    i18n.changeLanguage(next);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur dark:border-uiu-navy-light dark:bg-uiu-navy/95">
      <div className="container flex h-16 items-center gap-2 sm:gap-3">
        <Link to="/" className="flex items-center gap-2 font-bold">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-uiu-orange text-sm text-white shadow">
            UIU
          </div>
          <span className="hidden text-lg text-uiu-navy dark:text-white sm:block">
            {t('app.name')}
          </span>
        </Link>

        <div className="flex-1" />

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-md border p-2 hover:bg-muted dark:border-uiu-navy-light dark:hover:bg-uiu-navy-light"
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        {/* Language toggle */}
        <button
          onClick={toggleLang}
          className="flex items-center gap-1 rounded-md border px-2 py-1.5 text-sm hover:bg-muted dark:border-uiu-navy-light dark:hover:bg-uiu-navy-light"
        >
          <Globe className="h-4 w-4" />
          {i18n.language === 'bn' ? 'বাং' : 'EN'}
        </button>

        {isAuthenticated ? (
          <>
            <Link
              to="/post"
              className="hidden items-center gap-1 rounded-md bg-uiu-orange px-3 py-1.5 text-sm font-medium text-white hover:bg-uiu-orange-dark sm:flex"
            >
              <Plus className="h-4 w-4" />
              {t('nav.post')}
            </Link>

            <Link
              to="/my-items"
              className="rounded-md p-2 hover:bg-muted dark:hover:bg-uiu-navy-light"
              title={t('nav.myItems')}
            >
              <Package className="h-5 w-5" />
            </Link>

            <Link
              to="/notifications"
              className="relative rounded-md p-2 hover:bg-muted dark:hover:bg-uiu-navy-light"
            >
              <Bell className="h-5 w-5" />
              {unreadCount !== undefined && unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-uiu-navy">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            <Link
              to="/profile"
              className="rounded-md p-2 hover:bg-muted dark:hover:bg-uiu-navy-light"
            >
              <User className="h-5 w-5" />
            </Link>

            <button
              onClick={handleLogout}
              className="rounded-md p-2 text-destructive hover:bg-muted dark:hover:bg-uiu-navy-light"
              title={t('nav.logout')}
            >
              <LogOut className="h-5 w-5" />
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="rounded-md px-3 py-1.5 text-sm font-medium hover:bg-muted dark:hover:bg-uiu-navy-light"
            >
              {t('nav.login')}
            </Link>
            <Link
              to="/register"
              className="rounded-md bg-uiu-orange px-3 py-1.5 text-sm font-medium text-white hover:bg-uiu-orange-dark"
            >
              {t('nav.register')}
            </Link>
          </>
        )}
      </div>
    </header>
  );
}