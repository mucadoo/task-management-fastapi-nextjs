'use client';

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, User, Shield, CheckCircle2 } from "lucide-react";
import { api } from "../lib/api";
import ErrorMessage from "./ui/ErrorMessage";
import LoadingSpinner from "./ui/LoadingSpinner";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function ProfileModal({ isOpen, onClose, onLogout }: ProfileModalProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'personal' | 'security'>('personal');
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
      setIsLoading(true);
      api.getMe()
        .then(setUser)
        .catch(() => setError(t('profile.error_load')))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, t]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="card-surface w-full max-w-md p-6 space-y-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-warm-900 dark:text-white">{t('profile.title')}</h2>
            <div className="rule-brand" />
          </div>
          <button onClick={onClose} className="p-2 hover:bg-warm-100 dark:hover:bg-warm-900 rounded-lg transition-colors">
            <X className="h-5 w-5 text-warm-500" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8"><LoadingSpinner /></div>
        ) : (
          <>
            <div className="bg-warm-50 dark:bg-warm-950/40 p-4 border-b border-warm-200 dark:border-warm-800 flex items-center justify-between rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-brand-500 text-white font-bold rounded-lg text-sm">{user?.name?.charAt(0) || 'U'}</div>
                <div>
                  <p className="font-bold text-sm text-warm-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-warm-500">{user?.email}</p>
                </div>
              </div>
              <button onClick={onLogout} className="text-xs font-semibold text-brand-500 dark:text-brand-400 hover:underline">{t('auth.logout')}</button>
            </div>

            <div className="flex gap-1 p-1 bg-warm-100 dark:bg-white/5 rounded-lg">
              <button 
                onClick={() => setActiveTab('personal')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${activeTab === 'personal' ? 'bg-white dark:bg-white/10 text-brand-500 shadow-sm' : 'text-warm-600 dark:text-gray-500 hover:text-warm-900 dark:hover:text-gray-300'}`}
              >
                {t('profile.personal_info')}
              </button>
              <button 
                onClick={() => setActiveTab('security')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${activeTab === 'security' ? 'bg-white dark:bg-white/10 text-brand-500 shadow-sm' : 'text-warm-600 dark:text-gray-500 hover:text-warm-900 dark:hover:text-gray-300'}`}
              >
                {t('profile.security')}
              </button>
            </div>

            {error && <ErrorMessage message={error} />}
            {success && <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold"><CheckCircle2 className="h-4 w-4" /> {success}</div>}

            <form className="space-y-4">
              <div className="space-y-3">
                {activeTab === 'personal' ? (
                  <>
                    <input type="text" className="input-base" defaultValue={user?.name} placeholder={t('common.name')} />
                    <input type="email" className="input-base" defaultValue={user?.email} placeholder={t('common.email')} />
                  </>
                ) : (
                  <>
                    <input type="password" className="input-base" placeholder={t('profile.new_password')} />
                    <input type="password" className="input-base" placeholder={t('profile.confirm_new_password')} />
                  </>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 btn-ghost"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="button"
                  className="flex-[1.5] btn-primary"
                >
                  {activeTab === 'personal' ? t('common.save_changes') : t('profile.change_password')}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
