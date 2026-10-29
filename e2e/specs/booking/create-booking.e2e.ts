import { expect, test } from '../../fixtures/test'
import { makeBooking } from '../../support/bookings'
import { TODAY } from '../../support/dates'
import { addStoredBooking, readStoredBookings } from '../../support/stored-bookings'

test.describe('creating a booking', () => {
  test('books a free slot, closes the form and keeps the booking after a reload', async ({ page, bookingPage }) => {
    await bookingPage.goto()

    await bookingPage.openFreeSlot('11:00', '11:30')
    await expect(bookingPage.field('Date')).toHaveValue(TODAY)
    await expect(bookingPage.field('Start')).toHaveValue('11:00')
    await expect(bookingPage.field('End')).toHaveValue('11:30')

    await bookingPage.fillForm({ title: 'retro' })
    await bookingPage.submit('Book the room')

    await expect(bookingPage.booking('retro, 11:00–11:30')).toBeVisible()
    await expect(bookingPage.panel).toContainText('Pick a free slot or an existing booking')

    await page.reload()

    await expect(bookingPage.booking('retro, 11:00–11:30')).toBeVisible()
  })

  test('books a longer slot', async ({ bookingPage }) => {
    await bookingPage.goto()

    await bookingPage.openFreeSlot('11:00', '11:30')
    await bookingPage.fillForm({ end: '12:30', title: 'workshop' })
    await bookingPage.submit('Book the room')

    await expect(bookingPage.booking('workshop, 11:00–12:30')).toBeVisible()
  })

  test('refuses an end before the start and stores nothing', async ({ page, bookingPage }) => {
    await bookingPage.goto()
    await bookingPage.openFreeSlot('11:00', '11:30')

    await bookingPage.fillForm({ end: '10:30' })
    await bookingPage.submit('Book the room')

    await expect(bookingPage.panel).toContainText('The end must be later than the start.')
    await expect(bookingPage.field('End')).toHaveAttribute('aria-invalid', 'true')
    expect(await readStoredBookings(page)).toEqual([])
  })

  test('refuses a booking longer than two hours', async ({ bookingPage }) => {
    await bookingPage.goto()
    await bookingPage.openFreeSlot('11:00', '11:30')

    await bookingPage.fillForm({ end: '13:30' })
    await bookingPage.submit('Book the room')

    await expect(bookingPage.panel).toContainText('A booking cannot last longer than 2 hours.')
  })

  test('explains a conflict, refreshes the day and keeps what was typed so the user can pick another time', async ({
    page,
    bookingPage,
  }) => {
    await bookingPage.goto()
    await bookingPage.openFreeSlot('11:00', '11:30')
    await bookingPage.fillForm({ title: 'retro' })

    // somebody else takes the slot while the form is open: the page still shows it as free
    await addStoredBooking(page, makeBooking({ id: 'other', start: '11:00', end: '11:30', title: 'other' }))
    await bookingPage.submit('Book the room')

    await expect(bookingPage.formAlert).toContainText('This time was just taken')
    await expect(bookingPage.booking('other, 11:00–11:30')).toBeVisible()
    await expect(bookingPage.field('Title (optional)')).toHaveValue('retro')
    await expect(bookingPage.field('Start')).toHaveValue('11:00')

    await bookingPage.fillForm({ start: '12:00', end: '12:30' })
    await bookingPage.submit('Book the room')

    await expect(bookingPage.booking('retro, 12:00–12:30')).toBeVisible()
    await expect(bookingPage.booking('other, 11:00–11:30')).toBeVisible()
  })
})
