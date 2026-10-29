export type DateNavigatorLabels = {
  previous: string
  next: string
  today: string
  date: string
}

export type DateNavigatorProps = {
  value: string
  labels: DateNavigatorLabels
  onChange: (date: string) => void
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
}

export const DateNavigator = (_props: DateNavigatorProps) => null
