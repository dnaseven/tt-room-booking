import { describe, expect, it } from 'vitest'
import { loadLanguage, saveLanguage } from '../language-storage'

const makeStorage = (overrides: Partial<Storage> = {}): Storage => {
  const items = new Map<string, string>()

  return {
    get length() {
      return items.size
    },
    clear: () => items.clear(),
    getItem: (key) => items.get(key) ?? null,
    key: (index) => [...items.keys()][index] ?? null,
    removeItem: (key) => {
      items.delete(key)
    },
    setItem: (key, value) => {
      items.set(key, String(value))
    },
    ...overrides,
  }
}

const brokenStorage = () =>
  makeStorage({
    getItem: () => {
      throw new Error('blocked')
    },
    setItem: () => {
      throw new Error('blocked')
    },
  })

describe('language storage', () => {
  it('loads what was saved', () => {
    const storage = makeStorage()

    saveLanguage(storage, 'ru')

    expect(loadLanguage(storage)).toBe('ru')
  })

  it('loads nothing when no language was saved', () => {
    expect(loadLanguage(makeStorage())).toBeUndefined()
  })

  it('loads nothing when the saved value is not a supported language', () => {
    const storage = makeStorage()
    saveLanguage(storage, 'ru')
    storage.setItem('room-booking:language', 'de')

    expect(loadLanguage(storage)).toBeUndefined()
  })

  it('survives a storage that throws', () => {
    expect(loadLanguage(brokenStorage())).toBeUndefined()
    expect(() => saveLanguage(brokenStorage(), 'en')).not.toThrow()
  })
})
