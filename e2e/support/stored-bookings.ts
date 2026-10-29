import type { Page } from '@playwright/test'
import type { Booking } from '../../src/domain/booking/booking.schema'
import { STORAGE_KEY } from '../../src/server/infra/local-storage-booking.repository'

// puts bookings into localStorage before the app starts, but never over what a test has stored since
export const seedBookings = (page: Page, bookings: Booking[]) =>
  page.addInitScript(
    ({ key, value }) => {
      if (!window.localStorage.getItem(key)) window.localStorage.setItem(key, value)
    },
    { key: STORAGE_KEY, value: JSON.stringify(bookings) },
  )

// simulates somebody else booking a slot while this page still shows it as free
export const addStoredBooking = (page: Page, booking: Booking) =>
  page.evaluate(
    ({ key, item }) => {
      const items = JSON.parse(window.localStorage.getItem(key) ?? '[]')
      window.localStorage.setItem(key, JSON.stringify([...items, item]))
    },
    { key: STORAGE_KEY, item: booking },
  )

export const readStoredBookings = (page: Page): Promise<Booking[]> =>
  page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? '[]'), STORAGE_KEY)
