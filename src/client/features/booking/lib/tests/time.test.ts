import { describe, expect, it } from 'vitest'
import { addMinutes, buildTimeOptions } from '../time'

describe('addMinutes', () => {
  it('adds minutes to a HH:mm time', () => {
    expect(addMinutes('16:00', 30)).toBe('16:30')
    expect(addMinutes('09:45', 30)).toBe('10:15')
  })

  it('keeps zero padding', () => {
    expect(addMinutes('08:30', 30)).toBe('09:00')
    expect(addMinutes('00:00', 5)).toBe('00:05')
  })
})

describe('buildTimeOptions', () => {
  it('lists every half hour of the work day, both ends included', () => {
    const values = buildTimeOptions().map((option) => option.value)

    expect(values).toHaveLength(19)
    expect(values[0]).toBe('09:00')
    expect(values[1]).toBe('09:30')
    expect(values[18]).toBe('18:00')
  })

  it('uses the time itself as the label', () => {
    expect(buildTimeOptions().every((option) => option.label === option.value)).toBe(true)
  })
})
