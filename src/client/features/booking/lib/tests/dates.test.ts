import { describe, expect, it } from 'vitest'
import { formatDate, shiftDate } from '../dates'

describe('formatDate', () => {
  it('formats a local date as YYYY-MM-DD with zero padding', () => {
    expect(formatDate(new Date(2026, 9, 29, 23, 59))).toBe('2026-10-29')
    expect(formatDate(new Date(2026, 0, 5, 0, 0))).toBe('2026-01-05')
  })
})

describe('shiftDate', () => {
  it('moves a date by days', () => {
    expect(shiftDate('2026-10-29', 1)).toBe('2026-10-30')
    expect(shiftDate('2026-10-29', -1)).toBe('2026-10-28')
  })

  it('crosses month and year boundaries', () => {
    expect(shiftDate('2026-10-31', 1)).toBe('2026-11-01')
    expect(shiftDate('2026-12-31', 1)).toBe('2027-01-01')
    expect(shiftDate('2026-01-01', -1)).toBe('2025-12-31')
  })

  it('is stable across a daylight saving change', () => {
    expect(shiftDate('2026-03-28', 1)).toBe('2026-03-29')
    expect(shiftDate('2026-03-29', 1)).toBe('2026-03-30')
    expect(shiftDate('2026-10-24', 1)).toBe('2026-10-25')
    expect(shiftDate('2026-10-25', 1)).toBe('2026-10-26')
  })
})
