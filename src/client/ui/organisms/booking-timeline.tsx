import { BookingBlock } from '../atoms/booking-block'
import { SlotButton } from '../atoms/slot-button'
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

export const BookingTimeline = ({
  slots,
  bookings,
  labels,
  selectedBookingId,
  onSelectSlot,
  onSelectBooking,
}: BookingTimelineProps) => (
  <div className="relative">
    <ol>
      {slots.map((slot) => (
        <li key={slot.start}>
          <SlotButton
            state={slot.state}
            label={labels.slot(slot)}
            time={slot.start}
            onClick={() => onSelectSlot(slot.start)}
          />
        </li>
      ))}
    </ol>

    <div className="pointer-events-none absolute inset-y-0 right-0 left-16">
      {bookings.map((booking) => (
        <BookingBlock
          key={booking.id}
          label={labels.booking(booking)}
          position={booking.position}
          selected={booking.id === selectedBookingId}
          title={booking.title}
          time={`${booking.start}–${booking.end}`}
          onClick={() => onSelectBooking(booking.id)}
        />
      ))}
    </div>
  </div>
)
