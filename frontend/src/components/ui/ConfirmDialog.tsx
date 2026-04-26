'use client';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Trash2 } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
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
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <AlertDialogTitle className="text-center text-xl font-bold text-gray-900 dark:text-white mb-2">
            {t('common.confirm_action')}
          </AlertDialogTitle>
          <p className="text-center text-gray-500 dark:text-gray-400">
            {message}
          </p>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col gap-3 mt-8">
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 rounded-2xl shadow-lg shadow-red-500/25 transition-all active:scale-[0.98] border-none"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" className="text-white" />
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                {t('common.delete')}
              </>
            )}
          </AlertDialogAction>
          <AlertDialogCancel 
            disabled={isLoading}
            className="w-full h-12 text-gray-700 dark:text-gray-300 font-bold bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-[0.98]"
          >
            {t('common.cancel')}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
