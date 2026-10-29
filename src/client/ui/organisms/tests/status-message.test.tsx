// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { StatusMessage } from '../status-message'

afterEach(cleanup)

describe('StatusMessage', () => {
  describe('loading', () => {
    it('is a busy status with the label', () => {
      render(<StatusMessage kind="loading" label="Loading bookings" />)

      const status = screen.getByRole('status')

      expect(status.getAttribute('aria-busy')).toBe('true')
      expect(status.textContent).toContain('Loading bookings')
    })
  })

  describe('empty', () => {
    it('shows the title and the description', () => {
      render(<StatusMessage kind="empty" title="No bookings" description="Pick a free slot to create one" />)

      expect(screen.getByText('No bookings')).toBeTruthy()
      expect(screen.getByText('Pick a free slot to create one')).toBeTruthy()
    })

    it('works without a description', () => {
      render(<StatusMessage kind="empty" title="No bookings" />)

      expect(screen.getByText('No bookings')).toBeTruthy()
    })

    it('is not an alert', () => {
      render(<StatusMessage kind="empty" title="No bookings" />)

      expect(screen.queryByRole('alert')).toBeNull()
    })
  })

  describe('error', () => {
    it('is an alert with the title and the description', () => {
      render(
        <StatusMessage kind="error" title="Could not load" description="Check the connection" retryLabel="Retry" onRetry={vi.fn()} />,
      )

      const alert = screen.getByRole('alert')

      expect(alert.textContent).toContain('Could not load')
      expect(alert.textContent).toContain('Check the connection')
    })

    it('calls onRetry when the retry button is clicked', () => {
      const onRetry = vi.fn()
      render(<StatusMessage kind="error" title="Could not load" retryLabel="Retry" onRetry={onRetry} />)

      fireEvent.click(screen.getByRole('button', { name: 'Retry' }))

      expect(onRetry).toHaveBeenCalledOnce()
    })
  })
})
