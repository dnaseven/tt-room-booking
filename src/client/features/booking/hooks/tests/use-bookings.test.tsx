// @vitest-environment jsdom
import type { Booking } from '@domain/booking/booking.schema'
import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { createBookingsApi } from '@client/api/bookings.api'
import { useBookings } from '../use-bookings'
import { createWrapper } from './helpers'

const DATE = '2026-10-30'
const OTHER_DATE = '2026-10-31'
const booking: Booking = { id: '1', date: DATE, start: '11:00', end: '12:00' }
const otherBooking: Booking = { id: '2', date: OTHER_DATE, start: '13:00', end: '14:00' }

const server = setupServer()
const api = createBookingsApi({ baseUrl: 'http://localhost' })

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('useBookings', () => {
  it('is pending first and then returns the bookings of the date', async () => {
    server.use(http.get('*/api/bookings', () => HttpResponse.json([booking])))

    const { result } = renderHook(() => useBookings(DATE), { wrapper: createWrapper(api) })

    expect(result.current.isPending).toBe(true)
    await waitFor(() => expect(result.current.data).toEqual([booking]))
  })

  it('returns an empty list when there are no bookings', async () => {
    server.use(http.get('*/api/bookings', () => HttpResponse.json([])))

    const { result } = renderHook(() => useBookings(DATE), { wrapper: createWrapper(api) })

    await waitFor(() => expect(result.current.data).toEqual([]))
  })

  it('exposes an ApiError when loading fails', async () => {
    server.use(http.get('*/api/bookings', () => new HttpResponse('oops', { status: 500 })))

    const { result } = renderHook(() => useBookings(DATE), { wrapper: createWrapper(api) })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toMatchObject({ name: 'ApiError', status: 500, code: 'INTERNAL_ERROR' })
  })

  it('loads the bookings again when the date changes', async () => {
    server.use(
      http.get('*/api/bookings', ({ request }) => {
        const date = new URL(request.url).searchParams.get('date')
        return HttpResponse.json(date === DATE ? [booking] : [otherBooking])
      }),
    )

    const { result, rerender } = renderHook(({ date }) => useBookings(date), {
      initialProps: { date: DATE },
      wrapper: createWrapper(api),
    })
    await waitFor(() => expect(result.current.data).toEqual([booking]))

    rerender({ date: OTHER_DATE })

    await waitFor(() => expect(result.current.data).toEqual([otherBooking]))
  })
})
