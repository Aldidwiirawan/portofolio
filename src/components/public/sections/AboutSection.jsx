import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../../i18n/i18nContext'
import { usePrefersReducedMotion } from '../../../lib/useMediaQuery'
import CvButton from '../CvButton'
import { CapIcon, CodeIcon, LayoutIcon, TerminalIcon, UniversityIcon } from '../icons'
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
 * The photo card: the photo filling a dark rounded card with a bar at the bottom (name, "Terbuka untuk
 * kerja" when available, "Rekrut saya" to Kontak). It leans a little towards the pointer, like the profile
 * card of the reference site of phase 8 (not with reduced motion).
 */
function PhotoCard({ profile }) {
  const { t } = useI18n()
  const reducedMotion = usePrefersReducedMotion()
  const cardRef = useRef(null)

  const lean = (event) => {
    const card = cardRef.current
    if (!card || reducedMotion || event.pointerType === 'touch') return
    const rect = card.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    card.style.transform = `rotateX(${(-y * 10).toFixed(2)}deg) rotateY(${(x * 10).toFixed(2)}deg)`
  }
  const straighten = () => {
    if (cardRef.current) cardRef.current.style.transform = ''
  }

  return (
    <div className="pub-about-photo pub-reveal" onPointerMove={lean} onPointerLeave={straighten}>
      <figure ref={cardRef} className="pub-about-photo-card">
        <img src={profile.avatar_url} alt={t('about.photoAlt', { name: profile.full_name })} width="368" height="360" loading="lazy" decoding="async" />
        <figcaption className="pub-about-photo-bar">
          <span className="pub-about-photo-text">
            <b>{profile.full_name}</b>
            {profile.is_available && <small>{t('hero.available')}</small>}
          </span>
          <Link to={{ pathname: '/', hash: '#kontak' }} className="pub-about-hire">
            {t('about.hire')}
          </Link>
        </figcaption>
      </figure>
    </div>
  )
}

/**
 * "Tentang saya" as the bento of the reference site of phase 8, only from the admin's data:
 * - row 1: introduction (greeting, bio, "Unduh CV" when a CV exists) over two columns, and the photo card;
 * - row 2: education (first visible entry: school, programme, year, GPA in large type) and the tech stack
 *   over two columns (id "keahlian", so old /#keahlian links land here);
 * - row 3: the black "Fokus saya" card over the whole width (tagline and the hero keywords, or the
 *   supporting roles).
 * The reference also lists courses and a GPA predicate; there is no such data, so they are left out, like
 * every card whose data is empty. Cards fade up when they come on screen (public.css .pub-reveal).
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
    <section id="tentang" className="pub-about" aria-labelledby="tentang-judul">
      <div className="pub-about-inner">
        <h2 id="tentang-judul" className="pub-title pub-about-title pub-reveal" data-reveal="title">
          {t('about.title')}
        </h2>

        <div className="pub-about-bento">
          <article className="pub-bento pub-about-intro pub-reveal" data-wide={!profile.avatar_url || undefined}>
            <div className="pub-about-intro-body">
              <span className="pub-about-wave" aria-hidden="true">
                <WaveIcon />
              </span>
              {firstName && <h3 className="pub-about-hello">{t('about.hello', { name: profile.full_name })}</h3>}
              <div className="pub-about-bio">
                {bio.map((paragraph, index) => (
                  <p key={index} lang={langOf(profile, 'bio')}>
                    {paragraph}
                  </p>
                ))}
              </div>
              <div className="pub-about-cv-row">
                <CvButton variant="primary" className="pub-about-cv" iconSize={14} />
              </div>
            </div>
          </article>

          {profile.avatar_url && <PhotoCard profile={profile} />}

          {education && (
            <article className="pub-bento pub-about-edu pub-reveal" data-wide={skillGroups.length === 0 || undefined}>
              <div className="pub-about-edu-top">
                <span className="pub-about-edu-icon" aria-hidden="true">
                  <CapIcon size={24} />
                </span>
                {(education.is_current || education.end_year) && (
                  <span className="pub-about-edu-year">
                    {education.is_current ? t('about.studying') : t('about.graduated', { year: education.end_year })}
                  </span>
                )}
              </div>
              <div className="pub-about-edu-main">
                <p className="pub-about-edu-school">
                  <UniversityIcon size={12} />
                  {education.institution}
                </p>
                <h3 className="pub-about-edu-title">
                  <span lang={langOf(education, 'degree')}>{education.degree}</span>{' '}
                  <span lang={langOf(education, 'field_of_study')}>{education.field_of_study}</span>
                </h3>
                {education.thesis_title && (
                  <p className="pub-about-edu-thesis" lang={langOf(education, 'thesis_title')}>
                    {t('about.thesis')}: {education.thesis_title}
                  </p>
                )}
              </div>
              {education.gpa != null && (
                <p className="pub-about-gpa">
                  <b>{formatGpa(education.gpa)}</b>
                  <span>{t('about.gpaOf', { max: formatGpa(4) })}</span>
                </p>
              )}
            </article>
          )}

          {skillGroups.length > 0 && (
            <article
              id="keahlian"
              className="pub-bento pub-about-stack pub-reveal"
              data-wide={!education || undefined}
              aria-labelledby="keahlian-judul"
            >
              <div className="pub-about-stack-top">
                <span className="pub-about-stack-icon" aria-hidden="true">
                  <TerminalIcon size={20} />
                </span>
                <h3 id="keahlian-judul">{t('about.stack')}</h3>
              </div>
              <div className="pub-about-stack-groups">
                {skillGroups.map((group) => (
                  <div key={group.category}>
                    <h4>{skillCategory(group.category)}</h4>
                    <ul className="pub-about-tags">
                      {group.skills.map((skill) => (
                        <li key={skill.id}>
                          <CodeIcon size={14} />
                          <span>{skill.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </article>
          )}

          {hasFocus && (
            <article className="pub-bento pub-about-focus pub-reveal">
              <div className="pub-about-focus-grid">
                <div>
                  <h3>{t('about.focus')}</h3>
                  {profile.tagline && <p lang={langOf(profile, 'tagline')}>{profile.tagline}</p>}
                </div>
                {profile[focusChips].length > 0 && (
                  <ul className="pub-about-focus-list">
                    {profile[focusChips].map((item, index) => (
                      <li key={`${item}-${index}`} lang={langOf(profile, focusChips, index)}>
                        <LayoutIcon size={20} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          )}
        </div>
      </div>
    </section>
  )
}

function AboutSkeleton() {
  return (
    <section id="tentang" className="pub-about" aria-hidden="true">
      <div className="pub-about-inner">
        <SkeletonBlock width="min(36rem, 80%)" height="4.5rem" />
        <div className="pub-about-bento">
          <SkeletonBlock className="pub-about-intro" height="24rem" />
          <SkeletonBlock className="pub-about-photo" height="22.5rem" />
        </div>
      </div>
    </section>
  )
}

export default AboutSection
