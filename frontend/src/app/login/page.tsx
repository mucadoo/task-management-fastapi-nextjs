'use client';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import LanguageSelector from '@/components/LanguageSelector';
import ThemeToggle from '@/components/ThemeToggle';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuthStore } from '@/store/useAuthStore';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { getLoginSchema } from '@/lib/validations';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { FormControl } from '@/components/ui/FormControl';
import AuthSidebar from '@/components/AuthSidebar';

type LoginForm = z.infer<ReturnType<typeof getLoginSchema>>;

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuthStore();

  const {
    isLoading: authCheckLoading,
    isActionLoading: authActionLoading,
    isAuthenticated,
  } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(getLoginSchema(t)),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data);
    } catch {}
  };

  if (authCheckLoading || isAuthenticated) return null;

  return (
    <div className="min-h-screen flex">
      <AuthSidebar />
      <div className="flex-1 flex flex-col justify-center p-8 lg:p-16 relative bg-warm-50 dark:bg-[#0a0a0a]">
        <div className="absolute top-6 right-6 flex items-center space-x-3">
          <LanguageSelector />
          <ThemeToggle />
        </div>
        <div className="max-w-sm w-full mx-auto">
          <div className="mb-8">
            <div className="rule-brand w-8 mb-4 h-1" />
            <h2 className="text-2xl font-bold text-warm-900 dark:text-gray-100 tracking-tight">
              {t('auth.sign_in_header')}
            </h2>
            <p className="mt-2 text-sm text-warm-500 dark:text-gray-400">
              {t('auth.or')}{' '}
              <Link href="/register" className="text-brand-500 font-semibold hover:underline">
                {t('auth.no_account')}
              </Link>
            </p>
          </div>

          <div className="card-surface p-6">
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <FormControl
                  id="identifier"
                  label={t('auth.email_or_username')}
                  error={errors.identifier?.message}
                >
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400" />
                    <input
                      id="identifier"
                      {...register('identifier')}
                      type="text"
                      className={cn('input-base pl-10', errors.identifier && 'border-red-500')}
                      placeholder={t('auth.email_or_username')}
                      disabled={authActionLoading}
                    />
                  </div>
                </FormControl>

                <FormControl
                  id="password"
                  label={t('auth.password')}
                  error={errors.password?.message}
                >
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400" />
                    <input
                      id="password"
                      {...register('password')}
                      type="password"
                      className={cn('input-base pl-10', errors.password && 'border-red-500')}
                      placeholder={t('auth.password')}
                      disabled={authActionLoading}
                    />
                  </div>
                </FormControl>
              </div>
              <button type="submit" disabled={authActionLoading} className="btn-primary w-full">
                {authActionLoading ? (
                  <LoadingSpinner size="sm" className="text-white" />
                ) : (
                  <>
                    {t('auth.login')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
