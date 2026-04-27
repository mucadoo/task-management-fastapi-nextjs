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
