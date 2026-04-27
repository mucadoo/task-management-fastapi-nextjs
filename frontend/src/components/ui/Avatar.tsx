'use client';
import React from 'react';
import { cn } from '../../lib/utils';

interface AvatarProps {
  name?: string;
  username?: string;
  email?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ name, username, email, size = 'md', className }: AvatarProps) {
  const initial = (name || username || email || 'U').charAt(0).toUpperCase();

  const sizes = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center bg-brand-500 text-white font-bold rounded-lg shadow-sm shrink-0',
        sizes[size],
        className,
      )}
    >
      {initial}
    </div>
  );
}
