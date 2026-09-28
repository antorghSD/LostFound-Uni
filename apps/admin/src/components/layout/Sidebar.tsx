import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Package, MessageSquare, Flag,
  ScrollText, FolderTree, MapPin, LogOut, ShieldCheck, Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/users', icon: Users, label: 'Users' },
  { to: '/items', icon: Package, label: 'Items' },
  { to: '/claims', icon: MessageSquare, label: 'Claims' },
  { to: '/reports', icon: Flag, label: 'Reports' },
  { to: '/audit', icon: ScrollText, label: 'Audit Logs' },
  { to: '/categories', icon: FolderTree, label: 'Categories' },
  { to: '/locations', icon: MapPin, label: 'Locations' },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-uiu-navy-light/30 bg-gradient-to-b from-uiu-navy via-uiu-navy to-[#16203a] text-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-white/5 px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-uiu-orange to-uiu-orange-dark shadow-lg shadow-uiu-orange/30">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight tracking-tight">Lost & Found</p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-white/40">
            Admin Panel
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map(({ to, icon: Icon, label, end }, i) => (
          <motion.div
            key={to}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-uiu-orange text-white shadow-lg shadow-uiu-orange/20'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-lg bg-uiu-orange shadow-lg shadow-uiu-orange/30"
                      transition={{ type: 'spring', duration: 0.4 }}
                      style={{ zIndex: -1 }}
                    />
                  )}
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-white/5 p-3">
        <div className="mb-2 flex items-center gap-3 rounded-lg bg-white/5 p-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-uiu-orange to-uiu-orange-dark text-sm font-bold">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold">{user?.name}</p>
            <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-white/40">
              <ShieldCheck className="h-3 w-3" />
              {user?.role}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/10"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}