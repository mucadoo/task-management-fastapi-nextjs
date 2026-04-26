'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import LanguageSelector from '../../components/LanguageSelector';
import ThemeToggle from '../../components/ThemeToggle';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useAuthStore } from '../../store/useAuthStore';
import { Mail, Lock, ArrowRight, BookOpen } from 'lucide-react';
import { getLoginSchema } from '../../lib/validations';
import * as z from 'zod';

type LoginForm = z.infer<ReturnType<typeof getLoginSchema>>;

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

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
      router.push('/app');
    } catch (err) {
      // Error handled by store
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-5/12 bg-brand-600 dark:bg-brand-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)',
          backgroundSize: '20px 20px',
        }} />
        <div className="relative z-10">
          <div className="w-10 h-10 bg-white rounded flex items-center justify-center mb-6">
            <BookOpen className="text-brand-600 h-6 w-6" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">TaskFlow</h1>
          <p className="text-white/80">{t('auth.slogan')}</p>
        </div>
        <div className="relative z-10 text-white/60 text-sm">
          © {new Date().getFullYear()} {t('common.copyright')}
        </div>
      </div>
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
                <div className="space-y-2">
                  <label htmlFor="identifier" className="text-[10px] font-bold uppercase tracking-wider text-warm-500 ml-1">
                    {t('auth.email_or_username')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400" />
                    <input
                      id="identifier"
                      {...register('identifier')}
                      type="text"
                      className={cn("input-base pl-10", errors.identifier && "border-red-500")}
                      placeholder={t('auth.email_or_username')}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.identifier && (
                    <p className="text-[10px] text-red-500 font-medium ml-1">{errors.identifier.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-[10px] font-bold uppercase tracking-wider text-warm-500 ml-1">
                    {t('auth.password')}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400" />
                    <input
                      id="password"
                      {...register('password')}
                      type="password"
                      className={cn("input-base pl-10", errors.password && "border-red-500")}
                      placeholder={t('auth.password')}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-[10px] text-red-500 font-medium ml-1">{errors.password.message}</p>
                  )}
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="btn-primary w-full">
                {isLoading ? (
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

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
