import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query'
import type { Booking, CreateBooking, UpdateBooking } from '@domain/booking/booking.schema'
import type { ApiError } from '@client/api/api-error'
import { bookingKeys } from './booking-query-keys'
import { useBookingsApi } from './use-bookings-api'

// refetch the lists after every mutation, also after a failure: a 409 or 404 means the list is stale
const useRefreshBookings = () => {
  const queryClient = useQueryClient()

  return () => queryClient.invalidateQueries({ queryKey: bookingKeys.all })
}

export const useCreateBooking = (): UseMutationResult<Booking, ApiError, CreateBooking> => {
  const api = useBookingsApi()
  const refresh = useRefreshBookings()

  return useMutation<Booking, ApiError, CreateBooking>({
    mutationFn: (input) => api.create(input),
    onSettled: refresh,
  })
}

export const useUpdateBooking = (): UseMutationResult<Booking, ApiError, { id: string; patch: UpdateBooking }> => {
  const api = useBookingsApi()
  const refresh = useRefreshBookings()

  return useMutation<Booking, ApiError, { id: string; patch: UpdateBooking }>({
    mutationFn: ({ id, patch }) => api.update(id, patch),
    onSettled: refresh,
  })
}

export const useDeleteBooking = (): UseMutationResult<void, ApiError, string> => {
  const api = useBookingsApi()
  const refresh = useRefreshBookings()

  return useMutation<void, ApiError, string>({
    mutationFn: (id) => api.remove(id),
    onSettled: refresh,
  })
}
