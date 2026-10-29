import { describe, expect, it } from 'vitest'
import type { Booking } from '../booking.schema'
import { listBookings, type BookingDeps } from '../booking.usecase'
import { TODAY, TOMORROW, YESTERDAY, makeDeps } from './helpers'

describe('listBookings', () => {
  let deps: BookingDeps

  const setup = (initial: Booking[] = []) => {
    deps = makeDeps(initial)
  }

  it('returns only bookings of the requested date', async () => {
    const onDate: Booking = { id: '1', date: TOMORROW, start: '11:00', end: '12:00' }
    setup([onDate, { id: '2', date: TODAY, start: '14:00', end: '15:00' }])

    expect(await listBookings(deps, TOMORROW)).toEqual([onDate])
  })

  it('sorts bookings by start time', async () => {
    const late: Booking = { id: '1', date: TOMORROW, start: '15:00', end: '16:00' }
    const early: Booking = { id: '2', date: TOMORROW, start: '09:00', end: '10:00' }
    const middle: Booking = { id: '3', date: TOMORROW, start: '11:00', end: '12:00' }
    setup([late, early, middle])

    expect(await listBookings(deps, TOMORROW)).toEqual([early, middle, late])
  })

  it('returns an empty list when there are no bookings', async () => {
    setup([])

    expect(await listBookings(deps, TOMORROW)).toEqual([])
  })

  it('allows listing a past date', async () => {
    const past: Booking = { id: '1', date: YESTERDAY, start: '10:00', end: '11:00' }
    setup([past])

    expect(await listBookings(deps, YESTERDAY)).toEqual([past])
  })

  it('rejects a malformed date', async () => {
    setup([])

    await expect(listBookings(deps, '29-10-2026')).rejects.toMatchObject({ code: 'INVALID_INPUT' })
  })
})
