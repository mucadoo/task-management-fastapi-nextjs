'use client';

import { TaskPriority } from "../types/task";
import { useTranslation } from "react-i18next";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

interface PriorityBadgeProps {
  priority: TaskPriority;
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const { t } = useTranslation();
  
  const configs = {
    low: {
      label: t('tasks.low'),
      classes: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-900",
    },
    medium: {
      label: t('tasks.medium'),
      classes: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900",
    },
    high: {
      label: t('tasks.high'),
      classes: "bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-900/20 dark:text-brand-400 dark:border-brand-900",
    },
  };

  const config = configs[priority];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.classes}`}>
      {config.label}
    </span>
  );
}
