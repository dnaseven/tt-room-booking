import type { Booking } from '@domain/booking/booking.schema'
import { describe, expect, it } from 'vitest'
import { buildSlots, getBlockPosition } from '../timeline'

const TODAY = '2026-10-29'
const TOMORROW = '2026-10-30'
const YESTERDAY = '2026-10-28'

// now = 2026-10-29 12:00
const NOW = new Date(2026, 9, 29, 12, 0)

const stateOf = (slots: ReturnType<typeof buildSlots>, start: string) => slots.find((slot) => slot.start === start)?.state

describe('buildSlots', () => {
  it('covers the work day with 18 half-hour slots', () => {
    const slots = buildSlots(TOMORROW, [], NOW)

    expect(slots).toHaveLength(18)
    expect(slots[0]).toEqual({ start: '09:00', end: '09:30', state: 'free' })
    expect(slots[17]).toEqual({ start: '17:30', end: '18:00', state: 'free' })
  })

  it('marks slots covered by a booking as booked and leaves touching slots free', () => {
    const booking: Booking = { id: '1', date: TOMORROW, start: '11:00', end: '12:00' }

    const slots = buildSlots(TOMORROW, [booking], NOW)

    expect(stateOf(slots, '10:30')).toBe('free')
    expect(stateOf(slots, '11:00')).toBe('booked')
    expect(stateOf(slots, '11:30')).toBe('booked')
    expect(stateOf(slots, '12:00')).toBe('free')
  })

  it('ignores bookings of other dates', () => {
    const booking: Booking = { id: '1', date: '2026-10-31', start: '11:00', end: '12:00' }

    expect(stateOf(buildSlots(TOMORROW, [booking], NOW), '11:00')).toBe('free')
  })

  it('marks slots that started before now as past on today', () => {
    const slots = buildSlots(TODAY, [], NOW)

    expect(stateOf(slots, '09:00')).toBe('past')
    expect(stateOf(slots, '11:30')).toBe('past')
    expect(stateOf(slots, '12:00')).toBe('free')
  })

  it('marks every slot as past on a past date', () => {
    const slots = buildSlots(YESTERDAY, [], NOW)

    expect(slots.every((slot) => slot.state === 'past')).toBe(true)
  })

  it('keeps a booked slot booked even when it is in the past', () => {
    const booking: Booking = { id: '1', date: TODAY, start: '10:00', end: '11:00' }

    const slots = buildSlots(TODAY, [booking], NOW)

    expect(stateOf(slots, '09:30')).toBe('past')
    expect(stateOf(slots, '10:00')).toBe('booked')
    expect(stateOf(slots, '10:30')).toBe('booked')
  })
})

describe('getBlockPosition', () => {
  it('spans the whole work day for 09:00-18:00', () => {
    expect(getBlockPosition({ start: '09:00', end: '18:00' })).toEqual({ topPercent: 0, heightPercent: 100 })
  })

  it('positions a block relative to the work day', () => {
    const position = getBlockPosition({ start: '13:30', end: '15:00' })

    expect(position.topPercent).toBeCloseTo(50)
    expect(position.heightPercent).toBeCloseTo(16.667, 2)
  })

  it('sizes a one-hour block at the start of the day', () => {
    const position = getBlockPosition({ start: '09:00', end: '10:00' })

    expect(position.topPercent).toBe(0)
    expect(position.heightPercent).toBeCloseTo(11.111, 2)
  })
})
