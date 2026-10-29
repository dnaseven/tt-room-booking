import { findTimeRuleViolation } from '@domain/booking/booking.rules'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ApiError } from '@client/api/api-error'
import { DEFAULT_LANGUAGE, LANGUAGES, isLanguage } from '@client/i18n/languages'
import { saveLanguage } from '@client/i18n/language-storage'
import type { BookingFormValues } from '@client/ui/models/booking-form-values'
import type { BookingPageProps, BookingPageSchedule } from '@client/ui/pages/booking-page'
import { useCreateBooking, useDeleteBooking, useUpdateBooking } from '../hooks/use-booking-mutations'
import { useBookings } from '../hooks/use-bookings'
import { formatDate, shiftDate } from '../lib/dates'
import { getFeedbackTarget, type FeedbackTarget } from '../lib/form-feedback'
import { buildSlots } from '../lib/timeline'
import { addMinutes, buildTimeOptions } from '../lib/time'
import { toCreateBooking, toFormValues } from '../model/booking-form.mapper'
import { toBookingViewModel } from '../model/to-booking-view-model'

export type BookingScreenOptions = {
  now: () => Date
  storage: Storage
}

type Panel = { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; bookingId: string }

type Feedback = { target: FeedbackTarget; code: string }

const EMPTY_VALUES: BookingFormValues = { date: '', start: '', end: '', title: '' }
const TIME_OPTIONS = buildTimeOptions()
const DEFAULT_DURATION = 30

export const useBookingScreen = ({ now, storage }: BookingScreenOptions): BookingPageProps => {
  const { t, i18n } = useTranslation()

  const [date, setDate] = useState(() => formatDate(now()))
  const [panel, setPanel] = useState<Panel>({ mode: 'closed' })
  const [values, setValues] = useState<BookingFormValues>(EMPTY_VALUES)
  const [feedback, setFeedback] = useState<Feedback>()
  const [isConfirmingDelete, setConfirmingDelete] = useState(false)

  const bookingsQuery = useBookings(date)
  const createBooking = useCreateBooking()
  const updateBooking = useUpdateBooking()
  const deleteBooking = useDeleteBooking()

  const bookings = bookingsQuery.data ?? []
  const editing = panel.mode === 'edit' ? bookings.find((booking) => booking.id === panel.bookingId) : undefined

  const closePanel = () => {
    setPanel({ mode: 'closed' })
    setFeedback(undefined)
    setConfirmingDelete(false)
  }

  const showFailure = (error: ApiError) => setFeedback({ target: getFeedbackTarget(error.code), code: error.code })

  const openCreate = (start: string) => {
    setValues({ date, start, end: addMinutes(start, DEFAULT_DURATION), title: '' })
    setPanel({ mode: 'create' })
    setFeedback(undefined)
  }

  const openEdit = (id: string) => {
    const booking = bookings.find((item) => item.id === id)
    if (!booking) return

    setValues(toFormValues(booking))
    setPanel({ mode: 'edit', bookingId: id })
    setFeedback(undefined)
  }

  const changeDate = (next: string) => {
    if (!next) return

    setDate(next)
    closePanel()
  }

  const submit = () => {
    const input = toCreateBooking(values)
    const timeChanged =
      !editing || input.date !== editing.date || input.start !== editing.start || input.end !== editing.end

    const violation = findTimeRuleViolation(input, now(), { checkPast: panel.mode === 'create' || timeChanged })
    if (violation) {
      setFeedback({ target: getFeedbackTarget(violation), code: violation })
      return
    }

    setFeedback(undefined)
    const callbacks = { onSuccess: closePanel, onError: showFailure }

    if (panel.mode === 'edit') {
      // an empty title is sent on purpose: it clears the old one
      updateBooking.mutate({ id: panel.bookingId, patch: { ...input, title: values.title.trim() } }, callbacks)
    } else {
      createBooking.mutate(input, callbacks)
    }
  }

  const confirmDelete = () => {
    if (panel.mode !== 'edit') return

    deleteBooking.mutate(panel.bookingId, {
      onSuccess: closePanel,
      onError: (error) => {
        setConfirmingDelete(false)
        showFailure(error)
      },
    })
  }

  const errorText = (code: string) => t(`errors.${code}`)
  const fieldTarget = feedback && feedback.target !== 'form' ? feedback.target : undefined

  let schedule: BookingPageSchedule
  if (bookingsQuery.data === undefined && !bookingsQuery.isError) {
    schedule = { kind: 'loading', label: t('loading.bookings') }
  } else if (bookingsQuery.data === undefined) {
    schedule = {
      kind: 'error',
      title: t('loadError.title'),
      description: bookingsQuery.error ? errorText(bookingsQuery.error.code) : undefined,
      retryLabel: t('loadError.retry'),
      onRetry: () => void bookingsQuery.refetch(),
    }
  } else {
    schedule = {
      kind: 'ready',
      timeline: {
        slots: buildSlots(date, bookings, now()),
        bookings: bookings.map((booking) => toBookingViewModel(booking, now())),
        labels: {
          slot: (slot) => t(`timeline.slot.${slot.state}`, { start: slot.start, end: slot.end }),
          booking: (booking) =>
            booking.title
              ? t('timeline.booking.titled', { title: booking.title, start: booking.start, end: booking.end })
              : t('timeline.booking.untitled', { start: booking.start, end: booking.end }),
        },
        selectedBookingId: panel.mode === 'edit' ? panel.bookingId : undefined,
        onSelectSlot: openCreate,
        onSelectBooking: openEdit,
      },
      emptyNotice:
        bookings.length === 0
          ? { title: t('timeline.empty.title'), description: t('timeline.empty.description') }
          : undefined,
    }
  }

  return {
    header: {
      title: t('app.title'),
      languageLabel: t('language.label'),
      languages: LANGUAGES.map((language) => ({ value: language, label: t(`language.${language}`) })),
      language: isLanguage(i18n.language) ? i18n.language : DEFAULT_LANGUAGE,
      onLanguageChange: (language) => {
        if (!isLanguage(language)) return

        void i18n.changeLanguage(language)
        saveLanguage(storage, language)
      },
    },
    navigator: {
      value: date,
      labels: {
        previous: t('date.previous'),
        next: t('date.next'),
        today: t('date.today'),
        date: t('date.label'),
      },
      onChange: changeDate,
      onPrevious: () => changeDate(shiftDate(date, -1)),
      onNext: () => changeDate(shiftDate(date, 1)),
      onToday: () => changeDate(formatDate(now())),
    },
    schedule,
    panel: {
      isOpen: panel.mode !== 'closed',
      title: t('panel.title'),
      closeLabel: t('panel.close'),
      placeholder: t('panel.placeholder'),
      onClose: closePanel,
      form:
        panel.mode === 'closed'
          ? undefined
          : {
              values,
              timeOptions: TIME_OPTIONS,
              labels: {
                date: t('form.date'),
                start: t('form.start'),
                end: t('form.end'),
                title: t('form.title'),
                submit: panel.mode === 'edit' ? t('form.save') : t('form.create'),
                submitting: t('form.submitting'),
                delete: t('form.delete'),
              },
              fieldErrors: fieldTarget && feedback ? { [fieldTarget]: errorText(feedback.code) } : undefined,
              formError: feedback && feedback.target === 'form' ? errorText(feedback.code) : undefined,
              isSubmitting: createBooking.isPending || updateBooking.isPending,
              onChange: (next) => {
                setValues(next)
                setFeedback(undefined)
              },
              onSubmit: submit,
              onDelete: panel.mode === 'edit' ? () => setConfirmingDelete(true) : undefined,
            },
    },
    confirmDelete: {
      open: isConfirmingDelete,
      title: t('confirmDelete.title'),
      description: t('confirmDelete.description'),
      confirmLabel: t('confirmDelete.confirm'),
      cancelLabel: t('confirmDelete.cancel'),
      isConfirming: deleteBooking.isPending,
      onConfirm: confirmDelete,
      onCancel: () => setConfirmingDelete(false),
    },
  }
}
