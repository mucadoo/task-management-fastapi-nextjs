import { useState, useCallback } from 'react';

export function useDataDisclosure<T>(initialData: T | null = null) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | null>(initialData);

  const onOpen = useCallback((newData: T | null = null) => {
    if (newData !== null) {
      setData(newData);
    }
    setIsOpen(true);
  }, []);

  const onClose = useCallback(() => {
    setIsOpen(false);
    // We don't necessarily want to clear data immediately to avoid flash during exit animations
    // but often it's desired. Let's make it optional or just clear it.
    // For tasks, clearing it on close is usually fine.
    setData(null);
  }, []);

  const onToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    data,
    setData,
    onOpen,
    onClose,
    onToggle,
    setIsOpen,
  };
}
