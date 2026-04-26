'use client';
import { AlertCircle } from 'lucide-react';
interface ErrorMessageProps {
  message: string;
}
export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-900/50 p-4 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-brand-600" />
        </div>
        <div>
          <p className="text-sm text-brand-800 dark:text-brand-300 font-bold leading-tight">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
