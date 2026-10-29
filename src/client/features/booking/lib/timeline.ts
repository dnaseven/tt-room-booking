import type { Booking } from '@domain/booking/booking.schema'
import type { BlockPosition } from '@client/ui/models/booking-view-model'
import type { TimelineSlot } from '@client/ui/models/timeline-slot'

export const buildSlots = (_date: string, _bookings: Booking[], _now: Date): TimelineSlot[] => {
  throw new Error('not implemented')
}

export const getBlockPosition = (_booking: Pick<Booking, 'start' | 'end'>): BlockPosition => {
  throw new Error('not implemented')
}
