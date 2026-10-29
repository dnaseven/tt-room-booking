import { z } from 'zod'

export const DateSchema = z.iso.date()

export const TimeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)

export const BookingSchema = z.object({
  id: z.string(),
  date: DateSchema,
  start: TimeSchema,
  end: TimeSchema,
  title: z.string().optional(),
})

export const CreateBookingSchema = BookingSchema.omit({ id: true })

export const UpdateBookingSchema = CreateBookingSchema.partial()

export type Booking = z.infer<typeof BookingSchema>
export type CreateBooking = z.infer<typeof CreateBookingSchema>
export type UpdateBooking = z.infer<typeof UpdateBookingSchema>
