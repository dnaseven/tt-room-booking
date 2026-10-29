import { beforeEach, describe, expect, it } from 'vitest'
import type { BookingRepository } from './booking.repository'
import type { Booking } from './booking.schema'
import { createBooking, deleteBooking, listBookings, updateBooking, type BookingDeps } from './booking.usecase'

const TODAY = '2026-10-29'
const TOMORROW = '2026-10-30'
const YESTERDAY = '2026-10-28'

const makeRepository = (initial: Booking[] = []): BookingRepository => {
  const items = [...initial]
  let nextId = items.length + 1

  return {
    listByDate: async (date) => items.filter((item) => item.date === date),
    getById: async (id) => items.find((item) => item.id === id),
    create: async (input) => {
      const booking = { id: String(nextId++), ...input }
      items.push(booking)
      return booking
    },
    update: async (id, patch) => {
      const index = items.findIndex((item) => item.id === id)
      items[index] = { ...items[index], ...patch }
      return items[index]
    },
    remove: async (id) => {
      const index = items.findIndex((item) => item.id === id)
      items.splice(index, 1)
    },
  }
}

describe('createBooking', () => {
  let deps: BookingDeps

  // now = 2026-10-29 12:00
  const setup = (initial: Booking[] = []) => {
    deps = { repository: makeRepository(initial), now: () => new Date(2026, 9, 29, 12, 0) }
  }

  beforeEach(() => setup())

  it('creates a booking and persists it', async () => {
    const booking = await createBooking(deps, { date: TODAY, start: '14:00', end: '15:00', title: 'sync' })

    expect(booking).toMatchObject({ date: TODAY, start: '14:00', end: '15:00', title: 'sync' })
    expect(await deps.repository.listByDate(TODAY)).toEqual([booking])
  })

  describe('input format', () => {
    it('rejects a malformed time', async () => {
      await expect(createBooking(deps, { date: TODAY, start: '9:00', end: '15:00' })).rejects.toMatchObject({
        code: 'INVALID_INPUT',
      })
    })

    it('rejects a malformed date', async () => {
      await expect(createBooking(deps, { date: '29-10-2026', start: '14:00', end: '15:00' })).rejects.toMatchObject({
        code: 'INVALID_INPUT',
      })
    })
  })

  describe('range', () => {
    it('rejects start equal to end', async () => {
      await expect(createBooking(deps, { date: TOMORROW, start: '14:00', end: '14:00' })).rejects.toMatchObject({
        code: 'INVALID_RANGE',
      })
    })

    it('rejects start after end', async () => {
      await expect(createBooking(deps, { date: TOMORROW, start: '15:00', end: '14:00' })).rejects.toMatchObject({
        code: 'INVALID_RANGE',
      })
    })
  })

  describe('work hours 09:00-18:00', () => {
    it('rejects start before 09:00', async () => {
      await expect(createBooking(deps, { date: TOMORROW, start: '08:30', end: '09:30' })).rejects.toMatchObject({
        code: 'OUT_OF_WORK_HOURS',
      })
    })

    it('rejects end after 18:00', async () => {
      await expect(createBooking(deps, { date: TOMORROW, start: '17:30', end: '18:30' })).rejects.toMatchObject({
        code: 'OUT_OF_WORK_HOURS',
      })
    })

    it('allows the first and the last slot of the day', async () => {
      await expect(createBooking(deps, { date: TOMORROW, start: '09:00', end: '10:00' })).resolves.toBeDefined()
      await expect(createBooking(deps, { date: TOMORROW, start: '17:00', end: '18:00' })).resolves.toBeDefined()
    })
  })

  describe('duration 30 min - 2 h', () => {
    it('rejects less than 30 minutes', async () => {
      await expect(createBooking(deps, { date: TOMORROW, start: '14:00', end: '14:29' })).rejects.toMatchObject({
        code: 'DURATION_TOO_SHORT',
      })
    })

    it('rejects more than 2 hours', async () => {
      await expect(createBooking(deps, { date: TOMORROW, start: '14:00', end: '16:01' })).rejects.toMatchObject({
        code: 'DURATION_TOO_LONG',
      })
    })

    it('allows exactly 30 minutes and exactly 2 hours', async () => {
      await expect(createBooking(deps, { date: TOMORROW, start: '10:00', end: '10:30' })).resolves.toBeDefined()
      await expect(createBooking(deps, { date: TOMORROW, start: '14:00', end: '16:00' })).resolves.toBeDefined()
    })
  })

  describe('past time (now = 12:00 today)', () => {
    it('rejects a past date', async () => {
      await expect(createBooking(deps, { date: YESTERDAY, start: '14:00', end: '15:00' })).rejects.toMatchObject({
        code: 'PAST_TIME',
      })
    })

    it('rejects a slot that already ended today', async () => {
      await expect(createBooking(deps, { date: TODAY, start: '10:00', end: '11:00' })).rejects.toMatchObject({
        code: 'PAST_TIME',
      })
    })

    it('rejects a slot that already started today', async () => {
      await expect(createBooking(deps, { date: TODAY, start: '11:30', end: '12:30' })).rejects.toMatchObject({
        code: 'PAST_TIME',
      })
    })

    it('allows start exactly at now', async () => {
      await expect(createBooking(deps, { date: TODAY, start: '12:00', end: '13:00' })).resolves.toBeDefined()
    })
  })

  describe('conflicts', () => {
    const existing: Booking = { id: 'existing', date: TOMORROW, start: '11:00', end: '12:00' }

    beforeEach(() => setup([existing]))

    it('rejects an overlapping booking', async () => {
      await expect(createBooking(deps, { date: TOMORROW, start: '11:30', end: '12:30' })).rejects.toMatchObject({
        code: 'BOOKING_CONFLICT',
      })
    })

    it('rejects a booking inside an existing one', async () => {
      await expect(createBooking(deps, { date: TOMORROW, start: '11:15', end: '11:45' })).rejects.toMatchObject({
        code: 'BOOKING_CONFLICT',
      })
    })

    it('rejects a booking that contains an existing one', async () => {
      await expect(createBooking(deps, { date: TOMORROW, start: '10:30', end: '12:30' })).rejects.toMatchObject({
        code: 'BOOKING_CONFLICT',
      })
    })

    it('rejects an identical booking', async () => {
      await expect(createBooking(deps, { date: TOMORROW, start: '11:00', end: '12:00' })).rejects.toMatchObject({
        code: 'BOOKING_CONFLICT',
      })
    })

    it('allows touching boundaries', async () => {
      await expect(createBooking(deps, { date: TOMORROW, start: '10:00', end: '11:00' })).resolves.toBeDefined()
      await expect(createBooking(deps, { date: TOMORROW, start: '12:00', end: '13:00' })).resolves.toBeDefined()
    })

    it('ignores bookings on other dates', async () => {
      await expect(createBooking(deps, { date: '2026-10-31', start: '11:00', end: '12:00' })).resolves.toBeDefined()
    })
  })

  describe('check order', () => {
    it('reports the range before work hours', async () => {
      await expect(createBooking(deps, { date: TOMORROW, start: '08:00', end: '07:00' })).rejects.toMatchObject({
        code: 'INVALID_RANGE',
      })
    })

    it('reports work hours before duration', async () => {
      await expect(createBooking(deps, { date: TOMORROW, start: '08:00', end: '08:10' })).rejects.toMatchObject({
        code: 'OUT_OF_WORK_HOURS',
      })
    })

    it('reports duration before past time', async () => {
      await expect(createBooking(deps, { date: YESTERDAY, start: '10:00', end: '10:10' })).rejects.toMatchObject({
        code: 'DURATION_TOO_SHORT',
      })
    })

    it('reports past time before conflict', async () => {
      setup([{ id: 'existing', date: YESTERDAY, start: '10:00', end: '11:00' }])

      await expect(createBooking(deps, { date: YESTERDAY, start: '10:00', end: '11:00' })).rejects.toMatchObject({
        code: 'PAST_TIME',
      })
    })
  })
})

describe('updateBooking', () => {
  let deps: BookingDeps

  // now = 2026-10-29 12:00
  const setup = (initial: Booking[]) => {
    deps = { repository: makeRepository(initial), now: () => new Date(2026, 9, 29, 12, 0) }
  }

  const mine: Booking = { id: 'mine', date: TOMORROW, start: '11:00', end: '12:00', title: 'sync' }

  beforeEach(() => setup([mine]))

  it('updates fields and persists them', async () => {
    const booking = await updateBooking(deps, 'mine', { start: '13:00', end: '14:00' })

    expect(booking).toEqual({ ...mine, start: '13:00', end: '14:00' })
    expect(await deps.repository.getById('mine')).toEqual(booking)
  })

  it('keeps untouched fields when only the title changes', async () => {
    const booking = await updateBooking(deps, 'mine', { title: 'retro' })

    expect(booking).toEqual({ ...mine, title: 'retro' })
  })

  describe('lookup and input', () => {
    it('rejects an unknown id', async () => {
      await expect(updateBooking(deps, 'missing', { title: 'x' })).rejects.toMatchObject({
        code: 'BOOKING_NOT_FOUND',
      })
    })

    it('rejects a malformed patch', async () => {
      await expect(updateBooking(deps, 'mine', { start: '9:00' })).rejects.toMatchObject({
        code: 'INVALID_INPUT',
      })
    })

    it('reports invalid input before a missing booking', async () => {
      await expect(updateBooking(deps, 'missing', { start: '9:00' })).rejects.toMatchObject({
        code: 'INVALID_INPUT',
      })
    })
  })

  describe('rules apply to the merged booking', () => {
    it('rejects an end that is not after the existing start', async () => {
      await expect(updateBooking(deps, 'mine', { end: '10:00' })).rejects.toMatchObject({
        code: 'INVALID_RANGE',
      })
    })

    it('rejects a move outside work hours', async () => {
      await expect(updateBooking(deps, 'mine', { start: '17:30', end: '18:30' })).rejects.toMatchObject({
        code: 'OUT_OF_WORK_HOURS',
      })
    })

    it('rejects a duration shorter than 30 minutes', async () => {
      await expect(updateBooking(deps, 'mine', { end: '11:20' })).rejects.toMatchObject({
        code: 'DURATION_TOO_SHORT',
      })
    })

    it('rejects a duration longer than 2 hours', async () => {
      await expect(updateBooking(deps, 'mine', { end: '13:30' })).rejects.toMatchObject({
        code: 'DURATION_TOO_LONG',
      })
    })
  })

  describe('conflicts', () => {
    const other: Booking = { id: 'other', date: TOMORROW, start: '13:00', end: '14:00' }

    beforeEach(() => setup([mine, other]))

    it('does not conflict with itself', async () => {
      await expect(updateBooking(deps, 'mine', { start: '11:30', end: '12:30' })).resolves.toBeDefined()
      await expect(updateBooking(deps, 'mine', { start: '11:30', end: '12:30' })).resolves.toBeDefined()
    })

    it('rejects an overlap with another booking', async () => {
      await expect(updateBooking(deps, 'mine', { start: '12:30', end: '13:30' })).rejects.toMatchObject({
        code: 'BOOKING_CONFLICT',
      })
    })

    it('allows touching boundaries of another booking', async () => {
      await expect(updateBooking(deps, 'mine', { start: '12:00', end: '13:00' })).resolves.toBeDefined()
    })

    it('rejects a move to another date that overlaps a booking there', async () => {
      setup([mine, { id: 'other', date: '2026-10-31', start: '11:00', end: '12:00' }])

      await expect(updateBooking(deps, 'mine', { date: '2026-10-31' })).rejects.toMatchObject({
        code: 'BOOKING_CONFLICT',
      })
    })
  })

  describe('past time (now = 12:00 today)', () => {
    const past: Booking = { id: 'past', date: TODAY, start: '10:00', end: '11:00' }

    beforeEach(() => setup([past]))

    it('allows changing only the title of a booking in the past', async () => {
      await expect(updateBooking(deps, 'past', { title: 'notes' })).resolves.toMatchObject({ title: 'notes' })
    })

    it('allows resending unchanged date and time of a booking in the past', async () => {
      await expect(
        updateBooking(deps, 'past', { date: TODAY, start: '10:00', end: '11:00', title: 'notes' }),
      ).resolves.toMatchObject({ title: 'notes' })
    })

    it('rejects moving to a slot that already started', async () => {
      await expect(updateBooking(deps, 'past', { start: '10:30', end: '11:30' })).rejects.toMatchObject({
        code: 'PAST_TIME',
      })
    })

    it('allows moving to a future slot', async () => {
      await expect(updateBooking(deps, 'past', { start: '14:00', end: '15:00' })).resolves.toBeDefined()
    })

    it('rejects moving a future booking to a past date', async () => {
      setup([{ id: 'future', date: TODAY, start: '14:00', end: '15:00' }])

      await expect(updateBooking(deps, 'future', { date: YESTERDAY })).rejects.toMatchObject({
        code: 'PAST_TIME',
      })
    })
  })
})

describe('deleteBooking', () => {
  let deps: BookingDeps

  // now = 2026-10-29 12:00
  const setup = (initial: Booking[]) => {
    deps = { repository: makeRepository(initial), now: () => new Date(2026, 9, 29, 12, 0) }
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

describe('listBookings', () => {
  let deps: BookingDeps

  const setup = (initial: Booking[]) => {
    deps = { repository: makeRepository(initial), now: () => new Date(2026, 9, 29, 12, 0) }
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
