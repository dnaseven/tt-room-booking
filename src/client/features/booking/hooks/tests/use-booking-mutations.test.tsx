// @vitest-environment jsdom
import type { Booking } from '@domain/booking/booking.schema'
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createBookingsApi } from '@client/api/bookings.api'
import { useCreateBooking, useDeleteBooking, useUpdateBooking } from '../use-booking-mutations'
import { useBookings } from '../use-bookings'
import { createWrapper } from './helpers'

const DATE = '2026-10-30'
const existing: Booking = { id: 'existing', date: DATE, start: '11:00', end: '12:00' }
const input = { date: DATE, start: '13:00', end: '14:00' }

const server = setupServer()
const api = createBookingsApi({ baseUrl: 'http://localhost' })

// the list a "backend" currently holds; handlers serve and change it
let stored: Booking[]

const conflict = () => HttpResponse.json({ code: 'BOOKING_CONFLICT', message: 'overlaps' }, { status: 409 })
const notFound = () => HttpResponse.json({ code: 'BOOKING_NOT_FOUND', message: 'missing' }, { status: 404 })

const renderScenario = () =>
  renderHook(
    () => ({
      list: useBookings(DATE),
      create: useCreateBooking(),
      update: useUpdateBooking(),
      remove: useDeleteBooking(),
    }),
    { wrapper: createWrapper(api) },
  )

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
beforeEach(() => {
  stored = [existing]
  server.use(http.get('*/api/bookings', () => HttpResponse.json(stored)))
})
afterEach(() => {
  cleanup()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('booking mutations', () => {
  describe('useCreateBooking', () => {
    it('creates the booking and refreshes the list', async () => {
      const created: Booking = { id: 'new', ...input }
      server.use(
        http.post('*/api/bookings', () => {
          stored = [...stored, created]
          return HttpResponse.json(created, { status: 201 })
        }),
      )
      const { result } = renderScenario()
      await waitFor(() => expect(result.current.list.data).toEqual([existing]))

      await act(() => result.current.create.mutateAsync(input))

      await waitFor(() => expect(result.current.list.data).toEqual([existing, created]))
    })

    it('exposes the conflict, keeps the input and refreshes the list', async () => {
      const taken: Booking = { id: 'taken', ...input }
      server.use(
        http.post('*/api/bookings', () => {
          stored = [...stored, taken]
          return conflict()
        }),
      )
      const { result } = renderScenario()
      await waitFor(() => expect(result.current.list.data).toEqual([existing]))

      await act(() => result.current.create.mutateAsync(input).catch(() => undefined))

      await waitFor(() => expect(result.current.create.error).toMatchObject({ status: 409, code: 'BOOKING_CONFLICT' }))
      expect(result.current.create.variables).toEqual(input)
      await waitFor(() => expect(result.current.list.data).toEqual([existing, taken]))
    })
  })

  describe('useUpdateBooking', () => {
    it('updates the booking and refreshes the list', async () => {
      const updated: Booking = { ...existing, start: '15:00', end: '16:00' }
      server.use(
        http.patch('*/api/bookings/:id', () => {
          stored = [updated]
          return HttpResponse.json(updated)
        }),
      )
      const { result } = renderScenario()
      await waitFor(() => expect(result.current.list.data).toEqual([existing]))

      await act(() => result.current.update.mutateAsync({ id: 'existing', patch: { start: '15:00', end: '16:00' } }))

      await waitFor(() => expect(result.current.list.data).toEqual([updated]))
    })

    it('exposes a conflict and refreshes the list', async () => {
      server.use(
        http.patch('*/api/bookings/:id', () => {
          stored = []
          return conflict()
        }),
      )
      const { result } = renderScenario()
      await waitFor(() => expect(result.current.list.data).toEqual([existing]))

      await act(() =>
        result.current.update.mutateAsync({ id: 'existing', patch: { start: '12:30' } }).catch(() => undefined),
      )

      await waitFor(() => expect(result.current.update.error).toMatchObject({ code: 'BOOKING_CONFLICT' }))
      await waitFor(() => expect(result.current.list.data).toEqual([]))
    })
  })

  describe('useDeleteBooking', () => {
    it('deletes the booking and refreshes the list', async () => {
      server.use(
        http.delete('*/api/bookings/:id', () => {
          stored = []
          return new HttpResponse(null, { status: 204 })
        }),
      )
      const { result } = renderScenario()
      await waitFor(() => expect(result.current.list.data).toEqual([existing]))

      await act(() => result.current.remove.mutateAsync('existing'))

      await waitFor(() => expect(result.current.list.data).toEqual([]))
    })

    it('exposes a missing booking and refreshes the list', async () => {
      server.use(
        http.delete('*/api/bookings/:id', () => {
          stored = []
          return notFound()
        }),
      )
      const { result } = renderScenario()
      await waitFor(() => expect(result.current.list.data).toEqual([existing]))

      await act(() => result.current.remove.mutateAsync('existing').catch(() => undefined))

      await waitFor(() => expect(result.current.remove.error).toMatchObject({ code: 'BOOKING_NOT_FOUND' }))
      await waitFor(() => expect(result.current.list.data).toEqual([]))
    })
  })
})
