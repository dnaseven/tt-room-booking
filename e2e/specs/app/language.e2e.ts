import { expect, test } from '../../fixtures/test'

test.describe('language', () => {
  test('starts in English and switches to Russian, remembering the choice', async ({ page, bookingPage }) => {
    await bookingPage.goto()
    await expect(bookingPage.heading).toHaveText('Room booking')

    await bookingPage.languageSelect().selectOption('ru')

    await expect(bookingPage.heading).toHaveText('Бронирование переговорной')

    await page.reload()

    await expect(bookingPage.heading).toHaveText('Бронирование переговорной')
  })
})
