import { Link } from 'react-router-dom'
import { useI18n } from '../../../i18n/i18nContext'
import GithubActivitySlot from '../github/GithubActivitySlot'
import { ArrowRightIcon, ExternalIcon, FileIcon } from '../icons'
import { langOf } from '../localize'
import { usePublicData } from '../publicContexts'
import { SectionError, SkeletonBlock } from '../Section'
import ProjectCover from './ProjectCover'
import TechList from './TechList'
import './ProjectsSection.css'

const STATUS_TONE = { production: 'success', in_development: 'accent', final_project: 'accent' }

/** Badge for a project status code (Produksi, Selesai, …). Also used by the project page. */
export function StatusBadge({ status }) {
  const { code } = useI18n()
  const label = code('status', status)
  if (!label) return null
  const tone = STATUS_TONE[status]
  return <span className={`pub-badge${tone ? ` pub-badge--${tone}` : ''}`}>{label}</span>
}

/** The first public demo link of a project (private links have no address here). */
const demoLinkOf = (project) => project.links?.find((link) => link.type === 'demo' && !link.is_private && link.url)

/**
 * "Proyek pilihan" (monochrome redesign, phase 4): a black section that widens from a rounded card to
 * the full screen as it comes in (CSS scroll-driven). The featured projects (sort_order; the first
 * three when none is featured) are sticky cards that stack from 1060 px: the earlier card shrinks and
 * dims under the next one. Below 1060 px, with reduced motion or without animation support they are a
 * normal list. Then the other projects as a compact list, and the GitHub activity.
 * No made-up numbers: every card shows only the admin's data.
 */
function ProjectsSection() {
  const { t } = useI18n()
  const { status, data: projects } = usePublicData().projects
  const { reload, profile } = usePublicData()
  const hasGithub = Boolean(profile.data?.github_username)

  if (status === 'ready' && projects.length === 0) return null

  const featured = projects.filter((project) => project.is_featured)
  const cards = featured.length > 0 ? featured : projects.slice(0, 3)
  const others = projects.filter((project) => !cards.includes(project))

  return (
    <section id="proyek" className="pub-section pub-invert pub-projects" aria-labelledby="proyek-judul">
      <div className="pub-container">
        <div className="pub-projects-head">
          <h2 id="proyek-judul" className="pub-h2 pub-reveal">
            {t('projects.title')}
          </h2>
          <p className="pub-lead">{t('projects.intro')}</p>
        </div>

        {status === 'loading' && <ProjectsSkeleton />}
        {status === 'error' && <SectionError onRetry={() => reload('projects')} />}
        {status === 'ready' && (
          <>
            <ol className="pub-stack">
              {cards.map((project) => (
                <li key={project.id} className="pub-stack-item">
                  <ProjectCard project={project} />
                </li>
              ))}
            </ol>

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

            {hasGithub && <GithubActivitySlot />}
          </>
        )}
      </div>
    </section>
  )
}

function ProjectCard({ project }) {
  const { t, code } = useI18n()
  const href = project.slug ? `/projects/${encodeURIComponent(project.slug)}` : null
  const demo = demoLinkOf(project)
  const label = [code('status', project.status), code('type', project.project_type)].filter(Boolean).join(' · ')
  const facts = [
    project.my_role && { key: 'my_role', label: t('projects.role'), value: project.my_role },
    project.year && { key: 'year', label: t('projects.year'), value: project.year },
    project.client_name && { key: 'client_name', label: t('projects.client'), value: project.client_name },
  ].filter(Boolean)

  return (
    <article className="pub-project" aria-labelledby={`proyek-${project.id}`}>
      <div className="pub-project-body">
        {label && <span className="pub-project-label">{label}</span>}
        <h3 id={`proyek-${project.id}`} className="pub-project-title" lang={langOf(project, 'title')}>
          {project.title}
        </h3>
        {project.summary && (
          <p className="pub-project-summary" lang={langOf(project, 'summary')}>
            {project.summary}
          </p>
        )}
        {facts.length > 0 && (
          <dl className="pub-project-facts">
            {facts.map((fact) => (
              <div key={fact.key} className={fact.key === 'my_role' ? 'pub-project-fact--wide' : undefined}>
                <dt>{fact.label}</dt>
                <dd lang={fact.key === 'my_role' ? langOf(project, 'my_role') : undefined}>{fact.value}</dd>
              </div>
            ))}
          </dl>
        )}
        <TechList items={project.tech_stack} max={6} className="pub-project-tech" />
        {(href || demo) && (
          <div className="pub-project-actions">
            {href && (
              <Link to={href} className="pub-project-case">
                <FileIcon size={18} />
                <span>{t('projects.readCase')}</span>
                <span className="pub-sr-only">: {project.title}</span>
              </Link>
            )}
            {demo && (
              <a href={demo.url} target="_blank" rel="noopener noreferrer" className="pub-btn pub-btn--primary pub-btn--sm pub-project-visit">
                <span>{t('projects.visit')}</span>
                <ExternalIcon size={16} />
                <span className="pub-sr-only">
                  {project.title} {t('common.newTab')}
                </span>
              </a>
            )}
          </div>
        )}
      </div>
      <ProjectCover project={project} className="pub-project-cover" />
    </article>
  )
}

function ProjectRow({ project }) {
  const { code } = useI18n()
  const facts = [project.year, code('type', project.project_type), code('status', project.status)].filter(Boolean).join(' · ')
  const content = (
    <>
      <span className="pub-row-title" lang={langOf(project, 'title')}>
        {project.title}
      </span>
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
    <div className="pub-stack" aria-hidden="true">
      {[0, 1].map((key) => (
        <div key={key} className="pub-project pub-project--skeleton">
          <div className="pub-project-body">
            <SkeletonBlock width="10rem" height="1.5rem" />
            <SkeletonBlock width="80%" height="3rem" />
            <SkeletonBlock height="5rem" />
          </div>
          <SkeletonBlock className="pub-project-cover" height="auto" />
        </div>
      ))}
    </div>
  )
}

export default ProjectsSection
