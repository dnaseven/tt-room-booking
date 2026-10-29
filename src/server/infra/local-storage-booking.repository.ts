import type { BookingRepository } from '@domain/booking/booking.repository'

export const STORAGE_KEY = 'room-booking:bookings'

export type LocalStorageBookingRepositoryDeps = {
  storage: Storage
  generateId: () => string
}

export const createLocalStorageBookingRepository = (_deps: LocalStorageBookingRepositoryDeps): BookingRepository => ({
  listByDate: async () => {
    throw new Error('not implemented')
  },
  getById: async () => {
    throw new Error('not implemented')
  },
  create: async () => {
    throw new Error('not implemented')
  },
  update: async () => {
    throw new Error('not implemented')
  },
  remove: async () => {
    throw new Error('not implemented')
  },
})
