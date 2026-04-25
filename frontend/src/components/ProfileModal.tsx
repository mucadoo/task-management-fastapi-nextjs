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
            <div className="rule-brand w-10" />
          </div>
          <button onClick={onClose} className="p-2 hover:bg-warm-100 dark:hover:bg-warm-800 rounded-full transition-colors">
            <X className="h-5 w-5 text-warm-500" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8"><LoadingSpinner /></div>
        ) : (
          <>
            <div className="bg-warm-50 dark:bg-warm-950/40 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-warm-900 rounded-lg"><User className="h-5 w-5 text-brand-600" /></div>
                <div>
                  <p className="font-bold text-sm text-warm-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-warm-500">{user?.email}</p>
                </div>
              </div>
              <button onClick={onLogout} className="text-xs font-semibold text-brand-600 hover:text-brand-700">{t('auth.logout')}</button>
            </div>

            <div className="flex gap-2 p-1 bg-warm-100 dark:bg-warm-900 rounded-xl">
              <button 
                onClick={() => setActiveTab('personal')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'personal' ? 'bg-brand-600 text-white shadow-sm' : 'text-warm-600 dark:text-warm-400'}`}
              >
                <User className="h-4 w-4" /> Personal info
              </button>
              <button 
                onClick={() => setActiveTab('security')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'security' ? 'bg-brand-600 text-white shadow-sm' : 'text-warm-600 dark:text-warm-400'}`}
              >
                <Shield className="h-4 w-4" /> Security
              </button>
            </div>

            {error && <ErrorMessage message={error} />}
            {success && <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold"><CheckCircle2 className="h-4 w-4" /> {success}</div>}

            <form className="space-y-4">
              {activeTab === 'personal' ? (
                <>
                  <input type="text" className="input-base" defaultValue={user?.name} placeholder="Name" />
                  <input type="email" className="input-base" defaultValue={user?.email} placeholder="Email" />
                  <button type="button" className="btn-primary w-full">Save changes</button>
                </>
              ) : (
                <>
                  <input type="password" className="input-base" placeholder="New password" />
                  <input type="password" className="input-base" placeholder="Confirm new password" />
                  <button type="button" className="btn-primary w-full">Change password</button>
                </>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
