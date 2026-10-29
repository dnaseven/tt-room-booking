// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { BookingViewModel } from '../../models/booking-view-model'
import type { TimelineSlot } from '../../models/timeline-slot'
import { BookingPage, type BookingPageProps } from '../booking-page'

const slots: TimelineSlot[] = [
  { start: '09:00', end: '09:30', state: 'free' },
  { start: '09:30', end: '10:00', state: 'free' },
]

const booking: BookingViewModel = {
  id: 'sync',
  title: 'sync',
  start: '09:30',
  end: '10:00',
  durationMinutes: 30,
  hasStarted: false,
  position: { topPercent: 50, heightPercent: 50 },
}

const makeProps = (overrides: Partial<BookingPageProps> = {}): BookingPageProps => ({
  header: {
    title: 'Room booking',
    languageLabel: 'Language',
    languages: [{ value: 'en', label: 'English' }],
    language: 'en',
    onLanguageChange: vi.fn(),
  },
  navigator: {
    value: '2026-10-30',
    labels: { previous: 'Previous day', next: 'Next day', today: 'Today', date: 'Date' },
    onChange: vi.fn(),
    onPrevious: vi.fn(),
    onNext: vi.fn(),
    onToday: vi.fn(),
  },
  schedule: {
    kind: 'ready',
    timeline: {
      slots,
      bookings: [booking],
      labels: { slot: (slot) => `slot ${slot.start}`, booking: (item) => `booking ${item.title}` },
      onSelectSlot: vi.fn(),
      onSelectBooking: vi.fn(),
    },
  },
  panel: {
    isOpen: false,
    title: 'Booking details',
    closeLabel: 'Close details',
    placeholder: 'Pick a free slot or a booking',
    onClose: vi.fn(),
  },
  confirmDelete: {
    open: false,
    title: 'Delete booking?',
    description: 'This cannot be undone',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    isConfirming: false,
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  },
  ...overrides,
})

const renderPage = (overrides: Partial<BookingPageProps> = {}) => {
  const props = makeProps(overrides)
  render(<BookingPage {...props} />)

  return props
}

const formProps = (): NonNullable<BookingPageProps['panel']['form']> => ({
  values: { date: '2026-10-30', start: '09:00', end: '09:30', title: '' },
  timeOptions: [
    { value: '09:00', label: '09:00' },
    { value: '09:30', label: '09:30' },
  ],
  labels: { date: 'Date', start: 'Start', end: 'End', title: 'Title', submit: 'Save', submitting: 'Saving', delete: 'Remove' },
  isSubmitting: false,
  onChange: vi.fn(),
  onSubmit: vi.fn(),
})

afterEach(cleanup)

describe('BookingPage', () => {
  describe('chrome', () => {
    it('shows the header and the date navigator', () => {
      renderPage()

      expect(screen.getByRole('heading', { level: 1, name: 'Room booking' })).toBeTruthy()
      expect((screen.getByLabelText('Date') as HTMLInputElement).value).toBe('2026-10-30')
    })
  })

  describe('schedule', () => {
    it('shows the timeline when ready and passes interactions through', () => {
      const props = renderPage()

      fireEvent.click(screen.getByRole('button', { name: 'slot 09:00' }))
      fireEvent.click(screen.getByRole('button', { name: 'booking sync' }))

      if (props.schedule.kind !== 'ready') throw new Error('expected ready')
      expect(props.schedule.timeline.onSelectSlot).toHaveBeenCalledExactlyOnceWith('09:00')
      expect(props.schedule.timeline.onSelectBooking).toHaveBeenCalledExactlyOnceWith('sync')
    })

    it('shows the empty notice above the timeline when the day has no bookings', () => {
      const props = makeProps()
      if (props.schedule.kind !== 'ready') throw new Error('expected ready')
      renderPage({
        schedule: { ...props.schedule, emptyNotice: { title: 'No bookings yet', description: 'Pick a free slot' } },
      })

      expect(screen.getByText('No bookings yet')).toBeTruthy()
      expect(screen.getByRole('button', { name: 'slot 09:00' })).toBeTruthy()
    })

    it('shows a busy status instead of the timeline while loading', () => {
      renderPage({ schedule: { kind: 'loading', label: 'Loading bookings' } })

      expect(screen.getByRole('status').textContent).toContain('Loading bookings')
      expect(screen.queryByRole('button', { name: 'slot 09:00' })).toBeNull()
    })

    it('shows an error with a retry instead of the timeline', () => {
      const onRetry = vi.fn()
      renderPage({ schedule: { kind: 'error', title: 'Could not load', retryLabel: 'Retry', onRetry } })

      fireEvent.click(screen.getByRole('button', { name: 'Retry' }))

      expect(screen.getByRole('alert').textContent).toContain('Could not load')
      expect(onRetry).toHaveBeenCalledOnce()
      expect(screen.queryByRole('button', { name: 'slot 09:00' })).toBeNull()
    })
  })

  describe('panel', () => {
    const panelOf = (name = 'Booking details') => screen.getByRole('complementary', { name, hidden: true })

    it('shows the placeholder when there is no form', () => {
      renderPage()

      expect(panelOf().textContent).toContain('Pick a free slot or a booking')
    })

    it('shows the form in the panel', () => {
      const props = makeProps()
      renderPage({ panel: { ...props.panel, isOpen: true, form: formProps() } })

      expect(panelOf().contains(screen.getByLabelText('Title'))).toBe(true)
      expect(screen.queryByText('Pick a free slot or a booking')).toBeNull()
    })

    it('closes the panel from its close button', () => {
      const props = makeProps()
      const onClose = vi.fn()
      renderPage({ panel: { ...props.panel, isOpen: true, onClose } })

      fireEvent.click(screen.getByRole('button', { name: 'Close details' }))

      expect(onClose).toHaveBeenCalledOnce()
    })
  })

  describe('delete confirmation', () => {
    it('shows the confirm dialog when it is open', () => {
      const props = makeProps()
      renderPage({ confirmDelete: { ...props.confirmDelete, open: true } })

      expect(screen.getByRole('dialog', { name: 'Delete booking?' })).toBeTruthy()
    })

    it('shows no dialog while it is closed', () => {
      renderPage()

      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })
})
