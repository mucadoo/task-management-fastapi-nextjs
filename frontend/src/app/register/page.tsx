'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../lib/api';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../../components/LanguageSelector';
import ThemeToggle from '../../components/ThemeToggle';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useAuthStore } from '../../store/useAuthStore';
import { Mail, Lock, User, ArrowRight, BookOpen, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { useToastStore } from '../../store/useToastStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { Label } from '../../components/ui/Label';

export default function RegisterPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const { register, isLoading } = useAuthStore();
  const { addToast } = useToastStore();
  
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
      addToast(t('auth.error_password_match'), 'error');
      return;
    }
    if (emailStatus === 'taken') {
      return;
    }
    try {
      await register({ email, name, password });
      router.push('/app');
    } catch (err) {
      // Error handled by store via toasts
    }
  };

  return (
    <div className="min-h-screen flex">
      <div
        className="hidden lg:flex lg:w-5/12 bg-primary p-12 flex-col justify-between relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)',
          backgroundSize: '20px 20px',
        }} />
        <div className="relative z-10">
          <div className="w-10 h-10 bg-white rounded flex items-center justify-center mb-6">
            <BookOpen className="text-primary h-6 w-6" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">TaskFlow</h1>
          <p className="text-white/80">{t('auth.slogan')}</p>
        </div>
        <div className="relative z-10 text-white/60 text-sm">
          © {new Date().getFullYear()} {t('common.copyright')}
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center p-8 lg:p-16 relative bg-background">
        <div className="absolute top-6 right-6 flex items-center space-x-3">
          <LanguageSelector />
          <ThemeToggle />
        </div>
        <div className="max-w-sm w-full mx-auto">
          <div className="mb-8">
            <div className="rule-brand w-8 mb-4" />
            <h2 className="text-2xl font-bold tracking-tight">
              {t('auth.register_header')}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('auth.or')}{' '}
              <Link
                href="/login"
                className="text-primary font-semibold hover:underline"
              >
                {t('auth.already_registered')}
              </Link>
            </p>
          </div>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('auth.name')}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        className="pl-10"
                        placeholder={t('auth.name')}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('auth.email')}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        required
                        className={`pl-10 pr-10 ${emailStatus === 'taken' ? 'border-destructive focus-visible:ring-destructive' : emailStatus === 'available' ? 'border-emerald-500 focus-visible:ring-emerald-500' : ''}`}
                        placeholder={t('auth.email')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
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
                    {emailStatus === 'taken' && (
                      <p className="text-xs text-destructive font-medium">
                        {t('profile.email_taken')}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">{t('auth.password')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        required
                        className="pl-10"
                        placeholder={t('auth.password')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t('auth.confirm_password')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        required
                        className="pl-10"
                        placeholder={t('auth.confirm_password')}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={isLoading || emailStatus === 'taken'} 
                  className="w-full mt-2"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" className="text-primary-foreground" />
                  ) : (
                    <>
                      {t('auth.register')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
