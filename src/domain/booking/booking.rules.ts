import { BookingErrorCode } from './booking.error'
import type { Booking, CreateBooking } from './booking.schema'

export const WORK_START = 9 * 60
export const WORK_END = 18 * 60
export const MIN_DURATION = 30
const MAX_DURATION = 2 * 60

export const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

const toDateString = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export const isInPast = (date: string, start: number, now: Date) => {
  const today = toDateString(now)
  if (date !== today) return date < today
  return start < now.getHours() * 60 + now.getMinutes()
}

export const findTimeRuleViolation = (
  booking: CreateBooking,
  now: Date,
  { checkPast = true }: { checkPast?: boolean } = {},
): BookingErrorCode | undefined => {
  const start = timeToMinutes(booking.start)
  const end = timeToMinutes(booking.end)

  if (start >= end) return BookingErrorCode.InvalidRange
  if (start < WORK_START || end > WORK_END) return BookingErrorCode.OutOfWorkHours

  const duration = end - start
  if (duration < MIN_DURATION) return BookingErrorCode.DurationTooShort
  if (duration > MAX_DURATION) return BookingErrorCode.DurationTooLong

  if (checkPast && isInPast(booking.date, start, now)) return BookingErrorCode.PastTime

  return undefined
}

export const findConflict = (booking: CreateBooking, existing: Booking[], excludeId?: string): Booking | undefined => {
  const start = timeToMinutes(booking.start)
  const end = timeToMinutes(booking.end)

  return existing.find(
    (other) =>
      other.id !== excludeId &&
      other.date === booking.date &&
      start < timeToMinutes(other.end) &&
      timeToMinutes(other.start) < end,
  )
}
