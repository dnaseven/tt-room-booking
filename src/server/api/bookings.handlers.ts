import type { BookingDeps } from '@domain/booking/booking.usecase'
import type { HttpHandler } from 'msw'

export type BookingHandlersOptions = {
  deps: BookingDeps
  delayMs: number
}

export const createBookingHandlers = (_options: BookingHandlersOptions): HttpHandler[] => {
  throw new Error('not implemented')
}
