// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { BookingFormValues } from '../../models/booking-form-values'
import { BookingForm, type BookingFormLabels, type BookingFormProps } from '../booking-form'

const labels: BookingFormLabels = {
  date: 'Date',
  start: 'Start',
  end: 'End',
  title: 'Title',
  submit: 'Save booking',
  submitting: 'Saving...',
  delete: 'Delete booking',
}

const values: BookingFormValues = { date: '2026-10-30', start: '10:00', end: '11:00', title: 'sync' }

const timeOptions = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00'].map((time) => ({
  value: time,
  label: time,
}))

const renderForm = (overrides: Partial<BookingFormProps> = {}) => {
  const props: BookingFormProps = {
    values,
    timeOptions,
    labels,
    isSubmitting: false,
    onChange: vi.fn(),
    onSubmit: vi.fn(),
    ...overrides,
  }
  render(<BookingForm {...props} />)

  return props
}

const field = (label: string) => screen.getByLabelText(label) as HTMLInputElement | HTMLSelectElement

afterEach(cleanup)

describe('BookingForm', () => {
  describe('fields', () => {
    it('shows the values in labelled fields', () => {
      renderForm()

      expect(field(labels.date).value).toBe('2026-10-30')
      expect(field(labels.start).value).toBe('10:00')
      expect(field(labels.end).value).toBe('11:00')
      expect(field(labels.title).value).toBe('sync')
    })

    it('offers the time options for start and end', () => {
      renderForm()

      const optionsOf = (label: string) => Array.from((field(label) as HTMLSelectElement).options).map((o) => o.value)

      expect(optionsOf(labels.start)).toEqual(timeOptions.map((option) => option.value))
      expect(optionsOf(labels.end)).toEqual(timeOptions.map((option) => option.value))
    })

    it('reports the whole new values on every change', () => {
      const { onChange } = renderForm()

      fireEvent.change(field(labels.date), { target: { value: '2026-10-31' } })
      fireEvent.change(field(labels.start), { target: { value: '09:30' } })
      fireEvent.change(field(labels.end), { target: { value: '12:00' } })
      fireEvent.change(field(labels.title), { target: { value: 'retro' } })

      expect(onChange).toHaveBeenNthCalledWith(1, { ...values, date: '2026-10-31' })
      expect(onChange).toHaveBeenNthCalledWith(2, { ...values, start: '09:30' })
      expect(onChange).toHaveBeenNthCalledWith(3, { ...values, end: '12:00' })
      expect(onChange).toHaveBeenNthCalledWith(4, { ...values, title: 'retro' })
    })
  })

  describe('submit', () => {
    it('calls onSubmit when the submit button is clicked', () => {
      const { onSubmit } = renderForm()

      fireEvent.click(screen.getByRole('button', { name: labels.submit }))

      expect(onSubmit).toHaveBeenCalledOnce()
    })

    it('disables the submit button and shows the submitting label while submitting', () => {
      const { onSubmit } = renderForm({ isSubmitting: true })

      const button = screen.getByRole('button', { name: labels.submitting }) as HTMLButtonElement
      fireEvent.click(button)

      expect(button.disabled).toBe(true)
      expect(screen.queryByRole('button', { name: labels.submit })).toBeNull()
      expect(onSubmit).not.toHaveBeenCalled()
    })
  })

  describe('errors', () => {
    it('shows a field error next to the field and marks the field invalid', () => {
      renderForm({ fieldErrors: { end: 'End must be after start' } })

      const end = field(labels.end)
      const message = screen.getByText('End must be after start')

      expect(end.getAttribute('aria-invalid')).toBe('true')
      expect(end.getAttribute('aria-describedby')).toBe(message.id)
      expect(field(labels.start).getAttribute('aria-invalid')).not.toBe('true')
    })

    it('shows a form error as an alert', () => {
      renderForm({ formError: 'This time was just taken' })

      expect(screen.getByRole('alert').textContent).toContain('This time was just taken')
    })

    it('shows no alert when there is no form error', () => {
      renderForm()

      expect(screen.queryByRole('alert')).toBeNull()
    })

    it('keeps the entered values when an error is shown', () => {
      renderForm({ formError: 'This time was just taken', values: { ...values, title: 'keep me' } })

      expect(field(labels.title).value).toBe('keep me')
      expect(field(labels.start).value).toBe('10:00')
    })
  })

  describe('delete', () => {
    it('has no delete button without onDelete', () => {
      renderForm()

      expect(screen.queryByRole('button', { name: labels.delete })).toBeNull()
    })

    it('calls onDelete when the delete button is clicked', () => {
      const onDelete = vi.fn()
      renderForm({ onDelete })

      fireEvent.click(screen.getByRole('button', { name: labels.delete }))

      expect(onDelete).toHaveBeenCalledOnce()
    })

    it('disables the delete button while submitting', () => {
      renderForm({ onDelete: vi.fn(), isSubmitting: true })

      expect((screen.getByRole('button', { name: labels.delete }) as HTMLButtonElement).disabled).toBe(true)
    })
  })
})
