'use client';

import { useEffect, useState, useCallback } from 'react';
import { Toast as ToastType, useToastStore } from '@/store/useToastStore';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export default function Toast({ toast }: { toast: ToastType }) {
  const { removeToast } = useToastStore();
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      removeToast(toast.id);
    }, 300); 
  }, [removeToast, toast.id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast, handleClose]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-500/20';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-500/20';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-500/20';
      case 'info':
      default:
        return 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-500/20';
    }
  };

  return (
    <div
      className={`
        max-w-md w-full flex items-center gap-3 p-4 rounded-xl border shadow-lg
        transition-all duration-300 transform
        ${isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
        ${getBgColor()}
      `}
    >
      <div className="flex-shrink-0">{getIcon()}</div>
      <p className="flex-grow text-sm font-medium text-warm-900 dark:text-gray-100">
        {toast.message}
      </p>
      <button
        onClick={handleClose}
        className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
      >
        <X className="h-4 w-4 text-warm-400 hover:text-warm-600 dark:hover:text-gray-200" />
      </button>
    </div>
  );
}
