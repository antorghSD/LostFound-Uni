import { Bell, Search, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';

interface Props {
  title: string;
}

export default function Topbar({ title }: Props) {
  const user = useAuthStore((s) => s.user);
  const { theme, toggleTheme } = useThemeStore();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center gap-4 border-b border-border/60 bg-white/80 px-4 backdrop-blur-xl dark:border-white/5 dark:bg-uiu-navy/80 sm:px-6">
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-bold tracking-tight text-uiu-navy dark:text-white sm:text-xl">
          {title}
        </h1>
        <p className="hidden text-xs text-muted-foreground sm:block">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* Search — hidden on small */}
      <div className="relative hidden lg:block">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search..."
          className="w-56 rounded-lg border border-border/60 bg-muted/40 py-2 pl-9 pr-3 text-sm focus:border-uiu-orange/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-uiu-orange/20 dark:border-white/10 dark:bg-uiu-navy-light/50"
        />
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="shrink-0 rounded-lg border border-border/60 p-2 transition hover:bg-muted dark:border-white/10 dark:hover:bg-white/5"
        title="Toggle theme"
      >
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      {/* Notifications */}
      <button className="relative shrink-0 rounded-lg border border-border/60 p-2 transition hover:bg-muted dark:border-white/10 dark:hover:bg-white/5">
        <Bell className="h-4 w-4" />
        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-uiu-orange ring-2 ring-white dark:ring-uiu-navy" />
      </button>

      {/* Avatar */}
      <div className="flex shrink-0 items-center gap-2 rounded-lg border border-border/60 py-1 pl-1 pr-3 dark:border-white/10">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-uiu-orange to-uiu-orange-dark text-xs font-bold text-white">
          {user?.name.charAt(0).toUpperCase()}
        </div>
        <span className="hidden text-xs font-medium sm:block">{user?.name}</span>
      </div>
    </header>
  );
}