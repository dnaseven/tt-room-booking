import type { Booking, CreateBooking, UpdateBooking } from './booking.schema'

export interface BookingRepository {
  listByDate(date: string): Promise<Booking[]>
  getById(id: string): Promise<Booking | undefined>
  create(input: CreateBooking): Promise<Booking>
  update(id: string, patch: UpdateBooking): Promise<Booking>
  remove(id: string): Promise<void>
}
