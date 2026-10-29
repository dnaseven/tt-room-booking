import type { Language } from './languages'

export type DetectLanguageInput = {
  stored?: string | null
  navigatorLanguages: readonly string[]
}

export const detectLanguage = (_input: DetectLanguageInput): Language => {
  throw new Error('not implemented')
}
