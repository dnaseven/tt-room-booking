import type { Locator, Page } from '@playwright/test'

// the page object keeps every selector of the booking screen (English interface) in one place
export class BookingPage {
  readonly page: Page
  readonly heading: Locator
  readonly navigatorDate: Locator
  readonly panel: Locator
  readonly formAlert: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.getByRole('heading', { level: 1 })
    this.navigatorDate = page.getByLabel('Date').first()
    this.panel = page.getByRole('complementary', { name: 'Booking details' })
    this.formAlert = this.panel.getByRole('alert')
  }

  async goto() {
    await this.page.goto('/')
    await this.heading.waitFor()
  }

  slot(start: string, end: string, state: 'free' | 'booked' | 'unavailable') {
    return this.page.getByRole('button', { name: `${start}–${end}, ${state}` })
  }

  freeSlot(start: string, end: string) {
    return this.slot(start, end, 'free')
  }

  booking(label: string) {
    return this.page.getByRole('button', { name: label, exact: true })
  }

  field(label: 'Date' | 'Start' | 'End' | 'Title (optional)') {
    return this.panel.getByLabel(label)
  }

  async fillForm(values: { start?: string; end?: string; title?: string }) {
    if (values.start !== undefined) await this.field('Start').selectOption(values.start)
    if (values.end !== undefined) await this.field('End').selectOption(values.end)
    if (values.title !== undefined) await this.field('Title (optional)').fill(values.title)
  }

  async submit(label: 'Book the room' | 'Save changes') {
    await this.panel.getByRole('button', { name: label }).click()
  }

  async openFreeSlot(start: string, end: string) {
    await this.freeSlot(start, end).click()
  }

  async openBooking(label: string) {
    await this.booking(label).click()
  }

  async deleteOpenBooking() {
    await this.panel.getByRole('button', { name: 'Delete booking' }).click()
  }

  confirmDialog() {
    return this.page.getByRole('dialog', { name: 'Delete this booking?' })
  }

  async goToNextDay() {
    await this.page.getByRole('button', { name: 'Next day' }).click()
  }

  async goToPreviousDay() {
    await this.page.getByRole('button', { name: 'Previous day' }).click()
  }

  async goToToday() {
    await this.page.getByRole('button', { name: 'Today' }).click()
  }

  languageSelect() {
    return this.page.getByLabel('Language')
  }
}
