import type { Language } from './languages'

export const loadLanguage = (_storage: Storage): Language | undefined => {
  throw new Error('not implemented')
}

export const saveLanguage = (_storage: Storage, _language: Language): void => {
  throw new Error('not implemented')
}
