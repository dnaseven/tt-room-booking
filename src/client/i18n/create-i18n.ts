import { createInstance, type i18n } from 'i18next'
import { en } from './en'
import { DEFAULT_LANGUAGE, type Language } from './languages'
import { ru } from './ru'

export const createI18n = (language: Language): i18n => {
  const instance = createInstance()

  void instance.init({
    lng: language,
    fallbackLng: DEFAULT_LANGUAGE,
    resources: { en: { translation: en }, ru: { translation: ru } },
    interpolation: { escapeValue: false },
    initAsync: false,
  })

  return instance
}
