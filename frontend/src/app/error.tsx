"use client";
import { useEffect } from "react";
import ErrorMessage from "../components/ui/ErrorMessage";
import { useTranslation } from "react-i18next";

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('common.error')}</h2>
        <div className="mb-6">
          <ErrorMessage message={error.message || t('common.error')} />
        </div>
        <button
          onClick={() => reset()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {t('common.back')}
        </button>
      </div>
    </div>
  );
}
