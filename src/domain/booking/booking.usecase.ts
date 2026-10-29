import { BookingErrorCode, DomainError } from './booking.error'
import type { BookingRepository } from './booking.repository'
import { findConflict, findTimeRuleViolation, timeToMinutes } from './booking.rules'
import {
  CreateBookingSchema,
  DateSchema,
  UpdateBookingSchema,
  type Booking,
  type CreateBooking,
  type UpdateBooking,
} from './booking.schema'

export type BookingDeps = {
  repository: BookingRepository
  now: () => Date
}

type RuleOptions = {
  checkPast: boolean
  excludeId?: string
}

const assertRules = async (deps: BookingDeps, booking: CreateBooking, options: RuleOptions) => {
  const violation = findTimeRuleViolation(booking, deps.now(), { checkPast: options.checkPast })
  if (violation) {
    throw new DomainError(violation)
  }

  const sameDay = await deps.repository.listByDate(booking.date)
  if (findConflict(booking, sameDay, options.excludeId)) {
    throw new DomainError(BookingErrorCode.BookingConflict)
  }
}

export const createBooking = async (deps: BookingDeps, input: CreateBooking): Promise<Booking> => {
  const parsed = CreateBookingSchema.safeParse(input)
  if (!parsed.success) {
    throw new DomainError(BookingErrorCode.InvalidInput, parsed.error.message)
  }

  await assertRules(deps, parsed.data, { checkPast: true })

  return deps.repository.create(parsed.data)
}

export const updateBooking = async (deps: BookingDeps, id: string, patch: UpdateBooking): Promise<Booking> => {
  const parsed = UpdateBookingSchema.safeParse(patch)
  if (!parsed.success) {
    throw new DomainError(BookingErrorCode.InvalidInput, parsed.error.message)
  }

  const existing = await deps.repository.getById(id)
  if (!existing) {
    throw new DomainError(BookingErrorCode.BookingNotFound)
  }

  const merged = { ...existing, ...parsed.data }
  const timeChanged =
    merged.date !== existing.date || merged.start !== existing.start || merged.end !== existing.end

  await assertRules(deps, merged, { checkPast: timeChanged, excludeId: id })

  return deps.repository.update(id, parsed.data)
}

export const deleteBooking = async (deps: BookingDeps, id: string): Promise<void> => {
  const existing = await deps.repository.getById(id)
  if (!existing) {
    throw new DomainError(BookingErrorCode.BookingNotFound)
  }

  await deps.repository.remove(id)
}

export const listBookings = async (deps: BookingDeps, date: string): Promise<Booking[]> => {
  const parsed = DateSchema.safeParse(date)
  if (!parsed.success) {
    throw new DomainError(BookingErrorCode.InvalidInput, parsed.error.message)
  }

  const bookings = await deps.repository.listByDate(parsed.data)

  return [...bookings].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start))
}
