import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Mail,
  Building2,
  GraduationCap,
  IdCard,
  Award,
  Calendar,
  Package,
  Shield,
  Loader2,
} from 'lucide-react';
import { api } from '@/lib/api';

interface Profile {
  id: string;
  email: string;
  name: string;
  role: string;
  department: string | null;
  year: number | null;
  studentId: string | null;
  phone: string | null;
  avatarUrl: string | null;
  bio: string | null;
  isEmailVerified: boolean;
  isVerified: boolean;
  reputationScore: number;
  createdAt: string;
  _count: { items: number; claims: number; ownedClaims: number };
}

export default function ProfilePage() {
  const { t } = useTranslation();
  

  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      return data.data as Profile;
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-uiu-orange" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-3xl">
        {/* Header card */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-uiu-orange text-2xl font-bold text-white">
              {data.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 className="text-2xl font-bold">{data.name}</h1>
                {data.isVerified && (
                  <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    <Shield className="h-3 w-3" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-muted-foreground">{data.email}</p>
              <p className="mt-1 inline-block rounded-md bg-uiu-orange/10 px-2 py-0.5 text-xs font-medium text-uiu-orange">
                {data.role}
              </p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              icon={<Package className="h-5 w-5" />}
              label={t('profile.myItems')}
              value={data._count.items}
            />
            <StatCard
              icon={<Award className="h-5 w-5" />}
              label={t('profile.claims')}
              value={data._count.claims}
            />
            <StatCard
              icon={<Shield className="h-5 w-5" />}
              label={t('profile.received')}
              value={data._count.ownedClaims}
            />
            <StatCard
              icon={<Award className="h-5 w-5" />}
              label={t('profile.reputation')}
              value={data.reputationScore}
            />
          </div>
        </div>

        {/* Details card */}
        <div className="mt-6 rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">{t('profile.details')}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoRow icon={<Mail className="h-4 w-4" />} label={t('auth.email')} value={data.email} />
            <InfoRow
              icon={<Building2 className="h-4 w-4" />}
              label={t('auth.department')}
              value={data.department || '—'}
            />
            <InfoRow
              icon={<GraduationCap className="h-4 w-4" />}
              label={t('auth.year')}
              value={data.year ? `Year ${data.year}` : '—'}
            />
            <InfoRow
              icon={<IdCard className="h-4 w-4" />}
              label="Student ID"
              value={data.studentId || '—'}
            />
            <InfoRow
              icon={<Calendar className="h-4 w-4" />}
              label="Joined"
              value={new Date(data.createdAt).toLocaleDateString()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-background p-3 text-center">
      <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-uiu-orange/10 text-uiu-orange">
        {icon}
      </div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}