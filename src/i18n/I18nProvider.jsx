import { useCallback, useEffect, useMemo, useState } from 'react'
import { readStorage, writeStorage } from '../lib/safeStorage'
import { I18nContext } from './i18nContext'
import { createI18n, DEFAULT_LANGUAGE, LANGUAGES } from './translate'

// Also read by the inline script in index.html (sets <html lang> before the first render)
export const LANGUAGE_STORAGE_KEY = 'aldi-portfolio-lang'

function storedLanguage() {
  const value = readStorage(LANGUAGE_STORAGE_KEY)
  return LANGUAGES.includes(value) ? value : DEFAULT_LANGUAGE
}

/**
 * Language of the public pages: Indonesian by default (not the browser language), English after the
 * visitor picks it; the choice is remembered in the browser. <html lang> follows the language and is
 * set back to "id" when the public pages unmount (login and admin are Indonesian only).
 */
function I18nProvider({ children }) {
  const [lang, setLangState] = useState(storedLanguage)

  const setLang = useCallback((next) => {
    if (!LANGUAGES.includes(next)) return
    setLangState(next)
    writeStorage(LANGUAGE_STORAGE_KEY, next)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.lang = lang
    return () => {
      root.lang = DEFAULT_LANGUAGE
    }
  }, [lang])

  const value = useMemo(() => ({ ...createI18n(lang), setLang }), [lang, setLang])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export default I18nProvider
