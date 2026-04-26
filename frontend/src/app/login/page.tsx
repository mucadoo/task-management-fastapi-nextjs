'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../lib/api';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../../components/LanguageSelector';
import ThemeToggle from '../../components/ThemeToggle';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Mail, Lock, ArrowRight, BookOpen } from 'lucide-react';
export default function LoginPage() {
  const { t } = useTranslation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await api.login({ identifier, password });
      router.push('/app');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex">
      <div
        className="hidden lg:flex lg:w-5/12 bg-brand-600 dark:bg-brand-900 p-12 flex-col justify-between"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0, rgba(255,255,255,0.03) 1px, transparent 0, transparent 50%)',
          backgroundSize: '20px 20px',
        }}
      >
        <div>
          <div className="w-10 h-10 bg-white rounded flex items-center justify-center mb-6">
            <BookOpen className="text-brand-600 h-6 w-6" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">TaskFlow</h1>
          <p className="text-brand-100">{t('auth.slogan')}</p>
        </div>
        <div className="text-brand-200 text-sm opacity-60">
          © {new Date().getFullYear()} {t('common.copyright')}
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center p-8 lg:p-16 relative bg-warm-50 dark:bg-[#0d0c0b]">
        <div className="absolute top-6 right-6 flex items-center space-x-3">
          <LanguageSelector />
          <ThemeToggle />
        </div>
        <div className="max-w-sm w-full mx-auto">
          <div className="mb-8">
            <div className="rule-brand w-8 mb-4" />
            <h2 className="text-2xl font-bold text-warm-900 dark:text-white">
              {t('auth.sign_in_header')}
            </h2>
            <p className="mt-2 text-sm text-warm-600">
              {t('auth.or')}{' '}
              <Link
                href="/register"
                className="text-brand-600 dark:text-brand-400 font-semibold hover:underline"
              >
                {t('auth.no_account')}
              </Link>
            </p>
          </div>
          <div className="card-surface p-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && <ErrorMessage message={error} />}
              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400" />
                  <input
                    type="text"
                    required
                    className="input-base pl-10"
                    placeholder={t('auth.email_or_username')}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400" />
                  <input
                    type="password"
                    required
                    className="input-base pl-10"
                    placeholder={t('auth.password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="btn-primary w-full">
                {isLoading ? (
                  <LoadingSpinner size="sm" className="text-white" />
                ) : (
                  <>
                    {t('auth.login')}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
