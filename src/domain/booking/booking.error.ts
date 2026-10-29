export const BookingErrorCode = {
  InvalidInput: 'INVALID_INPUT',
  InvalidRange: 'INVALID_RANGE',
  OutOfWorkHours: 'OUT_OF_WORK_HOURS',
  DurationTooShort: 'DURATION_TOO_SHORT',
  DurationTooLong: 'DURATION_TOO_LONG',
  PastTime: 'PAST_TIME',
  BookingConflict: 'BOOKING_CONFLICT',
  BookingNotFound: 'BOOKING_NOT_FOUND',
} as const

export type BookingErrorCode = (typeof BookingErrorCode)[keyof typeof BookingErrorCode]

export class DomainError extends Error {
  readonly code: BookingErrorCode

  constructor(code: BookingErrorCode, message?: string) {
    super(message ?? code)
    this.name = 'DomainError'
    this.code = code
  }
}
