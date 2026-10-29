import type { BookingErrorCode } from '@domain/booking/booking.error'

export type ApiErrorCode = BookingErrorCode | 'INTERNAL_ERROR' | 'NETWORK_ERROR' | 'INVALID_RESPONSE'

export class ApiError extends Error {
  readonly status: number
  readonly code: ApiErrorCode

  constructor(status: number, code: ApiErrorCode, message?: string) {
    super(message ?? code)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}
