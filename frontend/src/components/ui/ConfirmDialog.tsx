'use client';

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Trash2 } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";

interface ConfirmDialogProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  message,
  onConfirm,
  onCancel,
  isLoading,
}: ConfirmDialogProps) {
  const { t } = useTranslation();

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
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-sm w-full p-8 animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800 text-center">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('common.confirm_action')}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium leading-relaxed">{message}</p>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-500/25 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" className="text-white" />
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                {t('common.delete')}
              </>
            )}
          </button>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="w-full py-3.5 px-6 text-gray-700 dark:text-gray-300 font-bold bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
