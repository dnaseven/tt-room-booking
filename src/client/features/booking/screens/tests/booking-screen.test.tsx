// @vitest-environment jsdom
import type { Booking } from '@domain/booking/booking.schema'
import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { renderScreen } from './render-screen'
import { TODAY, TOMORROW, YESTERDAY, conflictFailure, createFakeBackend } from './test-doubles'

const sync: Booking = { id: 'sync', date: TODAY, start: '14:00', end: '15:00', title: 'sync' }

const server = setupServer()
let backend: ReturnType<typeof createFakeBackend>['backend']

const useBackend = (initial: Booking[]) => {
  const fake = createFakeBackend(initial)
  backend = fake.backend
  server.resetHandlers(...fake.handlers)
}

// the navigator comes first in the document, the form field with the same label comes later
const navigatorDate = () => screen.getAllByLabelText('Date')[0] as HTMLInputElement
const panel = () => within(screen.getByRole('complementary', { name: 'Booking details', hidden: true }))
const freeSlot = (start: string, end: string) => screen.findByRole('button', { name: `${start}–${end}, free` })
const type = (label: string, value: string) => fireEvent.change(panel().getByLabelText(label), { target: { value } })

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
beforeEach(() => useBackend([sync]))
afterEach(() => {
  cleanup()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('BookingScreen', () => {
  describe('loading the day', () => {
    it('shows a busy status first and then the bookings of the day', async () => {
      renderScreen()

      expect(screen.getByRole('status').textContent).toContain('Loading bookings')
      expect(await screen.findByRole('button', { name: 'sync, 14:00–15:00' })).toBeTruthy()
      expect(screen.queryByRole('status')).toBeNull()
    })

    it('starts on today', async () => {
      renderScreen()

      await screen.findByRole('button', { name: 'sync, 14:00–15:00' })

      expect(navigatorDate().value).toBe(TODAY)
    })

    it('tells that the day has no bookings', async () => {
      useBackend([])
      renderScreen()

      expect(await screen.findByText('No bookings for this day')).toBeTruthy()
    })

    it('shows an error with a retry and recovers on retry', async () => {
      backend.fail('GET', { status: 500, body: { code: 'INTERNAL_ERROR', message: 'boom' } })
      renderScreen()

      expect((await screen.findByRole('alert')).textContent).toContain('Could not load bookings')

      backend.recover('GET')
      fireEvent.click(screen.getByRole('button', { name: 'Try again' }))

      expect(await screen.findByRole('button', { name: 'sync, 14:00–15:00' })).toBeTruthy()
    })

    it('does not offer slots that are already in the past', async () => {
      renderScreen()

      const pastSlot = await screen.findByRole('button', { name: '09:00–09:30, unavailable' })

      expect((pastSlot as HTMLButtonElement).disabled).toBe(true)
    })
  })

  describe('creating a booking', () => {
    it('opens a form for the clicked slot with a half-hour booking', async () => {
      renderScreen()

      fireEvent.click(await freeSlot('16:00', '16:30'))

      expect((panel().getByLabelText('Date') as HTMLInputElement).value).toBe(TODAY)
      expect((panel().getByLabelText('Start') as HTMLSelectElement).value).toBe('16:00')
      expect((panel().getByLabelText('End') as HTMLSelectElement).value).toBe('16:30')
      expect(panel().queryByText('Pick a free slot or an existing booking')).toBeNull()
    })

    it('creates the booking, shows it on the timeline and closes the form', async () => {
      renderScreen()
      fireEvent.click(await freeSlot('16:00', '16:30'))

      type('Title (optional)', 'retro')
      fireEvent.click(panel().getByRole('button', { name: 'Book the room' }))

      expect(await screen.findByRole('button', { name: 'retro, 16:00–16:30' })).toBeTruthy()
      await waitFor(() => expect(panel().getByText('Pick a free slot or an existing booking')).toBeTruthy())
      expect(backend.bookings).toContainEqual(expect.objectContaining({ date: TODAY, start: '16:00', end: '16:30', title: 'retro' }))
    })

    it('shows a rule violation at the field and sends no request', async () => {
      renderScreen()
      fireEvent.click(await freeSlot('16:00', '16:30'))

      type('End', '15:30')
      fireEvent.click(panel().getByRole('button', { name: 'Book the room' }))

      expect(await panel().findByText('The end must be later than the start.')).toBeTruthy()
      expect(panel().getByLabelText('End').getAttribute('aria-invalid')).toBe('true')
      expect(backend.count('POST')).toBe(0)
    })

    it('shows a conflict, refreshes the day and keeps what the user entered', async () => {
      renderScreen()
      fireEvent.click(await freeSlot('16:00', '16:30'))
      type('Title (optional)', 'retro')

      // somebody else takes the slot while the form is open
      backend.bookings.push({ id: 'other', date: TODAY, start: '16:00', end: '16:30', title: 'other' })
      backend.failOnce('POST', conflictFailure)
      fireEvent.click(panel().getByRole('button', { name: 'Book the room' }))

      expect((await panel().findByRole('alert')).textContent).toContain('This time was just taken')
      expect(await screen.findByRole('button', { name: 'other, 16:00–16:30' })).toBeTruthy()
      expect((panel().getByLabelText('Title (optional)') as HTMLInputElement).value).toBe('retro')
      expect((panel().getByLabelText('Start') as HTMLSelectElement).value).toBe('16:00')
    })
  })

  describe('editing a booking', () => {
    it('opens the form with the values of the clicked booking', async () => {
      renderScreen()

      fireEvent.click(await screen.findByRole('button', { name: 'sync, 14:00–15:00' }))

      expect((panel().getByLabelText('Title (optional)') as HTMLInputElement).value).toBe('sync')
      expect((panel().getByLabelText('Start') as HTMLSelectElement).value).toBe('14:00')
      expect((panel().getByLabelText('End') as HTMLSelectElement).value).toBe('15:00')
      expect(panel().getByRole('button', { name: 'Save changes' })).toBeTruthy()
    })

    it('saves the changes and shows the updated booking', async () => {
      renderScreen()
      fireEvent.click(await screen.findByRole('button', { name: 'sync, 14:00–15:00' }))

      type('Title (optional)', 'planning')
      fireEvent.click(panel().getByRole('button', { name: 'Save changes' }))

      expect(await screen.findByRole('button', { name: 'planning, 14:00–15:00' })).toBeTruthy()
      expect(screen.queryByRole('button', { name: 'sync, 14:00–15:00' })).toBeNull()
    })

    it('does not complain about the past when only the title of a started booking changes', async () => {
      useBackend([{ id: 'early', date: TODAY, start: '10:00', end: '11:00', title: 'early' }])
      renderScreen()
      fireEvent.click(await screen.findByRole('button', { name: 'early, 10:00–11:00' }))

      type('Title (optional)', 'early v2')
      fireEvent.click(panel().getByRole('button', { name: 'Save changes' }))

      expect(await screen.findByRole('button', { name: 'early v2, 10:00–11:00' })).toBeTruthy()
    })
  })

  describe('deleting a booking', () => {
    const askToDelete = async () => {
      renderScreen()
      fireEvent.click(await screen.findByRole('button', { name: 'sync, 14:00–15:00' }))
      fireEvent.click(panel().getByRole('button', { name: 'Delete booking' }))

      return screen.findByRole('dialog', { name: 'Delete this booking?' })
    }

    it('removes the booking after the confirmation', async () => {
      const dialog = await askToDelete()

      fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }))

      await waitFor(() => expect(screen.queryByRole('button', { name: 'sync, 14:00–15:00' })).toBeNull())
      expect(backend.bookings).toEqual([])
    })

    it('keeps the booking when the confirmation is cancelled', async () => {
      const dialog = await askToDelete()

      fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))

      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
      expect(screen.getByRole('button', { name: 'sync, 14:00–15:00' })).toBeTruthy()
      expect(backend.count('DELETE')).toBe(0)
    })
  })

  describe('changing the day', () => {
    const planned: Booking = { id: 'planned', date: TOMORROW, start: '11:00', end: '12:00', title: 'planned' }

    beforeEach(() => useBackend([sync, planned]))

    it('shows the next day and comes back to today', async () => {
      renderScreen()
      await screen.findByRole('button', { name: 'sync, 14:00–15:00' })

      fireEvent.click(screen.getByRole('button', { name: 'Next day' }))

      expect(await screen.findByRole('button', { name: 'planned, 11:00–12:00' })).toBeTruthy()
      expect(navigatorDate().value).toBe(TOMORROW)
      expect(screen.queryByRole('button', { name: 'sync, 14:00–15:00' })).toBeNull()

      fireEvent.click(screen.getByRole('button', { name: 'Today' }))

      expect(await screen.findByRole('button', { name: 'sync, 14:00–15:00' })).toBeTruthy()
      expect(navigatorDate().value).toBe(TODAY)
    })

    it('shows a picked date', async () => {
      renderScreen()
      await screen.findByRole('button', { name: 'sync, 14:00–15:00' })

      fireEvent.change(navigatorDate(), { target: { value: TOMORROW } })

      expect(await screen.findByRole('button', { name: 'planned, 11:00–12:00' })).toBeTruthy()
    })

    it('shows a past day with no slot to book', async () => {
      renderScreen()
      await screen.findByRole('button', { name: 'sync, 14:00–15:00' })

      fireEvent.click(screen.getByRole('button', { name: 'Previous day' }))

      const slot = await screen.findByRole('button', { name: '09:00–09:30, unavailable' })
      expect(navigatorDate().value).toBe(YESTERDAY)
      expect((slot as HTMLButtonElement).disabled).toBe(true)
      expect(screen.queryByRole('button', { name: /free$/ })).toBeNull()
    })
  })

  describe('language', () => {
    it('switches the interface language and remembers the choice', async () => {
      const { storage } = renderScreen()
      await screen.findByRole('button', { name: 'sync, 14:00–15:00' })

      fireEvent.change(screen.getByLabelText('Language'), { target: { value: 'ru' } })

      expect(await screen.findByRole('heading', { level: 1, name: 'Бронирование переговорной' })).toBeTruthy()
      expect(storage.getItem('room-booking:language')).toBe('ru')
    })

    it('starts in the language of the provided instance', async () => {
      renderScreen('ru')

      expect(await screen.findByRole('heading', { level: 1, name: 'Бронирование переговорной' })).toBeTruthy()
    })
  })
})
