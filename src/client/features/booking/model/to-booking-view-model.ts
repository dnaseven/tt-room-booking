import type { Booking } from '@domain/booking/booking.schema'
import type { BookingViewModel } from '@client/ui/models/booking-view-model'

export const toBookingViewModel = (_booking: Booking, _now: Date): BookingViewModel => {
  throw new Error('not implemented')
}
