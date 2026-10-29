import type { Booking } from '../../src/domain/booking/booking.schema'
import { TODAY } from './dates'

export const makeBooking = (overrides: Partial<Booking> & Pick<Booking, 'id'>): Booking => ({
  date: TODAY,
  start: '14:00',
  end: '15:00',
  ...overrides,
})
