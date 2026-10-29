export const LANGUAGES = ['en', 'ru'] as const

export type Language = (typeof LANGUAGES)[number]

export const DEFAULT_LANGUAGE: Language = 'en'

export const isLanguage = (value: unknown): value is Language => LANGUAGES.some((language) => language === value)
