'use client';
import { memo, useMemo } from 'react';
import { Task } from '../types/task';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import LoadingSpinner from './ui/LoadingSpinner';
import { useTranslation } from 'react-i18next';
import { useToggleTaskStatus } from '../hooks/useTasks';
import {
  Pencil,
  Trash2,
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  AlertCircle,
  Play,
  Pause,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/Tooltip';
import { cn } from '../lib/utils';
import { getTaskDateStatus } from '../lib/date-utils';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  viewMode?: 'gallery' | 'list';
  isToggling?: boolean;
}

const TaskCard = memo(function TaskCard({
  task,
  onEdit,
  onDelete,
  isDeleting,
  viewMode = 'gallery',
  isToggling: isTogglingProp,
}: TaskCardProps) {
  const { t, i18n } = useTranslation();
  const toggleStatusMutation = useToggleTaskStatus();
  
  const isToggling = isTogglingProp ?? toggleStatusMutation.isPending;

  const isCompleted = task.status === 'completed';
  const isInProgress = task.status === 'in_progress';

  const { isOverdue, isDueToday } = useMemo(() => 
    getTaskDateStatus(task.due_date, isCompleted, task.due_date_has_time || false),
    [task.due_date, isCompleted, task.due_date_has_time]
  );

  const formattedDueDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString(i18n.language, {
        month: 'short',
        day: 'numeric',
        ...(task.due_date_has_time ? { hour: '2-digit', minute: '2-digit' } : {}),
      })
    : null;

  const accentColor = useMemo(() => {
    if (isCompleted) return 'bg-emerald-500';
    if (isOverdue) return 'bg-red-600';
    if (task.priority === 'high') return 'bg-red-500';
    if (isDueToday) return 'bg-amber-500';

    switch (task.priority) {
      case 'medium':
        return 'bg-amber-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-brand-500';
    }
  }, [isCompleted, isOverdue, isDueToday, task.priority]);

  const toggleStatus = () => {
    toggleStatusMutation.mutate(task.id);
  };

  const commonActions = (
    <div className="flex items-center gap-1.5">
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
    </div>
  );

  const statusToggles = (
    <div className={cn(
      "flex items-center gap-1",
      viewMode === 'gallery' ? "bg-warm-50 dark:bg-white/5 p-1 rounded-lg border border-warm-200 dark:border-white/10" : ""
    )}>
      {/* Completion Toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={toggleStatus}
            disabled={isToggling || isDeleting}
            aria-label={isCompleted ? t('tasks.mark_pending') : t('tasks.mark_completed')}
            className={cn("p-1 rounded-md transition-colors", isCompleted ? "text-emerald-600" : "text-warm-400 dark:text-gray-500 hover:text-emerald-600 hover:bg-warm-100 dark:hover:bg-white/5")}
          >
            {isToggling ? (
              <LoadingSpinner size="sm" />
            ) : isCompleted ? (
              <CheckCircle2 className={viewMode === 'list' ? "h-5 w-5" : "h-4 w-4"} />
            ) : (
              <Circle className={viewMode === 'list' ? "h-5 w-5" : "h-4 w-4"} />
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
              onClick={toggleStatus}
              disabled={isToggling || isDeleting}
              aria-label={isInProgress ? t('tasks.mark_pending') : t('tasks.mark_in_progress')}
              className={cn("p-1 rounded-md transition-colors", isInProgress ? "text-amber-600" : "text-warm-400 dark:text-gray-500 hover:text-amber-600 hover:bg-warm-100 dark:hover:bg-white/5")}
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

  if (viewMode === 'list') {
    return (
      <div className={cn("group card-surface p-3 flex items-center gap-4 hover:shadow-md transition-all duration-300 relative pl-6", isCompleted && "opacity-80")}>
        <span className={cn("accent-bar", accentColor)} />
        {statusToggles}

        <div className="flex-grow min-w-0 flex items-center justify-between gap-4">
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3
                className={cn("text-sm font-semibold truncate transition-all duration-300",
                  isCompleted ? "text-warm-400 dark:text-gray-500 line-through" : "text-warm-900 dark:text-gray-100 group-hover:text-brand-500"
                )}
              >
                {task.title}
              </h3>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <StatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
              </div>
            </div>
            {task.description && (
              <p className="text-xs text-warm-500 dark:text-gray-400 truncate max-w-2xl">
                {task.description}
              </p>
            )}
          </div>

          {task.due_date && (
            <div
              className={cn("flex items-center gap-1.5 text-[10px] font-medium whitespace-nowrap flex-shrink-0 px-2 py-1 rounded-md transition-colors",
                isOverdue
                  ? 'text-red-600 bg-red-50 dark:bg-red-900/10'
                  : isDueToday
                    ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10'
                    : 'text-warm-500 dark:text-gray-400 bg-warm-100 dark:bg-white/5'
              )}
            >
              {task.due_date_has_time ? (
                <Clock className="h-3 w-3" />
              ) : (
                <Calendar className="h-3 w-3" />
              )}
              <span>{formattedDueDate}</span>
              {isOverdue && <AlertCircle className="h-2.5 w-2.5" />}
              {isDueToday && (
                <span className="text-[9px] uppercase tracking-wider font-bold">
                  {t('tasks.today')}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex-shrink-0 ml-2">
          {commonActions}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("group card-surface p-3.5 flex flex-col h-full hover:shadow-md transition-all duration-300 relative pl-6", isCompleted && "opacity-80")}>
      <span className={cn("accent-bar", accentColor)} />
      <div className="flex justify-between items-start mb-3">
        {statusToggles}
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
        </div>
      </div>

      <div className="flex-grow">
        <h3
          className={cn("text-sm font-semibold mb-1 transition-all duration-300",
            isCompleted ? "text-warm-400 dark:text-gray-500 line-through" : "text-warm-900 dark:text-gray-100 group-hover:text-brand-500"
          )}
        >
          {task.title}
        </h3>
        <p className="text-xs text-warm-500 dark:text-gray-400 line-clamp-3 leading-snug">
          {task.description || t('tasks.no_description')}
        </p>
        {task.due_date && (
          <div
            className={cn("flex items-center gap-1.5 mt-2.5 text-[11px] font-semibold",
              isOverdue
                ? 'text-red-600'
                : isDueToday
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-warm-500 dark:text-gray-400'
            )}
          >
            <div
              className={cn("p-1 rounded-lg",
                isOverdue
                  ? 'bg-red-50 dark:bg-red-900/20'
                  : isDueToday
                    ? 'bg-amber-50 dark:bg-amber-900/20'
                    : 'bg-warm-100 dark:bg-white/5'
              )}
            >
              {task.due_date_has_time ? (
                <Clock className="h-3 w-3" />
              ) : (
                <Calendar className="h-3 w-3" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider text-warm-400 dark:text-gray-500 mb-0">
                {t('tasks.due_date')}
              </span>
              <div className="flex items-center gap-1">
                <span>{formattedDueDate}</span>
                {isOverdue && (
                  <span className="text-[8px] bg-red-100 dark:bg-red-900/40 px-1 py-0 rounded uppercase">
                    {t('tasks.overdue')}
                  </span>
                )}
                {isDueToday && (
                  <span className="text-[8px] bg-amber-100 dark:bg-amber-900/40 px-1 py-0 rounded uppercase">
                    {t('tasks.today')}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-end pt-2.5 mt-2.5 border-t border-warm-200 dark:border-white/10">
        {commonActions}
      </div>
    </div>
  );
});

export default TaskCard;
