import { useEffect, useMemo, useRef } from 'react'
import { usePublicProject } from '../../../hooks/usePublicPortfolio'
import { useI18n } from '../../../i18n/i18nContext'
import { useFocusTrap } from '../../admin/ui/useFocusTrap'
import { useScrollLock } from '../../admin/ui/useScrollLock'
import { ArrowUpRightIcon, CloseIcon } from '../icons'
import LazyLightbox from '../LazyLightbox'
import { langOf, localizeProject } from '../localize'
import { usePublicData, useTheme } from '../publicContexts'
import { SITE_NAME } from '../publicFormat'
import { SectionError } from '../Section'
import { Period } from '../sections/Period'
import { useDocumentTitle } from '../useDocumentTitle'
import { useLightbox } from '../useLightbox'
import { usePageMeta } from '../usePageMeta'
import RepoPanel from './RepoPanel'
import { publicRepoLink } from './repoLink'
import './ProjectModal.css'

const words = (value) => String(value || '').toLowerCase().split(/\s+/).filter(Boolean)

/** Whether two organization names point to the same place ("Dinas … Kabupaten Kediri" / "Diskominfo Kabupaten Kediri"). */
function sameOrganization(a, b) {
  const x = words(a)
  const y = words(b)
  if (x.length === 0 || y.length === 0) return false
  const joinedX = x.join(' ')
  const joinedY = y.join(' ')
  if (joinedX.includes(joinedY) || joinedY.includes(joinedX)) return true
  return x.length >= 2 && y.length >= 2 && x.slice(-2).join(' ') === y.slice(-2).join(' ')
}

/** Public links of a project except the demo (shown as "Kunjungi situs") and the GitHub repository (its panel). */
const extraLinksOf = (project, demo, repo) => project.links.filter((link) => link !== demo && link !== repo && !link.is_private && link.url)

/**
 * The case study as a pop-up over the home page (/projects/:slug), laid out like the reference site of
 * phase 8: the cover with a dark gradient, the "Studi kasus" chip and the title; then the problem (red dot)
 * and the solution (green dot), the project background and the main features (▹), "Kunjungi situs" when
 * there is a public demo. After that, in the same style, what this portfolio adds: the gallery and the
 * diagrams (opening the image viewer), the GitHub panel (public repositories only), the outcome, and the
 * role with time, place, partner, status and the technologies. Parts without data are left out.
 * Closes with Escape, the close button, a click outside, or Back (the address goes back to /); the focus
 * stays inside while it is open and returns to the button that opened it.
 */
function ProjectModal({ slug, onClose }) {
  const { status, project: stored, reload } = usePublicProject(slug)
  const data = usePublicData()
  const { t, lang } = useI18n()
  const { theme } = useTheme()
  const project = useMemo(() => localizeProject(stored, lang), [stored, lang])
  const panelRef = useRef(null)
  const headingRef = useRef(null)
  const { viewer, openLightbox, closeLightbox } = useLightbox()
  const name = data.profile.data?.full_name || SITE_NAME
  const title = project ? t('meta.project', { title: project.title, name }) : null

  useDocumentTitle(title)
  usePageMeta({ title, description: project?.description || project?.solution, path: project ? `/projects/${project.slug}` : null, lang })
  useFocusTrap(panelRef, !viewer, { onEscape: onClose, initialFocusRef: headingRef })
  useScrollLock(true)

  // The title appears once the project has loaded: screen readers and the keyboard start there
  useEffect(() => {
    if (status !== 'loading') headingRef.current?.focus({ preventScroll: true })
  }, [status])

  const onBackdrop = (event) => {
    if (event.target === event.currentTarget) onClose()
  }

  return (
    <div className="pub-case-layer" onPointerDown={onBackdrop}>
      {/* The panel takes the other palette (dark on the light page, light on the dark page), like the reference */}
      <div ref={panelRef} className="pub-case" data-theme={theme === 'dark' ? 'light' : 'dark'} role="dialog" aria-modal="true" aria-labelledby="pub-case-title">
        <button type="button" className="pub-case-close" aria-label={t('detail.close')} onClick={onClose}>
          <CloseIcon size={20} strokeWidth={2} />
        </button>
        {status === 'loading' && (
          <div className="pub-case-state" role="status">
            <span className="pub-spinner" aria-hidden="true" />
            <span className="pub-sr-only">{t('common.loading')}</span>
            <h2 id="pub-case-title" ref={headingRef} tabIndex={-1} className="pub-sr-only">
              {t('detail.caseStudy')}
            </h2>
          </div>
        )}
        {status === 'missing' && (
          <div className="pub-case-state">
            <h2 id="pub-case-title" ref={headingRef} tabIndex={-1} className="pub-case-state-title">
              {t('notFound.projectTitle')}
            </h2>
            <p>{t('notFound.projectText')}</p>
          </div>
        )}
        {status === 'error' && (
          <div className="pub-case-state">
            <h2 id="pub-case-title" ref={headingRef} tabIndex={-1} className="pub-case-state-title">
              {t('detail.caseStudy')}
            </h2>
            <SectionError message={t('detail.loadError')} onRetry={reload} />
          </div>
        )}
        {status === 'ready' && project && <CaseStudy project={project} headingRef={headingRef} onZoom={openLightbox} />}
      </div>
      <LazyLightbox viewer={viewer} onClose={closeLightbox} />
    </div>
  )
}


/** The content of the pop-up once the project has loaded. */
function CaseStudy({ project, headingRef, onZoom }) {
  const data = usePublicData()
  const { t, code } = useI18n()
  const experience = data.experiences.data.find((item) => item.related_project_id === project.id)
  const repo = publicRepoLink(project)
  const demo = project.links.find((link) => link.type === 'demo' && !link.is_private && link.url)
  const extraLinks = extraLinksOf(project, demo, repo)
  const gallery = project.gallery.filter((item) => item.kind !== 'diagram')
  const diagrams = project.gallery.filter((item) => item.kind === 'diagram')
  const cover = project.thumbnail_url || gallery[0]?.url
  const hasPoints = Boolean(project.problem?.trim() || project.solution?.trim())
  const hasDetails = Boolean(project.background?.trim() || project.features?.length)
  const facts = [
    (experience?.start_date || project.year) && {
      key: 'time',
      label: t('detail.time'),
      value: experience?.start_date ? <Period start={experience.start_date} end={experience.end_date} current={experience.is_current} /> : project.year,
    },
    experience?.company &&
      !sameOrganization(experience.company, project.client_name) && {
        key: 'place',
        label: t('detail.place'),
        value: <span lang={langOf(experience, 'company')}>{experience.company}</span>,
      },
    project.client_name && { key: 'partner', label: t('detail.partner'), value: <span lang={langOf(project, 'client_name')}>{project.client_name}</span> },
    code('status', project.status) && { key: 'status', label: t('detail.status'), value: code('status', project.status) },
  ].filter(Boolean)
  const hasRole = facts.length > 0 || Boolean(project.my_role?.trim()) || project.tech_stack.length > 0
  const captionOf = (item, n) => item.caption || item.label || t('lightbox.untitled', { n: n + 1 })

  const thumbs = (items, kind) => (
    <ul className="pub-case-thumbs" data-kind={kind}>
      {items.map((item, n) => (
        <li key={item.url}>
          <button type="button" className="pub-case-thumb" onClick={() => onZoom(items, n)} aria-label={`${t('detail.zoom')}: ${captionOf(item, n)}`}>
            <img src={item.url} alt="" loading="lazy" decoding="async" />
            {(item.label || item.caption) && <span>{kind === 'diagram' ? item.label || item.caption : item.caption}</span>}
          </button>
        </li>
      ))}
    </ul>
  )

  return (
    <>
      <header className="pub-case-head">
        {cover && <img src={cover} alt="" className="pub-case-cover" decoding="async" />}
        <div className="pub-case-head-text">
          <span className="pub-case-chip">{t('detail.caseStudy')}</span>
          <h2 id="pub-case-title" ref={headingRef} tabIndex={-1} className="pub-case-title" lang={langOf(project, 'title')}>
            {project.title}
          </h2>
        </div>
      </header>

      <div className="pub-case-body">
        {hasPoints && (
          <div className="pub-case-grid pub-case-grid--two">
            {project.problem?.trim() && (
              <section className="pub-case-block">
                <h3 className="pub-case-h">
                  <span className="pub-case-dot pub-case-dot--red" aria-hidden="true" />
                  {t('detail.problem')}
                </h3>
                <p lang={langOf(project, 'problem')}>{project.problem}</p>
              </section>
            )}
            {project.solution?.trim() && (
              <section className="pub-case-block">
                <h3 className="pub-case-h">
                  <span className="pub-case-dot pub-case-dot--green" aria-hidden="true" />
                  {t('detail.solution')}
                </h3>
                <p lang={langOf(project, 'solution')}>{project.solution}</p>
              </section>
            )}
          </div>
        )}

        {hasPoints && hasDetails && <hr className="pub-case-rule" />}

        {hasDetails && (
          <div className="pub-case-grid pub-case-grid--three">
            {project.background?.trim() && (
              <section className="pub-case-block pub-case-block--wide">
                <h3 className="pub-case-h">{t('detail.projectBackground')}</h3>
                <p lang={langOf(project, 'background')}>{project.background}</p>
              </section>
            )}
            {project.features?.length > 0 && (
              <section className="pub-case-block">
                <h3 className="pub-case-h">{t('detail.features')}</h3>
                <ul className="pub-case-features">
                  {project.features.map((item, n) => (
                    <li key={`${item}-${n}`} lang={langOf(project, 'features', n)}>
                      <span aria-hidden="true">▹</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}

        {(demo || extraLinks.length > 0) && (
          <div className="pub-case-actions">
            {demo && (
              <a href={demo.url} target="_blank" rel="noopener noreferrer" className="pub-case-visit">
                {t('detail.visitSite')}
                <ArrowUpRightIcon size={16} />
                <span className="pub-sr-only">{t('common.newTab')}</span>
              </a>
            )}
            {extraLinks.map((link) => (
              <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="pub-case-visit pub-case-visit--line">
                {link.label || code('link', link.type)}
                <ArrowUpRightIcon size={16} />
                <span className="pub-sr-only">{t('common.newTab')}</span>
              </a>
            ))}
          </div>
        )}

        {gallery.length > 0 && (
          <section className="pub-case-block pub-case-more">
            <h3 className="pub-case-h">{t('detail.tabGallery')}</h3>
            {thumbs(gallery, 'gallery')}
          </section>
        )}

        {diagrams.length > 0 && (
          <section className="pub-case-block pub-case-more">
            <h3 className="pub-case-h">{t('detail.tabDiagram')}</h3>
            {thumbs(diagrams, 'diagram')}
          </section>
        )}

        {repo && (
          <div className="pub-case-more">
            <RepoPanel project={project} />
          </div>
        )}

        {project.outcome?.trim() && (
          <section className="pub-case-block pub-case-more">
            <h3 className="pub-case-h">{t('detail.outcome')}</h3>
            <p lang={langOf(project, 'outcome')}>{project.outcome}</p>
          </section>
        )}

        {hasRole && (
          <section className="pub-case-block pub-case-more">
            <h3 className="pub-case-h">{t('detail.roleTech')}</h3>
            {facts.length > 0 && (
              <dl className="pub-case-facts">
                {facts.map((fact) => (
                  <div key={fact.key}>
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {project.my_role?.trim() && <p lang={langOf(project, 'my_role')}>{project.my_role}</p>}
            {project.tech_stack.length > 0 && (
              <ul className="pub-case-tech" aria-label={t('detail.tech')}>
                {project.tech_stack.map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </>
  )
}

export default ProjectModal
