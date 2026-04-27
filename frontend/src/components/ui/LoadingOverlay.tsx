'use client';
import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  blur?: boolean;
}

export default function LoadingOverlay({ 
  isVisible, 
  message,
  blur = true 
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/60 dark:bg-slate-950/60 ${blur ? 'backdrop-blur-sm' : ''} transition-all duration-300`}>
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        {message && (
          <p className="text-sm font-medium text-warm-700 dark:text-gray-300 animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
