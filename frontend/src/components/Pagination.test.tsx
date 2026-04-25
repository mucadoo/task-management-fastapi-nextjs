import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Pagination from './Pagination'

describe('Pagination', () => {
  it('renders correctly', () => {
    render(<Pagination page={1} totalPages={5} onPageChange={() => {}} />)
    expect(screen.getByText(/Page 1 of 5/i)).toBeInTheDocument()
    expect(screen.getByText(/Previous/i)).toBeInTheDocument()
    expect(screen.getByText(/Next/i)).toBeInTheDocument()
  })

  it('disables previous button on first page', () => {
    render(<Pagination page={1} totalPages={5} onPageChange={() => {}} />)
    expect(screen.getByText(/Previous/i)).toBeDisabled()
    expect(screen.getByText(/Next/i)).not.toBeDisabled()
  })

  it('disables next button on last page', () => {
    render(<Pagination page={5} totalPages={5} onPageChange={() => {}} />)
    expect(screen.getByText(/Previous/i)).not.toBeDisabled()
    expect(screen.getByText(/Next/i)).toBeDisabled()
  })

  it('calls onPageChange when buttons are clicked', () => {
    const onPageChange = vi.fn()
    render(<Pagination page={2} totalPages={5} onPageChange={onPageChange} />)
    
    fireEvent.click(screen.getByText(/Previous/i))
    expect(onPageChange).toHaveBeenCalledWith(1)
    
    fireEvent.click(screen.getByText(/Next/i))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('disables buttons when loading', () => {
    render(<Pagination page={2} totalPages={5} onPageChange={() => {}} isLoading={true} />)
    expect(screen.getByText(/Previous/i)).toBeDisabled()
    expect(screen.getByText(/Next/i)).toBeDisabled()
  })

  it('renders nothing when totalPages is 1', () => {
    const { container } = render(<Pagination page={1} totalPages={1} onPageChange={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })
})
