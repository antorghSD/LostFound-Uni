import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z
    .string()
    .email('Invalid email')
    .refine((email) => email.endsWith('@uiu.ac.bd'), {
      message: 'Only @uiu.ac.bd emails are allowed',
    }),
  password: z
    .string()
    .min(10, 'Minimum 10 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  department: z.string().optional(),
  year: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { register: registerUser, isLoading } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        department: data.department,
        year: data.year ? Number(data.year) : undefined,
      });
      toast.success('Account created! Welcome to UIU Lost & Found');
      nav('/');
    } catch (e: any) {
      const msg = e.response?.data?.error || 'Registration failed';
      const details = e.response?.data?.details;
      if (details && Array.isArray(details)) {
        toast.error(details[0]?.message || msg);
      } else {
        toast.error(msg);
      }
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
            <h1 className="text-2xl font-bold">{t('auth.createAccount')}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Use your <b>@uiu.ac.bd</b> email
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t('auth.name')}</label>
              <input
                {...register('name')}
                placeholder="Rahim Uddin"
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uiu-orange"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

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
                placeholder="Min 10 chars, 1 uppercase, 1 number"
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uiu-orange"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">{t('auth.department')}</label>
                <input
                  {...register('department')}
                  placeholder="CSE"
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uiu-orange"
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t('auth.year')}</label>
                <input
                  {...register('year')}
                  type="number"
                  placeholder="3"
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uiu-orange"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-uiu-orange py-2 font-medium text-white hover:bg-uiu-orange-dark disabled:opacity-50"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? t('common.loading') : t('auth.registerBtn')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm">
            {t('auth.haveAccount')}{' '}
            <Link to="/login" className="font-medium text-uiu-orange hover:underline">
              {t('nav.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}