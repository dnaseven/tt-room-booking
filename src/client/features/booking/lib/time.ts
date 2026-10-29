import { MIN_DURATION, WORK_END, WORK_START, timeToMinutes } from '@domain/booking/booking.rules'
import type { TimeOption } from '@client/ui/models/time-option'

export const minutesToTime = (minutes: number) => {
  const hours = String(Math.floor(minutes / 60)).padStart(2, '0')
  const rest = String(minutes % 60).padStart(2, '0')

  return `${hours}:${rest}`
}

export const addMinutes = (time: string, minutes: number) => minutesToTime(timeToMinutes(time) + minutes)

export const buildTimeOptions = (): TimeOption[] => {
  const options: TimeOption[] = []

  for (let minutes = WORK_START; minutes <= WORK_END; minutes += MIN_DURATION) {
    const time = minutesToTime(minutes)
    options.push({ value: time, label: time })
  }

  return options
}
