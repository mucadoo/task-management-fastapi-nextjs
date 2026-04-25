"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "../../lib/api";
import ErrorMessage from "../../components/ui/ErrorMessage";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../../components/LanguageSelector";
import ThemeToggle from "../../components/ThemeToggle";
import { Mail, Lock, LogIn, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await api.login({ email, password });
      router.push("/tasks");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-2/5 bg-brand-600 p-12 flex-col justify-center relative overflow-hidden" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)" }}>
        <h1 className="text-5xl font-bold text-white mb-6">TaskFlow</h1>
        <p className="text-brand-100 text-lg">Manage your tasks with elegance and precision.</p>
      </div>

      <div className="flex-1 flex flex-col justify-center p-8 lg:p-16 relative">
        <div className="absolute top-6 right-6 flex items-center space-x-3">
          <LanguageSelector />
          <ThemeToggle />
        </div>

        <div className="max-w-md w-full mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-warm-900 dark:text-white">
              {t('auth.sign_in_header')}
            </h2>
            <p className="mt-2 text-warm-600 dark:text-warm-400">
              {t('auth.or')}{" "}
              <Link href="/register" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
                {t('auth.no_account')}
              </Link>
            </p>
          </div>

          <div className="card-surface p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && <ErrorMessage message={error} />}
              
              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-warm-400" />
                  <input
                    type="email"
                    required
                    className="input-base pl-12"
                    placeholder={t('auth.email')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-warm-400" />
                  <input
                    type="password"
                    required
                    className="input-base pl-12"
                    placeholder={t('auth.password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full"
              >
                {isLoading ? t('common.loading') : (
                  <>
                    {t('auth.login')}
                    <ArrowRight className="h-5 w-5" />
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
