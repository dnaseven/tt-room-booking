import {
  createBooking,
  deleteBooking,
  listBookings,
  updateBooking,
  type BookingDeps,
} from '@domain/booking/booking.usecase'
import type { CreateBooking, UpdateBooking } from '@domain/booking/booking.schema'
import { http, HttpResponse, type HttpHandler } from 'msw'
import { delay } from '../utils/delay'
import { toErrorResponse } from './error-response'
import { readJsonBody } from './read-json-body'

export type BookingHandlersOptions = {
  deps: BookingDeps
  delayMs: number
}

const COLLECTION_PATH = '*/api/bookings'
const ITEM_PATH = '*/api/bookings/:id'

export const createBookingHandlers = ({ deps, delayMs }: BookingHandlersOptions): HttpHandler[] => {
  const respond = async (action: () => Promise<Response>) => {
    await delay(delayMs)

    try {
      return await action()
    } catch (error) {
      return toErrorResponse(error)
    }
  }

  return [
    http.get(COLLECTION_PATH, ({ request }) =>
      respond(async () => {
        const date = new URL(request.url).searchParams.get('date') ?? ''
        return HttpResponse.json(await listBookings(deps, date))
      }),
    ),

    http.post(COLLECTION_PATH, ({ request }) =>
      respond(async () => {
        const input = (await readJsonBody(request)) as CreateBooking
        return HttpResponse.json(await createBooking(deps, input), { status: 201 })
      }),
    ),

    http.patch(ITEM_PATH, ({ request, params }) =>
      respond(async () => {
        const patch = (await readJsonBody(request)) as UpdateBooking
        return HttpResponse.json(await updateBooking(deps, String(params.id), patch))
      }),
    ),

    http.delete(ITEM_PATH, ({ params }) =>
      respond(async () => {
        await deleteBooking(deps, String(params.id))
        return new HttpResponse(null, { status: 204 })
      }),
    ),
  ]
}
