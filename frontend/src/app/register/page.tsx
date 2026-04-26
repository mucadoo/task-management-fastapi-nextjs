'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../lib/api';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../../components/LanguageSelector';
import ThemeToggle from '../../components/ThemeToggle';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Mail, Lock, User, ArrowRight, BookOpen, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useDebounce } from 'use-debounce';

export default function RegisterPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [debouncedEmail] = useDebounce(email, 500);

  const router = useRouter();

  useEffect(() => {
    const checkEmail = async () => {
      if (!debouncedEmail) {
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
    checkEmail();
  }, [debouncedEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(t('auth.error_password_match'));
      return;
    }
    if (emailStatus === 'taken') {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await api.register({ email, name, password });
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
              {t('auth.register_header')}
            </h2>
            <p className="mt-2 text-sm text-warm-600">
              {t('auth.or')}{' '}
              <Link
                href="/login"
                className="text-brand-600 dark:text-brand-400 font-semibold hover:underline"
              >
                {t('auth.already_registered')}
              </Link>
            </p>
          </div>
          <div className="card-surface p-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && <ErrorMessage message={error} />}
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400" />
                  <input
                    type="text"
                    className="input-base pl-10"
                    placeholder={t('auth.name')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400" />
                  <input
                    type="email"
                    required
                    className={`input-base pl-10 pr-10 ${emailStatus === 'taken' ? 'border-red-500 focus:border-red-500' : emailStatus === 'available' ? 'border-emerald-500 focus:border-emerald-500' : ''}`}
                    placeholder={t('auth.email')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                {emailStatus === 'taken' && (
                  <p className="text-xs text-red-500 ml-1 -mt-3">
                    {t('profile.email_taken')}
                  </p>
                )}
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
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400" />
                  <input
                    type="password"
                    required
                    className="input-base pl-10"
                    placeholder={t('auth.confirm_password')}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isLoading || emailStatus === 'taken'} 
                className="btn-primary w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" className="text-white" />
                ) : (
                  <>
                    {t('auth.register')}
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
