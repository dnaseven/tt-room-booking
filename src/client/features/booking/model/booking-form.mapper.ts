import type { Booking, CreateBooking } from '@domain/booking/booking.schema'
import type { BookingFormValues } from '@client/ui/models/booking-form-values'

export const toFormValues = (booking: Booking): BookingFormValues => ({
  date: booking.date,
  start: booking.start,
  end: booking.end,
  title: booking.title ?? '',
})

export const toCreateBooking = (values: BookingFormValues): CreateBooking => {
  const title = values.title.trim()

  return { date: values.date, start: values.start, end: values.end, ...(title ? { title } : {}) }
}
