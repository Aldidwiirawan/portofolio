import { useI18n } from '../../../i18n/i18nContext'
import { usePublicData } from '../publicContexts'
import { SkeletonBlock } from '../Section'
import './AboutSection.css'

/**
 * "Tentang saya": photo in a blueprint frame, bio, three facts (education, languages, city) and
 * hobbies. Only rendered when the profile exists; profile errors are shown once, in the hero.
 */
function AboutSection() {
  const data = usePublicData()
  const { t, formatGpa, storedLabel } = useI18n()
  const { status, data: profile } = data.profile
  if (status === 'loading') return <AboutSkeleton />
  if (!profile) return null

  const education = data.educations.data[0]
  const languages = data.languages.data
  const facts = [
    education && {
      key: 'education',
      label: t('about.education'),
      body: (
        <>
          <p className="pub-about-fact-main">{education.field_of_study || education.degree}</p>
          <p>{[education.field_of_study && education.degree, education.institution].filter(Boolean).join(' · ')}</p>
          {education.gpa != null && <p className="pub-about-fact-note">{t('about.gpa', { gpa: formatGpa(education.gpa) })}</p>}
        </>
      ),
    },
    languages.length > 0 && {
      key: 'languages',
      label: t('about.languages'),
      body: (
        <ul className="pub-about-langs">
          {languages.map((language) => (
            <li key={language.id}>
              <span className="pub-about-fact-main">{language.language_name}</span>
              {language.proficiency_level && <span> · {storedLabel('langLevel', language.proficiency_level)}</span>}
            </li>
          ))}
        </ul>
      ),
    },
    profile.location && {
      key: 'based',
      label: t('about.basedIn'),
      body: (
        <>
          <p className="pub-about-fact-main">{profile.location}</p>
          <p>Indonesia</p>
        </>
      ),
    },
  ].filter(Boolean)

  return (
    <section id="tentang" className="pub-section pub-about" aria-labelledby="tentang-judul">
      <div className="pub-container pub-about-grid">
        {profile.avatar_url && (
          <figure className="pub-about-photo">
            <img
              src={profile.avatar_url}
              alt={t('about.photoAlt', { name: profile.full_name })}
              width="480"
              height="600"
              loading="lazy"
              decoding="async"
            />
          </figure>
        )}

        <div className="pub-about-body">
          <div className="pub-section-head">
            <p className="pub-tag">{t('about.tag')}</p>
            <h2 id="tentang-judul" className="pub-h2">
              {t('about.title')}
            </h2>
          </div>

          {profile.bio && <p className="pub-about-bio">{profile.bio}</p>}

          {facts.length > 0 && (
            <dl className="pub-about-facts">
              {facts.map((fact) => (
                <div key={fact.key} className="pub-about-fact">
                  <dt className="pub-about-fact-label">{fact.label}</dt>
                  <dd>{fact.body}</dd>
                </div>
              ))}
            </dl>
          )}

          {profile.hobbies.length > 0 && (
            <div className="pub-about-hobbies">
              <h3 className="pub-about-hobbies-title">{t('about.hobbies')}</h3>
              <ul className="pub-chips">
                {profile.hobbies.map((hobby) => (
                  <li key={hobby} className="pub-chip">
                    {hobby}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function AboutSkeleton() {
  return (
    <section id="tentang" className="pub-section pub-about" aria-hidden="true">
      <div className="pub-container pub-about-grid">
        <SkeletonBlock className="pub-about-photo-skeleton" height="auto" />
        <div className="pub-about-body">
          <SkeletonBlock width="6rem" height="1.25rem" />
          <SkeletonBlock width="16rem" height="2.5rem" />
          <SkeletonBlock height="7rem" />
          <SkeletonBlock height="6rem" />
        </div>
      </div>
    </section>
  )
}

export default AboutSection
