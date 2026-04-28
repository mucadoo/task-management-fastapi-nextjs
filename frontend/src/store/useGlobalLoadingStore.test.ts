import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useGlobalLoadingStore } from './useGlobalLoadingStore';

describe('useGlobalLoadingStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useGlobalLoadingStore.setState({
      progress: 0,
      isVisible: false,
      activeLoaders: 0,
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('starts loading and manages progress', () => {
    useGlobalLoadingStore.getState().startLoading();
    expect(useGlobalLoadingStore.getState().activeLoaders).toBe(1);
    expect(useGlobalLoadingStore.getState().isVisible).toBe(true);
    expect(useGlobalLoadingStore.getState().progress).toBeGreaterThan(0);
  });

  it('stops loading and completes progress', () => {
    useGlobalLoadingStore.getState().startLoading();
    useGlobalLoadingStore.getState().stopLoading();
    expect(useGlobalLoadingStore.getState().activeLoaders).toBe(0);
    expect(useGlobalLoadingStore.getState().progress).toBe(100);

    vi.advanceTimersByTime(200);
    expect(useGlobalLoadingStore.getState().isVisible).toBe(false);
  });

  it('trickles progress', () => {
    useGlobalLoadingStore.getState().startLoading();
    const initialProgress = useGlobalLoadingStore.getState().progress;

    vi.advanceTimersByTime(400);

    expect(useGlobalLoadingStore.getState().progress).toBeGreaterThan(initialProgress);
  });
});
