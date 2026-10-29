import type { BookingRepository } from './booking.repository'
import type { Booking, CreateBooking } from './booking.schema'

export type BookingDeps = {
  repository: BookingRepository
  now: () => Date
}

export const createBooking = async (_deps: BookingDeps, _input: CreateBooking): Promise<Booking> => {
  throw new Error('not implemented')
}
