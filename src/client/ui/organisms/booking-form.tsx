import { useId, type FormEvent } from 'react'
import { Alert } from '../atoms/alert'
import { Button } from '../atoms/button'
import { Input } from '../atoms/input'
import { Select } from '../atoms/select'
import { FormField } from '../molecules/form-field'
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

export const BookingForm = ({
  values,
  timeOptions,
  labels,
  fieldErrors = {},
  formError,
  isSubmitting,
  onChange,
  onSubmit,
  onDelete,
}: BookingFormProps) => {
  const id = useId()
  const change = (patch: Partial<BookingFormValues>) => onChange({ ...values, ...patch })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!isSubmitting) onSubmit()
  }

  return (
    <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit}>
      {formError && <Alert>{formError}</Alert>}

      <FormField id={`${id}-date`} label={labels.date} error={fieldErrors.date}>
        {(control) => (
          <Input {...control} type="date" value={values.date} onChange={(date) => change({ date })} />
        )}
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField id={`${id}-start`} label={labels.start} error={fieldErrors.start}>
          {(control) => (
            <Select {...control} value={values.start} options={timeOptions} onChange={(start) => change({ start })} />
          )}
        </FormField>

        <FormField id={`${id}-end`} label={labels.end} error={fieldErrors.end}>
          {(control) => (
            <Select {...control} value={values.end} options={timeOptions} onChange={(end) => change({ end })} />
          )}
        </FormField>
      </div>

      <FormField id={`${id}-title`} label={labels.title} error={fieldErrors.title}>
        {(control) => <Input {...control} value={values.title} onChange={(title) => change({ title })} />}
      </FormField>

      <div className="flex gap-2">
        <Button type="submit" loading={isSubmitting}>
          {isSubmitting ? labels.submitting : labels.submit}
        </Button>
        {onDelete && (
          <Button variant="destructive" disabled={isSubmitting} onClick={onDelete}>
            {labels.delete}
          </Button>
        )}
      </div>
    </form>
  )
}
