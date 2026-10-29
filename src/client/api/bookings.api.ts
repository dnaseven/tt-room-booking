import type { Booking, CreateBooking, UpdateBooking } from '@domain/booking/booking.schema'

export type BookingsApiOptions = {
  baseUrl?: string
}

export type BookingsApi = {
  list: (date: string) => Promise<Booking[]>
  create: (input: CreateBooking) => Promise<Booking>
  update: (id: string, patch: UpdateBooking) => Promise<Booking>
  remove: (id: string) => Promise<void>
}

export const createBookingsApi = (_options: BookingsApiOptions = {}): BookingsApi => ({
  list: () => {
    throw new Error('not implemented')
  },
  create: () => {
    throw new Error('not implemented')
  },
  update: () => {
    throw new Error('not implemented')
  },
  remove: () => {
    throw new Error('not implemented')
  },
})
