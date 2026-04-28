'use client';
import { useState, useEffect } from 'react';
import { useForm, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDebounce } from 'use-debounce';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/services/auth-service';
import { getPersonalSchema, getSecuritySchema } from '@/lib/validations';
import { notify } from '@/lib/notifications';
import * as z from 'zod';

interface UseProfileFormProps {
  isOpen: boolean;
  activeTab: 'personal' | 'security';
  onSuccess?: () => void;
}

export function useProfileForm({ activeTab }: UseProfileFormProps) {
  const { t } = useTranslation();
  const { user, updateMe } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [usernameStatus, setUsernameStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'invalid'
  >('idle');
  const [emailStatus, setEmailStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'invalid'
  >('idle');

  const personalSchema = getPersonalSchema(t);
  const securitySchema = getSecuritySchema(t);

  type PersonalFormData = z.infer<typeof personalSchema>;
  type SecurityFormData = z.infer<typeof securitySchema>;
  type FormData = PersonalFormData & SecurityFormData;

  const form = useForm<FormData>({
    resolver: zodResolver(
      activeTab === 'personal' ? personalSchema : securitySchema,
    ) as unknown as Resolver<FormData>,
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      username: user?.username || '',
      current_password: '',
      password: '',
      confirmPassword: '',
    },
  });

  const {
    reset,
    watch,
    handleSubmit,
    formState: { errors },
  } = form;

  const watchedUsername = watch('username');
  const watchedEmail = watch('email');
  const [debouncedUsername] = useDebounce(watchedUsername, 500);
  const [debouncedEmail] = useDebounce(watchedEmail, 500);

  useEffect(() => {
    setUsernameStatus('idle');
    setEmailStatus('idle');
  }, [activeTab]);

  useEffect(() => {
    const checkUsername = async () => {
      if (!debouncedUsername || debouncedUsername === user?.username) {
        setUsernameStatus('idle');
        return;
      }
      if (errors.username) {
        setUsernameStatus('invalid');
        return;
      }
      setUsernameStatus('checking');
      try {
        const { available } = await authService.checkUsername(debouncedUsername);
        setUsernameStatus(available ? 'available' : 'taken');
      } catch {
        setUsernameStatus('idle');
      }
    };
    if (activeTab === 'personal') void checkUsername();
  }, [debouncedUsername, user?.username, activeTab, !!errors.username]);

  useEffect(() => {
    const checkEmail = async () => {
      if (!debouncedEmail || debouncedEmail === user?.email) {
        setEmailStatus('idle');
        return;
      }
      if (errors.email) {
        setEmailStatus('invalid');
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
    if (activeTab === 'personal') void checkEmail();
  }, [debouncedEmail, user?.email, activeTab, !!errors.email]);

  const onFormSubmit = async (data: FormData) => {
    if (activeTab === 'personal' && (usernameStatus === 'taken' || emailStatus === 'taken')) return;
    setIsSubmitting(true);
    try {
      const payload =
        activeTab === 'personal'
          ? { name: data.name, email: data.email, username: data.username }
          : { current_password: data.current_password, password: data.password };

      await updateMe(payload);

      if (activeTab === 'security') {
        reset({ ...form.getValues(), current_password: '', password: '', confirmPassword: '' });
        notify.success('profile.password_change_success');
      } else {
        notify.success('profile.update_success');
      }
    } catch (err: any) {
      if (activeTab === 'security' && err.code === 'INCORRECT_PASSWORD') {
        form.setError('current_password', { 
          type: 'manual', 
          message: t('errors.incorrect_password') 
        });
      } else {
        notify.error(
          err,
          activeTab === 'personal' ? 'profile.update_failed' : 'profile.change_password_failed',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    usernameStatus,
    emailStatus,
    onSubmit: handleSubmit(onFormSubmit),
  };
}
