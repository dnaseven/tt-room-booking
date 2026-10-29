import type { BookingFormValues } from '../models/booking-form-values'
import type { TimeOption } from '../models/time-option'

export type BookingFormLabels = {
  date: string
  start: string
  end: string
  title: string
  submit: string
  submitting: string
  delete: string
}

export type BookingFormProps = {
  values: BookingFormValues
  timeOptions: TimeOption[]
  labels: BookingFormLabels
  fieldErrors?: Partial<Record<keyof BookingFormValues, string>>
  formError?: string
  isSubmitting: boolean
  onChange: (values: BookingFormValues) => void
  onSubmit: () => void
  onDelete?: () => void
}

export const BookingForm = (_props: BookingFormProps) => null
