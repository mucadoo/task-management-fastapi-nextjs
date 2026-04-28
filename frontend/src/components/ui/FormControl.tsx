'use client';
import React from 'react';
import { cn } from '@/lib/utils';

interface FormControlProps {
  label?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
  required?: boolean;
}

export function FormControl({ label, error, children, className, id, required }: FormControlProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label
          htmlFor={id}
          className="text-[10px] font-bold uppercase tracking-wider text-warm-500 ml-1 block"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-xs text-red-500 font-medium ml-1 animate-in fade-in slide-in-from-top-1 duration-200">
          {error}
        </p>
      )}
    </div>
  );
}
