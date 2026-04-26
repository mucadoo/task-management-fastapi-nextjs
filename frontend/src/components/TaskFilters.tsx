'use client';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Plus, LayoutGrid, List } from 'lucide-react';
import SearchInput from './ui/SearchInput';
import { TooltipSimple } from './ui/Tooltip';
import { cn } from '../lib/utils';
import { TaskStatus, TaskPriority } from '../types/task';

interface TaskFiltersProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  filters: any;
  setFilters: (filters: any) => void;
  viewMode: 'gallery' | 'list';
  setViewMode: (mode: 'gallery' | 'list') => void;
  onNewTask: () => void;
}

export default function TaskFilters({
  searchTerm,
  onSearchChange,
  filters,
  setFilters,
  viewMode,
  setViewMode,
  onNewTask,
}: TaskFiltersProps) {
  const { t } = useTranslation();

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilters({ priority: value === 'all' ? undefined : (value as TaskPriority) });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilters({ status: value === 'all' ? undefined : (value as TaskStatus) });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const [sortBy, sortDir] = value.split('-');
    setFilters({ sort_by: sortBy, sort_dir: sortDir });
  };

  const statusOptions = [
    { label: t('tasks.status_all'), value: 'all' },
    { label: t('tasks.pending'), value: 'pending' },
    { label: t('tasks.in_progress'), value: 'in_progress' },
    { label: t('tasks.completed'), value: 'completed' },
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-8">
      <div className="flex-[2]">
        <SearchInput
          placeholder={t('tasks.search')}
          value={searchTerm}
          onChange={onSearchChange}
        />
      </div>
      <div className="flex flex-1 items-center gap-3">
        <div className="relative flex-1">
          <select
            value={filters.status || 'all'}
            onChange={handleStatusChange}
            className="h-10 w-full pl-3 pr-10 bg-white dark:bg-[#141414] border border-warm-200 dark:border-white/10 rounded-lg text-sm text-warm-600 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/5 focus:border-brand-500 appearance-none cursor-pointer"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400 pointer-events-none" />
        </div>

        <div className="relative flex-1">
          <select
            value={filters.priority || 'all'}
            onChange={handlePriorityChange}
            className="h-10 w-full pl-3 pr-10 bg-white dark:bg-[#141414] border border-warm-200 dark:border-white/10 rounded-lg text-sm text-warm-600 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/5 focus:border-brand-500 appearance-none cursor-pointer"
          >
            <option value="all">{t('tasks.all_priorities')}</option>
            <option value="low">{t('tasks.low_priority')}</option>
            <option value="medium">{t('tasks.medium_priority')}</option>
            <option value="high">{t('tasks.high_priority')}</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400 pointer-events-none" />
        </div>
      </div>

      <div className="flex-shrink-0 flex items-center gap-2">
        <span className="text-[10px] font-bold text-warm-500 dark:text-gray-500 uppercase tracking-widest ml-1 hidden lg:block">
          {t('tasks.sort_by')}
        </span>
        <div className="relative w-[180px]">
          <select
            value={`${filters.sort_by || 'due_date'}-${filters.sort_dir || 'asc'}`}
            onChange={handleSortChange}
            className="h-10 w-full pl-3 pr-10 bg-white dark:bg-[#141414] border border-warm-200 dark:border-white/10 rounded-lg text-sm text-warm-600 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/5 focus:border-brand-500 appearance-none cursor-pointer"
          >
            <option value="due_date-asc">{t('tasks.sort_due')} (↑)</option>
            <option value="due_date-desc">{t('tasks.sort_due')} (↓)</option>
            <option value="created_at-desc">{t('tasks.sort_created')} (↓)</option>
            <option value="created_at-asc">{t('tasks.sort_created')} (↑)</option>
            <option value="priority-desc">{t('tasks.sort_priority')} (↓)</option>
            <option value="priority-asc">{t('tasks.sort_priority')} (↑)</option>
            <option value="title-asc">{t('tasks.sort_title')} (A-Z)</option>
            <option value="title-desc">{t('tasks.sort_title')} (Z-A)</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400 pointer-events-none" />
        </div>
      </div>

      <TooltipSimple content={t('tasks.new_task')} side="left">
        <button
          onClick={onNewTask}
          className="h-10 w-10 bg-brand-500 hover:bg-brand-600 text-white rounded-lg flex items-center justify-center shadow-sm shadow-brand-500/10 transition-colors"
        >
          <Plus className="h-5 w-5" />
        </button>
      </TooltipSimple>
    </div>
  );
}
