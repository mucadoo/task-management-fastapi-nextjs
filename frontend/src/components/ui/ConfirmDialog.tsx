'use client';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './AlertDialog';

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

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="sm:max-w-[425px] bg-white dark:bg-[#141414] border border-warm-200 dark:border-white/10 rounded-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-lg font-semibold text-warm-900 dark:text-gray-100">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            {t('common.confirm_action')}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription className="text-sm text-warm-500 dark:text-gray-400">
          {message}
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isLoading}
            className="bg-warm-50 dark:bg-white/5 border border-warm-200 dark:border-white/10 hover:bg-warm-100 dark:hover:bg-white/10 text-warm-700 dark:text-gray-300"
          >
            {t('common.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {isLoading ? <LoadingSpinner size="sm" className="text-white" /> : t('common.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
