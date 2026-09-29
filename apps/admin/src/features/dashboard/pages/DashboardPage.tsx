import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Users, Package, CheckCircle, MessageSquare, Flag,
  Sparkles, TrendingUp, Activity, 
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import Topbar from '@/components/layout/Topbar';
import { api, type Stats } from '@/lib/api';

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/stats');
      return data.data as Stats;
    },
  });

  const { data: daily } = useQuery({
    queryKey: ['admin-daily'],
    queryFn: async () => {
      const { data } = await api.get('/admin/analytics/daily');
      return data.data as { date: string; items: number; users: number }[];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['admin-categories-chart'],
    queryFn: async () => {
      const { data } = await api.get('/admin/analytics/categories');
      return data.data as { name: string; count: number }[];
    },
  });

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      text: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Total Items',
      value: stats?.totalItems ?? 0,
      icon: Package,
      gradient: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-500/10',
      text: 'text-purple-600 dark:text-purple-400',
    },
    {
      label: 'Open Items',
      value: stats?.openItems ?? 0,
      icon: TrendingUp,
      gradient: 'from-uiu-orange to-uiu-orange-dark',
      bg: 'bg-orange-50 dark:bg-orange-500/10',
      text: 'text-uiu-orange',
    },
    {
      label: 'Resolved',
      value: stats?.resolvedItems ?? 0,
      icon: CheckCircle,
      gradient: 'from-green-500 to-green-600',
      bg: 'bg-green-50 dark:bg-green-500/10',
      text: 'text-green-600 dark:text-green-400',
    },
    {
      label: 'Total Claims',
      value: stats?.totalClaims ?? 0,
      icon: MessageSquare,
      gradient: 'from-indigo-500 to-indigo-600',
      bg: 'bg-indigo-50 dark:bg-indigo-500/10',
      text: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      label: 'Pending Claims',
      value: stats?.pendingClaims ?? 0,
      icon: MessageSquare,
      gradient: 'from-yellow-500 to-yellow-600',
      bg: 'bg-yellow-50 dark:bg-yellow-500/10',
      text: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      label: 'Matches',
      value: stats?.totalMatches ?? 0,
      icon: Sparkles,
      gradient: 'from-pink-500 to-pink-600',
      bg: 'bg-pink-50 dark:bg-pink-500/10',
      text: 'text-pink-600 dark:text-pink-400',
    },
    {
      label: 'Pending Reports',
      value: stats?.pendingReports ?? 0,
      icon: Flag,
      gradient: 'from-red-500 to-red-600',
      bg: 'bg-red-50 dark:bg-red-500/10',
      text: 'text-red-600 dark:text-red-400',
    },
  ];

  return (
    <div>
      <Topbar title="Dashboard" />
      <div className="p-6">
        {/* Stat cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-uiu-orange/30 hover:shadow-lg hover:shadow-uiu-orange/5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </p>
                  <p className="mt-2 text-3xl font-bold tracking-tight">
                    {isLoading ? '—' : s.value}
                  </p>
                </div>
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${s.gradient} text-white shadow-md`}
                >
                  <s.icon className="h-5 w-5" />
                </div>
              </div>
              <div className={`absolute -bottom-8 -right-8 h-24 w-24 rounded-full ${s.bg} opacity-50 blur-2xl transition-all group-hover:scale-125`} />
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold tracking-tight">Activity</h3>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-uiu-orange/10 px-2.5 py-1 text-xs font-medium text-uiu-orange">
                <Activity className="h-3 w-3" />
                Live
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={daily || []}>
                <defs>
                  <linearGradient id="itemsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F26522" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F26522" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} vertical={false} />
                <XAxis
                  dataKey="date"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#9ca3af' }}
                />
                <YAxis
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#9ca3af' }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="items"
                  stroke="#F26522"
                  strokeWidth={2.5}
                  fill="url(#itemsGradient)"
                  name="Items"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm"
          >
            <div className="mb-4">
              <h3 className="font-semibold tracking-tight">Items by Category</h3>
              <p className="text-xs text-muted-foreground">Distribution across categories</p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categories || []}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F26522" />
                    <stop offset="100%" stopColor="#D9541A" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} vertical={false} />
                <XAxis
                  dataKey="name"
                  fontSize={10}
                  angle={-25}
                  textAnchor="end"
                  height={60}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#9ca3af' }}
                />
                <YAxis
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#9ca3af' }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    fontSize: '12px',
                  }}
                  cursor={{ fill: '#f3f4f6' }}
                />
                <Bar
                  dataKey="count"
                  fill="url(#barGradient)"
                  radius={[6, 6, 0, 0]}
                  name="Items"
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </div>
  );
}