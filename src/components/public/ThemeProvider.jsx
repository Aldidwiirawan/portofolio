import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { readStorage, writeStorage } from '../../lib/safeStorage'
import { ThemeContext } from './publicContexts'

// Also read by the inline script in index.html, which sets data-pub-theme before the first render
export const THEME_STORAGE_KEY = 'aldi-portfolio-theme'
const THEMES = ['light', 'dark']

function storedTheme() {
  const value = readStorage(THEME_STORAGE_KEY)
  return THEMES.includes(value) ? value : null
}

/**
 * Theme of the public pages: follows the device (prefers-color-scheme) until the visitor picks one
 * with the toggle; that choice is remembered in the browser. The theme is also written to
 * <html data-pub-theme> (page background and native scrollbars) and removed again when the public
 * pages unmount, so login and admin never see it.
 */
function ThemeProvider({ children }) {
  const systemDark = useMediaQuery('(prefers-color-scheme: dark)')
  const [chosen, setChosen] = useState(storedTheme)
  const theme = chosen ?? (systemDark ? 'dark' : 'light')

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setChosen(next)
    writeStorage(THEME_STORAGE_KEY, next)
  }, [theme])

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-pub-theme', theme)
    return () => root.removeAttribute('data-pub-theme')
  }, [theme])

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export default ThemeProvider
