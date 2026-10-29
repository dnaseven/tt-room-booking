import { BookingErrorCode } from '@domain/booking/booking.error'
import { describe, expect, it } from 'vitest'
import { en } from '../en'
import { ru } from '../ru'

const flatten = (value: unknown, prefix = ''): Record<string, string> =>
  typeof value === 'string'
    ? { [prefix]: value }
    : Object.entries(value as Record<string, unknown>).reduce(
        (all, [key, nested]) => ({ ...all, ...flatten(nested, prefix ? `${prefix}.${key}` : key) }),
        {},
      )

const placeholders = (text: string) => (text.match(/{{\w+}}/g) ?? []).sort()

const flatEn = flatten(en)
const flatRu = flatten(ru)

describe('dictionaries', () => {
  it('have the same keys in every language', () => {
    expect(Object.keys(flatRu).sort()).toEqual(Object.keys(flatEn).sort())
  })

  it('have no empty texts', () => {
    expect(Object.values(flatEn).filter((text) => text.trim() === '')).toEqual([])
    expect(Object.values(flatRu).filter((text) => text.trim() === '')).toEqual([])
  })

  it('use the same interpolation placeholders in every language', () => {
    for (const key of Object.keys(flatEn)) {
      expect(placeholders(flatRu[key]), key).toEqual(placeholders(flatEn[key]))
    }
  })

  it('have a message for every booking and api error code', () => {
    const codes = [...Object.values(BookingErrorCode), 'INTERNAL_ERROR', 'NETWORK_ERROR', 'INVALID_RESPONSE']

    for (const code of codes) {
      expect(flatEn[`errors.${code}`], code).toBeTruthy()
      expect(flatRu[`errors.${code}`], code).toBeTruthy()
    }
  })
})
