import { expect, test } from '../../fixtures/test'

test.describe('booking panel on a phone', () => {
  test.use({ viewport: { width: 390, height: 800 } })

  test('is hidden until a slot is picked, then covers the page and can be closed', async ({ bookingPage }) => {
    await bookingPage.goto()
    await expect(bookingPage.panel).toBeHidden()

    await bookingPage.openFreeSlot('11:00', '11:30')

    await expect(bookingPage.panel).toBeVisible()
    await expect(bookingPage.field('Start')).toBeVisible()

    await bookingPage.panel.getByRole('button', { name: 'Close' }).click()

    await expect(bookingPage.panel).toBeHidden()
  })
})
