export type BlockPosition = {
  topPercent: number
  heightPercent: number
}

export type BookingViewModel = {
  id: string
  title?: string
  start: string
  end: string
  durationMinutes: number
  hasStarted: boolean
  position: BlockPosition
}
