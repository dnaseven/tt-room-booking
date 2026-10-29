import { createContext } from 'react'
import type { BookingsApi } from '@client/api/bookings.api'

export const BookingsApiContext = createContext<BookingsApi | undefined>(undefined)
