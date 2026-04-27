import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Circle, Play, Pause } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';

interface TaskStatusTogglesProps {
  status: 'pending' | 'in_progress' | 'completed';
  onToggleStatus: () => void;
  isToggling: boolean;
  isDeleting: boolean;
  viewMode?: 'gallery' | 'list';
}

export function TaskStatusToggles({
  status,
  onToggleStatus,
  isToggling,
  isDeleting,
  viewMode = 'gallery',
}: TaskStatusTogglesProps) {
  const { t } = useTranslation();

  const isCompleted = status === 'completed';
  const isInProgress = status === 'in_progress';

  return (
    <div
      className={cn(
        'flex items-center gap-1',
        viewMode === 'gallery'
          ? 'bg-warm-50 dark:bg-white/5 p-1 rounded-lg border border-warm-200 dark:border-white/10'
          : '',
      )}
    >
      {/* Completion Toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onToggleStatus}
            disabled={isToggling || isDeleting}
            aria-label={isCompleted ? t('tasks.mark_pending') : t('tasks.mark_completed')}
            className={cn(
              'p-1 rounded-md transition-colors',
              isCompleted
                ? 'text-emerald-600'
                : 'text-warm-400 dark:text-gray-500 hover:text-emerald-600 hover:bg-warm-100 dark:hover:bg-white/5',
            )}
          >
            {isToggling ? (
              <LoadingSpinner size="sm" />
            ) : isCompleted ? (
              <CheckCircle2 className={viewMode === 'list' ? 'h-5 w-5' : 'h-4 w-4'} />
            ) : (
              <Circle className={viewMode === 'list' ? 'h-5 w-5' : 'h-4 w-4'} />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">
          {isCompleted ? t('tasks.mark_pending') : t('tasks.mark_completed')}
        </TooltipContent>
      </Tooltip>

      {/* In Progress Toggle */}
      {!isCompleted && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onToggleStatus}
              disabled={isToggling || isDeleting}
              aria-label={isInProgress ? t('tasks.mark_pending') : t('tasks.mark_in_progress')}
              className={cn(
                'p-1 rounded-md transition-colors',
                isInProgress
                  ? 'text-amber-600'
                  : 'text-warm-400 dark:text-gray-500 hover:text-amber-600 hover:bg-warm-100 dark:hover:bg-white/5',
              )}
            >
              {isInProgress ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
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
