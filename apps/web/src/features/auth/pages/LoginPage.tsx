
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { login, isLoading } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      nav('/');
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center py-10">
      <div className="w-full max-w-md">
        <div className="rounded-xl border bg-card p-8 shadow-sm">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-uiu-orange text-xl font-bold text-white">
              UIU
            </div>
            <h1 className="text-2xl font-bold">{t('auth.welcome')}</h1>
            <p className="text-sm text-muted-foreground">{t('app.name')}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t('auth.email')}</label>
              <input
                {...register('email')}
                type="email"
                placeholder="student@uiu.ac.bd"
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uiu-orange"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">{t('auth.password')}</label>
              <input
                {...register('password')}
                type="password"
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uiu-orange"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-uiu-orange py-2 font-medium text-white hover:bg-uiu-orange-dark disabled:opacity-50"
            >
              {isLoading ? t('common.loading') : t('auth.loginBtn')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="font-medium text-uiu-orange hover:underline">
              {t('nav.register')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}