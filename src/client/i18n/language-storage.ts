import { isLanguage, type Language } from './languages'

export const LANGUAGE_STORAGE_KEY = 'room-booking:language'

export const loadLanguage = (storage: Storage): Language | undefined => {
  try {
    const value = storage.getItem(LANGUAGE_STORAGE_KEY)
    return isLanguage(value) ? value : undefined
  } catch {
    return undefined
  }
}

export const saveLanguage = (storage: Storage, language: Language): void => {
  try {
    storage.setItem(LANGUAGE_STORAGE_KEY, language)
  } catch {
    // the choice is a convenience; a blocked storage must not break the app
  }
}
