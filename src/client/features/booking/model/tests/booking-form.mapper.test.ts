import type { Booking } from '@domain/booking/booking.schema'
import { describe, expect, it } from 'vitest'
import { toCreateBooking, toFormValues } from '../booking-form.mapper'

describe('toFormValues', () => {
  it('maps a booking to form values', () => {
    const booking: Booking = { id: '1', date: '2026-10-30', start: '11:00', end: '12:00', title: 'sync' }

    expect(toFormValues(booking)).toEqual({ date: '2026-10-30', start: '11:00', end: '12:00', title: 'sync' })
  })

  it('uses an empty string when the booking has no title', () => {
    const booking: Booking = { id: '1', date: '2026-10-30', start: '11:00', end: '12:00' }

    expect(toFormValues(booking).title).toBe('')
  })
})

describe('toCreateBooking', () => {
  const values = { date: '2026-10-30', start: '11:00', end: '12:00', title: 'sync' }

  it('maps form values to a booking input', () => {
    expect(toCreateBooking(values)).toStrictEqual({ date: '2026-10-30', start: '11:00', end: '12:00', title: 'sync' })
  })

  it('trims the title', () => {
    expect(toCreateBooking({ ...values, title: '  sync  ' }).title).toBe('sync')
  })

  it('omits an empty or blank title', () => {
    expect(toCreateBooking({ ...values, title: '' })).toStrictEqual({ date: '2026-10-30', start: '11:00', end: '12:00' })
    expect(toCreateBooking({ ...values, title: '   ' })).toStrictEqual({
      date: '2026-10-30',
      start: '11:00',
      end: '12:00',
    })
  })
})
