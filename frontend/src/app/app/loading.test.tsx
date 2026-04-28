import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import Loading from './loading';

vi.mock('@/components/ui/Skeleton', () => ({
  TaskSkeleton: () => <div data-testid="task-skeleton" />,
}));

describe('Loading', () => {
  it('renders loading skeletons', () => {
    const { getAllByTestId } = render(<Loading />);
    expect(getAllByTestId('task-skeleton').length).toBe(6);
  });
});
