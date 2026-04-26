"use client";
import { useState, memo } from "react";
import { Task, TaskStatus } from "../types/task";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import LoadingSpinner from "./ui/LoadingSpinner";
import { useTranslation } from "react-i18next";
import { Pencil, Trash2, CheckCircle2, Circle, Calendar, Clock, AlertCircle, Play, RotateCcw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/Tooltip";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  isDeleting: boolean;
  isToggling?: boolean;
  viewMode?: 'gallery' | 'list';
}

const TaskCard = memo(function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  isDeleting,
  isToggling,
  viewMode = 'gallery'
}: TaskCardProps) {
  const { t, i18n } = useTranslation();
  
  const isCompleted = task.status === "completed";

  const isOverdue = task.due_date && !isCompleted && (() => {
    const dueDate = new Date(task.due_date);
    const now = new Date();
    if (task.due_date_has_time) {
      return dueDate < now;
    } else {
      // For date-only, overdue means it's strictly before today's start
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDay = new Date(task.due_date);
      dueDay.setHours(0, 0, 0, 0);
      return dueDay < today;
    }
  })();

  const isDueToday = task.due_date && !isCompleted && !isOverdue && (() => {
    const dueDate = new Date(task.due_date);
    const now = new Date();
    return dueDate.toDateString() === now.toDateString();
  })();

  const formattedDueDate = task.due_date ? new Date(task.due_date).toLocaleDateString(i18n.language, {
    month: "short",
    day: "numeric",
    ...(task.due_date_has_time ? { hour: '2-digit', minute: '2-digit' } : {})
  }) : null;

  if (viewMode === 'list') {
    return (
      <div className={`group card-surface p-3 flex items-center gap-4 hover:shadow-md transition-all duration-300 relative pl-6 ${isCompleted ? 'opacity-80' : ''}`}>
        <span className={`accent-bar ${task.priority === 'high' ? 'bg-brand-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-sky-500'}`} />
        
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => {
                  if (task.status === 'pending') onStatusChange(task.id, 'in_progress');
                  else if (task.status === 'in_progress') onStatusChange(task.id, 'completed');
                  else onStatusChange(task.id, 'pending');
                }}
                disabled={isToggling || isDeleting}
                aria-label={task.status === 'pending' ? t('tasks.mark_in_progress') : 
                           task.status === 'in_progress' ? t('tasks.mark_completed') : 
                           t('tasks.mark_pending')}
                className={`flex-shrink-0 focus:outline-none group/status cursor-pointer p-1 rounded-sm transition-colors ${
                  task.status === 'completed' ? 'text-emerald-600' : 
                  task.status === 'in_progress' ? 'text-amber-600' : 
                  'text-warm-400 group-hover/status:text-brand-500'
                }`}
              >
                {isToggling ? <LoadingSpinner size="sm" /> : (
                  task.status === 'completed' ? <CheckCircle2 className="h-5 w-5" /> : 
                  task.status === 'in_progress' ? <Play className="h-5 w-5" /> : 
                  <Circle className="h-5 w-5" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {task.status === 'pending' ? t('tasks.mark_in_progress') : 
               task.status === 'in_progress' ? t('tasks.mark_completed') : 
               t('tasks.mark_pending')}
            </TooltipContent>
          </Tooltip>
          
          {task.status === 'pending' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => onStatusChange(task.id, 'completed')}
                  disabled={isToggling || isDeleting}
                  aria-label={t('tasks.mark_completed')}
                  className="p-1 text-warm-400 hover:text-emerald-600 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>{t('tasks.mark_completed')}</TooltipContent>
            </Tooltip>
          )}
        </div>

        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className={`text-sm font-semibold truncate transition-all duration-300 ${
              isCompleted 
                ? 'text-warm-400 dark:text-warm-600 line-through' 
                : 'text-warm-900 dark:text-white group-hover:text-brand-500'
            }`}>
              {task.title}
            </h3>
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
          </div>
            {task.description && (
            <p className="text-xs text-warm-600 dark:text-warm-400 truncate max-w-2xl">
              {task.description}
            </p>
          )}
          {task.due_date && (
            <div className={`flex items-center gap-1.5 mt-1 text-[10px] font-medium ${
              isOverdue ? 'text-red-600 dark:text-red-400' : isDueToday ? 'text-amber-600 dark:text-amber-400' : 'text-warm-500'
            }`}>
              {task.due_date_has_time ? <Clock className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
              <span>{formattedDueDate}</span>
              {isOverdue && <AlertCircle className="h-2.5 w-2.5 ml-0.5" />}
              {isDueToday && <span className="ml-1 text-[9px] uppercase tracking-wider font-bold">({t('tasks.today')})</span>}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onEdit(task)}
                disabled={isDeleting}
                aria-label={t('common.edit')}
                className="p-1.5 text-warm-500 dark:text-gray-400 hover:text-brand-500 dark:hover:text-white hover:bg-warm-100 dark:hover:bg-white/5 rounded-lg transition-all active:scale-95 cursor-pointer"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {t('common.edit')}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onDelete(task.id)}
                disabled={isDeleting}
                aria-label={t('common.delete')}
                className="p-1.5 text-warm-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all active:scale-95 cursor-pointer"
              >
                {isDeleting ? <LoadingSpinner size="sm" /> : <Trash2 className="h-3.5 w-3.5" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {t('common.delete')}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    );
  }

  return (
    <div className={`group card-surface p-5 flex flex-col h-full hover:shadow-md transition-all duration-300 relative pl-6 ${isCompleted ? 'opacity-80' : ''}`}>
      <span className={`accent-bar ${task.priority === 'high' ? 'bg-brand-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-sky-500'}`} />
      
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => {
                    if (task.status === 'pending') onStatusChange(task.id, 'in_progress');
                    else if (task.status === 'in_progress') onStatusChange(task.id, 'completed');
                    else onStatusChange(task.id, 'pending');
                  }}
                  disabled={isToggling || isDeleting}
                  aria-label={task.status === 'pending' ? t('tasks.mark_in_progress') : 
                             task.status === 'in_progress' ? t('tasks.mark_completed') : 
                             t('tasks.mark_pending')}
                  className={`flex items-center gap-2 focus:outline-none group/status cursor-pointer p-0.5 rounded-sm transition-colors ${
                    task.status === 'completed' ? 'text-emerald-600' : 
                    task.status === 'in_progress' ? 'text-amber-600' : 
                    'text-warm-400 group-hover/status:text-brand-500'
                  }`}
                >
                  {isToggling ? <LoadingSpinner size="sm" /> : (
                    task.status === 'completed' ? <CheckCircle2 className="h-4 w-4" /> : 
                    task.status === 'in_progress' ? <Play className="h-4 w-4" /> : 
                    <Circle className="h-4 w-4" />
                  )}
                  <StatusBadge status={task.status} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {task.status === 'pending' ? t('tasks.mark_in_progress') : 
                 task.status === 'in_progress' ? t('tasks.mark_completed') : 
                 t('tasks.mark_pending')}
              </TooltipContent>
            </Tooltip>

            {task.status === 'pending' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={() => onStatusChange(task.id, 'completed')}
                    disabled={isToggling || isDeleting}
                    aria-label={t('tasks.mark_completed')}
                    className="p-1 text-warm-400 hover:text-emerald-600 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">{t('tasks.mark_completed')}</TooltipContent>
              </Tooltip>
            )}
          </div>
          <PriorityBadge priority={task.priority} />
        </div>
      </div>

      <div className="flex-grow">
        <h3 className={`text-base font-semibold mb-2 transition-all duration-300 ${
          isCompleted 
            ? 'text-warm-400 dark:text-warm-600 line-through' 
            : 'text-warm-900 dark:text-white group-hover:text-brand-500'
        }`}>
          {task.title}
        </h3>
        <p className="text-sm text-warm-600 dark:text-warm-400 line-clamp-3 leading-relaxed">
          {task.description || t('tasks.no_description')}
        </p>
        
        {task.due_date && (
          <div className={`flex items-center gap-2 mt-4 text-xs font-semibold ${
            isOverdue ? 'text-red-600 dark:text-red-400' : isDueToday ? 'text-amber-600 dark:text-amber-400' : 'text-warm-500'
          }`}>
            <div className={`p-1.5 rounded-lg ${
              isOverdue ? 'bg-red-50 dark:bg-red-900/20' : isDueToday ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-warm-50 dark:bg-warm-800/50'
            }`}>
              {task.due_date_has_time ? <Clock className="h-3.5 w-3.5" /> : <Calendar className="h-3.5 w-3.5" />}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-warm-400 mb-0.5">{t('tasks.due_date')}</span>
              <div className="flex items-center gap-1.5">
                <span>{formattedDueDate}</span>
                {isOverdue && <span className="text-[9px] bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 rounded uppercase">{t('tasks.overdue')}</span>}
                {isDueToday && <span className="text-[9px] bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded uppercase">{t('tasks.today')}</span>}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-warm-100 dark:border-white/5">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => onEdit(task)}
              disabled={isDeleting}
              aria-label={t('common.edit')}
              className="p-2 text-warm-500 dark:text-gray-400 hover:text-brand-500 dark:hover:text-white hover:bg-warm-100 dark:hover:bg-white/5 rounded-lg transition-all active:scale-95 cursor-pointer"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">
            {t('common.edit')}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => onDelete(task.id)}
              disabled={isDeleting}
              aria-label={t('common.delete')}
              className="p-2 text-warm-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all active:scale-95 cursor-pointer"
            >
              {isDeleting ? <LoadingSpinner size="sm" /> : <Trash2 className="h-4 w-4" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">
            {t('common.delete')}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
});

export default TaskCard;
