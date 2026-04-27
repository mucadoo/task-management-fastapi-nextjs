import React from 'react';
import { SearchX, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-20 px-4 border border-dashed border-warm-300 dark:border-white/5 rounded-xl text-center',
        className,
      )}
    >
      <div className="p-3 bg-warm-100 dark:bg-white/5 rounded-full mb-4 text-warm-400 dark:text-gray-500">
        {icon || <SearchX className="h-8 w-8" />}
      </div>
      <h3 className="text-lg font-semibold text-warm-900 dark:text-gray-100 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-warm-600 dark:text-gray-500 max-w-xs mb-6">{description}</p>
      )}
      {action && (
        <button onClick={action.onClick} className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          {action.label}
        </button>
      )}
    </div>
  );
}
