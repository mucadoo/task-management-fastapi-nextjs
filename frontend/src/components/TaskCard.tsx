'use client';
import { memo } from 'react';
import { Task, TaskStatus } from '../types/task';
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
import { Button } from './ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/Card';
import { cn } from '../lib/utils';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  viewMode?: 'gallery' | 'list';
}

const TaskCard = memo(function TaskCard({
  task,
  onEdit,
  onDelete,
  isDeleting,
  viewMode = 'gallery',
}: TaskCardProps) {
  const { t, i18n } = useTranslation();
  const toggleStatusMutation = useToggleTaskStatus();
  
  const isToggling = toggleStatusMutation.isPending;

  const isCompleted = task.status === 'completed';
  const isInProgress = task.status === 'in_progress';

  const isOverdue =
    task.due_date &&
    !isCompleted &&
    (() => {
      const dueDate = new Date(task.due_date);
      const now = new Date();
      if (task.due_date_has_time) {
        return dueDate < now;
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDay = new Date(task.due_date);
        dueDay.setHours(0, 0, 0, 0);
        return dueDay < today;
      }
    })();
  const isDueToday =
    task.due_date &&
    !isCompleted &&
    !isOverdue &&
    (() => {
      const dueDate = new Date(task.due_date);
      const now = new Date();
      return dueDate.toDateString() === now.toDateString();
    })();
  const formattedDueDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString(i18n.language, {
        month: 'short',
        day: 'numeric',
        ...(task.due_date_has_time ? { hour: '2-digit', minute: '2-digit' } : {}),
      })
    : null;

  const accentColor = (() => {
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
        return 'bg-primary';
    }
  })();

  const toggleCompletion = () => {
    toggleStatusMutation.mutate(task.id);
  };

  const toggleInProgress = () => {
    toggleStatusMutation.mutate(task.id);
  };

  if (viewMode === 'list') {
    return (
      <Card className={cn("group relative pl-6 flex items-center gap-4 hover:shadow-md transition-all duration-300", isCompleted && "opacity-80")}>
        <span className={cn("accent-bar", accentColor)} />
        <div className="flex items-center gap-2">
          {/* Completion Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCompletion}
                disabled={isToggling || isDeleting}
                className={cn("flex-shrink-0", isCompleted ? "text-emerald-600" : "text-muted-foreground hover:text-emerald-600")}
              >
                {isToggling ? (
                  <LoadingSpinner size="sm" />
                ) : isCompleted ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {isCompleted ? t('tasks.mark_pending') : t('tasks.mark_completed')}
            </TooltipContent>
          </Tooltip>

          {/* In Progress Toggle */}
          {!isCompleted && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleInProgress}
                  disabled={isToggling || isDeleting}
                  className={cn("flex-shrink-0", isInProgress ? "text-amber-600 hover:text-muted-foreground" : "text-muted-foreground hover:text-amber-600")}
                >
                  {isInProgress ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {isInProgress ? t('tasks.mark_pending') : t('tasks.mark_in_progress')}
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <div className="flex-grow min-w-0 flex items-center justify-between gap-4">
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3
                className={cn("text-sm font-semibold truncate transition-all duration-300",
                  isCompleted ? "text-muted-foreground line-through" : "text-foreground group-hover:text-primary"
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
              <p className="text-xs text-muted-foreground truncate max-w-2xl">
                {task.description}
              </p>
            )}
          </div>

          {task.due_date && (
            <div
              className={cn("flex items-center gap-1.5 text-[10px] font-medium whitespace-nowrap flex-shrink-0 px-2 py-1 rounded-md transition-colors",
                isOverdue
                  ? 'text-destructive bg-destructive/10'
                  : isDueToday
                    ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10'
                    : 'text-muted-foreground bg-muted'
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

        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(task)}
                disabled={isDeleting}
                aria-label={t('common.edit')}
                className="text-muted-foreground hover:text-primary hover:bg-accent"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">{t('common.edit')}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(task.id)}
                disabled={isDeleting}
                aria-label={t('common.delete')}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                {isDeleting ? <LoadingSpinner size="sm" /> : <Trash2 className="h-3.5 w-3.5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">{t('common.delete')}</TooltipContent>
          </Tooltip>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("group relative pl-6 flex flex-col h-full hover:shadow-md transition-all duration-300", isCompleted && "opacity-80")}>
      <span className={cn("accent-bar", accentColor)} />
      <CardHeader className="flex-row justify-between items-start pb-3">
        {/* Action Capsule */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border border-border">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCompletion}
                disabled={isToggling || isDeleting}
                className={cn("flex-shrink-0", isCompleted ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" : "text-muted-foreground hover:text-emerald-600 hover:bg-accent")}
              >
                {isToggling ? (
                  <LoadingSpinner size="sm" />
                ) : isCompleted ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {isCompleted ? t('tasks.mark_pending') : t('tasks.mark_completed')}
            </TooltipContent>
          </Tooltip>

          {!isCompleted && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleInProgress}
                  disabled={isToggling || isDeleting}
                  className={cn("flex-shrink-0", isInProgress ? "text-amber-600 bg-amber-50 dark:bg-amber-900/20" : "text-muted-foreground hover:text-amber-600 hover:bg-accent")}
                >
                  {isInProgress ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {isInProgress ? t('tasks.mark_pending') : t('tasks.mark_in_progress')}
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Labels Group */}
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
        </div>
      </CardHeader>

      <CardContent className="flex-grow pt-0 pb-3">
        <CardTitle
          className={cn("text-sm mb-1 transition-all duration-300",
            isCompleted ? "text-muted-foreground line-through" : "text-foreground group-hover:text-primary"
          )}
        >
          {task.title}
        </CardTitle>
        <p className="text-xs text-muted-foreground line-clamp-3 leading-snug">
          {task.description || t('tasks.no_description')}
        </p>
        {task.due_date && (
          <div
            className={cn("flex items-center gap-1.5 mt-2.5 text-[11px] font-semibold",
              isOverdue
                ? 'text-destructive'
                : isDueToday
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-muted-foreground'
            )}
          >
            <div
              className={cn("p-1 rounded-lg",
                isOverdue
                  ? 'bg-destructive/10'
                  : isDueToday
                    ? 'bg-amber-50 dark:bg-amber-900/20'
                    : 'bg-muted'
              )}
            >
              {task.due_date_has_time ? (
                <Clock className="h-3 w-3" />
              ) : (
                <Calendar className="h-3 w-3" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0">
                {t('tasks.due_date')}
              </span>
              <div className="flex items-center gap-1">
                <span>{formattedDueDate}</span>
                {isOverdue && (
                  <span className="text-[8px] bg-destructive/20 px-1 py-0 rounded uppercase">
                    {t('tasks.overdue')}
                  </span>
                )}
                {isDueToday && (
                  <span className="text-[8px] bg-amber-100 dark:bg-amber-900/40 px-1 py-0 rounded uppercase">
                    {t('today')}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-1.5 pt-2.5 mt-2.5 border-t border-border">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(task)}
              disabled={isDeleting}
              aria-label={t('common.edit')}
              className="text-muted-foreground hover:text-primary hover:bg-accent"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">{t('common.edit')}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(task.id)}
              disabled={isDeleting}
              aria-label={t('common.delete')}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              {isDeleting ? <LoadingSpinner size="sm" /> : <Trash2 className="h-3.5 w-3.5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">{t('common.delete')}</TooltipContent>
        </Tooltip>
      </CardFooter>
    </Card>
  );
});

export default TaskCard;
