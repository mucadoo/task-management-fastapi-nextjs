'use client';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import ErrorMessage from './ui/ErrorMessage';
import LoadingSpinner from './ui/LoadingSpinner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDebounce } from 'use-debounce';
import { User } from '../types/auth';
interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  initialTab?: 'personal' | 'security';
}
export default function ProfileModal({
  isOpen,
  onClose,
  onLogout,
  initialTab = 'personal',
}: ProfileModalProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'personal' | 'security'>(initialTab);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'invalid'
  >('idle');
  const personalSchema = z.object({
    name: z.string().min(1, t('profile.name_required')),
    email: z.string().email(t('profile.email_invalid')),
    username: z
      .string()
      .min(3, t('profile.username_invalid'))
      .regex(/^[a-zA-Z_]+$/, t('profile.username_invalid'))
      .transform((val) => val.toLowerCase())
      .optional()
      .or(z.literal('')),
  });
  const securitySchema = z
    .object({
      current_password: z.string().min(1, t('profile.current_password_required')),
      password: z
        .string()
        .min(8, t('profile.password_min'))
        .regex(/[A-Z]/, t('profile.password_uppercase'))
        .regex(/[a-z]/, t('profile.password_lowercase'))
        .regex(/[0-9]/, t('profile.password_number'))
        .regex(/[^A-Za-z0-9]/, t('profile.password_special')),
      confirmPassword: z.string().min(1, t('profile.password_match')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('profile.password_match'),
      path: ['confirmPassword'],
    });
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(activeTab === 'personal' ? personalSchema : securitySchema),
    defaultValues: {
      name: '',
      email: '',
      username: '',
      current_password: '',
      password: '',
      confirmPassword: '',
    },
  });
  const watchedUsername = watch('username');
  const [debouncedUsername] = useDebounce(watchedUsername, 500);
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      api
        .getMe()
        .then((data) => {
          setUser(data);
          reset({
            name: data.name || '',
            email: data.email,
            username: data.username || '',
            current_password: '',
            password: '',
            confirmPassword: '',
          });
        })
        .catch(() => setError(t('profile.error_load')))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, initialTab, reset, t]);
  useEffect(() => {
    const checkAvailability = async () => {
      if (!debouncedUsername || debouncedUsername === user?.username) {
        setUsernameStatus('idle');
        return;
      }
      if (debouncedUsername.length < 3 || !/^[a-zA-Z_]+$/.test(debouncedUsername)) {
        setUsernameStatus('invalid');
        return;
      }
      setUsernameStatus('checking');
      try {
        const { available } = await api.checkUsername(debouncedUsername);
        setUsernameStatus(available ? 'available' : 'taken');
      } catch {
        setUsernameStatus('idle');
      }
    };
    if (activeTab === 'personal') {
      checkAvailability();
    }
  }, [debouncedUsername, user?.username, activeTab]);
  const onTabChange = (tab: 'personal' | 'security') => {
    setActiveTab(tab);
    setError(null);
    setSuccess(null);
    reset({
      name: user?.name || '',
      email: user?.email || '',
      username: user?.username || '',
      current_password: '',
      password: '',
      confirmPassword: '',
    });
  };
  const onSaveProfile = async (data: any) => {
    if (activeTab === 'personal' && usernameStatus === 'taken') return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const payload =
        activeTab === 'personal'
          ? { name: data.name, email: data.email, username: data.username }
          : { current_password: data.current_password, password: data.password };
      const updatedUser = await api.updateMe(payload);
      setUser(updatedUser);
      setSuccess(
        activeTab === 'personal' ? t('profile.update_success') : t('profile.password_success'),
      );
      if (activeTab === 'security') {
        reset({
          name: updatedUser.name || '',
          email: updatedUser.email,
          username: updatedUser.username || '',
          current_password: '',
          password: '',
          confirmPassword: '',
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="card-surface w-full max-w-md p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-warm-900 dark:text-white">
              {t('profile.title')}
            </h2>
            <div className="rule-brand" />
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-warm-100 dark:hover:bg-warm-900 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-5 w-5 text-warm-500" />
          </button>
        </div>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <div className="flex gap-1 p-1 bg-warm-100 dark:bg-white/5 rounded-lg">
              <button
                onClick={() => onTabChange('personal')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${activeTab === 'personal' ? 'bg-white dark:bg-white/10 text-brand-500 shadow-sm' : 'text-warm-600 dark:text-gray-500 hover:text-warm-900 dark:hover:text-gray-300'}`}
              >
                {t('profile.personal_info')}
              </button>
              <button
                onClick={() => onTabChange('security')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${activeTab === 'security' ? 'bg-white dark:bg-white/10 text-brand-500 shadow-sm' : 'text-warm-600 dark:text-gray-500 hover:text-warm-900 dark:hover:text-gray-300'}`}
              >
                {t('profile.security')}
              </button>
            </div>
            {error && <ErrorMessage message={error} />}
            {success && (
              <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold">
                <CheckCircle2 className="h-4 w-4" /> {success}
              </div>
            )}
            <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
              <div className="space-y-3">
                {activeTab === 'personal' ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-warm-500 ml-1">
                        {t('common.name')}
                      </label>
                      <input
                        {...register('name')}
                        type="text"
                        className="input-base"
                        placeholder={t('common.name')}
                      />
                      {errors.name && (
                        <p className="text-[10px] text-red-500 ml-1">
                          {errors.name.message as string}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-warm-500 ml-1">
                        {t('common.email')}
                      </label>
                      <input
                        {...register('email')}
                        type="email"
                        className="input-base"
                        placeholder={t('common.email')}
                      />
                      {errors.email && (
                        <p className="text-[10px] text-red-500 ml-1">
                          {errors.email.message as string}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-warm-500 ml-1">
                        {t('common.username')}
                      </label>
                      <div className="relative">
                        <input
                          {...register('username')}
                          type="text"
                          className={`input-base pr-10 ${usernameStatus === 'taken' ? 'border-red-500 focus:border-red-500' : usernameStatus === 'available' ? 'border-emerald-500 focus:border-emerald-500' : ''}`}
                          placeholder={t('common.username')}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {usernameStatus === 'checking' && (
                            <Loader2 className="h-4 w-4 text-warm-400 animate-spin" />
                          )}
                          {usernameStatus === 'available' && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          )}
                          {usernameStatus === 'taken' && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                      {usernameStatus === 'checking' && (
                        <p className="text-[10px] text-warm-500 ml-1">
                          {t('profile.username_checking')}
                        </p>
                      )}
                      {usernameStatus === 'available' && (
                        <p className="text-[10px] text-emerald-500 ml-1">
                          {t('profile.username_available')}
                        </p>
                      )}
                      {usernameStatus === 'taken' && (
                        <p className="text-[10px] text-red-500 ml-1">
                          {t('profile.username_taken')}
                        </p>
                      )}
                      {usernameStatus === 'invalid' && (
                        <p className="text-[10px] text-red-500 ml-1">
                          {t('profile.username_invalid')}
                        </p>
                      )}
                      {errors.username && (
                        <p className="text-[10px] text-red-500 ml-1">
                          {errors.username.message as string}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-warm-500 ml-1">
                        {t('profile.current_password')}
                      </label>
                      <input
                        {...register('current_password')}
                        type="password"
                        className="input-base"
                        placeholder={t('profile.current_password')}
                      />
                      {errors.current_password && (
                        <p className="text-[10px] text-red-500 ml-1">
                          {errors.current_password.message as string}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-warm-500 ml-1">
                        {t('profile.new_password')}
                      </label>
                      <input
                        {...register('password')}
                        type="password"
                        className="input-base"
                        placeholder={t('profile.new_password')}
                      />
                      {errors.password && (
                        <p className="text-[10px] text-red-500 ml-1">
                          {errors.password.message as string}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-warm-500 ml-1">
                        {t('profile.confirm_new_password')}
                      </label>
                      <input
                        {...register('confirmPassword')}
                        type="password"
                        className="input-base"
                        placeholder={t('profile.confirm_new_password')}
                      />
                      {errors.confirmPassword && (
                        <p className="text-[10px] text-red-500 ml-1">
                          {errors.confirmPassword.message as string}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 btn-ghost cursor-pointer">
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting || (activeTab === 'personal' && usernameStatus === 'taken')
                  }
                  className="flex-[1.5] btn-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting && <LoadingSpinner size="sm" color="white" />}
                  {activeTab === 'personal'
                    ? t('common.save_changes')
                    : t('profile.change_password')}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
