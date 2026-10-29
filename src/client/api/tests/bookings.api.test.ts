import type { Booking } from '@domain/booking/booking.schema'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { ApiError } from '../api-error'
import { createBookingsApi } from '../bookings.api'

const BASE_URL = 'http://localhost'
const DATE = '2026-10-30'
const booking: Booking = { id: 'id-1', date: DATE, start: '11:00', end: '12:00', title: 'sync' }

const server = setupServer()
const api = createBookingsApi({ baseUrl: BASE_URL })

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('bookings api', () => {
  describe('list', () => {
    it('requests the bookings of the date and returns them', async () => {
      let url = ''
      server.use(
        http.get('*/api/bookings', ({ request }) => {
          url = request.url
          return HttpResponse.json([booking])
        }),
      )

      expect(await api.list(DATE)).toEqual([booking])
      expect(new URL(url).searchParams.get('date')).toBe(DATE)
    })

    it('rejects a response that does not match the booking schema', async () => {
      server.use(http.get('*/api/bookings', () => HttpResponse.json([{ ...booking, start: '9:00' }])))

      await expect(api.list(DATE)).rejects.toMatchObject({ status: 200, code: 'INVALID_RESPONSE' })
    })
  })

  describe('create', () => {
    it('posts the booking as JSON and returns the created one', async () => {
      let received: unknown
      server.use(
        http.post('*/api/bookings', async ({ request }) => {
          received = await request.json()
          return HttpResponse.json(booking, { status: 201 })
        }),
      )

      const input = { date: DATE, start: '11:00', end: '12:00', title: 'sync' }

      expect(await api.create(input)).toEqual(booking)
      expect(received).toEqual(input)
    })
  })

  describe('update', () => {
    it('patches the booking by id and returns the updated one', async () => {
      let received: unknown
      server.use(
        http.patch('*/api/bookings/:id', async ({ request, params }) => {
          received = { id: params.id, body: await request.json() }
          return HttpResponse.json({ ...booking, start: '13:00', end: '14:00' })
        }),
      )

      expect(await api.update('id-1', { start: '13:00', end: '14:00' })).toEqual({
        ...booking,
        start: '13:00',
        end: '14:00',
      })
      expect(received).toEqual({ id: 'id-1', body: { start: '13:00', end: '14:00' } })
    })

    it('encodes the id in the path', async () => {
      let id: unknown
      server.use(
        http.patch('*/api/bookings/:id', ({ params }) => {
          id = params.id
          return HttpResponse.json(booking)
        }),
      )

      await api.update('a/b c', { title: 'x' })

      expect(id).toBe('a/b c')
    })
  })

  describe('remove', () => {
    it('deletes the booking by id and resolves with nothing', async () => {
      let requested = ''
      server.use(
        http.delete('*/api/bookings/:id', ({ params }) => {
          requested = String(params.id)
          return new HttpResponse(null, { status: 204 })
        }),
      )

      await expect(api.remove('id-1')).resolves.toBeUndefined()
      expect(requested).toBe('id-1')
    })
  })

  describe('errors', () => {
    it('turns a 409 into an ApiError with the server code and message', async () => {
      server.use(
        http.post('*/api/bookings', () =>
          HttpResponse.json({ code: 'BOOKING_CONFLICT', message: 'overlaps' }, { status: 409 }),
        ),
      )

      const error = await api.create({ date: DATE, start: '11:00', end: '12:00' }).catch((e: unknown) => e)

      expect(error).toBeInstanceOf(ApiError)
      expect(error).toMatchObject({ status: 409, code: 'BOOKING_CONFLICT', message: 'overlaps' })
    })

    it('keeps the code of a 404 and of a 400', async () => {
      server.use(
        http.delete('*/api/bookings/:id', () =>
          HttpResponse.json({ code: 'BOOKING_NOT_FOUND', message: 'missing' }, { status: 404 }),
        ),
        http.get('*/api/bookings', () =>
          HttpResponse.json({ code: 'INVALID_INPUT', message: 'bad date' }, { status: 400 }),
        ),
      )

      await expect(api.remove('x')).rejects.toMatchObject({ status: 404, code: 'BOOKING_NOT_FOUND' })
      await expect(api.list('bad')).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' })
    })

    it('turns an error body of an unexpected shape into INTERNAL_ERROR', async () => {
      server.use(http.get('*/api/bookings', () => new HttpResponse('oops', { status: 500 })))

      await expect(api.list(DATE)).rejects.toMatchObject({ status: 500, code: 'INTERNAL_ERROR' })
    })

    it('turns a network failure into NETWORK_ERROR', async () => {
      server.use(http.get('*/api/bookings', () => HttpResponse.error()))

      await expect(api.list(DATE)).rejects.toMatchObject({ status: 0, code: 'NETWORK_ERROR' })
    })
  })
})
