import { MIN_DURATION, WORK_END, WORK_START, isInPast, timeToMinutes } from '@domain/booking/booking.rules'
import type { Booking } from '@domain/booking/booking.schema'
import type { BlockPosition } from '@client/ui/models/booking-view-model'
import type { SlotState, TimelineSlot } from '@client/ui/models/timeline-slot'

const SLOT_MINUTES = MIN_DURATION
const WORK_DAY_MINUTES = WORK_END - WORK_START

const toTime = (minutes: number) => {
  const hours = String(Math.floor(minutes / 60)).padStart(2, '0')
  const rest = String(minutes % 60).padStart(2, '0')
  return `${hours}:${rest}`
}

export const buildSlots = (date: string, bookings: Booking[], now: Date): TimelineSlot[] => {
  const sameDay = bookings
    .filter((booking) => booking.date === date)
    .map((booking) => ({ start: timeToMinutes(booking.start), end: timeToMinutes(booking.end) }))

  const slots: TimelineSlot[] = []
  for (let start = WORK_START; start < WORK_END; start += SLOT_MINUTES) {
    const end = start + SLOT_MINUTES
    const isBooked = sameDay.some((booking) => start < booking.end && booking.start < end)

    let state: SlotState = 'free'
    if (isBooked) state = 'booked'
    else if (isInPast(date, start, now)) state = 'past'

    slots.push({ start: toTime(start), end: toTime(end), state })
  }

  return slots
}

export const getBlockPosition = (booking: Pick<Booking, 'start' | 'end'>): BlockPosition => {
  const start = timeToMinutes(booking.start)
  const end = timeToMinutes(booking.end)

  return {
    topPercent: ((start - WORK_START) / WORK_DAY_MINUTES) * 100,
    heightPercent: ((end - start) / WORK_DAY_MINUTES) * 100,
  }
}
