'use client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { useProfileForm } from '@/hooks/useProfileForm';
import { FormField } from './ui/FormField';
import { Input } from './ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/Dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/Tabs';
import { cn } from '@/lib/utils';

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

  const {
    form: {
      register,
      formState: { errors, touchedFields },
    },
    isSubmitting,
    usernameStatus,
    emailStatus,
    onSubmit,
  } = useProfileForm({ isOpen, activeTab });

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'personal' | 'security');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('profile.title')}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="personal">{t('profile.personal_info')}</TabsTrigger>
            <TabsTrigger value="security">{t('profile.security')}</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="mt-4">
            <form onSubmit={onSubmit} className="space-y-4">
              <FormField
                name="name"
                label={t('common.name')}
                required
                error={touchedFields.name ? errors.name?.message : undefined}
              >
                <Input {...register('name')} type="text" placeholder={t('common.name')} />
              </FormField>

              <FormField
                name="email"
                label={t('common.email')}
                required
                error={
                  (touchedFields.email ? errors.email?.message : undefined) ||
                  (emailStatus === 'taken' ? t('profile.email_taken') : undefined)
                }
              >
                <div className="relative">
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder={t('common.email')}
                    className={cn('pr-10', emailStatus === 'available' && 'border-emerald-500')}
                    error={!!(emailStatus === 'taken' || (touchedFields.email && errors.email))}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {emailStatus === 'checking' && (
                      <Loader2 className="h-4 w-4 text-warm-400 animate-spin" />
                    )}
                    {emailStatus === 'available' && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    )}
                    {emailStatus === 'taken' && <AlertCircle className="h-4 w-4 text-red-500" />}
                  </div>
                </div>
              </FormField>
              {emailStatus === 'available' && (
                <p className="text-[10px] text-emerald-500 ml-1 -mt-3 mb-4">
                  {t('profile.email_available')}
                </p>
              )}

              <FormField
                name="username"
                label={t('common.username')}
                required
                error={
                  (touchedFields.username ? errors.username?.message : undefined) ||
                  (usernameStatus === 'taken' ? t('profile.username_taken') : undefined) ||
                  (usernameStatus === 'invalid' ? t('profile.username_invalid') : undefined)
                }
              >
                <div className="relative">
                  <Input
                    {...register('username')}
                    type="text"
                    placeholder={t('common.username')}
                    className={cn('pr-10', usernameStatus === 'available' && 'border-emerald-500')}
                    error={
                      !!(
                        usernameStatus === 'taken' ||
                        (touchedFields.username && errors.username)
                      )
                    }
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {usernameStatus === 'checking' && (
                      <Loader2 className="h-4 w-4 text-warm-400 animate-spin" />
                    )}
                    {usernameStatus === 'available' && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    )}
                    {usernameStatus === 'taken' && <AlertCircle className="h-4 w-4 text-red-500" />}
                  </div>
                </div>
              </FormField>
              {usernameStatus === 'available' && (
                <p className="text-[10px] text-emerald-500 ml-1 -mt-3 mb-4">
                  {t('profile.username_available')}
                </p>
              )}

              <DialogFooter>
                <Button variant="ghost" onClick={onClose}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  {t('common.save_changes')}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="security" className="mt-4">
            <form onSubmit={onSubmit} className="space-y-4">
              <FormField
                name="current_password"
                label={t('profile.current_password')}
                required
                error={touchedFields.current_password ? errors.current_password?.message : undefined}
              >
                <Input
                  {...register('current_password')}
                  type="password"
                  placeholder={t('profile.current_password')}
                />
              </FormField>
              <FormField
                name="password"
                label={t('profile.new_password')}
                required
                error={touchedFields.password ? errors.password?.message : undefined}
              >
                <Input
                  {...register('password')}
                  type="password"
                  placeholder={t('profile.new_password')}
                />
              </FormField>
              <FormField
                name="confirmPassword"
                label={t('profile.confirm_new_password')}
                required
                error={touchedFields.confirmPassword ? errors.confirmPassword?.message : undefined}
              >
                <Input
                  {...register('confirmPassword')}
                  type="password"
                  placeholder={t('profile.confirm_new_password')}
                />
              </FormField>
              <DialogFooter>
                <Button variant="ghost" onClick={onClose}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  {t('profile.change_password')}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
