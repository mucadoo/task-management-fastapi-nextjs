'use client';

import React from 'react';
import { useGlobalLoadingStore } from '@/store/useGlobalLoadingStore';

export function GlobalLoadingBar() {
  const { progress, isVisible } = useGlobalLoadingStore();

  return (
    <div
      className="fixed top-0 left-0 w-full z-[9999] pointer-events-none overflow-hidden transition-opacity duration-300"
      style={{
        opacity: isVisible ? 1 : 0,
      }}
    >
      <div
        className="h-[3px] bg-[#3a5fa3] origin-left shadow-[0_0_10px_#3a5fa3,0_0_5px_#3a5fa3]"
        style={{
          width: '100%',
          transform: `scaleX(${progress / 100})`,
          transition: `transform ${progress === 100 ? '200ms' : '400ms'} ease-out`,
        }}
      />

      {isVisible && progress < 100 && (
        <div
          className="absolute top-0 h-[3px] w-20 bg-[#3a5fa3] opacity-50 blur-[4px] transition-all duration-300"
          style={{
            left: `${progress}%`,
            transform: 'translateX(-100%)',
          }}
        />
      )}
    </div>
  );
}
