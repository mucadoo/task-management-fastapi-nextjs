'use client';
import { memo, useMemo } from 'react';
import { Task } from '@/types/task';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import LoadingSpinner from './ui/LoadingSpinner';
import { useTranslation } from 'react-i18next';
import { useToggleTaskStatus } from '@/hooks/useTasks';
import { CheckCircle2, Circle, Play, Pause } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/Tooltip';
import { cn } from '@/lib/utils';
import { getTaskDateStatus } from '@/lib/date-utils';
import { TaskCardActions } from './TaskCardActions';
import { TaskDateBadge } from './TaskDateBadge';
import { TaskStatusToggles } from './TaskStatusToggles';

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

  const { isOverdue, isDueToday } = useMemo(
    () => getTaskDateStatus(task.due_date, isCompleted, task.due_date_has_time || false),
    [task.due_date, isCompleted, task.due_date_has_time],
  );

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

  const actions = (
    <TaskCardActions
      task={task}
      onEdit={onEdit}
      onDelete={onDelete}
      onToggleStatus={toggleStatus}
      isDeleting={isDeleting}
      isToggling={isToggling}
      isCompleted={isCompleted}
      isInProgress={isInProgress}
    />
  );

  const statusToggles = (
    <TaskStatusToggles
      status={task.status}
      onToggleStatus={toggleStatus}
      isToggling={isToggling}
      isDeleting={isDeleting}
      viewMode={viewMode}
    />
  );

  if (viewMode === 'list') {
    return (
      <div
        className={cn(
          'group card-surface p-3 flex items-center gap-4 hover:shadow-md transition-all duration-300 relative pl-6',
          isCompleted && 'opacity-80',
        )}
      >
        <span className={cn('accent-bar', accentColor)} />
        {statusToggles}

        <div className="flex-grow min-w-0 flex items-center justify-between gap-4">
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3
                className={cn(
                  'text-sm font-semibold truncate transition-all duration-300',
                  isCompleted
                    ? 'text-warm-400 dark:text-gray-500 line-through'
                    : 'text-warm-900 dark:text-gray-100 group-hover:text-brand-500',
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

          <TaskDateBadge
            dueDate={task.due_date as string | null}
            hasTime={task.due_date_has_time || false}
            isOverdue={isOverdue}
            isDueToday={isDueToday}
            isCompleted={isCompleted}
            variant="list"
          />
        </div>
        <div className="flex-shrink-0 ml-2">{actions}</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group card-surface p-3.5 flex flex-col h-full hover:shadow-md transition-all duration-300 relative pl-6',
        isCompleted && 'opacity-80',
      )}
    >
      <span className={cn('accent-bar', accentColor)} />
      <div className="flex justify-between items-start mb-3">
        {statusToggles}
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
        </div>
      </div>

      <div className="flex-grow">
        <h3
          className={cn(
            'text-sm font-semibold mb-1 transition-all duration-300',
            isCompleted
              ? 'text-warm-400 dark:text-gray-500 line-through'
              : 'text-warm-900 dark:text-gray-100 group-hover:text-brand-500',
          )}
        >
          {task.title}
        </h3>
        <p className="text-xs text-warm-500 dark:text-gray-400 line-clamp-3 leading-snug">
          {task.description || t('tasks.no_description')}
        </p>
        <TaskDateBadge
          dueDate={task.due_date as string | null}
          hasTime={task.due_date_has_time || false}
          isOverdue={isOverdue}
          isDueToday={isDueToday}
          isCompleted={isCompleted}
          variant="gallery"
        />
      </div>
      <div className="flex justify-end pt-2.5 mt-2.5 border-t border-warm-200 dark:border-white/10">
        {actions}
      </div>
    </div>
  );
});

export default TaskCard;
