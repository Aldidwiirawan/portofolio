import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import ViewfinderCursor from '../effects/ViewfinderCursor'
import I18nProvider from '../../i18n/I18nProvider'
import { useI18n } from '../../i18n/i18nContext'
import { usePublicPortfolio } from '../../hooks/usePublicPortfolio'
import ThemeProvider from './ThemeProvider'
import { PublicDataContext, useTheme } from './publicContexts'
import { PageSkeleton } from './Skeletons'
import PublicFooter from './PublicFooter'
import PublicNavbar from './PublicNavbar'

/**
 * Frame of every public page (home, project detail, 404): theme and language providers, the public
 * data (loaded once, so going back from a project to the home page is instant), the .pub root with
 * data-theme, skip link and viewfinder cursor. Lazy pages load inside it, so the frame stays.
 */
function PublicLayout() {
  const data = usePublicPortfolio()
  return (
    <ThemeProvider>
      <I18nProvider>
        <PublicDataContext.Provider value={data}>
          <PublicShell />
        </PublicDataContext.Provider>
      </I18nProvider>
    </ThemeProvider>
  )
}

function PublicShell() {
  const { theme } = useTheme()
  const { t } = useI18n()

  return (
    <div className="pub" data-theme={theme}>
      <a href="#konten" className="pub-skip">
        {t('common.skip')}
      </a>
      <ViewfinderCursor />
      <PublicNavbar />
      <main id="konten" className="pub-main" tabIndex={-1}>
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  )
}

export default PublicLayout
