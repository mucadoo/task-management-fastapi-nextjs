'use client';

import { TaskStatus } from "../types/task";
import { useTranslation } from "react-i18next";

interface StatusBadgeProps {
  status: TaskStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation();
  
  const configs = {
    pending: {
      label: t('tasks.pending'),
      classes: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
    },
    in_progress: {
      label: t('tasks.in_progress'),
      classes: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    },
    completed: {
      label: t('tasks.completed'),
      classes: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
    },
  };

  const config = configs[status];

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.classes}`}>
      {config.label}
    </span>
  );
}
