import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../../i18n/i18nContext'
import { usePrefersReducedMotion } from '../../../lib/useMediaQuery'
import CvButton from '../CvButton'
import {
  CapIcon,
  CodeIcon,
  DatabaseIcon,
  GithubIcon,
  LayoutIcon,
  NetworkIcon,
  PhoneIcon,
  ServerIcon,
  TerminalIcon,
  UniversityIcon,
  WrenchIcon,
} from '../icons'
import { langOf } from '../localize'
import { usePublicData } from '../publicContexts'
import { SkeletonBlock } from '../Section'
import { groupSkills } from '../skillGroups'
import HalftoneBackdrop from './HalftoneBackdrop'
import './AboutSection.css'

/**
 * The photo card: transparent portrait cutout over a prominent halftone dot backdrop
 * and a pill badge at the bottom (name + "Rekrut saya").
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

  // Use clean transparent cutout avatar
  const photoSrc = '/aldi-avatar-cutout.webp'

  return (
    <div className="pub-about-photo pub-reveal" onPointerMove={lean} onPointerLeave={straighten}>
      <figure ref={cardRef} className="pub-about-photo-card">
        {/* Authentic radial halftone dot backdrop */}
        <div className="pub-about-photo-halftone" aria-hidden="true">
          <HalftoneBackdrop className="pub-about-halftone-svg" />
        </div>

        {/* Clean portrait without red background */}
        <img
          src={photoSrc}
          alt={t('about.photoAlt', { name: profile.full_name })}
          width="368"
          height="360"
          loading="lazy"
          decoding="async"
        />

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

const RELEVANT_COURSES = [
  { id: 'web', name: { id: 'Pemrograman Web', en: 'Web Programming' } },
  { id: 'mobile', name: { id: 'Pemrograman Mobile', en: 'Mobile Programming' } },
  { id: 'db', name: { id: 'Sistem Basis Data', en: 'Database Systems' } },
  { id: 'network', name: { id: 'Jaringan Komputer', en: 'Computer Networks' } },
  { id: 'uiux', name: { id: 'UI/UX Design', en: 'UI/UX Design' } },
  { id: 'oop', name: { id: 'OOP', en: 'OOP' } },
]

const formatDegree = (degree) => {
  if (!degree) return ''
  if (/Diploma\s*(?:III|3)?\s*(?:\(D3\))?|Associate\s*Degree\s*(?:\(D3\))?/i.test(degree)) {
    return 'D3'
  }
  return degree
}

function getSkillIcon(skill) {
  const n = (skill.name || '').toLowerCase()
  const c = (skill.category || '').toLowerCase()
  if (n.includes('github')) return <GithubIcon size={13} />
  if (n.includes('database') || n.includes('sql') || n.includes('supabase') || c === 'database') return <DatabaseIcon size={13} />
  if (n.includes('flutter') || n.includes('dart') || n.includes('mobile') || c === 'mobile') return <PhoneIcon size={13} />
  if (n.includes('figma') || n.includes('ui') || n.includes('tailwind') || n.includes('bootstrap') || n.includes('react') || n.includes('next')) return <LayoutIcon size={13} />
  if (n.includes('network') || n.includes('jaringan') || n.includes('mikrotik') || c.includes('jaringan')) return <NetworkIcon size={13} />
  if (n.includes('git') || n.includes('postman') || n.includes('docker') || n.includes('vite') || c === 'tools') return <WrenchIcon size={13} />
  if (n.includes('server') || n.includes('api') || n.includes('fastapi') || n.includes('laravel') || c === 'backend') return <ServerIcon size={13} />
  return <CodeIcon size={13} />
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
  const { t, formatGpa, skillCategory, lang } = useI18n()
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
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white text-2xl animate-pulse pub-about-wave" aria-hidden="true">
                👋
              </div>
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
                  <UniversityIcon size={13} />
                  <span>{education.institution}</span>
                </p>
                <h3 className="pub-about-edu-title">
                  <span lang={langOf(education, 'degree')}>{formatDegree(education.degree)}</span>{' '}
                  <span lang={langOf(education, 'field_of_study')}>{education.field_of_study}</span>
                </h3>

                <div className="pub-about-edu-coursework">
                  <h4 className="pub-about-edu-coursework-title">{t('about.coursework')}</h4>
                  <ul className="pub-about-edu-course-list">
                    {RELEVANT_COURSES.map((course) => (
                      <li key={course.id} className="pub-about-edu-course-chip">
                        {course.name[lang] ?? course.name.id}
                      </li>
                    ))}
                  </ul>
                </div>

                {education.thesis_title && (
                  <p className="pub-about-edu-thesis" lang={langOf(education, 'thesis_title')}>
                    <b>{t('about.thesis')}:</b> {education.thesis_title}
                  </p>
                )}
              </div>
              {education.gpa != null && (
                <div className="pub-about-gpa">
                  <b>{formatGpa(education.gpa)}</b>
                  <div className="pub-about-gpa-meta">
                    <span className="pub-about-gpa-pred">{t('about.gpaPredicate')}</span>
                    <span className="pub-about-gpa-denom">{t('about.gpaOf', { max: formatGpa(4) })}</span>
                  </div>
                </div>
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
                  <div key={group.key || group.category} className="pub-about-stack-group">
                    <h4>{group.category}</h4>
                    <ul className="pub-about-tags">
                      {group.skills.map((skill) => (
                        <li key={skill.id || skill.name}>
                          {getSkillIcon(skill)}
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
                <div className="pub-about-focus-lead">
                  <h3>{t('about.focus')}</h3>
                  <p className="pub-about-focus-role">{profile.primary_role || t('about.focusRole')}</p>
                  <p className="pub-about-focus-desc">{t('about.focusDesc')}</p>
                </div>
                <ul className="pub-about-focus-list">
                  <li>
                    <LayoutIcon size={20} />
                    <span>Web Development</span>
                  </li>
                  <li>
                    <PhoneIcon size={20} />
                    <span>Mobile Apps</span>
                  </li>
                  <li>
                    <NetworkIcon size={20} />
                    <span>Network & IT Support</span>
                  </li>
                </ul>
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
