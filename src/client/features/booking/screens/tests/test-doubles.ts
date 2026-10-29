import type { Booking, CreateBooking, UpdateBooking } from '@domain/booking/booking.schema'
import { http, HttpResponse } from 'msw'

// now = 2026-10-29 12:00
export const TODAY = '2026-10-29'
export const TOMORROW = '2026-10-30'
export const YESTERDAY = '2026-10-28'
export const NOW = new Date(2026, 9, 29, 12, 0)

type Failure = { status: number; body: { code: string; message: string } }

// a tiny in-memory backend behind msw handlers, so the screen runs against the real client api layer
export const createFakeBackend = (initial: Booking[] = []) => {
  const failures = new Map<string, { failure: Failure; once: boolean }>()
  let nextId = 1

  const backend = {
    bookings: [...initial],
    requests: [] as string[],
    fail: (method: string, failure: Failure) => failures.set(method, { failure, once: false }),
    failOnce: (method: string, failure: Failure) => failures.set(method, { failure, once: true }),
    recover: (method: string) => failures.delete(method),
    count: (method: string) => backend.requests.filter((request) => request === method).length,
  }

  const respond = (method: string, success: () => Response) => {
    backend.requests.push(method)
    const entry = failures.get(method)
    if (!entry) return success()
    if (entry.once) failures.delete(method)
    return HttpResponse.json(entry.failure.body, { status: entry.failure.status })
  }

  const handlers = [
    http.get('*/api/bookings', ({ request }) =>
      respond('GET', () => {
        const date = new URL(request.url).searchParams.get('date')
        return HttpResponse.json(backend.bookings.filter((booking) => booking.date === date))
      }),
    ),
    http.post('*/api/bookings', async ({ request }) => {
      const input = (await request.json()) as CreateBooking
      return respond('POST', () => {
        const created = { id: `new-${nextId++}`, ...input }
        backend.bookings.push(created)
        return HttpResponse.json(created, { status: 201 })
      })
    }),
    http.patch('*/api/bookings/:id', async ({ request, params }) => {
      const patch = (await request.json()) as UpdateBooking
      return respond('PATCH', () => {
        const index = backend.bookings.findIndex((booking) => booking.id === params.id)
        backend.bookings[index] = { ...backend.bookings[index], ...patch }
        return HttpResponse.json(backend.bookings[index])
      })
    }),
    http.delete('*/api/bookings/:id', ({ params }) =>
      respond('DELETE', () => {
        backend.bookings = backend.bookings.filter((booking) => booking.id !== params.id)
        return new HttpResponse(null, { status: 204 })
      }),
    ),
  ]

  return { backend, handlers }
}

export const conflictFailure: Failure = {
  status: 409,
  body: { code: 'BOOKING_CONFLICT', message: 'overlaps' },
}

export const makeStorage = (): Storage => {
  const items = new Map<string, string>()

  return {
    get length() {
      return items.size
    },
    clear: () => items.clear(),
    getItem: (key) => items.get(key) ?? null,
    key: (index) => [...items.keys()][index] ?? null,
    removeItem: (key) => {
      items.delete(key)
    },
    setItem: (key, value) => {
      items.set(key, String(value))
    },
  }
}
