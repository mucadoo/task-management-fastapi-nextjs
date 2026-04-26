'use client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import LoadingSpinner from './ui/LoadingSpinner';
import { useProfileForm } from '../hooks/useProfileForm';
import { FormControl } from './ui/FormControl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/Dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/Tabs';
import { cn } from '../lib/utils';

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
    form: { register, formState: { errors, touchedFields } },
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
          <div className="rule-brand w-8 h-1" />
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="personal">{t('profile.personal_info')}</TabsTrigger>
            <TabsTrigger value="security">{t('profile.security')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal" className="mt-4">
            <form onSubmit={onSubmit} className="space-y-4">
              <FormControl id="name" label={t('common.name')} error={errors.name && touchedFields.name ? (errors.name.message as string) : undefined}>
                <input
                  id="name"
                  {...register('name')}
                  type="text"
                  placeholder={t('common.name')}
                  className={cn("input-base", errors.name && touchedFields.name && "border-red-500")}
                />
              </FormControl>

              <FormControl 
                id="email" 
                label={t('common.email')} 
                error={(errors.email && touchedFields.email ? (errors.email.message as string) : undefined) || (emailStatus === 'taken' ? t('profile.email_taken') : undefined)}
              >
                <div className="relative">
                  <input
                    id="email"
                    {...register('email')}
                    type="email"
                    placeholder={t('common.email')}
                    className={cn(
                      "input-base pr-10",
                      emailStatus === 'taken' ? 'border-red-500' : emailStatus === 'available' ? 'border-emerald-500' : (errors.email && touchedFields.email && "border-red-500")
                    )}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {emailStatus === 'checking' && <Loader2 className="h-4 w-4 text-warm-400 animate-spin" />}
                    {emailStatus === 'available' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                    {emailStatus === 'taken' && <AlertCircle className="h-4 w-4 text-red-500" />}
                  </div>
                </div>
                {emailStatus === 'available' && <p className="text-[10px] text-emerald-500 ml-1">{t('profile.email_available')}</p>}
              </FormControl>

              <FormControl 
                id="username" 
                label={t('common.username')} 
                error={(errors.username && touchedFields.username ? (errors.username.message as string) : undefined) || (usernameStatus === 'taken' ? t('profile.username_taken') : undefined) || (usernameStatus === 'invalid' ? t('profile.username_invalid') : undefined)}
              >
                <div className="relative">
                  <input
                    id="username"
                    {...register('username')}
                    type="text"
                    placeholder={t('common.username')}
                    className={cn(
                      "input-base pr-10",
                      usernameStatus === 'taken' ? 'border-red-500' : usernameStatus === 'available' ? 'border-emerald-500' : (errors.username && touchedFields.username && "border-red-500")
                    )}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {usernameStatus === 'checking' && <Loader2 className="h-4 w-4 text-warm-400 animate-spin" />}
                    {usernameStatus === 'available' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                    {usernameStatus === 'taken' && <AlertCircle className="h-4 w-4 text-red-500" />}
                  </div>
                </div>
                {usernameStatus === 'available' && <p className="text-[10px] text-emerald-500 ml-1">{t('profile.username_available')}</p>}
              </FormControl>

              <DialogFooter className="pt-4 flex flex-row justify-end gap-2">
                <button type="button" onClick={onClose} className="btn-ghost">{t('common.cancel')}</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? <LoadingSpinner size="sm" className="text-white" /> : t('common.save_changes')}
                </button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="security" className="mt-4">
            <form onSubmit={onSubmit} className="space-y-4">
              <FormControl id="current_password" label={t('profile.current_password')} error={errors.current_password && touchedFields.current_password ? (errors.current_password.message as string) : undefined}>
                <input
                  id="current_password"
                  {...register('current_password')}
                  type="password"
                  placeholder={t('profile.current_password')}
                  className={cn("input-base", errors.current_password && touchedFields.current_password && "border-red-500")}
                />
              </FormControl>
              <FormControl id="password" label={t('profile.new_password')} error={errors.password && touchedFields.password ? (errors.password.message as string) : undefined}>
                <input
                  id="password"
                  {...register('password')}
                  type="password"
                  placeholder={t('profile.new_password')}
                  className={cn("input-base", errors.password && touchedFields.password && "border-red-500")}
                />
              </FormControl>
              <FormControl id="confirmPassword" label={t('profile.confirm_new_password')} error={errors.confirmPassword && touchedFields.confirmPassword ? (errors.confirmPassword.message as string) : undefined}>
                <input
                  id="confirmPassword"
                  {...register('confirmPassword')}
                  type="password"
                  placeholder={t('profile.confirm_new_password')}
                  className={cn("input-base", errors.confirmPassword && touchedFields.confirmPassword && "border-red-500")}
                />
              </FormControl>
              <DialogFooter className="pt-4 flex flex-row justify-end gap-2">
                <button type="button" onClick={onClose} className="btn-ghost">{t('common.cancel')}</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? <LoadingSpinner size="sm" className="text-white" /> : t('profile.change_password')}
                </button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
