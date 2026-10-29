import type { BookingDeps } from '@domain/booking/booking.usecase'
import { createLocalStorageBookingRepository } from '../../infra/local-storage-booking.repository'
import { makeStorage } from '../../infra/tests/helpers'

export const TODAY = '2026-10-29'
export const TOMORROW = '2026-10-30'

const BASE_URL = 'http://localhost/api/bookings'

// now = 2026-10-29 12:00
export const makeDeps = (overrides: Partial<BookingDeps> = {}): BookingDeps => {
  let nextId = 1

  return {
    repository: createLocalStorageBookingRepository({ storage: makeStorage(), generateId: () => `id-${nextId++}` }),
    now: () => new Date(2026, 9, 29, 12, 0),
    ...overrides,
  }
}

export type ApiResult = { status: number; body: unknown }

export const call = async (method: string, path = '', body?: unknown): Promise<ApiResult> => {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  })
  const text = await response.text()

  return { status: response.status, body: text ? JSON.parse(text) : undefined }
}
