import { beforeEach, describe, expect, it } from 'vitest'
import type { Booking } from '../booking.schema'
import { updateBooking, type BookingDeps } from '../booking.usecase'
import { TODAY, TOMORROW, YESTERDAY, makeDeps } from './helpers'

describe('updateBooking', () => {
  let deps: BookingDeps

  const setup = (initial: Booking[] = []) => {
    deps = makeDeps(initial)
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
