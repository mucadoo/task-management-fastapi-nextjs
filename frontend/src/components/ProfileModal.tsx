'use client';
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
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
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
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
                <Label htmlFor="name">{t('common.name')}</Label>
                <Input
                  id="name"
                  {...register('name')}
                  type="text"
                  placeholder={t('common.name')}
                  className={errors.name && touchedFields.name ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {errors.name && touchedFields.name && (
                  <p className="text-xs text-destructive font-medium">
                    {errors.name.message as string}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('common.email')}</Label>
                <div className="relative">
                  <Input
                    id="email"
                    {...register('email')}
                    type="email"
                    placeholder={t('common.email')}
                    className={`pr-10 ${emailStatus === 'taken' ? 'border-destructive focus-visible:ring-destructive' : emailStatus === 'available' ? 'border-emerald-500 focus-visible:ring-emerald-500' : (errors.email && touchedFields.email ? 'border-destructive focus-visible:ring-destructive' : '')}`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {emailStatus === 'checking' && (
                      <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                    )}
                    {emailStatus === 'available' && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    )}
                    {emailStatus === 'taken' && (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                </div>
                {emailStatus === 'checking' && (
                  <p className="text-xs text-muted-foreground">
                    {t('profile.email_checking')}
                  </p>
                )}
                {emailStatus === 'available' && (
                  <p className="text-xs text-emerald-500">
                    {t('profile.email_available')}
                  </p>
                )}
                {emailStatus === 'taken' && (
                  <p className="text-xs text-destructive font-medium">
                    {t('profile.email_taken')}
                  </p>
                )}
                {errors.email && touchedFields.email && (
                  <p className="text-xs text-destructive font-medium">
                    {errors.email.message as string}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">{t('common.username')}</Label>
                <div className="relative">
                  <Input
                    id="username"
                    {...register('username')}
                    type="text"
                    placeholder={t('common.username')}
                    className={`pr-10 ${usernameStatus === 'taken' ? 'border-destructive focus-visible:ring-destructive' : usernameStatus === 'available' ? 'border-emerald-500 focus-visible:ring-emerald-500' : (errors.username && touchedFields.username ? 'border-destructive focus-visible:ring-destructive' : '')}`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {usernameStatus === 'checking' && (
                      <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                    )}
                    {usernameStatus === 'available' && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    )}
                    {usernameStatus === 'taken' && (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                </div>
                {usernameStatus === 'checking' && (
                  <p className="text-xs text-muted-foreground">
                    {t('profile.username_checking')}
                  </p>
                )}
                {usernameStatus === 'available' && (
                  <p className="text-xs text-emerald-500">
                    {t('profile.username_available')}
                  </p>
                )}
                {usernameStatus === 'taken' && (
                  <p className="text-xs text-destructive font-medium">
                    {t('profile.username_taken')}
                  </p>
                )}
                {usernameStatus === 'invalid' && (
                  <p className="text-xs text-destructive font-medium">
                    {t('profile.username_invalid')}
                  </p>
                )}
                {errors.username && touchedFields.username && (
                  <p className="text-xs text-destructive font-medium">
                    {errors.username.message as string}
                  </p>
                )}
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <LoadingSpinner size="sm" className="text-primary-foreground" />
                  ) : (
                    t('common.save_changes')
                  )}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
          <TabsContent value="security" className="mt-4">
            <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current_password">{t('profile.current_password')}</Label>
                <Input
                  id="current_password"
                  {...register('current_password')}
                  type="password"
                  placeholder={t('profile.current_password')}
                  className={errors.current_password && touchedFields.current_password ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {errors.current_password && touchedFields.current_password && (
                  <p className="text-xs text-destructive font-medium">
                    {errors.current_password.message as string}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('profile.new_password')}</Label>
                <Input
                  id="password"
                  {...register('password')}
                  type="password"
                  placeholder={t('profile.new_password')}
                  className={errors.password && touchedFields.password ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {errors.password && touchedFields.password && (
                  <p className="text-xs text-destructive font-medium">
                    {errors.password.message as string}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('profile.confirm_new_password')}</Label>
                <Input
                  id="confirmPassword"
                  {...register('confirmPassword')}
                  type="password"
                  placeholder={t('profile.confirm_new_password')}
                  className={errors.confirmPassword && touchedFields.confirmPassword ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {errors.confirmPassword && touchedFields.confirmPassword && (
                  <p className="text-xs text-destructive font-medium">
                    {errors.confirmPassword.message as string}
                  </p>
                )}
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <LoadingSpinner size="sm" className="text-primary-foreground" />
                  ) : (
                    t('profile.change_password')
                  )}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
