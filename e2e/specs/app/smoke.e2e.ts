import { expect, test } from '@playwright/test'

test('app loads and the mock worker intercepts api requests', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'room booking' })).toBeVisible()

  const result = await page.evaluate(async () => {
    const response = await fetch('/api/bookings?date=2099-01-01')
    return { status: response.status, body: await response.json() }
  })

  expect(result).toEqual({ status: 200, body: [] })
})
