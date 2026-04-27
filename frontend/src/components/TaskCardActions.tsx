import React from 'react';
import { Pencil, Trash2, Play, Pause } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/Tooltip';
import LoadingSpinner from './ui/LoadingSpinner';
import { cn } from '../lib/utils';
import { Task } from '../types/task';

interface TaskCardActionsProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleStatus: () => void;
  isDeleting: boolean;
  isToggling: boolean;
  isCompleted: boolean;
  isInProgress: boolean;
  className?: string;
}

export function TaskCardActions({
  task,
  onEdit,
  onDelete,
  onToggleStatus,
  isDeleting,
  isToggling,
  isCompleted,
  isInProgress,
  className,
}: TaskCardActionsProps) {
  const { t } = useTranslation();

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => onEdit(task)}
            disabled={isDeleting}
            aria-label={t('common.edit')}
            className="p-1 rounded-md text-warm-400 dark:text-gray-500 hover:text-brand-500 hover:bg-warm-100 dark:hover:bg-white/5 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">{t('common.edit')}</TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => onDelete(task.id)}
            disabled={isDeleting}
            aria-label={t('common.delete')}
            className="p-1 rounded-md text-warm-400 dark:text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            {isDeleting ? <LoadingSpinner size="sm" /> : <Trash2 className="h-3.5 w-3.5" />}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">{t('common.delete')}</TooltipContent>
      </Tooltip>

      {!isCompleted && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onToggleStatus}
              disabled={isToggling || isDeleting}
              aria-label={isInProgress ? t('tasks.mark_pending') : t('tasks.mark_in_progress')}
              className={cn(
                "p-1 rounded-md transition-colors",
                isInProgress 
                  ? "text-amber-600" 
                  : "text-warm-400 dark:text-gray-500 hover:text-amber-600 hover:bg-warm-100 dark:hover:bg-white/5"
              )}
            >
              {isInProgress ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">
            {isInProgress ? t('tasks.mark_pending') : t('tasks.mark_in_progress')}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
