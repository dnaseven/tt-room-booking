import { expect, test } from '../../fixtures/test'
import { makeBooking } from '../../support/bookings'
import { seedBookings } from '../../support/stored-bookings'

test.describe('editing a booking', () => {
  test('opens the form with the booking values', async ({ page, bookingPage }) => {
    await seedBookings(page, [makeBooking({ id: 'sync', title: 'sync' })])
    await bookingPage.goto()

    await bookingPage.openBooking('sync, 14:00–15:00')

    await expect(bookingPage.field('Title (optional)')).toHaveValue('sync')
    await expect(bookingPage.field('Start')).toHaveValue('14:00')
    await expect(bookingPage.field('End')).toHaveValue('15:00')
    await expect(bookingPage.booking('sync, 14:00–15:00')).toHaveAttribute('aria-current', 'true')
  })

  test('changes the title', async ({ page, bookingPage }) => {
    await seedBookings(page, [makeBooking({ id: 'sync', title: 'sync' })])
    await bookingPage.goto()
    await bookingPage.openBooking('sync, 14:00–15:00')

    await bookingPage.fillForm({ title: 'planning' })
    await bookingPage.submit('Save changes')

    await expect(bookingPage.booking('planning, 14:00–15:00')).toBeVisible()
    await expect(bookingPage.booking('sync, 14:00–15:00')).toBeHidden()
  })

  test('moves the booking to another time', async ({ page, bookingPage }) => {
    await seedBookings(page, [makeBooking({ id: 'sync', title: 'sync' })])
    await bookingPage.goto()
    await bookingPage.openBooking('sync, 14:00–15:00')

    await bookingPage.fillForm({ start: '16:00', end: '17:00' })
    await bookingPage.submit('Save changes')

    await expect(bookingPage.booking('sync, 16:00–17:00')).toBeVisible()
    await expect(bookingPage.booking('sync, 14:00–15:00')).toBeHidden()
  })

  test('does not conflict with itself when it is stretched over its own time', async ({ page, bookingPage }) => {
    await seedBookings(page, [makeBooking({ id: 'sync', title: 'sync' })])
    await bookingPage.goto()
    await bookingPage.openBooking('sync, 14:00–15:00')

    await bookingPage.fillForm({ end: '15:30' })
    await bookingPage.submit('Save changes')

    await expect(bookingPage.booking('sync, 14:00–15:30')).toBeVisible()
  })

  test('removes the title when it is cleared', async ({ page, bookingPage }) => {
    await seedBookings(page, [makeBooking({ id: 'sync', title: 'sync' })])
    await bookingPage.goto()
    await bookingPage.openBooking('sync, 14:00–15:00')

    await bookingPage.fillForm({ title: '' })
    await bookingPage.submit('Save changes')

    await expect(bookingPage.booking('Booking, 14:00–15:00')).toBeVisible()
  })

  test('lets the user rename a booking that has already started', async ({ page, bookingPage }) => {
    await seedBookings(page, [makeBooking({ id: 'early', start: '09:00', end: '10:30', title: 'early' })])
    await bookingPage.goto()
    await bookingPage.openBooking('early, 09:00–10:30')

    await bookingPage.fillForm({ title: 'early v2' })
    await bookingPage.submit('Save changes')

    await expect(bookingPage.booking('early v2, 09:00–10:30')).toBeVisible()
  })

  test('explains a conflict when the new time overlaps another booking', async ({ page, bookingPage }) => {
    await seedBookings(page, [
      makeBooking({ id: 'a', start: '11:00', end: '12:00', title: 'a' }),
      makeBooking({ id: 'b', start: '13:00', end: '14:00', title: 'b' }),
    ])
    await bookingPage.goto()
    await bookingPage.openBooking('b, 13:00–14:00')

    await bookingPage.fillForm({ start: '11:30', end: '12:30' })
    await bookingPage.submit('Save changes')

    await expect(bookingPage.formAlert).toContainText('This time was just taken')
    await expect(bookingPage.field('Start')).toHaveValue('11:30')
    await expect(bookingPage.booking('b, 13:00–14:00')).toBeVisible()
  })
})
