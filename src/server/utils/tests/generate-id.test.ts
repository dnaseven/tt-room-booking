import { describe, expect, it } from 'vitest'
import { generateId } from '../generate-id'

describe('generateId', () => {
  it('returns a non-empty string', () => {
    expect(generateId()).toMatch(/\S+/)
  })

  it('returns a different id on every call', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()))

    expect(ids.size).toBe(100)
  })
})
