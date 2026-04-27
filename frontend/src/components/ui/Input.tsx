import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "input-base",
          error && "border-red-500 focus:ring-red-500/20",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
