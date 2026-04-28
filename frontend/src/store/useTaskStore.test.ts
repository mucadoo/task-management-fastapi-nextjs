import { describe, it, expect, beforeEach } from 'vitest';
import { useTaskStore } from './useTaskStore';

describe('useTaskStore', () => {
  beforeEach(() => {
    useTaskStore.setState({ viewMode: 'gallery' });
  });

  it('sets viewMode correctly', () => {
    useTaskStore.getState().setViewMode('list');
    expect(useTaskStore.getState().viewMode).toBe('list');
  });
});
