import { lazy, Suspense, useCallback, useDeferredValue } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { afterFirstPaint } from '../lib/afterFirstPaint'
import HeroSection from '../components/public/hero/HeroSection'
import GuestbookButton from '../components/public/guestbook/GuestbookButton'
import { usePublicData } from '../components/public/publicContexts'
import { SITE_NAME } from '../components/public/publicFormat'
import { useDocumentTitle } from '../components/public/useDocumentTitle'
import { usePageMeta } from '../components/public/usePageMeta'
import { useI18n } from '../i18n/i18nContext'

// The sections below the hero are their own chunk; it starts loading right after the first paint
const loadSections = () => import('./HomeSections')
const HomeSections = lazy(loadSections)
afterFirstPaint(loadSections)
// Kopi and Susu: decorative, their own chunk, rendered together with the sections
const CatPets = lazy(() => import('../components/public/pets/CatPets'))
// The case study pop-up (/projects/:slug), its own chunk
const ProjectModal = lazy(() => import('../components/public/detail/ProjectModal'))

/**
 * Public home page (/): the hero, then the other sections (HomeSections) in the order of the stage 3A
 * plan. A project address (/projects/:slug) shows the same page with that case study as a pop-up
 * (phase 8): opened from a card it goes back on close (so Back closes it too); opened from a shared link
 * it replaces the address with /. Every section reads the public data from PublicLayout and hides itself when its table is
 * empty. The first render is the hero only; the sections follow in a deferred render that React does
 * in small slices (stage 3C: the first paint and the name come sooner, and the page load has no long
 * task for content that is off screen).
 */
function PublicHomePage() {
  const { slug } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const data = usePublicData()
  const { t, lang } = useI18n()
  const name = data.profile.data?.full_name || SITE_NAME
  const role = data.profile.data?.tagline || data.profile.data?.primary_role
  const showSections = useDeferredValue(true, false)
  const title = t('meta.title', { name })

  // While a case study is open the pop-up sets the title and the meta tags of the project
  useDocumentTitle(slug ? null : title)
  usePageMeta(
    slug ? { lang } : { title, description: role ? t('meta.descriptionRole', { name, role }) : t('meta.description', { name }), path: '/', lang }
  )

  const fromHome = Boolean(location.state?.caseFromHome)
  const closeCase = useCallback(() => {
    if (fromHome) navigate(-1)
    else navigate('/', { replace: true })
  }, [fromHome, navigate])

  return (
    <>
      <HeroSection />
      {showSections && (
        <Suspense fallback={null}>
          <HomeSections />
        </Suspense>
      )}
      {showSections && (
        <Suspense fallback={null}>
          <CatPets />
        </Suspense>
      )}
      <GuestbookButton />
      {slug && (
        <Suspense fallback={null}>
          <ProjectModal key={slug} slug={slug} onClose={closeCase} />
        </Suspense>
      )}
    </>
  )
}

export default PublicHomePage
