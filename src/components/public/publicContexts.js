import { createContext, useContext } from 'react'

/** { theme: 'light' | 'dark', toggleTheme } of the public pages (ThemeProvider). */
export const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} })

export function useTheme() {
  return useContext(ThemeContext)
}

/** The public portfolio data loaded once for every public page (usePublicPortfolio in PublicLayout). */
export const PublicDataContext = createContext(null)

export function usePublicData() {
  return useContext(PublicDataContext)
}
