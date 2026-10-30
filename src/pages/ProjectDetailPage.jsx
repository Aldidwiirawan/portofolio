import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { usePublicProject } from '../hooks/usePublicPortfolio'
import { useI18n } from '../i18n/i18nContext'
import { ArrowLeftIcon, GithubIcon } from '../components/public/icons'
import LazyLightbox from '../components/public/LazyLightbox'
import { langOf, localizeProject } from '../components/public/localize'
import MediaViewer from '../components/public/detail/MediaViewer'
import RepoPanel from '../components/public/detail/RepoPanel'
import { publicRepoLink } from '../components/public/detail/repoLink'
import ProjectLinks from '../components/public/ProjectLinks'
import { usePublicData } from '../components/public/publicContexts'
import { SITE_NAME } from '../components/public/publicFormat'
import { SectionError } from '../components/public/Section'
import { PageSkeleton } from '../components/public/Skeletons'
import { Period } from '../components/public/sections/Period'
import TechList from '../components/public/sections/TechList'
import { useDocumentTitle } from '../components/public/useDocumentTitle'
import { usePageMeta } from '../components/public/usePageMeta'
import { useLightbox } from '../components/public/useLightbox'
import NotFoundPage from './NotFoundPage'
import './ProjectDetailPage.css'

const pad = (n) => String(n).padStart(2, '0')
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

/**
 * Project page (/projects/:slug, monochrome redesign, phase 6); only visible projects, an unknown or
 * hidden slug shows the 404 page.
 * - Top bar: back to the projects, "Proyek 03 / 05", GitHub when the project has a public repository.
 * - Black header: kind of activity (from the related experience), status and type, the title, the
 *   short description, and time, place, partner and status (each only when known).
 * - Media viewer, "Info proyek" (type, my part, technologies), the GitHub panel and the links.
 * - "Tentang proyek": background, problem, solution and main features, numbered; a point that is
 *   still empty in the database is left out. "Hasil" follows as a note; the long technical text is
 *   not shown on this page.
 * - Previous and next project in the order of the home page.
 */
function ProjectDetailPage() {
  const { slug } = useParams()
  const { status, project: stored, reload } = usePublicProject(slug)
  const data = usePublicData()
  const { t, code, storedLabel, lang } = useI18n()
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
        <BackLink />
        <SectionError message={t('detail.loadError')} onRetry={reload} />
      </div>
    )
  }

  const list = data.projects.data
  const position = list.findIndex((item) => item.slug === project.slug)
  const previous = position > 0 ? list[position - 1] : null
  const next = position >= 0 && position < list.length - 1 ? list[position + 1] : null
  const experience = data.experiences.data.find((item) => item.related_project_id === project.id)
  const repoLink = publicRepoLink(project)

  const labels = [
    experience?.experience_type && { key: 'activity', text: storedLabel('exp', experience.experience_type), fill: true },
    code('status', project.status) && { key: 'status', text: code('status', project.status) },
    code('type', project.project_type) && { key: 'type', text: code('type', project.project_type) },
  ].filter(Boolean)

  const meta = [
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

  const points = [
    project.background && { key: 'background', title: t('detail.background'), text: project.background },
    project.problem?.trim() && { key: 'problem', title: t('detail.problem'), text: project.problem },
    project.solution?.trim() && { key: 'solution', title: t('detail.solution'), text: project.solution },
    project.features?.length > 0 && { key: 'features', title: t('detail.features'), list: project.features },
  ].filter(Boolean)

  const otherLinks = project.links.filter((link) => link !== repoLink)

  return (
    <article className="pub-detail">
      <div className="pub-container pub-detail-bar">
        <BackLink />
        {position >= 0 && <span className="pub-detail-count">{t('detail.counter', { n: pad(position + 1), total: pad(list.length) })}</span>}
        {repoLink && (
          <a href={repoLink.url} target="_blank" rel="noopener noreferrer" className="pub-detail-github">
            <GithubIcon size={16} />
            <span>GitHub</span>
            <span className="pub-sr-only">{t('common.newTab')}</span>
          </a>
        )}
      </div>

      <header className="pub-invert pub-detail-head">
        <div className="pub-container pub-reveal" data-reveal="title">
          {labels.length > 0 && (
            <ul className="pub-detail-labels">
              {labels.map((label) => (
                <li key={label.key} data-fill={label.fill || undefined}>
                  {label.text}
                </li>
              ))}
            </ul>
          )}
          <h1 ref={headingRef} tabIndex={-1} className="pub-detail-title" lang={langOf(project, 'title')}>
            {project.title}
          </h1>
          {project.description?.trim() && (
            <p className="pub-detail-lead" lang={langOf(project, 'description')}>
              {project.description}
            </p>
          )}
          {meta.length > 0 && (
            <dl className="pub-detail-meta">
              {meta.map((item) => (
                <div key={item.key}>
                  <dd>{item.value}</dd>
                  <dt>{item.label}</dt>
                </div>
              ))}
            </dl>
          )}
        </div>
      </header>

      <div className="pub-container pub-detail-body">
        <div className="pub-detail-grid pub-reveal">
          <MediaViewer key={project.slug} project={project} onZoom={openLightbox} />

          <aside className="pub-detail-side">
            <section className="pub-panel" aria-labelledby="info-judul">
              <div className="pub-panel-title">
                <h2 id="info-judul">{t('detail.info')}</h2>
              </div>
              <dl className="pub-detail-info">
                {code('type', project.project_type) && (
                  <>
                    <dt>{t('detail.type')}</dt>
                    <dd>{code('type', project.project_type)}</dd>
                  </>
                )}
                {project.my_role?.trim() && (
                  <>
                    <dt>{t('detail.myPart')}</dt>
                    <dd lang={langOf(project, 'my_role')}>{project.my_role}</dd>
                  </>
                )}
                {project.tech_stack.length > 0 && (
                  <>
                    <dt>{t('detail.tech')}</dt>
                    <dd>
                      <TechList items={project.tech_stack} label={t('detail.tech')} className="pub-detail-tech" />
                    </dd>
                  </>
                )}
              </dl>
            </section>

            <RepoPanel project={project} />

            {otherLinks.length > 0 && (
              <section className="pub-panel" aria-labelledby="tautan-judul">
                <div className="pub-panel-title">
                  <h2 id="tautan-judul">{t('detail.links')}</h2>
                </div>
                <ProjectLinks links={otherLinks} />
              </section>
            )}
          </aside>
        </div>

        {points.length > 0 && (
          <section className="pub-detail-about" aria-labelledby="tentang-proyek">
            <h2 id="tentang-proyek" className="pub-detail-h2 pub-reveal" data-reveal="title">
              {t('detail.about')}
            </h2>
            <div className="pub-detail-points">
              {points.map((point, index) => (
                <article key={point.key} className="pub-detail-point pub-reveal">
                  <p className="pub-detail-point-n" aria-hidden="true">
                    {pad(index + 1)}
                  </p>
                  <h3>{point.title}</h3>
                  {point.text && <p lang={langOf(project, point.key)}>{point.text}</p>}
                  {point.list && (
                    <ul>
                      {point.list.map((item, n) => (
                        <li key={`${item}-${n}`} lang={langOf(project, 'features', n)}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {project.outcome?.trim() && (
          <section className="pub-detail-outcome pub-reveal" aria-labelledby="hasil-proyek">
            <h2 id="hasil-proyek">{t('detail.outcome')}</h2>
            <p lang={langOf(project, 'outcome')}>{project.outcome}</p>
          </section>
        )}

        {(previous || next) && (
          <nav className="pub-detail-pn pub-reveal" aria-label={t('detail.otherProjects')}>
            {previous ? (
              <Link to={`/projects/${encodeURIComponent(previous.slug)}`} className="pub-detail-pn-link" rel="prev">
                <span>{t('detail.prev')}</span>
                <b lang={langOf(previous, 'title')}>{previous.title}</b>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link to={`/projects/${encodeURIComponent(next.slug)}`} className="pub-detail-pn-link pub-detail-pn-link--next" rel="next">
                <span>{t('detail.next')}</span>
                <b lang={langOf(next, 'title')}>{next.title}</b>
              </Link>
            )}
          </nav>
        )}
      </div>

      <LazyLightbox viewer={viewer} onClose={closeLightbox} />
    </article>
  )
}

function BackLink() {
  const { t } = useI18n()
  const location = useLocation()
  const navigate = useNavigate()
  const fromHome = Boolean(location.state?.fromHome)

  const handleClick = (e) => {
    if (fromHome) {
      e.preventDefault()
      navigate(-1)
    }
  }

  return (
    <Link to={{ pathname: '/', hash: '#proyek' }} onClick={handleClick} className="pub-detail-back">
      <ArrowLeftIcon size={18} />
      <span>{t('detail.back')}</span>
    </Link>
  )
}

export default ProjectDetailPage
