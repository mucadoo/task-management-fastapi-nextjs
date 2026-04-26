'use client';
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import LoadingSpinner from './ui/LoadingSpinner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDebounce } from 'use-debounce';
import { useAuthStore } from '../store/useAuthStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/Dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/Tabs';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'personal' | 'security';
}

export default function ProfileModal({
  isOpen,
  onClose,
  initialTab = 'personal',
}: ProfileModalProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'personal' | 'security'>(initialTab);
  
  const { user, updateMe } = useAuthStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'invalid'
  >('idle');
  const [emailStatus, setEmailStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'invalid'
  >('idle');

  const personalSchema = useMemo(() => z.object({
    name: z.string().min(1, t('profile.name_required')),
    email: z.string().email(t('profile.email_invalid')),
    username: z
      .string()
      .min(3, t('profile.username_invalid'))
      .regex(/^[a-zA-Z_]+$/, t('profile.username_invalid'))
      .transform((val) => val.toLowerCase())
      .optional()
      .or(z.literal('')),
  }), [t]);

  const securitySchema = useMemo(() => z
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
    }), [t]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    clearErrors,
    formState: { errors, touchedFields },
  } = useForm({
    resolver: zodResolver(activeTab === 'personal' ? personalSchema : securitySchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      username: user?.username || '',
      current_password: '',
      password: '',
      confirmPassword: '',
    },
  });

  const watchedUsername = watch('username');
  const watchedEmail = watch('email');
  const [debouncedUsername] = useDebounce(watchedUsername, 500);
  const [debouncedEmail] = useDebounce(watchedEmail, 500);

  useEffect(() => {
    if (isOpen) {
      clearErrors();
      setActiveTab(initialTab);
      
      reset({
        name: user?.name || '',
        email: user?.email || '',
        username: user?.username || '',
        current_password: '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [isOpen, initialTab, reset, user, clearErrors]);

  useEffect(() => {
    const checkUsernameAvailability = async () => {
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
      checkUsernameAvailability();
    }
  }, [debouncedUsername, user?.username, activeTab]);

  useEffect(() => {
    const checkEmailAvailability = async () => {
      if (!debouncedEmail || debouncedEmail === user?.email) {
        setEmailStatus('idle');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(debouncedEmail)) {
        setEmailStatus('invalid');
        return;
      }
      setEmailStatus('checking');
      try {
        const { available } = await api.checkEmail(debouncedEmail);
        setEmailStatus(available ? 'available' : 'taken');
      } catch {
        setEmailStatus('idle');
      }
    };
    if (activeTab === 'personal') {
      checkEmailAvailability();
    }
  }, [debouncedEmail, user?.email, activeTab]);

  const onTabChange = (tab: 'personal' | 'security') => {
    setActiveTab(tab);
    setUsernameStatus('idle');
    setEmailStatus('idle');
    clearErrors();
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
    if (activeTab === 'personal' && (usernameStatus === 'taken' || emailStatus === 'taken')) return;
    setIsSubmitting(true);
    try {
      const payload =
        activeTab === 'personal'
          ? { name: data.name, email: data.email, username: data.username }
          : { current_password: data.current_password, password: data.password };
      
      await updateMe(payload);
      
      if (activeTab === 'security') {
        reset({
          name: user?.name || '',
          email: user?.email || '',
          username: user?.username || '',
          current_password: '',
          password: '',
          confirmPassword: '',
        });
      }
    } catch (err: any) {
      // Error handled by store via toasts
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('profile.title')}</DialogTitle>
          <div className="rule-brand w-8 h-1" />
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as 'personal' | 'security')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="personal">{t('profile.personal_info')}</TabsTrigger>
            <TabsTrigger value="security">{t('profile.security')}</TabsTrigger>
          </TabsList>
          <TabsContent value="personal" className="mt-4">
            <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-[10px] font-bold uppercase tracking-wider text-warm-500 ml-1">
                  {t('common.name')}
                </label>
                <input
                  id="name"
                  {...register('name')}
                  type="text"
                  placeholder={t('common.name')}
                  className={`input-base ${errors.name && touchedFields.name ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : ''}`}
                />
                {errors.name && touchedFields.name && (
                  <p className="text-xs text-red-500 font-medium ml-1">
                    {errors.name.message as string}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-wider text-warm-500 ml-1">
                  {t('common.email')}
                </label>
                <div className="relative">
                  <input
                    id="email"
                    {...register('email')}
                    type="email"
                    placeholder={t('common.email')}
                    className={`input-base pr-10 ${emailStatus === 'taken' ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : emailStatus === 'available' ? 'border-emerald-500 focus:ring-emerald-500/20 focus:border-emerald-500' : (errors.email && touchedFields.email ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : '')}`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {emailStatus === 'checking' && (
                      <Loader2 className="h-4 w-4 text-warm-400 animate-spin" />
                    )}
                    {emailStatus === 'available' && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    )}
                    {emailStatus === 'taken' && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
                {emailStatus === 'checking' && (
                  <p className="text-xs text-warm-500 ml-1">
                    {t('profile.email_checking')}
                  </p>
                )}
                {emailStatus === 'available' && (
                  <p className="text-xs text-emerald-500 ml-1">
                    {t('profile.email_available')}
                  </p>
                )}
                {emailStatus === 'taken' && (
                  <p className="text-xs text-red-500 font-medium ml-1">
                    {t('profile.email_taken')}
                  </p>
                )}
                {errors.email && touchedFields.email && (
                  <p className="text-xs text-red-500 font-medium ml-1">
                    {errors.email.message as string}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="username" className="text-[10px] font-bold uppercase tracking-wider text-warm-500 ml-1">
                  {t('common.username')}
                </label>
                <div className="relative">
                  <input
                    id="username"
                    {...register('username')}
                    type="text"
                    placeholder={t('common.username')}
                    className={`input-base pr-10 ${usernameStatus === 'taken' ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : usernameStatus === 'available' ? 'border-emerald-500 focus:ring-emerald-500/20 focus:border-emerald-500' : (errors.username && touchedFields.username ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : '')}`}
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
                  <p className="text-xs text-warm-500 ml-1">
                    {t('profile.username_checking')}
                  </p>
                )}
                {usernameStatus === 'available' && (
                  <p className="text-xs text-emerald-500 ml-1">
                    {t('profile.username_available')}
                  </p>
                )}
                {usernameStatus === 'taken' && (
                  <p className="text-xs text-red-500 font-medium ml-1">
                    {t('profile.username_taken')}
                  </p>
                )}
                {usernameStatus === 'invalid' && (
                  <p className="text-xs text-red-500 font-medium ml-1">
                    {t('profile.username_invalid')}
                  </p>
                )}
                {errors.username && touchedFields.username && (
                  <p className="text-xs text-red-500 font-medium ml-1">
                    {errors.username.message as string}
                  </p>
                )}
              </div>
              <DialogFooter className="pt-4 flex flex-row justify-end gap-2">
                <button type="button" onClick={onClose} className="btn-ghost">
                  {t('common.cancel')}
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? (
                    <LoadingSpinner size="sm" className="text-white" />
                  ) : (
                    t('common.save_changes')
                  )}
                </button>
              </DialogFooter>
            </form>
          </TabsContent>
          <TabsContent value="security" className="mt-4">
            <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="current_password" className="text-[10px] font-bold uppercase tracking-wider text-warm-500 ml-1">
                  {t('profile.current_password')}
                </label>
                <input
                  id="current_password"
                  {...register('current_password')}
                  type="password"
                  placeholder={t('profile.current_password')}
                  className={`input-base ${errors.current_password && touchedFields.current_password ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : ''}`}
                />
                {errors.current_password && touchedFields.current_password && (
                  <p className="text-xs text-red-500 font-medium ml-1">
                    {errors.current_password.message as string}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-[10px] font-bold uppercase tracking-wider text-warm-500 ml-1">
                  {t('profile.new_password')}
                </label>
                <input
                  id="password"
                  {...register('password')}
                  type="password"
                  placeholder={t('profile.new_password')}
                  className={`input-base ${errors.password && touchedFields.password ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : ''}`}
                />
                {errors.password && touchedFields.password && (
                  <p className="text-xs text-red-500 font-medium ml-1">
                    {errors.password.message as string}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-[10px] font-bold uppercase tracking-wider text-warm-500 ml-1">
                  {t('profile.confirm_new_password')}
                </label>
                <input
                  id="confirmPassword"
                  {...register('confirmPassword')}
                  type="password"
                  placeholder={t('profile.confirm_new_password')}
                  className={`input-base ${errors.confirmPassword && touchedFields.confirmPassword ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : ''}`}
                />
                {errors.confirmPassword && touchedFields.confirmPassword && (
                  <p className="text-xs text-red-500 font-medium ml-1">
                    {errors.confirmPassword.message as string}
                  </p>
                )}
              </div>
              <DialogFooter className="pt-4 flex flex-row justify-end gap-2">
                <button type="button" onClick={onClose} className="btn-ghost">
                  {t('common.cancel')}
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? (
                    <LoadingSpinner size="sm" className="text-white" />
                  ) : (
                    t('profile.change_password')
                  )}
                </button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
