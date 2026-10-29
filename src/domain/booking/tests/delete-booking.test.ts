import { beforeEach, describe, expect, it } from 'vitest'
import type { Booking } from '../booking.schema'
import { deleteBooking, type BookingDeps } from '../booking.usecase'
import { TOMORROW, YESTERDAY, makeDeps } from './helpers'

describe('deleteBooking', () => {
  let deps: BookingDeps

  const setup = (initial: Booking[] = []) => {
    deps = makeDeps(initial)
  }

  const mine: Booking = { id: 'mine', date: TOMORROW, start: '11:00', end: '12:00' }
  const other: Booking = { id: 'other', date: TOMORROW, start: '13:00', end: '14:00' }

  beforeEach(() => setup([mine, other]))

  it('removes the booking', async () => {
    await deleteBooking(deps, 'mine')

    expect(await deps.repository.getById('mine')).toBeUndefined()
  })

  it('keeps other bookings', async () => {
    await deleteBooking(deps, 'mine')

    expect(await deps.repository.listByDate(TOMORROW)).toEqual([other])
  })

  it('rejects an unknown id', async () => {
    await expect(deleteBooking(deps, 'missing')).rejects.toMatchObject({ code: 'BOOKING_NOT_FOUND' })
  })

  it('rejects a second delete of the same booking', async () => {
    await deleteBooking(deps, 'mine')

    await expect(deleteBooking(deps, 'mine')).rejects.toMatchObject({ code: 'BOOKING_NOT_FOUND' })
  })

  it('allows deleting a booking in the past', async () => {
    setup([{ id: 'past', date: YESTERDAY, start: '10:00', end: '11:00' }])

    await expect(deleteBooking(deps, 'past')).resolves.toBeUndefined()
    expect(await deps.repository.getById('past')).toBeUndefined()
  })
})
