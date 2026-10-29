import type { UseMutationResult } from '@tanstack/react-query'
import type { Booking, CreateBooking, UpdateBooking } from '@domain/booking/booking.schema'
import type { ApiError } from '@client/api/api-error'

export const useCreateBooking = (): UseMutationResult<Booking, ApiError, CreateBooking> => {
  throw new Error('not implemented')
}

export const useUpdateBooking = (): UseMutationResult<Booking, ApiError, { id: string; patch: UpdateBooking }> => {
  throw new Error('not implemented')
}

export const useDeleteBooking = (): UseMutationResult<void, ApiError, string> => {
  throw new Error('not implemented')
}
