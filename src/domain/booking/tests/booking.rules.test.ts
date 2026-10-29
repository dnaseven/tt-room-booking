import { describe, expect, it } from 'vitest'
import type { Booking } from '../booking.schema'
import { findConflict, findTimeRuleViolation, timeToMinutes } from '../booking.rules'
import { TODAY, TOMORROW, YESTERDAY } from './helpers'

// now = 2026-10-29 12:00
const NOW = new Date(2026, 9, 29, 12, 0)

describe('timeToMinutes', () => {
  it('converts HH:mm to minutes since midnight', () => {
    expect(timeToMinutes('00:00')).toBe(0)
    expect(timeToMinutes('09:00')).toBe(540)
    expect(timeToMinutes('18:30')).toBe(1110)
  })
})

describe('findTimeRuleViolation', () => {
  it('returns undefined for a valid booking', () => {
    expect(findTimeRuleViolation({ date: TOMORROW, start: '11:00', end: '12:00' }, NOW)).toBeUndefined()
  })

  describe('range', () => {
    it('reports start equal to end', () => {
      expect(findTimeRuleViolation({ date: TOMORROW, start: '14:00', end: '14:00' }, NOW)).toBe('INVALID_RANGE')
    })

    it('reports start after end', () => {
      expect(findTimeRuleViolation({ date: TOMORROW, start: '15:00', end: '14:00' }, NOW)).toBe('INVALID_RANGE')
    })
  })

  describe('work hours 09:00-18:00', () => {
    it('reports start before 09:00', () => {
      expect(findTimeRuleViolation({ date: TOMORROW, start: '08:30', end: '09:30' }, NOW)).toBe('OUT_OF_WORK_HOURS')
    })

    it('reports end after 18:00', () => {
      expect(findTimeRuleViolation({ date: TOMORROW, start: '17:30', end: '18:30' }, NOW)).toBe('OUT_OF_WORK_HOURS')
    })

    it('allows the first and the last slot of the day', () => {
      expect(findTimeRuleViolation({ date: TOMORROW, start: '09:00', end: '10:00' }, NOW)).toBeUndefined()
      expect(findTimeRuleViolation({ date: TOMORROW, start: '17:00', end: '18:00' }, NOW)).toBeUndefined()
    })
  })

  describe('duration 30 min - 2 h', () => {
    it('reports less than 30 minutes', () => {
      expect(findTimeRuleViolation({ date: TOMORROW, start: '14:00', end: '14:29' }, NOW)).toBe('DURATION_TOO_SHORT')
    })

    it('reports more than 2 hours', () => {
      expect(findTimeRuleViolation({ date: TOMORROW, start: '14:00', end: '16:01' }, NOW)).toBe('DURATION_TOO_LONG')
    })

    it('allows exactly 30 minutes and exactly 2 hours', () => {
      expect(findTimeRuleViolation({ date: TOMORROW, start: '10:00', end: '10:30' }, NOW)).toBeUndefined()
      expect(findTimeRuleViolation({ date: TOMORROW, start: '14:00', end: '16:00' }, NOW)).toBeUndefined()
    })
  })

  describe('past time (now = 12:00 today)', () => {
    it('reports a past date', () => {
      expect(findTimeRuleViolation({ date: YESTERDAY, start: '14:00', end: '15:00' }, NOW)).toBe('PAST_TIME')
    })

    it('reports a slot that already started today', () => {
      expect(findTimeRuleViolation({ date: TODAY, start: '11:30', end: '12:30' }, NOW)).toBe('PAST_TIME')
    })

    it('allows start exactly at now', () => {
      expect(findTimeRuleViolation({ date: TODAY, start: '12:00', end: '13:00' }, NOW)).toBeUndefined()
    })

    it('skips the past check when checkPast is false', () => {
      const booking = { date: YESTERDAY, start: '14:00', end: '15:00' }

      expect(findTimeRuleViolation(booking, NOW, { checkPast: false })).toBeUndefined()
    })
  })

  describe('check order', () => {
    it('reports the range before work hours', () => {
      expect(findTimeRuleViolation({ date: TOMORROW, start: '08:00', end: '07:00' }, NOW)).toBe('INVALID_RANGE')
    })

    it('reports work hours before duration', () => {
      expect(findTimeRuleViolation({ date: TOMORROW, start: '08:00', end: '08:10' }, NOW)).toBe('OUT_OF_WORK_HOURS')
    })

    it('reports duration before past time', () => {
      expect(findTimeRuleViolation({ date: YESTERDAY, start: '10:00', end: '10:10' }, NOW)).toBe('DURATION_TOO_SHORT')
    })
  })
})

describe('findConflict', () => {
  const existing: Booking = { id: 'existing', date: TOMORROW, start: '11:00', end: '12:00' }

  it('returns undefined when there are no bookings', () => {
    expect(findConflict({ date: TOMORROW, start: '11:00', end: '12:00' }, [])).toBeUndefined()
  })

  it('returns the overlapping booking', () => {
    expect(findConflict({ date: TOMORROW, start: '11:30', end: '12:30' }, [existing])).toBe(existing)
  })

  it('detects a booking inside, around and identical to an existing one', () => {
    expect(findConflict({ date: TOMORROW, start: '11:15', end: '11:45' }, [existing])).toBe(existing)
    expect(findConflict({ date: TOMORROW, start: '10:30', end: '12:30' }, [existing])).toBe(existing)
    expect(findConflict({ date: TOMORROW, start: '11:00', end: '12:00' }, [existing])).toBe(existing)
  })

  it('allows touching boundaries', () => {
    expect(findConflict({ date: TOMORROW, start: '10:00', end: '11:00' }, [existing])).toBeUndefined()
    expect(findConflict({ date: TOMORROW, start: '12:00', end: '13:00' }, [existing])).toBeUndefined()
  })

  it('ignores bookings on other dates', () => {
    expect(findConflict({ date: '2026-10-31', start: '11:00', end: '12:00' }, [existing])).toBeUndefined()
  })

  it('ignores the excluded booking', () => {
    expect(findConflict({ date: TOMORROW, start: '11:30', end: '12:30' }, [existing], 'existing')).toBeUndefined()
  })
})
