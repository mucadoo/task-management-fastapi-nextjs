'use client';
import { useState, useEffect } from 'react';
import { useForm, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDebounce } from 'use-debounce';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/services/auth-service';
import { getPersonalSchema, getSecuritySchema } from '@/lib/validations';

interface UseProfileFormProps {
  isOpen: boolean;
  activeTab: 'personal' | 'security';
  onSuccess?: () => void;
}

export function useProfileForm({ isOpen, activeTab }: UseProfileFormProps) {
  const { t } = useTranslation();
  const { user, updateMe } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [usernameStatus, setUsernameStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'invalid'
  >('idle');
  const [emailStatus, setEmailStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'invalid'
  >('idle');

  const form = useForm({
    resolver: zodResolver(activeTab === 'personal' ? getPersonalSchema(t) : getSecuritySchema(t)),
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
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = form;

  const watchedUsername = watch('username');
  const watchedEmail = watch('email');
  const [debouncedUsername] = useDebounce(watchedUsername, 500);
  const [debouncedEmail] = useDebounce(watchedEmail, 500);

  // Reset form when modal opens or tab changes
  useEffect(() => {
    if (isOpen) {
      clearErrors();
      reset({
        name: user?.name || '',
        email: user?.email || '',
        username: user?.username || '',
        current_password: '',
        password: '',
        confirmPassword: '',
      });
      setUsernameStatus('idle');
      setEmailStatus('idle');
    }
  }, [isOpen, activeTab, reset, user, clearErrors]);

  const usernameError = (errors as FieldErrors<{ username: string }>).username;
  const emailError = (errors as FieldErrors<{ email: string }>).email;

  // Username availability check
  useEffect(() => {
    const checkUsername = async () => {
      if (!debouncedUsername || debouncedUsername === user?.username) {
        setUsernameStatus('idle');
        return;
      }
      if (usernameError) {
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
    if (activeTab === 'personal') checkUsername();
  }, [debouncedUsername, user?.username, activeTab, !!errors.username]);

  // Email availability check
  useEffect(() => {
    const checkEmail = async () => {
      if (!debouncedEmail || debouncedEmail === user?.email) {
        setEmailStatus('idle');
        return;
      }
      if (emailError) {
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
    if (activeTab === 'personal') checkEmail();
  }, [debouncedEmail, user?.email, activeTab, !!errors.email]);

  const onFormSubmit = async (data: any) => {
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
      }
    } catch {
      // Handled by store
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
