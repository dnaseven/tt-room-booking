import type { BookingErrorCode } from './booking.error'
import type { Booking, CreateBooking } from './booking.schema'

export const timeToMinutes = (_time: string): number => {
  throw new Error('not implemented')
}

export const findTimeRuleViolation = (
  _booking: CreateBooking,
  _now: Date,
  _options?: { checkPast?: boolean },
): BookingErrorCode | undefined => {
  throw new Error('not implemented')
}

export const findConflict = (_booking: CreateBooking, _existing: Booking[], _excludeId?: string): Booking | undefined => {
  throw new Error('not implemented')
}
