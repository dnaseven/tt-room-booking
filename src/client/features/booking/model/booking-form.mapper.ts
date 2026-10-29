import type { Booking, CreateBooking } from '@domain/booking/booking.schema'
import type { BookingFormValues } from '@client/ui/models/booking-form-values'

export const toFormValues = (_booking: Booking): BookingFormValues => {
  throw new Error('not implemented')
}

export const toCreateBooking = (_values: BookingFormValues): CreateBooking => {
  throw new Error('not implemented')
}
