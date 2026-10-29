import { BookingErrorCode, DomainError } from './booking.error'
import type { BookingRepository } from './booking.repository'
import {
  CreateBookingSchema,
  UpdateBookingSchema,
  type Booking,
  type CreateBooking,
  type UpdateBooking,
} from './booking.schema'

export type BookingDeps = {
  repository: BookingRepository
  now: () => Date
}

const WORK_START = 9 * 60
const WORK_END = 18 * 60
const MIN_DURATION = 30
const MAX_DURATION = 2 * 60

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

const toDateString = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

const isInPast = (date: string, start: number, now: Date) => {
  const today = toDateString(now)
  if (date !== today) return date < today
  return start < now.getHours() * 60 + now.getMinutes()
}

type RuleOptions = {
  checkPast: boolean
  excludeId?: string
}

const assertRules = async (deps: BookingDeps, booking: CreateBooking, options: RuleOptions) => {
  const { date, start, end } = booking
  const startMinutes = toMinutes(start)
  const endMinutes = toMinutes(end)

  if (startMinutes >= endMinutes) {
    throw new DomainError(BookingErrorCode.InvalidRange)
  }
  if (startMinutes < WORK_START || endMinutes > WORK_END) {
    throw new DomainError(BookingErrorCode.OutOfWorkHours)
  }

  const duration = endMinutes - startMinutes
  if (duration < MIN_DURATION) {
    throw new DomainError(BookingErrorCode.DurationTooShort)
  }
  if (duration > MAX_DURATION) {
    throw new DomainError(BookingErrorCode.DurationTooLong)
  }

  if (options.checkPast && isInPast(date, startMinutes, deps.now())) {
    throw new DomainError(BookingErrorCode.PastTime)
  }

  const sameDay = await deps.repository.listByDate(date)
  const hasConflict = sameDay.some(
    (other) =>
      other.id !== options.excludeId && startMinutes < toMinutes(other.end) && toMinutes(other.start) < endMinutes,
  )
  if (hasConflict) {
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

export const listBookings = async (_deps: BookingDeps, _date: string): Promise<Booking[]> => {
  throw new Error('not implemented')
}
