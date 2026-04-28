import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDataDisclosure } from './useDataDisclosure';

describe('useDataDisclosure', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => useDataDisclosure());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.data).toBeNull();
  });

  it('opens and sets data', () => {
    const { result } = renderHook(() => useDataDisclosure<string>());
    act(() => {
      result.current.onOpen('test data');
    });
    expect(result.current.isOpen).toBe(true);
    expect(result.current.data).toBe('test data');
  });

  it('closes and clears data', () => {
    const { result } = renderHook(() => useDataDisclosure<string>('initial'));
    act(() => {
      result.current.onOpen('new');
      result.current.onClose();
    });
    expect(result.current.isOpen).toBe(false);
    expect(result.current.data).toBeNull();
  });

  it('toggles open state', () => {
    const { result } = renderHook(() => useDataDisclosure());
    act(() => {
      result.current.onToggle();
    });
    expect(result.current.isOpen).toBe(true);
    act(() => {
      result.current.onToggle();
    });
    expect(result.current.isOpen).toBe(false);
  });
});
