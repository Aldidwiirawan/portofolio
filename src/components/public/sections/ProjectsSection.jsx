import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../../i18n/i18nContext'
import { usePrefersReducedMotion } from '../../../lib/useMediaQuery'
import GithubActivitySlot from '../github/GithubActivitySlot'
import { ArrowUpRightIcon, FileTextIcon } from '../icons'
import { langOf } from '../localize'
import { usePublicData } from '../publicContexts'
import { SectionError, SkeletonBlock } from '../Section'
import './ProjectsSection.css'

/** The first public demo link of a project (private links have no address here). */
const demoLinkOf = (project) => project.links?.find((link) => link.type === 'demo' && !link.is_private && link.url)

/** Address of a project's case study (opens as a pop-up over the home page). */
const caseHref = (project) => `/projects/${encodeURIComponent(project.slug)}`

/**
 * "Proyek pilihan" as the black section of the reference site of phase 8: the title over two lines with
 * the intro on the right, then every visible project as a card (text on the left, the cover on the right
 * in a 16:9 frame that leans towards the pointer, with "Lihat studi kasus" on hover), in the order of the
 * admin (featured first). Each card shows only the admin's data: the kind, the title, the description, the
 * three facts Peran / Tahun / Klien in the place of the reference's numbers (no made-up metrics), the
 * technologies, "Baca studi kasus" (the pop-up) and "Kunjungi" for a public demo. Then the GitHub activity.
 */
function ProjectsSection() {
  const { t } = useI18n()
  const { status, data: projects } = usePublicData().projects
  const { reload, profile } = usePublicData()
  const hasGithub = Boolean(profile.data?.github_username)

  if (status === 'ready' && projects.length === 0) return null

  const [firstWord, ...restWords] = t('projects.title').split(' ')

  return (
    <section id="proyek" className="pub-invert pub-projects" aria-labelledby="proyek-judul">
      <div className="pub-projects-inner">
        <div className="pub-projects-head">
          <h2 id="proyek-judul" className="pub-title pub-reveal" data-reveal="title">
            {firstWord}
            {restWords.length > 0 && (
              <>
                <br />
                {restWords.join(' ')}
              </>
            )}
          </h2>
          <p className="pub-projects-intro pub-reveal" data-reveal="side">
            {t('projects.intro')}
          </p>
        </div>

        {status === 'loading' && <ProjectsSkeleton />}
        {status === 'error' && <SectionError onRetry={() => reload('projects')} />}
        {status === 'ready' && (
          <>
            <div className="pub-projects-list">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
            {hasGithub && <GithubActivitySlot />}
          </>
        )}
      </div>
    </section>
  )
}

function ProjectCard({ project }) {
  const { t, code } = useI18n()
  const reducedMotion = usePrefersReducedMotion()
  const frameRef = useRef(null)
  const demo = demoLinkOf(project)
  const label = [code('type', project.project_type), code('status', project.status)].filter(Boolean).join(' · ')
  const facts = [
    project.my_role && { key: 'my_role', label: t('projects.role'), value: project.my_role },
    project.year && { key: 'year', label: t('projects.year'), value: project.year },
    project.client_name && { key: 'client_name', label: t('projects.client'), value: project.client_name },
  ].filter(Boolean)
  const state = { fromHome: true }

  // The cover leans towards the pointer (3D), like the reference; straight again when the pointer leaves
  const lean = (event) => {
    const frame = frameRef.current
    if (!frame || reducedMotion || event.pointerType === 'touch') return
    const rect = frame.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    frame.style.transform = `rotateX(${(-y * 12).toFixed(2)}deg) rotateY(${(x * 12).toFixed(2)}deg)`
  }
  const straighten = () => {
    if (frameRef.current) frameRef.current.style.transform = ''
  }

  return (
    <article className="pub-project pub-reveal" aria-labelledby={`proyek-${project.id}`}>
      <div className="pub-project-body">
        <div>
          {label && (
            <div className="pub-project-label-row">
              <span className="pub-project-label">{label}</span>
            </div>
          )}
          <h3 id={`proyek-${project.id}`} className="pub-project-title" lang={langOf(project, 'title')}>
            {project.title}
          </h3>
        </div>
        {project.summary && (
          <p className="pub-project-summary" lang={langOf(project, 'summary')}>
            {project.summary}
          </p>
        )}
        {facts.length > 0 && (
          <dl className="pub-project-facts">
            {facts.map((fact) => (
              <div key={fact.key}>
                <dt>{fact.label}</dt>
                <dd lang={fact.key === 'my_role' ? langOf(project, 'my_role') : fact.key === 'client_name' ? langOf(project, 'client_name') : undefined} title={String(fact.value)}>
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
        {project.tech_stack?.length > 0 && (
          <ul className="pub-project-tags" aria-label={t('projects.techLabel')}>
            {project.tech_stack.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
        )}
        {(project.slug || demo) && (
          <div className="pub-project-actions">
            {project.slug && (
              <Link to={caseHref(project)} state={state} className="pub-project-case">
                <FileTextIcon size={16} />
                <span>{t('projects.readCase')}</span>
                <span className="pub-sr-only">: {project.title}</span>
                <span className="pub-project-case-line" aria-hidden="true" />
              </Link>
            )}
            {demo && (
              <a href={demo.url} target="_blank" rel="noopener noreferrer" className="pub-project-visit">
                <span>{t('projects.visit')}</span>
                <ArrowUpRightIcon size={14} />
                <span className="pub-sr-only">
                  {project.title} {t('common.newTab')}
                </span>
              </a>
            )}
          </div>
        )}
      </div>

      <div className="pub-project-media" onPointerMove={lean} onPointerLeave={straighten}>
        {/* The cover opens the case study too (a second way in for the pointer; keyboard users have the link) */}
        <Link to={project.slug ? caseHref(project) : '#'} state={state} className="pub-project-frame" ref={frameRef} tabIndex={-1} aria-hidden="true">
          {project.thumbnail_url ? (
            <img src={project.thumbnail_url} alt="" width="624" height="351" loading="lazy" decoding="async" />
          ) : (
            <span className="pub-project-noimage">{label}</span>
          )}
          <span className="pub-project-shade" />
          <span className="pub-project-hover">
            <span>
              <FileTextIcon size={16} />
              {t('projects.viewCase')}
            </span>
          </span>
        </Link>
      </div>
    </article>
  )
}

function ProjectsSkeleton() {
  return (
    <div className="pub-projects-list" aria-hidden="true">
      {[0, 1].map((key) => (
        <div key={key} className="pub-project">
          <div className="pub-project-body">
            <SkeletonBlock width="10rem" height="1.5rem" />
            <SkeletonBlock width="80%" height="3rem" />
            <SkeletonBlock height="5rem" />
          </div>
          <SkeletonBlock className="pub-project-media" height="20rem" />
        </div>
      ))}
    </div>
  )
}

export default ProjectsSection
