import React, { useEffect, useRef } from 'react';
import LoadingSpinner from './ui/LoadingSpinner';

interface InfiniteScrollTriggerProps {
  onIntersect: () => void;
  isLoading: boolean;
  hasMore: boolean;
}

export const InfiniteScrollTrigger: React.FC<InfiniteScrollTriggerProps> = ({
  onIntersect,
  isLoading,
  hasMore,
}) => {
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onIntersect();
        }
      },
      { threshold: 0.1 }
    );

    const currentTrigger = triggerRef.current;
    if (currentTrigger) {
      observer.observe(currentTrigger);
    }

    return () => {
      if (currentTrigger) {
        observer.unobserve(currentTrigger);
      }
    };
  }, [onIntersect, isLoading, hasMore]);

  return (
    <div ref={triggerRef} className="h-10 w-full flex items-center justify-center py-8">
      {isLoading && <LoadingSpinner size="md" />}
    </div>
  );
};
