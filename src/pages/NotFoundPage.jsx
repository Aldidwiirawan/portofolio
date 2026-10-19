import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import BlueprintBackground from '../components/effects/BlueprintBackground'
import { ArrowLeftIcon } from '../components/public/icons'
import { useDocumentTitle } from '../components/public/useDocumentTitle'
import { usePageMeta } from '../components/public/usePageMeta'
import { SITE_NAME } from '../components/public/publicFormat'
import { useI18n } from '../i18n/i18nContext'
import './NotFoundPage.css'

/**
 * 404 page for unknown addresses (`*`) and for a project that does not exist or is hidden
 * (`kind="project"`). Focus moves to the heading so screen readers hear the result first.
 */
function NotFoundPage({ kind = 'page', name = SITE_NAME }) {
  const { t, lang } = useI18n()
  const headingRef = useRef(null)
  const isProject = kind === 'project'
  const title = t('meta.notFound', { name })

  useDocumentTitle(title)
  // Search engines leave this page out (Vercel answers every unknown address with the app, status 200)
  usePageMeta({ title, lang, noindex: true })

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
  }, [])

  return (
    <section className="pub-notfound" aria-labelledby="pub-notfound-title">
      <BlueprintBackground variant="busy" />
      <div className="pub-container pub-notfound-inner">
        <p className="pub-tag">{t('notFound.code')}</p>
        <h1 id="pub-notfound-title" ref={headingRef} tabIndex={-1} className="pub-notfound-title">
          {t(isProject ? 'notFound.projectTitle' : 'notFound.title')}
        </h1>
        <p className="pub-lead">{t(isProject ? 'notFound.projectText' : 'notFound.text')}</p>
        <Link to={isProject ? { pathname: '/', hash: '#proyek' } : '/'} className="pub-btn pub-btn--primary">
          <ArrowLeftIcon size={18} />
          <span>{t(isProject ? 'detail.back' : 'notFound.home')}</span>
        </Link>
      </div>
    </section>
  )
}

export default NotFoundPage
