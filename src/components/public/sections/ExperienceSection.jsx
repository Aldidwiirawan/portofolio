import { Link } from 'react-router-dom'
import { useI18n } from '../../../i18n/i18nContext'
import { ArrowRightIcon, BriefcaseIcon } from '../icons'
import { usePublicData } from '../publicContexts'
import { Section, SectionError, SkeletonBlock } from '../Section'
import TechList from './TechList'
import './ExperienceSection.css'

/** "Jan 2026 – Jul 2026" / "Jan 2026 – sekarang", with machine-readable dates. */
export function Period({ start, end, current }) {
  const { t, formatDate } = useI18n()
  const from = formatDate(start)
  const to = current ? t('common.present') : formatDate(end)
  if (!from && !to) return null
  return (
    <>
      {from && <time dateTime={String(start).slice(0, 7)}>{from}</time>}
      {from && to && ' – '}
      {to && (current ? <span>{to}</span> : <time dateTime={String(end).slice(0, 7)}>{to}</time>)}
    </>
  )
}

/**
 * "Pengalaman": timeline of the visible experiences. An experience linked to a visible project with
 * a slug gets "Lihat proyek: …" (a hidden project is never linked).
 */
function ExperienceSection() {
  const { t, storedLabel } = useI18n()
  const data = usePublicData()
  const { status, data: experiences } = data.experiences

  if (status === 'ready' && experiences.length === 0) return null
  const projects = data.projects.data

  return (
    <Section id="pengalaman" tag={t('experience.tag')} title={t('experience.title')} intro={t('experience.intro')}>
      {status === 'loading' && (
        <div className="pub-timeline" aria-hidden="true">
          {[0, 1].map((key) => (
            <div key={key} className="pub-tl-item">
              <SkeletonBlock width="9rem" height="1rem" />
              <SkeletonBlock height="9rem" />
            </div>
          ))}
        </div>
      )}
      {status === 'error' && <SectionError onRetry={() => data.reload('experiences')} />}
      {status === 'ready' && (
        <ol className="pub-timeline">
          {experiences.map((item) => {
            const project = projects.find((p) => p.id === item.related_project_id && p.slug)
            const place = [item.company, item.location].filter(Boolean).join(' · ')
            return (
              <li key={item.id} className="pub-tl-item">
                <p className="pub-tl-period">
                  <Period start={item.start_date} end={item.end_date} current={item.is_current} />
                </p>
                <article className="pub-tl-card">
                  <div className="pub-tl-head">
                    <div className="pub-tl-logo" aria-hidden={item.logo_url ? undefined : 'true'}>
                      {item.logo_url ? (
                        <img
                          src={item.logo_url}
                          alt={t('experience.logoAlt', { company: item.company })}
                          width="48"
                          height="48"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <BriefcaseIcon size={22} />
                      )}
                    </div>
                    <div className="pub-tl-titles">
                      <h3 className="pub-tl-role">{item.role}</h3>
                      {place && <p className="pub-tl-company">{place}</p>}
                    </div>
                    {item.experience_type && (
                      <span className="pub-badge pub-badge--accent pub-tl-type">{storedLabel('exp', item.experience_type)}</span>
                    )}
                  </div>

                  {item.responsibilities.length > 0 && (
                    <ul className="pub-tl-tasks" aria-label={t('experience.tasks')}>
                      {item.responsibilities.map((task) => (
                        <li key={task}>{task}</li>
                      ))}
                    </ul>
                  )}

                  <TechList items={item.skill_tags} label={t('experience.skills')} />

                  {project && (
                    <Link to={`/projects/${encodeURIComponent(project.slug)}`} className="pub-arrow-link pub-tl-project">
                      <span>{t('experience.viewProject', { title: project.title })}</span>
                      <ArrowRightIcon size={18} />
                    </Link>
                  )}
                </article>
              </li>
            )
          })}
        </ol>
      )}
    </Section>
  )
}

export default ExperienceSection
