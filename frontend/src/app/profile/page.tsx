'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../lib/api';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { User as UserType } from '../../types/auth';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../../components/LanguageSelector';
import ThemeToggle from '../../components/ThemeToggle';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ProfileSkeleton } from '../../components/ui/Skeleton';
import { ChevronLeft, User, Shield, Save, CheckCircle2 } from 'lucide-react';
export default function ProfilePage() {
  const { t } = useTranslation();
  const [user, setUser] = useState<UserType | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await api.getMe();
        setUser(userData);
        setName(userData.name || '');
        setEmail(userData.email);
      } catch (err) {
        setError(t('profile.error_load'));
        if (err instanceof Error && err.message.includes('401')) {
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [router, t]);
  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setError(null);
    setSuccess(null);
    try {
      const updatedUser = await api.updateMe({ name, email });
      setUser(updatedUser);
      setSuccess(t('profile.update_success'));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setIsUpdating(false);
    }
  };
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(t('auth.error_password_match'));
      return;
    }
    setIsUpdating(true);
    setError(null);
    setSuccess(null);
    try {
      await api.updateMe({ password });
      setSuccess(t('profile.password_success'));
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setIsUpdating(false);
    }
  };
  if (isLoading) {
    return <ProfileSkeleton />;
  }
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="flex items-center justify-between mb-12">
          <div className="flex flex-col">
            <Link
              href="/tasks"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-500 font-bold text-sm mb-4 group"
            >
              <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
              {t('common.back')}
            </Link>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
              {t('profile.title')}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </header>
        {error && (
          <div className="mb-6 animate-in slide-in-from-top-2 duration-300">
            <ErrorMessage message={error} />
          </div>
        )}
        {success && (
          <div className="mb-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <p className="text-emerald-700 dark:text-emerald-400 font-bold text-sm">{success}</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 text-center shadow-xl shadow-gray-200/50 dark:shadow-none">
              <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white dark:border-gray-800 shadow-lg shadow-blue-500/10">
                <User className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                {user?.name || 'Anonymous'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                {user?.email}
              </p>
            </div>
          </div>
          <div className="md:col-span-3 space-y-8">
            <section className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                  <User className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('profile.personal_info')}
                </h2>
              </div>
              <form onSubmit={handleUpdateInfo} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-1 mb-2">
                    {t('auth.name')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-900 dark:text-white font-medium"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-1 mb-2">
                    {t('auth.email')}
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-900 dark:text-white font-medium"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {isUpdating ? t('common.saving') : t('profile.update_info')}
                </button>
              </form>
            </section>
            <section className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600 dark:text-amber-400">
                  <Shield className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('profile.security')}
                </h2>
              </div>
              <form onSubmit={handleUpdatePassword} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-1 mb-2">
                    {t('profile.new_password')}
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-900 dark:text-white font-medium"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-1 mb-2">
                    {t('profile.confirm_new_password')}
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-900 dark:text-white font-medium"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={8}
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isUpdating || !password}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <Shield className="h-4 w-4" />
                  {isUpdating ? t('common.saving') : t('profile.change_password')}
                </button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
