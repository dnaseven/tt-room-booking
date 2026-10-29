import type { BlockPosition } from '../models/booking-view-model'

export type BookingBlockProps = {
  label: string
  position: BlockPosition
  selected: boolean
  title?: string
  time: string
  onClick: () => void
}

export const BookingBlock = ({ label, position, selected, title, time, onClick }: BookingBlockProps) => (
  <button
    type="button"
    aria-label={label}
    aria-current={selected ? 'true' : undefined}
    onClick={onClick}
    style={{ top: `${position.topPercent}%`, height: `${position.heightPercent}%` }}
    className={`pointer-events-auto absolute right-0 left-0 flex flex-col overflow-hidden rounded-md border border-slot-booked-foreground/40 bg-slot-booked px-2 py-1 text-left text-xs text-slot-booked-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 ${selected ? 'ring-2 ring-ring' : ''}`}
  >
    {title && <span className="truncate font-medium">{title}</span>}
    <span>{time}</span>
  </button>
)
