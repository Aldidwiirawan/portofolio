import { lazy, Suspense, useDeferredValue } from 'react'
import { afterFirstPaint } from '../lib/afterFirstPaint'
import HeroSection from '../components/public/hero/HeroSection'
import GuestbookButton from '../components/public/guestbook/GuestbookButton'
import { usePublicData } from '../components/public/publicContexts'
import { SITE_NAME } from '../components/public/publicFormat'
import { useDocumentTitle } from '../components/public/useDocumentTitle'
import { useI18n } from '../i18n/i18nContext'

// The sections below the hero are their own chunk; it starts loading right after the first paint
const loadSections = () => import('./HomeSections')
const HomeSections = lazy(loadSections)
afterFirstPaint(loadSections)

/**
 * Public home page (/): the hero, then the other sections (HomeSections) in the order of the stage 3A
 * plan. Every section reads the public data from PublicLayout and hides itself when its table is
 * empty. The first render is the hero only; the sections follow in a deferred render that React does
 * in small slices (stage 3C: the first paint and the name come sooner, and the page load has no long
 * task for content that is off screen).
 */
function PublicHomePage() {
  const data = usePublicData()
  const { t } = useI18n()
  const name = data.profile.data?.full_name || SITE_NAME
  const showSections = useDeferredValue(true, false)

  useDocumentTitle(t('meta.title', { name }))

  return (
    <>
      <HeroSection />
      {showSections && (
        <Suspense fallback={null}>
          <HomeSections />
        </Suspense>
      )}
      <GuestbookButton />
    </>
  )
}

export default PublicHomePage
