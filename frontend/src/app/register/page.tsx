'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/auth-service';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import LanguageSelector from '@/components/LanguageSelector';
import ThemeToggle from '@/components/ThemeToggle';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuthStore } from '@/store/useAuthStore';
import { Mail, Lock, User, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { getRegisterSchema } from '@/lib/validations';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { FormControl } from '@/components/ui/FormControl';
import AuthSidebar from '@/components/AuthSidebar';

type RegisterForm = z.infer<ReturnType<typeof getRegisterSchema>>;

export default function RegisterPage() {
  const { t } = useTranslation();
  const { register: registerUser, isLoading: authActionLoading } = useAuthStore();
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  
  const router = useRouter();
  const { isLoading: authCheckLoading } = useAuth(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(getRegisterSchema(t)),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const emailValue = watch('email');
  const [debouncedEmail] = useDebounce(emailValue, 500);

  useEffect(() => {
    const checkEmail = async () => {
      if (!debouncedEmail || errors.email) {
        setEmailStatus('idle');
        return;
      }
      setEmailStatus('checking');
      try {
        const { available } = await authService.checkEmail(debouncedEmail);
        setEmailStatus(available ? 'available' : 'taken');
      } catch {
        setEmailStatus('idle');
      }
    };
    checkEmail();
  }, [debouncedEmail, errors.email]);

  const onSubmit = async (data: RegisterForm) => {
    if (emailStatus === 'taken') return;
    try {
      await registerUser({ email: data.email, name: data.name, password: data.password });
      router.push('/app');
    } catch (err) {
      // Handled by store
    }
  };

  if (authCheckLoading) return null;

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
              {t('auth.register_header')}
            </h2>
            <p className="mt-2 text-sm text-warm-500 dark:text-gray-400">
              {t('auth.or')}{' '}
              <Link href="/login" className="text-brand-500 font-semibold hover:underline">
                {t('auth.already_registered')}
              </Link>
            </p>
          </div>
          <div className="card-surface p-6">
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <FormControl id="name" label={t('auth.name')} error={errors.name?.message}>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400" />
                    <input
                      id="name"
                      {...register('name')}
                      type="text"
                      className={cn("input-base pl-10", errors.name && "border-red-500")}
                      placeholder={t('auth.name')}
                      disabled={authActionLoading}
                    />
                  </div>
                </FormControl>

                <FormControl 
                  id="email" 
                  label={t('auth.email')} 
                  error={errors.email?.message || (emailStatus === 'taken' ? t('profile.email_taken') : undefined)}
                >
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400" />
                    <input
                      id="email"
                      {...register('email')}
                      type="email"
                      className={cn(
                        "input-base pl-10 pr-10",
                        errors.email || emailStatus === 'taken' ? 'border-red-500 focus:ring-red-500/20' : emailStatus === 'available' ? 'border-emerald-500 focus:ring-emerald-500/20' : ''
                      )}
                      placeholder={t('auth.email')}
                      disabled={authActionLoading}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {emailStatus === 'checking' && <Loader2 className="h-4 w-4 text-warm-400 animate-spin" />}
                      {emailStatus === 'available' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                      {(emailStatus === 'taken' || errors.email) && <AlertCircle className="h-4 w-4 text-red-500" />}
                    </div>
                  </div>
                </FormControl>

                <FormControl id="password" label={t('auth.password')} error={errors.password?.message}>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400" />
                    <input
                      id="password"
                      {...register('password')}
                      type="password"
                      className={cn("input-base pl-10", errors.password && "border-red-500")}
                      placeholder={t('auth.password')}
                      disabled={authActionLoading}
                    />
                  </div>
                </FormControl>

                <FormControl id="confirmPassword" label={t('auth.confirm_password')} error={errors.confirmPassword?.message}>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400" />
                    <input
                      id="confirmPassword"
                      {...register('confirmPassword')}
                      type="password"
                      className={cn("input-base pl-10", errors.confirmPassword && "border-red-500")}
                      placeholder={t('auth.confirm_password')}
                      disabled={authActionLoading}
                    />
                  </div>
                </FormControl>
              </div>
              <button type="submit" disabled={authActionLoading || emailStatus === 'taken'} className="btn-primary w-full mt-2">
                {authActionLoading ? <LoadingSpinner size="sm" className="text-white" /> : (
                  <>
                    {t('auth.register')}
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
