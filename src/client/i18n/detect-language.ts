import { DEFAULT_LANGUAGE, isLanguage, type Language } from './languages'

export type DetectLanguageInput = {
  stored?: string | null
  navigatorLanguages: readonly string[]
}

export const detectLanguage = ({ stored, navigatorLanguages }: DetectLanguageInput): Language => {
  if (isLanguage(stored)) return stored

  for (const tag of navigatorLanguages) {
    const base = tag.toLowerCase().split('-')[0]
    if (isLanguage(base)) return base
  }

  return DEFAULT_LANGUAGE
}
