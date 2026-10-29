import type { BookingViewModel } from '../models/booking-view-model'
import type { TimelineSlot } from '../models/timeline-slot'

export type BookingTimelineLabels = {
  slot: (slot: TimelineSlot) => string
  booking: (booking: BookingViewModel) => string
}

export type BookingTimelineProps = {
  slots: TimelineSlot[]
  bookings: BookingViewModel[]
  labels: BookingTimelineLabels
  selectedBookingId?: string
  onSelectSlot: (start: string) => void
  onSelectBooking: (id: string) => void
}

export const BookingTimeline = (_props: BookingTimelineProps) => null
