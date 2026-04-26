import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InfiniteScrollTrigger } from './InfiniteScrollTrigger';
const observe = vi.fn();
const unobserve = vi.fn();
const disconnect = vi.fn();
class MockIntersectionObserver {
  observe = observe;
  unobserve = unobserve;
  disconnect = disconnect;
  root = null;
  rootMargin = '';
  thresholds = [];
  takeRecords = () => [];
}
window.IntersectionObserver = MockIntersectionObserver as any;
describe('InfiniteScrollTrigger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('renders correctly without loading spinner when isLoading is false', () => {
    const { container } = render(
      <InfiniteScrollTrigger onIntersect={() => {}} isLoading={false} hasMore={true} />,
    );
    expect(container.querySelector('.animate-spin')).not.toBeInTheDocument();
  });
  it('renders loading spinner when isLoading is true', () => {
    const { container } = render(
      <InfiniteScrollTrigger onIntersect={() => {}} isLoading={true} hasMore={true} />,
    );
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });
  it('sets up IntersectionObserver when hasMore is true and not loading', () => {
    render(<InfiniteScrollTrigger onIntersect={() => {}} isLoading={false} hasMore={true} />);
    expect(observe).toHaveBeenCalled();
  });
  it('does not set up IntersectionObserver when hasMore is false', () => {
    render(<InfiniteScrollTrigger onIntersect={() => {}} isLoading={false} hasMore={false} />);
    expect(observe).not.toHaveBeenCalled();
  });
  it('does not set up IntersectionObserver when isLoading is true', () => {
    render(<InfiniteScrollTrigger onIntersect={() => {}} isLoading={true} hasMore={true} />);
    expect(observe).not.toHaveBeenCalled();
  });
});
