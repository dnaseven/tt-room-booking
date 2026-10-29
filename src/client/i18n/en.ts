export const en = {
  app: { title: 'Room booking' },
  language: { label: 'Language', en: 'English', ru: 'Русский' },
  date: { label: 'Date', previous: 'Previous day', next: 'Next day', today: 'Today' },
  timeline: {
    slot: {
      free: '{{start}}–{{end}}, free',
      booked: '{{start}}–{{end}}, booked',
      past: '{{start}}–{{end}}, unavailable',
    },
    booking: { titled: '{{title}}, {{start}}–{{end}}', untitled: 'Booking, {{start}}–{{end}}' },
    empty: { title: 'No bookings for this day', description: 'Pick a free slot to book the room' },
  },
  loading: { bookings: 'Loading bookings' },
  loadError: { title: 'Could not load bookings', retry: 'Try again' },
  panel: { title: 'Booking details', close: 'Close', placeholder: 'Pick a free slot or an existing booking' },
  form: {
    date: 'Date',
    start: 'Start',
    end: 'End',
    title: 'Title (optional)',
    create: 'Book the room',
    save: 'Save changes',
    submitting: 'Saving…',
    delete: 'Delete booking',
  },
  confirmDelete: {
    title: 'Delete this booking?',
    description: 'The booking will be removed. This cannot be undone.',
    confirm: 'Delete',
    cancel: 'Cancel',
  },
  errors: {
    INVALID_INPUT: 'Check the date and time format.',
    INVALID_RANGE: 'The end must be later than the start.',
    OUT_OF_WORK_HOURS: 'The room is available from 09:00 to 18:00.',
    DURATION_TOO_SHORT: 'A booking must last at least 30 minutes.',
    DURATION_TOO_LONG: 'A booking cannot last longer than 2 hours.',
    PAST_TIME: 'This time has already passed.',
    BOOKING_CONFLICT: 'This time was just taken by another booking. The schedule has been refreshed.',
    BOOKING_NOT_FOUND: 'This booking no longer exists. The schedule has been refreshed.',
    INTERNAL_ERROR: 'Something went wrong on the server. Please try again.',
    NETWORK_ERROR: 'Network error. Check your connection and try again.',
    INVALID_RESPONSE: 'The server sent an unexpected response. Please try again.',
  },
}

export type Dictionary = typeof en
