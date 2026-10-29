export type SlotState = 'free' | 'booked' | 'past'

export type TimelineSlot = {
  start: string
  end: string
  state: SlotState
}
