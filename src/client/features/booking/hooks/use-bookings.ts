import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import type { Booking } from '@domain/booking/booking.schema'
import type { ApiError } from '@client/api/api-error'
import { bookingKeys } from './booking-query-keys'
import { useBookingsApi } from './use-bookings-api'

export const useBookings = (date: string): UseQueryResult<Booking[], ApiError> => {
  const api = useBookingsApi()

  return useQuery<Booking[], ApiError>({
    queryKey: bookingKeys.day(date),
    queryFn: () => api.list(date),
  })
}
