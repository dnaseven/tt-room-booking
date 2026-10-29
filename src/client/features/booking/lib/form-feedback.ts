import type { BookingFormValues } from '@client/ui/models/booking-form-values'

export type FeedbackTarget = keyof BookingFormValues | 'form'

const FIELD_BY_CODE = new Map<string, keyof BookingFormValues>([
  ['INVALID_RANGE', 'end'],
  ['OUT_OF_WORK_HOURS', 'end'],
  ['DURATION_TOO_SHORT', 'end'],
  ['DURATION_TOO_LONG', 'end'],
  ['PAST_TIME', 'start'],
])

export const getFeedbackTarget = (code: string): FeedbackTarget => FIELD_BY_CODE.get(code) ?? 'form'
