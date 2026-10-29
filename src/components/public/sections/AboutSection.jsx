import { Link } from 'react-router-dom'
import { useI18n } from '../../../i18n/i18nContext'
import CvButton from '../CvButton'
import { CapIcon } from '../icons'
import { langOf } from '../localize'
import { usePublicData } from '../publicContexts'
import { SkeletonBlock } from '../Section'
import { groupSkills } from '../skillGroups'
import './AboutSection.css'

function WaveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 11V6a2 2 0 0 0-4 0v1" />
      <path d="M14 10V4a2 2 0 0 0-4 0v2" />
      <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
    </svg>
  )
}

/**
 * "Tentang saya" as a bento (monochrome redesign, phase 4), only from the admin's data:
 * - introduction: greeting with the first name, the bio, "Unduh CV" (when a CV exists);
 * - photo with the name, "Terbuka untuk kerja" (when available) and "Rekrut saya" (to Kontak);
 * - education: the first visible entry, year of graduation and the GPA in large type;
 * - tech stack: the visible skills per category (id "keahlian", so old /#keahlian links land here);
 * - black "Fokus saya" card: the tagline and the hero keywords (or the supporting roles).
 * Cards whose data is empty are left out. Cards rise in while scrolling (public.css .pub-reveal).
 */
function AboutSection() {
  const data = usePublicData()
  const { t, formatGpa, skillCategory } = useI18n()
  const { status, data: profile } = data.profile
  if (status === 'loading') return <AboutSkeleton />
  if (!profile) return null

  const firstName = (profile.full_name || '').split(/\s+/)[0]
  const bio = (profile.bio || '').split(/\n+/).map((part) => part.trim()).filter(Boolean)
  const education = data.educations.data[0]
  const skillGroups = groupSkills(data.skills.data)
  const focusChips = profile.hero_keywords.length > 0 ? 'hero_keywords' : 'secondary_roles'
  const hasFocus = Boolean(profile.tagline) || profile[focusChips].length > 0

  return (
    <section id="tentang" className="pub-section pub-about" aria-labelledby="tentang-judul">
      <div className="pub-container">
        <h2 id="tentang-judul" className="pub-h2 pub-reveal">
          {t('about.title')}
        </h2>

        <div className="pub-about-bento">
          <article className="pub-tile pub-about-intro pub-reveal" data-wide={!profile.avatar_url || undefined}>
            <span className="pub-about-wave" aria-hidden="true">
              <WaveIcon />
            </span>
            {firstName && <h3 className="pub-about-hello">{t('about.hello', { name: profile.full_name })}</h3>}
            {bio.map((paragraph, index) => (
              <p key={index} className="pub-about-bio" lang={langOf(profile, 'bio')}>
                {paragraph}
              </p>
            ))}
            <CvButton variant="primary" className="pub-about-cv" />
          </article>

          {profile.avatar_url && (
            <figure className="pub-tile pub-about-photo pub-reveal">
              <img
                src={profile.avatar_url}
                alt={t('about.photoAlt', { name: profile.full_name })}
                width="480"
                height="600"
                loading="lazy"
                decoding="async"
              />
              <figcaption className="pub-about-tag">
                <span>
                  <b>{profile.full_name}</b>
                  {profile.is_available && <small>{t('hero.available')}</small>}
                </span>
                <Link to={{ pathname: '/', hash: '#kontak' }} className="pub-about-hire">
                  {t('about.hire')}
                </Link>
              </figcaption>
            </figure>
          )}

          {(education || hasFocus) && (
            <div className="pub-about-col" data-full={skillGroups.length === 0 || undefined}>
              {education && (
                <article className="pub-tile pub-about-edu pub-reveal">
                  <div className="pub-about-edu-top">
                    <span className="pub-about-edu-icon" aria-hidden="true">
                      <CapIcon size={28} />
                    </span>
                    {(education.is_current || education.end_year) && (
                      <span className="pub-about-edu-year">
                        {education.is_current ? t('about.studying') : t('about.graduated', { year: education.end_year })}
                      </span>
                    )}
                  </div>
                  <p className="pub-about-edu-school">{education.institution}</p>
                  <h3 className="pub-about-edu-title">
                    <span lang={langOf(education, 'degree')}>{education.degree}</span>{' '}
                    <span lang={langOf(education, 'field_of_study')}>{education.field_of_study}</span>
                  </h3>
                  {education.thesis_title && (
                    <p className="pub-about-edu-thesis" lang={langOf(education, 'thesis_title')}>
                      {t('about.thesis')}: {education.thesis_title}
                    </p>
                  )}
                  {education.gpa != null && (
                    <p className="pub-about-gpa">
                      <b>{formatGpa(education.gpa)}</b>
                      <span>{t('about.gpaOf', { max: formatGpa(4) })}</span>
                    </p>
                  )}
                </article>
              )}
              {hasFocus && (
                <article className="pub-tile pub-invert pub-about-focus pub-reveal">
                  <div>
                    <h3>{t('about.focus')}</h3>
                    {profile.tagline && <p lang={langOf(profile, 'tagline')}>{profile.tagline}</p>}
                  </div>
                  {profile[focusChips].length > 0 && (
                    <ul className="pub-about-focus-list">
                      {profile[focusChips].map((item, index) => (
                        <li key={`${item}-${index}`} lang={langOf(profile, focusChips, index)}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              )}
            </div>
          )}

          {skillGroups.length > 0 && (
            <article id="keahlian" className="pub-tile pub-tile--shadow pub-about-stack pub-reveal" aria-labelledby="keahlian-judul">
              <div className="pub-about-stack-top">
                <span className="pub-about-stack-icon" aria-hidden="true">
                  &gt;_
                </span>
                <h3 id="keahlian-judul">{t('about.stack')}</h3>
              </div>
              {skillGroups.map((group) => (
                <div key={group.category} className="pub-about-stack-group">
                  <h4>{skillCategory(group.category)}</h4>
                  <ul className="pub-about-tags">
                    {group.skills.map((skill) => (
                      <li key={skill.id}>{skill.name}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </article>
          )}
        </div>
      </div>
    </section>
  )
}

function AboutSkeleton() {
  return (
    <section id="tentang" className="pub-section pub-about" aria-hidden="true">
      <div className="pub-container">
        <SkeletonBlock width="min(36rem, 80%)" height="5rem" />
        <div className="pub-about-bento">
          <SkeletonBlock className="pub-about-intro" height="22rem" />
          <SkeletonBlock className="pub-about-photo" height="22rem" />
        </div>
      </div>
    </section>
  )
}

export default AboutSection
