import { createBookingHandlers } from '@server/api/bookings.handlers'
import { createLocalStorageBookingRepository } from '@server/infra/local-storage-booking.repository'
import { generateId } from '@server/utils/generate-id'
import { startWorker } from '@server/worker/start-worker'

const DELAY_MS = 400

export const startServer = () => {
  const repository = createLocalStorageBookingRepository({ storage: window.localStorage, generateId })
  const handlers = createBookingHandlers({ deps: { repository, now: () => new Date() }, delayMs: DELAY_MS })

  return startWorker(handlers)
}
