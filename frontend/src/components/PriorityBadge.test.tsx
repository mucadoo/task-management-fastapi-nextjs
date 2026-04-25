import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PriorityBadge from './PriorityBadge';
import { TaskPriority } from '../types/task';

describe('PriorityBadge', () => {
  it('renders high priority with correct text and style', () => {
    render(<PriorityBadge priority="high" />);
    const badge = screen.getByText(/high/i);
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-red-100');
    expect(badge.className).toContain('text-red-700');
  });

  it('renders medium priority with correct text and style', () => {
    render(<PriorityBadge priority="medium" />);
    const badge = screen.getByText(/medium/i);
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-yellow-100');
    expect(badge.className).toContain('text-yellow-700');
  });

  it('renders low priority with correct text and style', () => {
    render(<PriorityBadge priority="low" />);
    const badge = screen.getByText(/low/i);
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-slate-100');
    expect(badge.className).toContain('text-slate-700');
  });
});
