import type { BookingRepository } from '@domain/booking/booking.repository'
import { BookingSchema, type Booking } from '@domain/booking/booking.schema'

export const STORAGE_KEY = 'room-booking:bookings'

export type LocalStorageBookingRepositoryDeps = {
  storage: Storage
  generateId: () => string
}

const readAll = (storage: Storage): Booking[] => {
  const raw = storage.getItem(STORAGE_KEY)
  if (!raw) return []

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }
  if (!Array.isArray(parsed)) return []

  return parsed.flatMap((item) => {
    const result = BookingSchema.safeParse(item)
    return result.success ? [result.data] : []
  })
}

const writeAll = (storage: Storage, bookings: Booking[]) => {
  storage.setItem(STORAGE_KEY, JSON.stringify(bookings))
}

export const createLocalStorageBookingRepository = ({
  storage,
  generateId,
}: LocalStorageBookingRepositoryDeps): BookingRepository => ({
  listByDate: async (date) => readAll(storage).filter((booking) => booking.date === date),

  getById: async (id) => readAll(storage).find((booking) => booking.id === id),

  create: async (input) => {
    const booking: Booking = { id: generateId(), ...input }
    writeAll(storage, [...readAll(storage), booking])
    return booking
  },

  update: async (id, patch) => {
    const bookings = readAll(storage)
    const index = bookings.findIndex((booking) => booking.id === id)
    if (index === -1) {
      throw new Error(`booking not found: ${id}`)
    }

    const updated = { ...bookings[index], ...patch }
    bookings[index] = updated
    writeAll(storage, bookings)
    return updated
  },

  remove: async (id) => {
    writeAll(
      storage,
      readAll(storage).filter((booking) => booking.id !== id),
    )
  },
})
