import type { AppHeaderProps } from '../organisms/app-header'
import type { BookingFormProps } from '../organisms/booking-form'
import type { BookingTimelineProps } from '../organisms/booking-timeline'
import type { ConfirmDialogProps } from '../organisms/confirm-dialog'
import type { DateNavigatorProps } from '../molecules/date-navigator'

export type BookingPageSchedule =
  | { kind: 'loading'; label: string }
  | { kind: 'error'; title: string; description?: string; retryLabel: string; onRetry: () => void }
  | { kind: 'ready'; timeline: BookingTimelineProps; emptyNotice?: { title: string; description?: string } }

export type BookingPagePanel = {
  isOpen: boolean
  title: string
  closeLabel: string
  placeholder: string
  form?: BookingFormProps
  onClose: () => void
}

export type BookingPageProps = {
  header: AppHeaderProps
  navigator: DateNavigatorProps
  schedule: BookingPageSchedule
  panel: BookingPagePanel
  confirmDelete: ConfirmDialogProps
}

export const BookingPage = (_props: BookingPageProps) => null
