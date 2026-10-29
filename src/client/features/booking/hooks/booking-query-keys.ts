export const bookingKeys = {
  all: ['bookings'] as const,
  day: (date: string) => ['bookings', date] as const,
}
