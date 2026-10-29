import { Link } from 'react-router-dom'
import { useI18n } from '../../../i18n/i18nContext'
import { ArrowRightIcon, MapPinIcon } from '../icons'
import { langOf } from '../localize'
import Phrase from '../Phrase'
import { usePublicData } from '../publicContexts'
import { SectionError, SkeletonBlock } from '../Section'
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
 * "Perjalanan saya" (monochrome redesign, phase 5): the visible experiences and educations on one
 * timeline (certificates have their own section). A grey line runs down the middle with a black line
 * and dot that follow the scroll; each card opens like a curtain from the top as it comes in (both CSS
 * scroll-driven; without support or with reduced motion everything is simply shown). Each row has its
 * year in large outlined type, the photo folder when the entry has photos (otherwise its period), and
 * the card: kind, position, place, period, text and tags. Old links /#pengalaman and /#pendidikan land
 * here.
 */
function JourneySection() {
  const { t } = useI18n()
  const data = usePublicData()
  const experiences = data.experiences
  const educations = data.educations
  const loading = experiences.status === 'loading' || educations.status === 'loading'
  const entries = journeyEntries(experiences.data, educations.data)
  const failed = [experiences, educations].some((table) => table.status === 'error')

  if (!loading && !failed && entries.length === 0) return null

  return (
    <section id="perjalanan" className="pub-section pub-journey" aria-labelledby="perjalanan-judul">
      <span id="pengalaman" className="pub-anchor" aria-hidden="true" />
      <span id="pendidikan" className="pub-anchor" aria-hidden="true" />
      <div className="pub-container">
        <div className="pub-journey-head">
          <h2 id="perjalanan-judul" className="pub-h2 pub-journey-title">
            <span>{t('journey.title')}</span>
          </h2>
          <p className="pub-lead">{t('journey.intro')}</p>
        </div>

        {loading && (
          <div className="pub-jr" aria-hidden="true">
            {[0, 1].map((key) => (
              <SkeletonBlock key={key} height="14rem" />
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
          <div className="pub-jr">
            <span className="pub-jr-track" aria-hidden="true" />
            <span className="pub-jr-fill" aria-hidden="true" />
            <ol className="pub-jr-list">
              {entries.map((entry, index) => (
                <li key={entry.key} className="pub-jr-item" data-flip={index % 2 === 1 || undefined}>
                  <div className="pub-jr-side">
                    {entry.year && (
                      <p className="pub-jr-year" aria-hidden="true">
                        {entry.year}
                      </p>
                    )}
                    {entry.item.photos?.length > 0 ? (
                      <JourneyFolder photos={entry.item.photos} year={entry.year} />
                    ) : (
                      <p className="pub-jr-folder-text">
                        <span>
                          <EntryPeriod entry={entry} />
                        </span>
                      </p>
                    )}
                  </div>
                  {entry.type === 'experience' ? <ExperienceCard item={entry.item} /> : <EducationCard item={entry.item} />}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  )
}

function EntryPeriod({ entry }) {
  const { item } = entry
  return entry.type === 'experience' ? (
    <Period start={item.start_date} end={item.end_date} current={item.is_current} />
  ) : (
    <YearPeriod start={item.start_year} end={item.end_year} current={item.is_current} />
  )
}

function Place({ children }) {
  return (
    <p className="pub-jr-place">
      <MapPinIcon size={16} />
      <span>{children}</span>
    </p>
  )
}

function ExperienceCard({ item }) {
  const { t, storedLabel } = useI18n()
  const projects = usePublicData().projects.data
  const project = projects.find((p) => p.id === item.related_project_id && p.slug)

  return (
    <article className="pub-jr-card">
      {item.experience_type && <span className="pub-jr-kind">{storedLabel('exp', item.experience_type)}</span>}
      <h3 className="pub-jr-role" lang={langOf(item, 'role')}>
        {item.role}
      </h3>
      {(item.company || item.location) && (
        <Place>
          {item.company && <span lang={langOf(item, 'company')}>{item.company}</span>}
          {item.company && item.location && ', '}
          {item.location}
        </Place>
      )}
      <p className="pub-jr-period">
        <Period start={item.start_date} end={item.end_date} current={item.is_current} />
      </p>
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
        <Link to={`/projects/${encodeURIComponent(project.slug)}`} className="pub-arrow-link pub-jr-project">
          <span>
            <Phrase id="experience.viewProject" vars={{ title: { text: project.title, lang: langOf(project, 'title') } }} />
          </span>
          <ArrowRightIcon size={18} />
        </Link>
      )}
    </article>
  )
}

function EducationCard({ item }) {
  const { t, formatGpa } = useI18n()
  return (
    <article className="pub-jr-card">
      <span className="pub-jr-kind">{t('journey.education')}</span>
      <h3 className="pub-jr-role">
        <span lang={langOf(item, 'degree')}>{item.degree}</span>{' '}
        <span lang={langOf(item, 'field_of_study')}>{item.field_of_study}</span>
      </h3>
      {item.institution && <Place>{item.institution}</Place>}
      <p className="pub-jr-period">
        <YearPeriod start={item.start_year} end={item.end_year} current={item.is_current} />
      </p>
      {item.gpa != null && <p className="pub-jr-text">{t('journey.gpa', { gpa: formatGpa(item.gpa) })}</p>}
      {item.thesis_title && (
        <p className="pub-jr-also">
          <b>{t('about.thesis')}:</b> <span lang={langOf(item, 'thesis_title')}>{item.thesis_title}</span>
        </p>
      )}
    </article>
  )
}

export default JourneySection
