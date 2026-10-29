// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { BookingViewModel } from '../../models/booking-view-model'
import type { TimelineSlot } from '../../models/timeline-slot'
import { BookingTimeline, type BookingTimelineLabels, type BookingTimelineProps } from '../booking-timeline'

const labels: BookingTimelineLabels = {
  slot: (slot) => `slot ${slot.start}-${slot.end} ${slot.state}`,
  booking: (booking) => `booking ${booking.title ?? 'untitled'} ${booking.start}-${booking.end}`,
}

const slots: TimelineSlot[] = [
  { start: '09:00', end: '09:30', state: 'past' },
  { start: '09:30', end: '10:00', state: 'free' },
  { start: '10:00', end: '10:30', state: 'booked' },
  { start: '10:30', end: '11:00', state: 'booked' },
  { start: '11:00', end: '11:30', state: 'free' },
]

const sync: BookingViewModel = {
  id: 'sync',
  title: 'sync',
  start: '10:00',
  end: '11:00',
  durationMinutes: 60,
  hasStarted: false,
  position: { topPercent: 50, heightPercent: 25 },
}

const untitled: BookingViewModel = {
  id: 'untitled',
  start: '11:00',
  end: '11:30',
  durationMinutes: 30,
  hasStarted: true,
  position: { topPercent: 75, heightPercent: 12.5 },
}

const renderTimeline = (overrides: Partial<BookingTimelineProps> = {}) => {
  const props: BookingTimelineProps = {
    slots,
    bookings: [sync],
    labels,
    onSelectSlot: vi.fn(),
    onSelectBooking: vi.fn(),
    ...overrides,
  }
  render(<BookingTimeline {...props} />)

  return props
}

const slotButton = (slot: TimelineSlot) =>
  screen.getByRole('button', { name: labels.slot(slot) }) as HTMLButtonElement

afterEach(cleanup)

describe('BookingTimeline', () => {
  describe('slots', () => {
    it('renders a named button for every slot in the given order', () => {
      renderTimeline({ bookings: [] })

      const names = screen.getAllByRole('button').map((button) => button.getAttribute('aria-label') ?? button.textContent)

      expect(names).toEqual(slots.map((slot) => labels.slot(slot)))
    })

    it('reports the start of a free slot when it is clicked', () => {
      const { onSelectSlot } = renderTimeline()

      fireEvent.click(slotButton(slots[1]))

      expect(onSelectSlot).toHaveBeenCalledExactlyOnceWith('09:30')
    })

    it('disables booked and past slots and ignores clicks on them', () => {
      const { onSelectSlot } = renderTimeline()

      for (const slot of [slots[0], slots[2], slots[3]]) {
        expect(slotButton(slot).disabled).toBe(true)
        fireEvent.click(slotButton(slot))
      }

      expect(onSelectSlot).not.toHaveBeenCalled()
    })

    it('leaves free slots enabled', () => {
      renderTimeline()

      expect(slotButton(slots[1]).disabled).toBe(false)
      expect(slotButton(slots[4]).disabled).toBe(false)
    })
  })

  describe('bookings', () => {
    it('renders a named button for every booking with its time and title', () => {
      renderTimeline({ bookings: [sync, untitled] })

      const block = screen.getByRole('button', { name: labels.booking(sync) })

      expect(block.textContent).toContain('sync')
      expect(block.textContent).toContain('10:00')
      expect(block.textContent).toContain('11:00')
      expect(screen.getByRole('button', { name: labels.booking(untitled) })).toBeTruthy()
    })

    it('positions the block by the given percentages', () => {
      renderTimeline()

      const block = screen.getByRole('button', { name: labels.booking(sync) })

      expect(block.style.top).toBe('50%')
      expect(block.style.height).toBe('25%')
    })

    it('reports the id of a booking when its block is clicked', () => {
      const { onSelectBooking } = renderTimeline({ bookings: [sync, untitled] })

      fireEvent.click(screen.getByRole('button', { name: labels.booking(untitled) }))

      expect(onSelectBooking).toHaveBeenCalledExactlyOnceWith('untitled')
    })

    it('keeps a booking that already started clickable', () => {
      renderTimeline({ bookings: [untitled] })

      expect((screen.getByRole('button', { name: labels.booking(untitled) }) as HTMLButtonElement).disabled).toBe(false)
    })

    it('marks only the selected booking as current', () => {
      renderTimeline({ bookings: [sync, untitled], selectedBookingId: 'sync' })

      expect(screen.getByRole('button', { name: labels.booking(sync) }).getAttribute('aria-current')).toBe('true')
      expect(screen.getByRole('button', { name: labels.booking(untitled) }).getAttribute('aria-current')).toBeNull()
    })

    it('marks no booking as current without a selection', () => {
      renderTimeline({ bookings: [sync, untitled] })

      expect(document.querySelector('[aria-current="true"]')).toBeNull()
    })
  })
})
