import type { SlotState } from '../models/timeline-slot'

const STATES: Record<SlotState, string> = {
  free: 'bg-slot-free hover:bg-accent',
  booked: 'bg-slot-booked text-slot-booked-foreground',
  past: 'bg-slot-past text-muted-foreground',
}

export type SlotButtonProps = {
  state: SlotState
  label: string
  time: string
  onClick: () => void
}

export const SlotButton = ({ state, label, time, onClick }: SlotButtonProps) => (
  <button
    type="button"
    aria-label={label}
    disabled={state !== 'free'}
    onClick={onClick}
    className={`flex h-10 w-full items-start border-b border-border px-2 pt-1 text-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed ${STATES[state]}`}
  >
    {time}
  </button>
)
