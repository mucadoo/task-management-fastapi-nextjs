import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface TaskDateBadgeProps {
  dueDate: string | null;
  hasTime: boolean;
  isOverdue: boolean;
  isDueToday: boolean;
  isCompleted: boolean;
  variant?: 'list' | 'gallery';
  className?: string;
}

export function TaskDateBadge({
  dueDate,
  hasTime,
  isOverdue,
  isDueToday,
  isCompleted,
  variant = 'list',
  className,
}: TaskDateBadgeProps) {
  const { t, i18n } = useTranslation();

  if (!dueDate) return null;

  const formattedDate = new Date(dueDate).toLocaleDateString(i18n.language, {
    month: 'short',
    day: 'numeric',
    ...(hasTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });

  const isActuallyOverdue = isOverdue && !isCompleted;
  const isActuallyDueToday = isDueToday && !isCompleted;

  if (variant === 'list') {
    return (
      <div
        className={cn(
          'flex items-center gap-1.5 text-[10px] font-medium whitespace-nowrap flex-shrink-0 px-2 py-1 rounded-md transition-colors',
          isActuallyOverdue
            ? 'text-red-600 bg-red-50 dark:bg-red-900/10'
            : isActuallyDueToday
              ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10'
              : 'text-warm-500 dark:text-gray-400 bg-warm-100 dark:bg-white/5',
          className,
        )}
      >
        {hasTime ? <Clock className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
        <span>{formattedDate}</span>
        {isActuallyOverdue && <AlertCircle className="h-2.5 w-2.5" />}
        {isActuallyDueToday && (
          <span className="text-[9px] uppercase tracking-wider font-bold ml-1">
            {t('tasks.today')}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 mt-2.5 text-[11px] font-semibold',
        isActuallyOverdue
          ? 'text-red-600'
          : isActuallyDueToday
            ? 'text-amber-600 dark:text-amber-400'
            : 'text-warm-500 dark:text-gray-400',
        className,
      )}
    >
      <div
        className={cn(
          'p-1 rounded-lg',
          isActuallyOverdue
            ? 'bg-red-50 dark:bg-red-900/20'
            : isActuallyDueToday
              ? 'bg-amber-50 dark:bg-amber-900/20'
              : 'bg-warm-100 dark:bg-white/5',
        )}
      >
        {hasTime ? <Clock className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
      </div>
      <div className="flex flex-col">
        <span className="text-[9px] uppercase tracking-wider text-warm-400 dark:text-gray-500 mb-0">
          {t('tasks.due_date')}
        </span>
        <div className="flex items-center gap-1">
          <span>{formattedDate}</span>
          {isActuallyOverdue && (
            <span className="text-[8px] bg-red-100 dark:bg-red-900/40 px-1 py-0 rounded uppercase">
              {t('tasks.overdue')}
            </span>
          )}
          {isActuallyDueToday && (
            <span className="text-[8px] bg-amber-100 dark:bg-amber-900/40 px-1 py-0 rounded uppercase">
              {t('tasks.today')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
