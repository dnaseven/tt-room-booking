import { expect, test } from '../../fixtures/test'
import { makeBooking } from '../../support/bookings'
import { readStoredBookings, seedBookings } from '../../support/stored-bookings'

test.describe('deleting a booking', () => {
  test.beforeEach(async ({ page, bookingPage }) => {
    await seedBookings(page, [makeBooking({ id: 'sync', title: 'sync' })])
    await bookingPage.goto()
    await bookingPage.openBooking('sync, 14:00–15:00')
    await bookingPage.deleteOpenBooking()
  })

  test('removes the booking after the confirmation', async ({ page, bookingPage }) => {
    const dialog = bookingPage.confirmDialog()
    await expect(dialog).toBeVisible()

    await dialog.getByRole('button', { name: 'Delete', exact: true }).click()

    await expect(bookingPage.booking('sync, 14:00–15:00')).toBeHidden()
    await expect(bookingPage.freeSlot('14:00', '14:30')).toBeVisible()
    expect(await readStoredBookings(page)).toEqual([])
  })

  test('keeps the booking when the confirmation is cancelled', async ({ page, bookingPage }) => {
    const dialog = bookingPage.confirmDialog()

    await dialog.getByRole('button', { name: 'Cancel' }).click()

    await expect(dialog).toBeHidden()
    await expect(bookingPage.booking('sync, 14:00–15:00')).toBeVisible()
    expect(await readStoredBookings(page)).toHaveLength(1)
  })
})
