import { useCallback, useEffect, useMemo, useState } from 'react'
import { readStorage, writeStorage } from '../../lib/safeStorage'
import { ThemeContext } from './publicContexts'

// Also read by the inline script in index.html, which sets data-pub-theme before the first render
export const THEME_STORAGE_KEY = 'aldi-portfolio-theme'
const THEMES = ['light', 'dark']
// Browser bar color per theme (= --bg of the monochrome palette, public.css)
const BAR_COLORS = { light: '#ffffff', dark: '#000000' }

function storedTheme() {
  const value = readStorage(THEME_STORAGE_KEY)
  return THEMES.includes(value) ? value : null
}

/**
 * Theme of the public pages: light until the visitor picks one with the toggle; that choice is
 * remembered in the browser. The theme is also written to <html data-pub-theme> (page background and
 * native scrollbars) and to the theme-color meta tags (browser bar), and both are put back when the
 * public pages unmount, so login and admin never see them.
 */
function ThemeProvider({ children }) {
  const [chosen, setChosen] = useState(storedTheme)
  const theme = chosen ?? 'light'

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setChosen(next)
    writeStorage(THEME_STORAGE_KEY, next)
  }, [theme])

  useEffect(() => {
    const root = document.documentElement
    const bars = [...document.querySelectorAll('meta[name="theme-color"]')]
    root.setAttribute('data-pub-theme', theme)
    bars.forEach((bar) => bar.setAttribute('content', BAR_COLORS[theme]))
    return () => {
      root.removeAttribute('data-pub-theme')
      // Login and admin get their own colors back (data-default in index.html)
      bars.forEach((bar) => bar.dataset.default && bar.setAttribute('content', bar.dataset.default))
    }
  }, [theme])

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export default ThemeProvider
