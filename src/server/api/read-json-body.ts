import { BookingErrorCode, DomainError } from '@domain/booking/booking.error'

export const readJsonBody = async (request: Request): Promise<unknown> => {
  try {
    return await request.json()
  } catch {
    throw new DomainError(BookingErrorCode.InvalidInput, 'request body must be valid JSON')
  }
}
