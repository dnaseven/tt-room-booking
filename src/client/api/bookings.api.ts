import { BookingSchema, type Booking, type CreateBooking, type UpdateBooking } from '@domain/booking/booking.schema'
import { requestEmpty, requestJson } from './http'

export type BookingsApiOptions = {
  baseUrl?: string
}

export type BookingsApi = {
  list: (date: string) => Promise<Booking[]>
  create: (input: CreateBooking) => Promise<Booking>
  update: (id: string, patch: UpdateBooking) => Promise<Booking>
  remove: (id: string) => Promise<void>
}

const BookingListSchema = BookingSchema.array()

export const createBookingsApi = ({ baseUrl = '' }: BookingsApiOptions = {}): BookingsApi => {
  const collectionUrl = `${baseUrl}/api/bookings`
  const itemUrl = (id: string) => `${collectionUrl}/${encodeURIComponent(id)}`

  return {
    list: (date) => requestJson(`${collectionUrl}?date=${encodeURIComponent(date)}`, 'GET', BookingListSchema),
    create: (input) => requestJson(collectionUrl, 'POST', BookingSchema, input),
    update: (id, patch) => requestJson(itemUrl(id), 'PATCH', BookingSchema, patch),
    remove: (id) => requestEmpty(itemUrl(id), 'DELETE'),
  }
}
