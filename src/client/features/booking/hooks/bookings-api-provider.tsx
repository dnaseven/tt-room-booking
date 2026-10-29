import type { ReactNode } from 'react'
import type { BookingsApi } from '@client/api/bookings.api'
import { BookingsApiContext } from './bookings-api-context'

export const BookingsApiProvider = ({ api, children }: { api: BookingsApi; children: ReactNode }) => (
  <BookingsApiContext.Provider value={api}>{children}</BookingsApiContext.Provider>
)
