import { BookingErrorCode } from '@domain/booking/booking.error'
import { z } from 'zod'
import { ApiError } from './api-error'

const ErrorBodySchema = z.object({
  code: z.enum([...Object.values(BookingErrorCode), 'INTERNAL_ERROR']),
  message: z.string(),
})

const toApiError = async (response: Response) => {
  const parsed = ErrorBodySchema.safeParse(await response.json().catch(() => undefined))

  return parsed.success
    ? new ApiError(response.status, parsed.data.code, parsed.data.message)
    : new ApiError(response.status, 'INTERNAL_ERROR')
}

const send = async (url: string, method: string, body?: unknown) => {
  let response: Response
  try {
    response = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR')
  }

  if (!response.ok) {
    throw await toApiError(response)
  }

  return response
}

export const requestJson = async <T>(url: string, method: string, schema: z.ZodType<T>, body?: unknown) => {
  const response = await send(url, method, body)
  const parsed = schema.safeParse(await response.json().catch(() => undefined))

  if (!parsed.success) {
    throw new ApiError(response.status, 'INVALID_RESPONSE', parsed.error.message)
  }

  return parsed.data
}

export const requestEmpty = async (url: string, method: string) => {
  await send(url, method)
}
