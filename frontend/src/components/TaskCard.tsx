"use client";
import { Task } from "../types/task";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import LoadingSpinner from "./ui/LoadingSpinner";
import { useTranslation } from "react-i18next";
import { Calendar, Edit3, Trash2, CheckCircle2, Circle } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  isDeleting: boolean;
  isToggling?: boolean;
}

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onToggle,
  isDeleting,
  isToggling,
}: TaskCardProps) {
  const { t, i18n } = useTranslation();
  
  const formattedDate = new Date(task.created_at).toLocaleDateString(i18n.language, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const isCompleted = task.status === "completed";
  const priorityBorder = task.priority === 'high' ? 'border-l-brand-600' : task.priority === 'medium' ? 'border-l-orange-400' : 'border-l-sky-400';

  return (
    <div className={`group card-surface p-6 flex flex-col h-full hover:shadow-lg transition-all duration-300 border-l-4 ${priorityBorder} ${isCompleted ? 'opacity-80' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => onToggle(task.id)}
            disabled={isToggling || isDeleting}
            className="flex items-center gap-2 focus:outline-none group/status"
            title={t('tasks.click_to_toggle')}
          >
            <div className={`p-1 rounded-full transition-colors ${isCompleted ? 'text-emerald-500' : 'text-warm-400 group-hover/status:text-brand-600'}`}>
              {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
            </div>
            <StatusBadge status={task.status} />
          </button>
          <PriorityBadge priority={task.priority} />
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-warm-400 dark:text-warm-600">
          <Calendar className="h-3.5 w-3.5" />
          {formattedDate}
        </div>
      </div>

      <div className="flex-grow">
        <h3 className={`text-xl font-bold mb-2 transition-all duration-300 ${
          isCompleted 
            ? 'text-warm-400 dark:text-warm-600 line-through' 
            : 'text-warm-900 dark:text-white group-hover:text-brand-600'
        }`}>
          {task.title}
        </h3>
        <p className="text-sm text-warm-600 dark:text-warm-400 line-clamp-3 leading-relaxed">
          {task.description || t('tasks.no_description')}
        </p>
      </div>

      <div className="flex gap-3 pt-6 mt-6 border-t border-warm-100 dark:border-warm-800/60">
        <button
          onClick={() => onEdit(task)}
          disabled={isDeleting}
          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 rounded-xl hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-all active:scale-95 disabled:opacity-50"
        >
          <Edit3 className="h-4 w-4" />
          {t('common.edit')}
        </button>
        <button
          onClick={() => onDelete(task.id)}
          disabled={isDeleting}
          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 rounded-xl hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-all active:scale-95 disabled:opacity-50"
        >
          {isDeleting ? <div className="scale-50"><LoadingSpinner /></div> : (
            <>
              <Trash2 className="h-4 w-4" />
              {t('common.delete')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
