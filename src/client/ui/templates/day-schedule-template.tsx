import type { ReactNode } from 'react'

export type DayScheduleTemplateProps = {
  header: ReactNode
  navigator: ReactNode
  main: ReactNode
  panel: ReactNode
  panelTitle: string
  closeLabel: string
  isPanelOpen: boolean
  onClosePanel: () => void
}

export const DayScheduleTemplate = (_props: DayScheduleTemplateProps) => null
