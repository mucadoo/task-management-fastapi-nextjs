'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchInput({ value, onChange, placeholder, className = "" }: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setLocalValue(newVal);
    onChange(newVal);
  };

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400 dark:text-gray-500" />
      <input 
        type="text" 
        placeholder={placeholder} 
        value={localValue} 
        onChange={handleChange} 
        className="h-10 w-full pl-9 pr-4 bg-white dark:bg-[#141414] border border-warm-200 dark:border-white/10 rounded-lg text-sm text-warm-900 dark:text-gray-100 placeholder:text-warm-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/5 focus:border-brand-500 transition-all"
      />
    </div>
  );
}
