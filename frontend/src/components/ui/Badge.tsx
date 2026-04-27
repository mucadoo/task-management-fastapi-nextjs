'use client';
import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'amber' | 'emerald' | 'red' | 'gray';
  showDot?: boolean;
  className?: string;
}

export function Badge({ children, variant = 'gray', showDot = false, className }: BadgeProps) {
  const variants = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
      dot: 'bg-blue-500',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300',
      dot: 'bg-amber-500',
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300',
      dot: 'bg-emerald-500',
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300',
      dot: 'bg-red-500',
    },
    gray: {
      bg: 'bg-warm-100 dark:bg-white/5 text-warm-700 dark:text-gray-300',
      dot: 'bg-warm-400',
    },
  };

  const selectedVariant = variants[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
        selectedVariant.bg,
        className,
      )}
    >
      {showDot && <span className={cn('w-1.5 h-1.5 rounded-full', selectedVariant.dot)} />}
      {children}
    </span>
  );
}
