import { Link } from 'react-router-dom'
import { useI18n } from '../../../i18n/i18nContext'
import { ArrowRightIcon } from '../icons'
import { usePublicData } from '../publicContexts'
import { Section, SectionError, SkeletonBlock } from '../Section'
import ProjectCover from './ProjectCover'
import TechList from './TechList'
import './ProjectsSection.css'

const STATUS_TONE = { production: 'success', in_development: 'accent', final_project: 'accent' }

/** Badge for a project status code (Produksi, Selesai, …). */
export function StatusBadge({ status }) {
  const { code } = useI18n()
  const label = code('status', status)
  if (!label) return null
  const tone = STATUS_TONE[status]
  return <span className={`pub-badge${tone ? ` pub-badge--${tone}` : ''}`}>{label}</span>
}

/** "2026 · Web · Klien: …" */
function useProjectFacts(project, { withClient = true } = {}) {
  const { t, code } = useI18n()
  return [
    project.year,
    code('type', project.project_type),
    withClient && project.client_name && `${t('projects.client')}: ${project.client_name}`,
  ]
    .filter(Boolean)
    .join(' · ')
}

/**
 * "Proyek unggulan": featured projects as case-study cards (cover alternates left/right on wide
 * screens), the other visible projects as a compact list. Every card links to /projects/:slug.
 */
function ProjectsSection() {
  const { t } = useI18n()
  const { status, data: projects } = usePublicData().projects
  const { reload } = usePublicData()

  if (status === 'ready' && projects.length === 0) return null

  const featured = projects.filter((project) => project.is_featured)
  const cards = featured.length > 0 ? featured : projects.slice(0, 3)
  const others = projects.filter((project) => !cards.includes(project))

  return (
    <Section id="proyek" tag={t('projects.tag')} title={t('projects.title')} intro={t('projects.intro')}>
      {status === 'loading' && <ProjectsSkeleton />}
      {status === 'error' && <SectionError onRetry={() => reload('projects')} />}
      {status === 'ready' && (
        <>
          <ul className="pub-cases">
            {cards.map((project, index) => (
              <li key={project.id}>
                <ProjectCaseCard project={project} flip={index % 2 === 1} />
              </li>
            ))}
          </ul>

          {others.length > 0 && (
            <div className="pub-others">
              <h3 className="pub-others-title">{t('projects.others')}</h3>
              <ul className="pub-others-list">
                {others.map((project) => (
                  <ProjectRow key={project.id} project={project} />
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </Section>
  )
}

function ProjectCaseCard({ project, flip }) {
  const { t } = useI18n()
  const facts = useProjectFacts(project)
  const href = project.slug ? `/projects/${encodeURIComponent(project.slug)}` : null

  return (
    <article className="pub-case" data-flip={flip} data-linked={Boolean(href)}>
      <ProjectCover project={project} className="pub-case-cover" />
      <div className="pub-case-body">
        <div className="pub-case-meta">
          <StatusBadge status={project.status} />
          {facts && <span className="pub-case-facts">{facts}</span>}
        </div>
        <h3 className="pub-case-title">
          {href ? (
            <Link to={href} className="pub-case-link">
              {project.title}
            </Link>
          ) : (
            project.title
          )}
        </h3>
        {project.summary && <p className="pub-case-summary">{project.summary}</p>}
        <TechList items={project.tech_stack} max={5} />
        {href && (
          <span className="pub-arrow-link pub-case-more" aria-hidden="true">
            <span>{t('projects.detail')}</span>
            <ArrowRightIcon size={18} />
          </span>
        )}
      </div>
    </article>
  )
}

function ProjectRow({ project }) {
  const { code } = useI18n()
  const facts = [project.year, code('type', project.project_type), code('status', project.status)].filter(Boolean).join(' · ')
  const content = (
    <>
      <span className="pub-row-title">{project.title}</span>
      {facts && <span className="pub-row-facts">{facts}</span>}
    </>
  )
  return (
    <li className="pub-row">
      {project.slug ? (
        <Link to={`/projects/${encodeURIComponent(project.slug)}`} className="pub-row-link">
          {content}
          <ArrowRightIcon size={18} className="pub-row-arrow" />
        </Link>
      ) : (
        <div className="pub-row-link">{content}</div>
      )}
    </li>
  )
}

function ProjectsSkeleton() {
  return (
    <div className="pub-cases" aria-hidden="true">
      {[0, 1].map((key) => (
        <div key={key} className="pub-case pub-case--skeleton">
          <SkeletonBlock className="pub-case-cover" height="auto" />
          <div className="pub-case-body">
            <SkeletonBlock width="10rem" height="1.25rem" />
            <SkeletonBlock width="80%" height="2rem" />
            <SkeletonBlock height="4.5rem" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default ProjectsSection
