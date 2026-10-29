import { describe, expect, it } from 'vitest'
import { createI18n } from '../create-i18n'
import { en } from '../en'
import { ru } from '../ru'

describe('createI18n', () => {
  it('translates in the requested language', () => {
    expect(createI18n('en').t('app.title')).toBe(en.app.title)
    expect(createI18n('ru').t('app.title')).toBe(ru.app.title)
  })

  it('switches the language', async () => {
    const i18n = createI18n('en')

    await i18n.changeLanguage('ru')

    expect(i18n.t('app.title')).toBe(ru.app.title)
  })

  it('interpolates values without escaping them', () => {
    const text = createI18n('en').t('timeline.booking.titled', { title: 'Q&A <team>', start: '09:00', end: '09:30' })

    expect(text).toBe('Q&A <team>, 09:00–09:30')
  })

  it('creates independent instances', async () => {
    const first = createI18n('en')
    const second = createI18n('en')

    await first.changeLanguage('ru')

    expect(second.t('app.title')).toBe(en.app.title)
  })
})
