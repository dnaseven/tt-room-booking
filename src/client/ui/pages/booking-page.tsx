import { Text } from '../atoms/text'
import { DateNavigator, type DateNavigatorProps } from '../molecules/date-navigator'
import { AppHeader, type AppHeaderProps } from '../organisms/app-header'
import { BookingForm, type BookingFormProps } from '../organisms/booking-form'
import { BookingTimeline, type BookingTimelineProps } from '../organisms/booking-timeline'
import { ConfirmDialog, type ConfirmDialogProps } from '../organisms/confirm-dialog'
import { StatusMessage } from '../organisms/status-message'
import { DayScheduleTemplate } from '../templates/day-schedule-template'

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

const Schedule = ({ schedule }: { schedule: BookingPageSchedule }) => {
  if (schedule.kind === 'loading') {
    return <StatusMessage kind="loading" label={schedule.label} />
  }

  if (schedule.kind === 'error') {
    return (
      <StatusMessage
        kind="error"
        title={schedule.title}
        description={schedule.description}
        retryLabel={schedule.retryLabel}
        onRetry={schedule.onRetry}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {schedule.emptyNotice && (
        <StatusMessage kind="empty" title={schedule.emptyNotice.title} description={schedule.emptyNotice.description} />
      )}
      <BookingTimeline {...schedule.timeline} />
    </div>
  )
}

export const BookingPage = ({ header, navigator, schedule, panel, confirmDelete }: BookingPageProps) => (
  <>
    <DayScheduleTemplate
      header={<AppHeader {...header} />}
      navigator={<DateNavigator {...navigator} />}
      main={<Schedule schedule={schedule} />}
      panel={panel.form ? <BookingForm {...panel.form} /> : <Text tone="muted">{panel.placeholder}</Text>}
      panelTitle={panel.title}
      closeLabel={panel.closeLabel}
      isPanelOpen={panel.isOpen}
      onClosePanel={panel.onClose}
    />
    <ConfirmDialog {...confirmDelete} />
  </>
)
