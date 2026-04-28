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

export function FormField({ label, name, error, required, children, className }: FormFieldProps) {
  const child = React.Children.only(children);

  return (
    <FormControl label={label} error={error} required={required} id={name} className={className}>
      {React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
        id: name,
        error: !!error,
        ...(child.props || {}),
      })}
    </FormControl>
  );
}