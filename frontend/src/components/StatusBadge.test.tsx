import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import StatusBadge from './StatusBadge'

describe('StatusBadge', () => {
  it('renders correctly for pending status', () => {
    render(<StatusBadge status="pending" />)
    const badge = screen.getByText(/Pending/i)
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-gray-100')
  })

  it('renders correctly for in_progress status', () => {
    render(<StatusBadge status="in_progress" />)
    const badge = screen.getByText(/In Progress/i)
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-blue-100')
  })

  it('renders correctly for completed status', () => {
    render(<StatusBadge status="completed" />)
    const badge = screen.getByText(/Completed/i)
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-green-100')
  })
})
