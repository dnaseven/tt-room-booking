import { isInPast, timeToMinutes } from '@domain/booking/booking.rules'
import type { Booking } from '@domain/booking/booking.schema'
import type { BookingViewModel } from '@client/ui/models/booking-view-model'
import { getBlockPosition } from '../lib/timeline'

export const toBookingViewModel = (booking: Booking, now: Date): BookingViewModel => {
  const start = timeToMinutes(booking.start)
  const end = timeToMinutes(booking.end)

  return {
    id: booking.id,
    title: booking.title,
    start: booking.start,
    end: booking.end,
    durationMinutes: end - start,
    hasStarted: isInPast(booking.date, start, now),
    position: getBlockPosition(booking),
  }
}
