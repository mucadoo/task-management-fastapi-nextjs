"use client";
import { Task } from "../types/task";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import LoadingSpinner from "./ui/LoadingSpinner";
import { useTranslation } from "react-i18next";

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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-5 flex flex-col h-full hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-blue-900/10 transition-shadow relative">
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col gap-1.5">
          <button 
            onClick={() => onToggle(task.id)}
            disabled={isToggling || isDeleting}
            className="text-left focus:outline-none group"
            title={t('tasks.click_to_toggle')}
          >
            <StatusBadge status={task.status} />
            <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-gray-400 dark:text-gray-500">
              {t('tasks.toggle')}
            </span>
          </button>
          <PriorityBadge priority={task.priority} />
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{formattedDate}</span>
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-1">
        {task.title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-2 flex-grow">
        {task.description || t('tasks.no_description')}
      </p>
      <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => onEdit(task)}
          disabled={isDeleting}
          className="flex-1 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50"
        >
          {t('common.edit')}
        </button>
        <button
          onClick={() => onDelete(task.id)}
          disabled={isDeleting}
          className="flex-1 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50 flex justify-center items-center"
        >
          {isDeleting ? <div className="scale-50"><LoadingSpinner /></div> : t('common.delete')}
        </button>
      </div>
    </div>
  );
}
