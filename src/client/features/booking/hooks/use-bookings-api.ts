import { useContext } from 'react'
import { BookingsApiContext } from './bookings-api-context'

export const useBookingsApi = () => {
  const api = useContext(BookingsApiContext)
  if (!api) {
    throw new Error('useBookingsApi must be used inside BookingsApiProvider')
  }
  return api
}
