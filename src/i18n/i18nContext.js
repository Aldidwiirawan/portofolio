import { createContext, useContext } from 'react'
import { createI18n, DEFAULT_LANGUAGE } from './translate'

export const I18nContext = createContext(null)

const fallback = { ...createI18n(DEFAULT_LANGUAGE), setLang: () => {} }

/**
 * Current language and its helpers ({ lang, setLang, t, formatDate, formatGpa, code, storedLabel,
 * skillCategory }). Outside an I18nProvider it returns Indonesian.
 */
export function useI18n() {
  return useContext(I18nContext) ?? fallback
}
