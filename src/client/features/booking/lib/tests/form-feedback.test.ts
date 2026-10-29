import { describe, expect, it } from 'vitest'
import { getFeedbackTarget } from '../form-feedback'

describe('getFeedbackTarget', () => {
  it('points time rule violations at the end field', () => {
    for (const code of ['INVALID_RANGE', 'OUT_OF_WORK_HOURS', 'DURATION_TOO_SHORT', 'DURATION_TOO_LONG']) {
      expect(getFeedbackTarget(code), code).toBe('end')
    }
  })

  it('points a past time at the start field', () => {
    expect(getFeedbackTarget('PAST_TIME')).toBe('start')
  })

  it('shows everything else on the form', () => {
    for (const code of [
      'INVALID_INPUT',
      'BOOKING_CONFLICT',
      'BOOKING_NOT_FOUND',
      'INTERNAL_ERROR',
      'NETWORK_ERROR',
      'INVALID_RESPONSE',
    ]) {
      expect(getFeedbackTarget(code), code).toBe('form')
    }
  })

  it('shows an unknown code on the form', () => {
    expect(getFeedbackTarget('SOMETHING_NEW')).toBe('form')
  })
})
