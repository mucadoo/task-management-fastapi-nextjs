'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-warm-50 dark:bg-slate-950">
      <div className="max-w-md w-full flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-warm-200 dark:border-white/10 shadow-lg">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8" />
        </div>
        
        <h2 className="text-2xl font-bold text-warm-900 dark:text-gray-100 mb-2">
          {t('common.error')}
        </h2>
        
        <p className="text-warm-500 dark:text-gray-400 mb-8">
          {error.message || "An unexpected error occurred."}
        </p>

        <Button
          variant="primary"
          onClick={() => reset()}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          {t('common.back')}
        </Button>
      </div>
    </div>
  );
}
