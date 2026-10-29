import { beforeEach, describe, expect, it } from 'vitest'
import type { Booking } from '../booking.schema'
import { createBooking, type BookingDeps } from '../booking.usecase'
import { TODAY, TOMORROW, YESTERDAY, makeDeps } from './helpers'

describe('createBooking', () => {
  let deps: BookingDeps

  const setup = (initial: Booking[] = []) => {
    deps = makeDeps(initial)
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
