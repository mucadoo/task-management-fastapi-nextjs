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
      classes: "bg-warm-100 text-warm-700 border-warm-200 dark:bg-warm-900 dark:text-warm-400 dark:border-warm-700",
      dot: "bg-warm-400"
    },
    in_progress: {
      label: t('tasks.in_progress'),
      classes: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900",
      dot: "bg-amber-500"
    },
    completed: {
      label: t('tasks.completed'),
      classes: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900",
      dot: "bg-emerald-500"
    },
  };

  const config = configs[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider font-bold border transition-colors ${config.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
