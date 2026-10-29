import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { usePublicProject } from '../hooks/usePublicPortfolio'
import { useI18n } from '../i18n/i18nContext'
import { ArrowLeftIcon, ArrowRightIcon, ChevronDownIcon } from '../components/public/icons'
import LazyLightbox from '../components/public/LazyLightbox'
import { langOf, localizeProject } from '../components/public/localize'
import Phrase from '../components/public/Phrase'
import ProjectImage from '../components/public/ProjectImage'
import ProjectLinks from '../components/public/ProjectLinks'
import { usePublicData } from '../components/public/publicContexts'
import { SITE_NAME } from '../components/public/publicFormat'
import { SectionError } from '../components/public/Section'
import { PageSkeleton } from '../components/public/Skeletons'
import { StatusBadge } from '../components/public/sections/ProjectsSection'
import TechList from '../components/public/sections/TechList'
import { useDocumentTitle } from '../components/public/useDocumentTitle'
import { usePageMeta } from '../components/public/usePageMeta'
import { useLightbox } from '../components/public/useLightbox'
import NotFoundPage from './NotFoundPage'
import './ProjectDetailPage.css'

const BUILT_DURING_TYPES = ['Magang', 'Kerja', 'Freelance', 'Organisasi']

/**
 * Project detail (/projects/:slug): only visible projects; an unknown or hidden slug shows the 404
 * page. Empty parts (problem, outcome, gallery, links, …) are left out. "Detail teknis" (the long
 * `content`) sits at the end, collapsed (K8).
 */
function ProjectDetailPage() {
  const { slug } = useParams()
  const { status, project: stored, reload } = usePublicProject(slug)
  const data = usePublicData()
  const { t, code, lang } = useI18n()
  const project = useMemo(() => localizeProject(stored, lang), [stored, lang])
  const headingRef = useRef(null)
  const { viewer, openLightbox, closeLightbox } = useLightbox()
  const name = data.profile.data?.full_name || SITE_NAME

  const title = project ? t('meta.project', { title: project.title, name }) : null

  useDocumentTitle(title)
  usePageMeta({ title, description: project?.description || project?.solution, path: project ? `/projects/${project.slug}` : null, lang })

  // A new project starts at the top of the page (no smooth scroll from the previous position)
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [slug])

  // Screen readers start at the project title once it has loaded
  useEffect(() => {
    if (status === 'ready') headingRef.current?.focus({ preventScroll: true })
  }, [status, slug])

  if (status === 'loading') return <PageSkeleton />
  if (status === 'missing') return <NotFoundPage kind="project" name={name} />
  if (status === 'error') {
    return (
      <div className="pub-container pub-detail-error">
        <Link to={{ pathname: '/', hash: '#proyek' }} className="pub-arrow-link pub-detail-back">
          <ArrowLeftIcon size={18} />
          <span>{t('detail.back')}</span>
        </Link>
        <SectionError message={t('detail.loadError')} onRetry={reload} />
      </div>
    )
  }

  const experience = data.experiences.data.find((item) => item.related_project_id === project.id)
  const builtKey = BUILT_DURING_TYPES.includes(experience?.experience_type) ? experience.experience_type : 'other'
  const facts = [
    project.year && { label: t('detail.year'), value: project.year },
    code('type', project.project_type) && { label: t('detail.type'), value: code('type', project.project_type) },
    project.client_name && { label: t('detail.client'), value: project.client_name, lang: langOf(project, 'client_name') },
  ].filter(Boolean)
  const story = [
    ['problem', t('detail.problem')],
    ['solution', t('detail.solution')],
    ['outcome', t('detail.outcome')],
  ].filter(([key]) => project[key]?.trim())

  return (
    <article className="pub-detail">
      <header className="pub-detail-hero">
        <div className="pub-container pub-detail-hero-inner">
          <Link to={{ pathname: '/', hash: '#proyek' }} className="pub-arrow-link pub-detail-back">
            <ArrowLeftIcon size={18} />
            <span>{t('detail.back')}</span>
          </Link>
          <StatusBadge status={project.status} />
          <h1 ref={headingRef} tabIndex={-1} className="pub-detail-title" lang={langOf(project, 'title')}>
            {project.title}
          </h1>
          {project.description?.trim() && (
            <p className="pub-lead pub-detail-lead" lang={langOf(project, 'description')}>
              {project.description}
            </p>
          )}
          {facts.length > 0 && (
            <dl className="pub-detail-facts" aria-label={t('detail.facts')}>
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd lang={fact.lang}>{fact.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {experience && (
            <Link to={{ pathname: '/', hash: '#pengalaman' }} className="pub-arrow-link pub-detail-built">
              <span>
                <Phrase
                  id={`detail.builtDuring.${builtKey}`}
                  vars={{ company: { text: experience.company, lang: langOf(experience, 'company') } }}
                />
              </span>
              <ArrowRightIcon size={18} />
            </Link>
          )}
        </div>
      </header>

      {project.thumbnail_url && (
        <div className="pub-container">
          {/* The largest element of the page (LCP): fetched first, decoded without waiting */}
          <ProjectImage className="pub-detail-cover" src={project.thumbnail_url} width="1200" height="750" fetchPriority="high" />
        </div>
      )}

      <div className="pub-container pub-detail-body">
        <div className="pub-detail-main">
          {project.my_role?.trim() && (
            <section className="pub-detail-part" aria-labelledby="detail-peran">
              <h2 id="detail-peran" className="pub-detail-h2">
                {t('detail.myRole')}
              </h2>
              <p className="pub-detail-text" lang={langOf(project, 'my_role')}>
                {project.my_role}
              </p>
            </section>
          )}

          {story.map(([key, label]) => (
            <section key={key} className="pub-detail-part" aria-labelledby={`detail-${key}`}>
              <h2 id={`detail-${key}`} className="pub-detail-h2">
                {label}
              </h2>
              <p className="pub-detail-text" lang={langOf(project, key)}>
                {project[key]}
              </p>
            </section>
          ))}

          {project.gallery.length > 0 && (
            <section className="pub-detail-part" aria-labelledby="detail-galeri">
              <h2 id="detail-galeri" className="pub-detail-h2">
                {t('detail.gallery')}
              </h2>
              <ul className="pub-gallery">
                {project.gallery.map((image, index) => {
                  const caption = image.caption || t('lightbox.untitled', { n: index + 1 })
                  return (
                    <li key={image.url}>
                      <button
                        type="button"
                        className="pub-gallery-item"
                        onClick={() => openLightbox(project.gallery, index)}
                        aria-label={t('lightbox.open', { caption })}
                      >
                        <ProjectImage as="span" className="pub-gallery-frame" src={image.url} width="640" height="400" loading="lazy" decoding="async" />
                        {image.caption && (
                          <span className="pub-gallery-caption" lang={image.lang}>
                            {image.caption}
                          </span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          {project.content?.trim() && (
            <details className="pub-detail-technical">
              <summary>
                <h2 className="pub-detail-h2">{t('detail.technical')}</h2>
                <ChevronDownIcon size={20} className="pub-detail-technical-icon" />
              </summary>
              <div className="pub-detail-technical-body" lang={langOf(project, 'content')}>
                {project.content}
              </div>
            </details>
          )}
        </div>

        {(project.tech_stack.length > 0 || project.links.length > 0) && (
          <aside className="pub-detail-side">
            {project.tech_stack.length > 0 && (
              <section className="pub-detail-part" aria-labelledby="detail-teknologi">
                <h2 id="detail-teknologi" className="pub-detail-h2 pub-detail-h2--small">
                  {t('detail.tech')}
                </h2>
                <TechList items={project.tech_stack} label={t('detail.tech')} />
              </section>
            )}
            {project.links.length > 0 && (
              <section className="pub-detail-part" aria-labelledby="detail-tautan">
                <h2 id="detail-tautan" className="pub-detail-h2 pub-detail-h2--small">
                  {t('detail.links')}
                </h2>
                <ProjectLinks links={project.links} />
              </section>
            )}
          </aside>
        )}
      </div>

      <LazyLightbox viewer={viewer} onClose={closeLightbox} />
    </article>
  )
}

export default ProjectDetailPage
