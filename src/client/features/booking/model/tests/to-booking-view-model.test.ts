import type { Booking } from '@domain/booking/booking.schema'
import { describe, expect, it } from 'vitest'
import { getBlockPosition } from '../../lib/timeline'
import { toBookingViewModel } from '../to-booking-view-model'

// now = 2026-10-29 12:00
const NOW = new Date(2026, 9, 29, 12, 0)

describe('toBookingViewModel', () => {
  const booking: Booking = { id: '1', date: '2026-10-30', start: '11:00', end: '12:30', title: 'sync' }

  it('copies the fields and computes the duration', () => {
    expect(toBookingViewModel(booking, NOW)).toMatchObject({
      id: '1',
      title: 'sync',
      start: '11:00',
      end: '12:30',
      durationMinutes: 90,
    })
  })

  it('adds the position of the block on the timeline', () => {
    expect(toBookingViewModel(booking, NOW).position).toEqual(getBlockPosition(booking))
  })

  it('keeps the title undefined when the booking has none', () => {
    expect(toBookingViewModel({ ...booking, title: undefined }, NOW).title).toBeUndefined()
  })

  describe('hasStarted', () => {
    it('is true for a booking that started earlier today', () => {
      expect(toBookingViewModel({ ...booking, date: '2026-10-29', start: '10:00', end: '11:00' }, NOW).hasStarted).toBe(
        true,
      )
    })

    it('is false for a booking that starts exactly now', () => {
      expect(toBookingViewModel({ ...booking, date: '2026-10-29', start: '12:00', end: '13:00' }, NOW).hasStarted).toBe(
        false,
      )
    })

    it('is false for a future date and true for a past date', () => {
      expect(toBookingViewModel(booking, NOW).hasStarted).toBe(false)
      expect(toBookingViewModel({ ...booking, date: '2026-10-28' }, NOW).hasStarted).toBe(true)
    })
  })
})
