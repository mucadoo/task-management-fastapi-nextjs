'use client';
import { TaskPriority } from '../types/task';
import { useTranslation } from 'react-i18next';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
interface PriorityBadgeProps {
  priority: TaskPriority;
}
export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const { t } = useTranslation();
  const configs = {
    low: {
      label: t('tasks.low'),
      classes:
        'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900',
    },
    medium: {
      label: t('tasks.medium'),
      classes:
        'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900',
    },
    high: {
      label: t('tasks.high'),
      classes:
        'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900',
    },
  };
  const config = configs[priority];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${config.classes}`}
    >
      {config.label}
    </span>
  );
}
