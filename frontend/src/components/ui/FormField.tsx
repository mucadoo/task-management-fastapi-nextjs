'use client';
import React from 'react';
import { FormControl } from './FormControl';

interface FormFieldProps {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  children: React.ReactElement;
  className?: string;
}

/**
 * FormField wraps an input with a label and error message.
 * It automatically passes 'id' and 'error' (boolean) props to its child.
 */
export function FormField({ label, name, error, required, children, className }: FormFieldProps) {
  // Ensure we have only one child to clone
  const child = React.Children.only(children) as React.ReactElement;

  return (
    <FormControl label={label} error={error} required={required} id={name} className={className}>
      {React.cloneElement(child as React.ReactElement<any>, {
        id: name,
        error: !!error,
        ...(child.props || {}),
      })}
    </FormControl>
  );
}
