import { expect, test } from '../../fixtures/test'
import { makeBooking } from '../../support/bookings'
import { TODAY, TOMORROW } from '../../support/dates'
import { seedBookings } from '../../support/stored-bookings'

test.describe('viewing a day', () => {
  test('shows the bookings of today', async ({ page, bookingPage }) => {
    await seedBookings(page, [makeBooking({ id: 'sync', title: 'sync' })])

    await bookingPage.goto()

    await expect(bookingPage.navigatorDate).toHaveValue(TODAY)
    await expect(bookingPage.booking('sync, 14:00–15:00')).toBeVisible()
  })

  test('tells that a day has no bookings', async ({ bookingPage }) => {
    await bookingPage.goto()

    await expect(bookingPage.page.getByText('No bookings for this day')).toBeVisible()
  })

  test('marks the slots that have already passed as unavailable', async ({ bookingPage }) => {
    await bookingPage.goto()

    await expect(bookingPage.slot('09:30', '10:00', 'unavailable')).toBeDisabled()
    await expect(bookingPage.freeSlot('10:00', '10:30')).toBeEnabled()
  })

  test('moves between days', async ({ page, bookingPage }) => {
    await seedBookings(page, [
      makeBooking({ id: 'sync', title: 'sync' }),
      makeBooking({ id: 'planned', date: TOMORROW, start: '11:00', end: '12:00', title: 'planned' }),
    ])
    await bookingPage.goto()

    await bookingPage.goToNextDay()

    await expect(bookingPage.navigatorDate).toHaveValue(TOMORROW)
    await expect(bookingPage.booking('planned, 11:00–12:00')).toBeVisible()
    await expect(bookingPage.booking('sync, 14:00–15:00')).toBeHidden()

    await bookingPage.goToToday()

    await expect(bookingPage.navigatorDate).toHaveValue(TODAY)
    await expect(bookingPage.booking('sync, 14:00–15:00')).toBeVisible()
  })

  test('shows a past day with nothing to book', async ({ bookingPage }) => {
    await bookingPage.goto()

    await bookingPage.goToPreviousDay()

    await expect(bookingPage.slot('09:00', '09:30', 'unavailable')).toBeDisabled()
    await expect(bookingPage.page.getByRole('button', { name: /free$/ })).toHaveCount(0)
  })
})
