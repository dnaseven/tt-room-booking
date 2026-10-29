import type { UseQueryResult } from '@tanstack/react-query'
import type { Booking } from '@domain/booking/booking.schema'
import type { ApiError } from '@client/api/api-error'

export const useBookings = (_date: string): UseQueryResult<Booking[], ApiError> => {
  throw new Error('not implemented')
}
