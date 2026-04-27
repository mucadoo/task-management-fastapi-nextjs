'use client';
import React from 'react';
import { cn } from '../../lib/utils';
import LoadingSpinner from './LoadingSpinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'outline' | 'secondary';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false, 
    leftIcon, 
    rightIcon, 
    children, 
    disabled,
    type = 'button',
    ...props 
  }, ref) => {
    const variants = {
      primary: 'bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white shadow-sm shadow-brand-500/20 dark:hover:bg-brand-400',
      ghost: 'text-warm-700 dark:text-gray-300 bg-warm-50 dark:bg-white/5 border border-warm-200 dark:border-white/10 hover:bg-warm-100 dark:hover:bg-white/10',
      danger: 'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white shadow-sm shadow-red-500/20',
      outline: 'bg-transparent border border-brand-500 text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10',
      secondary: 'bg-warm-100 dark:bg-white/10 text-warm-900 dark:text-gray-100 hover:bg-warm-200 dark:hover:bg-white/20',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2.5',
      icon: 'p-2 rounded-lg',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && <LoadingSpinner size="sm" className={cn(variant === 'primary' || variant === 'danger' ? 'text-white' : 'text-current')} />}
        {!isLoading && leftIcon}
        <span className={cn(isLoading && 'opacity-0')}>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export interface IconButtonProps extends ButtonProps {
  'aria-label': string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, size = 'icon', ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size={size}
        className={cn("p-1.5", className)}
        {...props}
      />
    );
  }
);

IconButton.displayName = 'IconButton';
