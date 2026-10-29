import { Suspense, useMemo } from 'react'
import { Outlet } from 'react-router-dom'
import I18nProvider from '../../i18n/I18nProvider'
import { useI18n } from '../../i18n/i18nContext'
import { usePublicPortfolio } from '../../hooks/usePublicPortfolio'
import { localizePortfolio } from './localize'
import ThemeProvider from './ThemeProvider'
import { PublicDataContext, usePublicData, useTheme } from './publicContexts'
import { PageSkeleton } from './Skeletons'
import PublicFooter from './PublicFooter'
import PublicNavbar from './PublicNavbar'
import SoundProvider from './sound/SoundProvider'
import { personFromProfile, usePersonJsonLd } from './usePageMeta'

/**
 * Frame of every public page (home, project detail, 404): theme, language and sound providers, the public
 * data (loaded once, so going back from a project to the home page is instant), the .pub root with
 * data-theme and the skip link. Lazy pages load inside it, so the frame stays.
 */
function PublicLayout() {
  const data = usePublicPortfolio()
  return (
    <ThemeProvider>
      <I18nProvider>
        <LocalizedData data={data}>
          <SoundProvider>
            <PublicShell />
          </SoundProvider>
        </LocalizedData>
      </I18nProvider>
    </ThemeProvider>
  )
}

/** The public data in the page language (English texts with Indonesian fallback, stage 3C). */
function LocalizedData({ data, children }) {
  const { lang } = useI18n()
  const value = useMemo(() => localizePortfolio(data, lang), [data, lang])
  return <PublicDataContext.Provider value={value}>{children}</PublicDataContext.Provider>
}

function PublicShell() {
  const { theme } = useTheme()
  const { t } = useI18n()
  const data = usePublicData()

  // Structured data about the owner for search engines (stage 3C), from the loaded profile
  usePersonJsonLd(useMemo(() => personFromProfile(data.profile.data, data.educations.data ?? []), [data.profile.data, data.educations.data]))

  return (
    <div className="pub" data-theme={theme}>
      <a href="#konten" className="pub-skip">
        {t('common.skip')}
      </a>
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
