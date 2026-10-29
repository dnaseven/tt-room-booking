import type { HttpHandler } from 'msw'
import { setupWorker } from 'msw/browser'

export const startWorker = (handlers: HttpHandler[]) =>
  setupWorker(...handlers).start({ onUnhandledFrame: 'bypass' })
