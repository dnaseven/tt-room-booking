import { expect, test as base } from '@playwright/test'
import { BookingPage } from '../pages/booking-page'
import { NOW } from '../support/dates'

// every test gets a fresh browser context (clean localStorage) and a clock fixed at NOW,
// so "today", the past slots and the work day do not depend on when the suite runs
export const test = base.extend<{ bookingPage: BookingPage }>({
  bookingPage: async ({ page }, provide) => {
    await page.clock.install({ time: new Date(NOW) })
    await provide(new BookingPage(page))
  },
})

export { expect }
