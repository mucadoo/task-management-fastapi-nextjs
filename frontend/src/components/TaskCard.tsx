"use client";
import { Task } from "../types/task";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import LoadingSpinner from "./ui/LoadingSpinner";
import { useTranslation } from "react-i18next";
import { Pencil, Trash2, CheckCircle2, Circle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/Tooltip";

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

  return (
    <div className={`group card-surface p-5 flex flex-col h-full hover:shadow-md transition-all duration-300 relative pl-6 ${isCompleted ? 'opacity-80' : ''}`}>
      <span className={`accent-bar ${task.priority === 'high' ? 'bg-brand-700' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-sky-500'}`} />
      
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => onToggle(task.id)}
                disabled={isToggling || isDeleting}
                className="flex items-center gap-2 focus:outline-none group/status cursor-pointer"
              >
                <div className={`p-0.5 rounded-sm transition-colors ${isCompleted ? 'text-emerald-600' : 'text-warm-400 group-hover/status:text-brand-700'}`}>
                  {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                </div>
                <StatusBadge status={task.status} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {t('tasks.click_to_toggle')}
            </TooltipContent>
          </Tooltip>
          <PriorityBadge priority={task.priority} />
        </div>
        <div className="text-[10px] font-medium text-warm-500">
          {formattedDate}
        </div>
      </div>

      <div className="flex-grow">
        <h3 className={`text-base font-semibold mb-2 transition-all duration-300 ${
          isCompleted 
            ? 'text-warm-400 dark:text-warm-600 line-through' 
            : 'text-warm-900 dark:text-white group-hover:text-brand-700'
        }`}>
          {task.title}
        </h3>
        <p className="text-sm text-warm-600 dark:text-warm-400 line-clamp-3 leading-relaxed">
          {task.description || t('tasks.no_description')}
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-warm-100 dark:border-white/5">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => onEdit(task)}
              disabled={isDeleting}
              className="p-2 text-warm-500 dark:text-gray-400 hover:text-brand-700 dark:hover:text-white hover:bg-warm-100 dark:hover:bg-white/5 rounded-lg transition-all active:scale-95 cursor-pointer"
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
}
