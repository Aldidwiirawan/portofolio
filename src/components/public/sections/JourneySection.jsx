import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../../i18n/i18nContext'
import { ArrowRightIcon, BriefcaseIcon, CalendarIcon, CapIcon, CodeIcon, MapPinIcon } from '../icons'
import LazyLightbox from '../LazyLightbox'
import { langOf } from '../localize'
import Phrase from '../Phrase'
import { usePublicData } from '../publicContexts'
import { SectionError, SkeletonBlock } from '../Section'
import { useLightbox } from '../useLightbox'
import JourneyFolder from './JourneyFolder'
import { Period, YearPeriod } from './Period'
import './JourneySection.css'

const yearOf = (date) => (date ? String(date).slice(0, 4) : '')

/**
 * Experiences and educations as one list, newest first by start. An education only has years; it is
 * sorted as if it started in August (the start of the academic year), so a study that began in 2023
 * comes before work done earlier that year.
 */
function journeyEntries(experiences, educations) {
  return [
    ...experiences.map((item) => ({ key: `exp-${item.id}`, type: 'experience', item, year: yearOf(item.start_date), sort: String(item.start_date || '') })),
    ...educations.map((item) => ({
      key: `edu-${item.id}`,
      type: 'education',
      item,
      year: item.start_year ? String(item.start_year) : '',
      sort: item.start_year ? `${item.start_year}-08-01` : '',
    })),
  ].sort((a, b) => b.sort.localeCompare(a.sort))
}

/**
 * Photos of the journey milestone from the database. Empty by default until filled by user via admin panel.
 */
function getEntryPhotos(entry) {
  return entry.item.photos || []
}

/**
 * "Perjalanan saya" laid out like the timeline of the reference site of phase 8: a thin grey line down
 * the middle with a black line (and its tip) that follows the scroll, a dot per entry, the card on one side
 * (alternating) and on the other the year in large outlined type with an icon, which light up as the entry
 * passes the middle of the screen (CSS scroll-driven; without support they simply show). The photo folder
 * ("Arsip proyek / Klik folder") appears under the year only when the entry has photos; its photos open in
 * the image viewer. Old links /#pengalaman and /#pendidikan land here.
 */
function JourneySection() {
  const { t } = useI18n()
  const data = usePublicData()
  const experiences = data.experiences
  const educations = data.educations
  const { viewer, openLightbox, closeLightbox } = useLightbox()
  const loading = experiences.status === 'loading' || educations.status === 'loading'
  const entries = journeyEntries(experiences.data, educations.data)
  const failed = [experiences, educations].some((table) => table.status === 'error')

  const containerRef = useRef(null)
  const fillRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    const fill = fillRef.current
    if (!container || !fill) return

    let rafId = null

    const update = () => {
      const rect = container.getBoundingClientRect()
      const windowHeight = window.innerHeight

      // Offset matching Styfen Sagala ["start center", "end end"]:
      // "start center": top of container reaches center of viewport (windowHeight * 0.5) -> progress = 0
      // "end end": bottom of container reaches bottom of viewport (windowHeight) -> progress = 1
      const startY = windowHeight * 0.5
      const endY = windowHeight - rect.height
      const totalDist = startY - endY

      let progress = totalDist > 0 ? (startY - rect.top) / totalDist : 0
      progress = Math.min(Math.max(progress, 0), 1)

      // Transform with scaleY on full-height container line, squashing child tip capsule at low progress into a flat cap!
      fill.style.transform = `translateX(-50%) scaleY(${progress.toFixed(4)})`
      fill.style.opacity = progress > 0.002 ? '1' : '0'

      const currentTipY = rect.top + progress * rect.height
      const items = container.querySelectorAll('.pub-jr-item')

      items.forEach((item) => {
        const dot = item.querySelector('.pub-jr-dot')
        if (dot) {
          const dotRect = dot.getBoundingClientRect()
          const dotCenter = dotRect.top + dotRect.height * 0.5
          if (currentTipY >= dotCenter - 10) {
            item.setAttribute('data-active', 'true')
          } else {
            item.removeAttribute('data-active')
          }
        }
      })
    }

    const onScroll = () => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        update()
        rafId = null
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    update()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [entries.length])

  if (!loading && !failed && entries.length === 0) return null

  return (
    <section id="perjalanan" className="pub-journey" aria-labelledby="perjalanan-judul">
      <span id="pengalaman" className="pub-anchor" aria-hidden="true" />
      <span id="pendidikan" className="pub-anchor" aria-hidden="true" />
      <div className="pub-journey-grid" aria-hidden="true" />
      <div className="pub-journey-inner">
        <div className="pub-journey-head pub-reveal" data-reveal="title">
          <h2 id="perjalanan-judul" className="pub-journey-title">
            {t('journey.title')}
            <span className="pub-journey-title-accent" aria-hidden="true" />
          </h2>
          <p className="pub-journey-intro">{t('journey.intro')}</p>
        </div>

        {loading && (
          <div className="pub-jr" aria-hidden="true">
            {[0, 1].map((key) => (
              <SkeletonBlock key={key} height="18rem" />
            ))}
          </div>
        )}
        {!loading && failed && (
          <SectionError
            onRetry={() => {
              if (experiences.status === 'error') data.reload('experiences')
              if (educations.status === 'error') data.reload('educations')
            }}
          />
        )}
        {!loading && entries.length > 0 && (
          <div className="pub-jr" ref={containerRef}>
            <span className="pub-jr-track" aria-hidden="true" />
            <span className="pub-jr-fill" ref={fillRef} aria-hidden="true">
              <span className="pub-jr-tip" />
            </span>
            <ol className="pub-jr-list">
              {entries.map((entry, index) => {
                const photos = getEntryPhotos(entry)
                const roleLower = String(entry.item.role || '').toLowerCase()
                const isDev =
                  entry.type === 'experience' &&
                  (roleLower.includes('developer') ||
                    roleLower.includes('programmer') ||
                    roleLower.includes('web') ||
                    roleLower.includes('software'))
                const yearIcon = isDev ? (
                  <CodeIcon size={24} />
                ) : entry.type === 'education' ? (
                  <CapIcon size={24} />
                ) : (
                  <BriefcaseIcon size={24} />
                )

                return (
                  <li key={entry.key} className="pub-jr-item" data-flip={index % 2 === 0 || undefined}>
                    <div className="pub-jr-card-side pub-reveal">
                      {entry.type === 'experience' ? <ExperienceCard item={entry.item} year={entry.year} /> : <EducationCard item={entry.item} year={entry.year} />}
                    </div>
                    <span className="pub-jr-dot" aria-hidden="true">
                      <span className="pub-jr-dot-ring" />
                      <span className="pub-jr-dot-core" />
                    </span>
                    <div className="pub-jr-side">
                      <div className="pub-jr-archive">
                        {entry.year && (
                          <div className="pub-jr-yearbox" aria-hidden="true">
                            <span className="pub-jr-year">{entry.year}</span>
                            <span className="pub-jr-icon">{yearIcon}</span>
                          </div>
                        )}
                        <JourneyFolder photos={photos} year={entry.year} onOpenPhoto={openLightbox} />
                      </div>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
        )}
      </div>
      <LazyLightbox viewer={viewer} onClose={closeLightbox} />
    </section>
  )
}

function CardTop({ year, kind }) {
  return (
    <div className="pub-jr-chips">
      {year && <span className="pub-jr-year-chip">{year}</span>}
      {kind && <span className="pub-jr-kind">{kind}</span>}
    </div>
  )
}

function Meta({ icon, children }) {
  return (
    <p className="pub-jr-meta">
      {icon}
      <span>{children}</span>
    </p>
  )
}

function ExperienceCard({ item, year }) {
  const { t, storedLabel } = useI18n()
  const projects = usePublicData().projects.data
  const project = projects.find((p) => p.id === item.related_project_id && p.slug)

  return (
    <article className="pub-jr-card">
      <div className="pub-jr-card-inner">
        <CardTop year={year} kind={item.experience_type ? storedLabel('exp', item.experience_type) : null} />
        <div className="pub-jr-heading">
          <h3 className="pub-jr-role" lang={langOf(item, 'role')}>
            {item.role}
          </h3>
          {(item.company || item.location) && (
            <Meta icon={<MapPinIcon size={12} strokeWidth={2} />}>
              {item.company && <span lang={langOf(item, 'company')}>{item.company}</span>}
              {item.company && item.location && ', '}
              {item.location}
            </Meta>
          )}
          <Meta icon={<CalendarIcon size={12} strokeWidth={2} />}>
            <Period start={item.start_date} end={item.end_date} current={item.is_current} />
          </Meta>
        </div>
        {item.description && (
          <p className="pub-jr-text" lang={langOf(item, 'description')}>
            {item.description}
          </p>
        )}
        {item.responsibilities.length > 0 && (
          <ul className="pub-jr-tasks" aria-label={t('experience.tasks')}>
            {item.responsibilities.map((task, index) => (
              <li key={`${task}-${index}`} lang={langOf(item, 'responsibilities', index)}>
                {task}
              </li>
            ))}
          </ul>
        )}
        {item.skill_tags.length > 0 && (
          <ul className="pub-jr-tags" aria-label={t('experience.skills')}>
            {item.skill_tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        )}
        {project && (
          <Link to={`/projects/${encodeURIComponent(project.slug)}`} state={{ fromHome: true }} className="pub-jr-project">
            <span>
              <Phrase id="experience.viewProject" vars={{ title: { text: project.title, lang: langOf(project, 'title') } }} />
            </span>
            <ArrowRightIcon size={14} />
          </Link>
        )}
      </div>
    </article>
  )
}

function EducationCard({ item, year }) {
  const { t, formatGpa } = useI18n()
  return (
    <article className="pub-jr-card">
      <div className="pub-jr-card-inner">
        <CardTop year={year} kind={t('journey.education')} />
        <div className="pub-jr-heading">
          <h3 className="pub-jr-role">
            <span lang={langOf(item, 'degree')}>{item.degree}</span>{' '}
            <span lang={langOf(item, 'field_of_study')}>{item.field_of_study}</span>
          </h3>
          {item.institution && <Meta icon={<MapPinIcon size={12} strokeWidth={2} />}>{item.institution}</Meta>}
          <Meta icon={<CalendarIcon size={12} strokeWidth={2} />}>
            <YearPeriod start={item.start_year} end={item.end_year} current={item.is_current} />
          </Meta>
        </div>
        {item.description && (
          <p className="pub-jr-text" lang={langOf(item, 'description')}>
            {item.description}
          </p>
        )}
        {item.gpa != null && <p className="pub-jr-text">{t('journey.gpa', { gpa: formatGpa(item.gpa) })}</p>}
        {item.thesis_title && (
          <p className="pub-jr-text">
            <b>{t('about.thesis')}:</b> <span lang={langOf(item, 'thesis_title')}>{item.thesis_title}</span>
          </p>
        )}
      </div>
    </article>
  )
}

export default JourneySection
