import type { BookingRepository } from '../booking.repository'
import type { Booking } from '../booking.schema'
import type { BookingDeps } from '../booking.usecase'

export const TODAY = '2026-10-29'
export const TOMORROW = '2026-10-30'
export const YESTERDAY = '2026-10-28'

const makeRepository = (initial: Booking[]): BookingRepository => {
  const items = [...initial]
  let nextId = items.length + 1

  return {
    listByDate: async (date) => items.filter((item) => item.date === date),
    getById: async (id) => items.find((item) => item.id === id),
    create: async (input) => {
      const booking = { id: String(nextId++), ...input }
      items.push(booking)
      return booking
    },
    update: async (id, patch) => {
      const index = items.findIndex((item) => item.id === id)
      items[index] = { ...items[index], ...patch }
      return items[index]
    },
    remove: async (id) => {
      const index = items.findIndex((item) => item.id === id)
      items.splice(index, 1)
    },
  }
}

// now = 2026-10-29 12:00
export const makeDeps = (initial: Booking[] = []): BookingDeps => ({
  repository: makeRepository(initial),
  now: () => new Date(2026, 9, 29, 12, 0),
})
