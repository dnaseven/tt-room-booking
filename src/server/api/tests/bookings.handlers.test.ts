import type { BookingDeps } from '@domain/booking/booking.usecase'
import { setupServer } from 'msw/node'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createBookingHandlers } from '../bookings.handlers'
import { TODAY, TOMORROW, call, makeDeps } from './helpers'

const server = setupServer()

describe('booking handlers', () => {
  let deps: BookingDeps

  const setup = (next: BookingDeps = makeDeps()) => {
    deps = next
    server.resetHandlers(...createBookingHandlers({ deps, delayMs: 0 }))
  }

  beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
  beforeEach(() => setup())
  afterAll(() => server.close())

  describe('GET /api/bookings?date=', () => {
    it('returns the bookings of the date sorted by start', async () => {
      const late = await deps.repository.create({ date: TOMORROW, start: '15:00', end: '16:00' })
      const early = await deps.repository.create({ date: TOMORROW, start: '09:00', end: '10:00' })
      await deps.repository.create({ date: TODAY, start: '14:00', end: '15:00' })

      expect(await call('GET', `?date=${TOMORROW}`)).toEqual({ status: 200, body: [early, late] })
    })

    it('returns an empty list when there are no bookings', async () => {
      expect(await call('GET', `?date=${TOMORROW}`)).toEqual({ status: 200, body: [] })
    })

    it('rejects a missing date', async () => {
      expect(await call('GET')).toMatchObject({ status: 400, body: { code: 'INVALID_INPUT' } })
    })

    it('rejects a malformed date', async () => {
      expect(await call('GET', '?date=29-10-2026')).toMatchObject({ status: 400, body: { code: 'INVALID_INPUT' } })
    })
  })

  describe('POST /api/bookings', () => {
    it('creates a booking and responds 201', async () => {
      const result = await call('POST', '', { date: TOMORROW, start: '11:00', end: '12:00', title: 'sync' })

      expect(result).toEqual({
        status: 201,
        body: { id: 'id-1', date: TOMORROW, start: '11:00', end: '12:00', title: 'sync' },
      })
      expect(await call('GET', `?date=${TOMORROW}`)).toMatchObject({ body: [{ id: 'id-1' }] })
    })

    it('responds 409 with a conflict code and a message', async () => {
      await deps.repository.create({ date: TOMORROW, start: '11:00', end: '12:00' })

      const result = await call('POST', '', { date: TOMORROW, start: '11:30', end: '12:30' })

      expect(result).toMatchObject({ status: 409, body: { code: 'BOOKING_CONFLICT' } })
      expect((result.body as { message: string }).message).toEqual(expect.any(String))
    })

    it('responds 400 with the violated rule code', async () => {
      expect(await call('POST', '', { date: TOMORROW, start: '08:00', end: '09:00' })).toMatchObject({
        status: 400,
        body: { code: 'OUT_OF_WORK_HOURS' },
      })
      expect(await call('POST', '', { date: '2026-10-28', start: '11:00', end: '12:00' })).toMatchObject({
        status: 400,
        body: { code: 'PAST_TIME' },
      })
    })

    it('responds 400 for a malformed body', async () => {
      expect(await call('POST', '', { date: TOMORROW })).toMatchObject({ status: 400, body: { code: 'INVALID_INPUT' } })
    })

    it('responds 400 for invalid JSON', async () => {
      expect(await call('POST', '', '{not json')).toMatchObject({ status: 400, body: { code: 'INVALID_INPUT' } })
    })
  })

  describe('PATCH /api/bookings/:id', () => {
    it('updates the booking and responds 200', async () => {
      const booking = await deps.repository.create({ date: TOMORROW, start: '11:00', end: '12:00' })

      expect(await call('PATCH', `/${booking.id}`, { start: '13:00', end: '14:00' })).toEqual({
        status: 200,
        body: { ...booking, start: '13:00', end: '14:00' },
      })
    })

    it('responds 404 for an unknown id', async () => {
      expect(await call('PATCH', '/missing', { title: 'x' })).toMatchObject({
        status: 404,
        body: { code: 'BOOKING_NOT_FOUND' },
      })
    })

    it('responds 409 when the new time overlaps another booking', async () => {
      const booking = await deps.repository.create({ date: TOMORROW, start: '11:00', end: '12:00' })
      await deps.repository.create({ date: TOMORROW, start: '13:00', end: '14:00' })

      expect(await call('PATCH', `/${booking.id}`, { start: '12:30', end: '13:30' })).toMatchObject({
        status: 409,
        body: { code: 'BOOKING_CONFLICT' },
      })
    })

    it('responds 400 with the violated rule code', async () => {
      const booking = await deps.repository.create({ date: TOMORROW, start: '11:00', end: '12:00' })

      expect(await call('PATCH', `/${booking.id}`, { end: '13:30' })).toMatchObject({
        status: 400,
        body: { code: 'DURATION_TOO_LONG' },
      })
    })
  })

  describe('DELETE /api/bookings/:id', () => {
    it('deletes the booking and responds 204', async () => {
      const booking = await deps.repository.create({ date: TOMORROW, start: '11:00', end: '12:00' })

      expect(await call('DELETE', `/${booking.id}`)).toEqual({ status: 204, body: undefined })
      expect(await call('GET', `?date=${TOMORROW}`)).toEqual({ status: 200, body: [] })
    })

    it('responds 404 for an unknown id', async () => {
      expect(await call('DELETE', '/missing')).toMatchObject({ status: 404, body: { code: 'BOOKING_NOT_FOUND' } })
    })
  })

  describe('unexpected errors', () => {
    it('responds 500 with a generic error body', async () => {
      const base = makeDeps()
      setup({
        ...base,
        repository: {
          ...base.repository,
          listByDate: async () => {
            throw new Error('storage exploded')
          },
        },
      })

      expect(await call('GET', `?date=${TOMORROW}`)).toMatchObject({ status: 500, body: { code: 'INTERNAL_ERROR' } })
    })
  })
})
