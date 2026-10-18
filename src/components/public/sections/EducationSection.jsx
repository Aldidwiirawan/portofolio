import { useI18n } from '../../../i18n/i18nContext'
import { CapIcon } from '../icons'
import { usePublicData } from '../publicContexts'
import { Section, SectionError } from '../Section'
import './ExperienceSection.css'

/** "Pendidikan": the visible education entries (the admin hides school level, BRIEF §9). */
function EducationSection() {
  const { t, formatGpa } = useI18n()
  const data = usePublicData()
  const { status, data: educations } = data.educations

  if (status !== 'error' && educations.length === 0) return null

  return (
    <Section id="pendidikan" tag={t('education.tag')} title={t('education.title')}>
      {status === 'error' && <SectionError onRetry={() => data.reload('educations')} />}
      {status === 'ready' && (
        <ul className="pub-edu-list">
          {educations.map((item) => {
            const years = [item.start_year, item.is_current ? t('common.present') : item.end_year].filter(Boolean).join(' – ')
            const title = [item.degree, item.field_of_study].filter(Boolean).join(' ')
            return (
              <li key={item.id}>
                <article className="pub-edu">
                  <div className="pub-edu-logo" aria-hidden={item.logo_url ? undefined : 'true'}>
                    {item.logo_url ? (
                      <img
                        src={item.logo_url}
                        alt={t('education.logoAlt', { institution: item.institution })}
                        width="72"
                        height="72"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <CapIcon size={26} />
                    )}
                  </div>
                  <div className="pub-edu-body">
                    <h3 className="pub-edu-title">{title || item.institution}</h3>
                    {title && <p className="pub-edu-school">{item.institution}</p>}
                    <p className="pub-edu-facts">
                      {years && <span>{years}</span>}
                      {item.gpa != null && <span className="pub-edu-gpa">{t('about.gpa', { gpa: formatGpa(item.gpa) })}</span>}
                    </p>
                    {item.thesis_title && (
                      <p className="pub-edu-thesis">
                        <span>{t('education.thesis')}</span>
                        {item.thesis_title}
                      </p>
                    )}
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      )}
    </Section>
  )
}

export default EducationSection
