import { BookingErrorCode, DomainError } from '@domain/booking/booking.error'
import { HttpResponse } from 'msw'

const STATUS_BY_CODE: Partial<Record<BookingErrorCode, number>> = {
  [BookingErrorCode.BookingConflict]: 409,
  [BookingErrorCode.BookingNotFound]: 404,
}

export const toErrorResponse = (error: unknown) => {
  if (error instanceof DomainError) {
    return HttpResponse.json(
      { code: error.code, message: error.message },
      { status: STATUS_BY_CODE[error.code] ?? 400 },
    )
  }

  return HttpResponse.json({ code: 'INTERNAL_ERROR', message: 'internal server error' }, { status: 500 })
}
