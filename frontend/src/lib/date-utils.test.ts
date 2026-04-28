import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTaskDateStatus } from './date-utils';

describe('date-utils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
  });

  it('returns false when no due date or completed', () => {
    expect(getTaskDateStatus(null, false, false)).toEqual({ isOverdue: false, isDueToday: false });
    expect(getTaskDateStatus('2023-12-31', true, false)).toEqual({
      isOverdue: false,
      isDueToday: false,
    });
  });

  it('detects overdue task without time', () => {
    expect(getTaskDateStatus('2023-12-31', false, false)).toEqual({
      isOverdue: true,
      isDueToday: false,
    });
  });

  it('detects due today task without time', () => {
    const today = new Date();

    expect(getTaskDateStatus(today.toISOString(), false, false)).toEqual({
      isOverdue: false,
      isDueToday: true,
    });
  });

  it('detects overdue task with time', () => {
    expect(getTaskDateStatus('2024-01-01T11:00:00Z', false, true)).toEqual({
      isOverdue: true,
      isDueToday: false,
    });
  });

  it('detects due today task with time (upcoming)', () => {
    expect(getTaskDateStatus('2024-01-01T13:00:00Z', false, true)).toEqual({
      isOverdue: false,
      isDueToday: true,
    });
  });
});
