import { describe, expect, it } from 'vitest'
import { detectLanguage } from '../detect-language'

describe('detectLanguage', () => {
  it('prefers the stored language', () => {
    expect(detectLanguage({ stored: 'ru', navigatorLanguages: ['en-US'] })).toBe('ru')
  })

  it('ignores an unsupported stored language', () => {
    expect(detectLanguage({ stored: 'de', navigatorLanguages: ['ru-RU'] })).toBe('ru')
  })

  it('takes the first supported browser language and ignores the region', () => {
    expect(detectLanguage({ navigatorLanguages: ['de-DE', 'ru-RU', 'en'] })).toBe('ru')
  })

  it('is case-insensitive', () => {
    expect(detectLanguage({ navigatorLanguages: ['RU'] })).toBe('ru')
  })

  it('falls back to English when nothing is supported or known', () => {
    expect(detectLanguage({ navigatorLanguages: ['de-DE', 'fr'] })).toBe('en')
    expect(detectLanguage({ stored: null, navigatorLanguages: [] })).toBe('en')
  })
})
