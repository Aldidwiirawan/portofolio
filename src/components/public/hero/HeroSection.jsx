import { Link } from 'react-router-dom'
import BlueprintBackground from '../../effects/BlueprintBackground'
import { useI18n } from '../../../i18n/i18nContext'
import CvButton from '../CvButton'
import { ArrowRightIcon, GithubIcon, LinkedinIcon } from '../icons'
import { usePublicData } from '../publicContexts'
import { SITE_NAME } from '../publicFormat'
import { SectionError, SkeletonBlock } from '../Section'
import HeroStage from './HeroStage'
import KeywordRotator from './KeywordRotator'
import StatusBar from './StatusBar'
import './Hero.css'

/**
 * Hero of the home page: availability, the name as the page's h1, roles, rotating keywords (only
 * when the profile has them), "Unduh CV" (or "Hubungi saya" while there is no CV), "Lihat proyek",
 * LinkedIn and GitHub, the label stage and the status bar. While the profile loads it shows
 * placeholders; when it fails, a short message with "Coba lagi" instead of made-up data.
 */
function HeroSection() {
  const data = usePublicData()
  const { t } = useI18n()
  const { status, data: profile } = data.profile
  const skills = data.skills.data
  const hasProjects = data.projects.status !== 'ready' || data.projects.data.length > 0

  return (
    <section id="beranda" className="pub-hero" aria-labelledby="pub-hero-name">
      <BlueprintBackground variant="busy" />
      <div className="pub-container pub-hero-grid">
        <div className="pub-hero-copy">
          {status === 'loading' && <HeroSkeleton />}

          {status !== 'loading' && !profile && (
            <>
              <h1 id="pub-hero-name" className="pub-hero-name">
                {SITE_NAME}
              </h1>
              {status === 'error' && (
                <SectionError message={t('hero.profileError')} onRetry={() => data.reload('profile')} />
              )}
            </>
          )}

          {profile && (
            <>
              {profile.is_available && (
                <p className="pub-tag pub-hero-available">
                  <span className="pub-dot" aria-hidden="true" />
                  {t('hero.available')}
                </p>
              )}
              <h1 id="pub-hero-name" className="pub-hero-name">
                {profile.full_name || SITE_NAME}
              </h1>
              {profile.primary_role && <p className="pub-hero-role">{profile.primary_role}</p>}
              {profile.secondary_roles.length > 0 && (
                <p className="pub-hero-also">
                  <span>{t('hero.also')}</span> {profile.secondary_roles.join(' · ')}
                </p>
              )}
              {profile.hero_keywords.length > 0 && <KeywordRotator words={profile.hero_keywords} />}

              <div className="pub-hero-actions">
                {profile.cvUrl ? (
                  <CvButton />
                ) : (
                  <Link to={{ pathname: '/', hash: '#kontak' }} className="pub-btn pub-btn--primary">
                    <span>{t('hero.contact')}</span>
                    <ArrowRightIcon size={18} />
                  </Link>
                )}
                {hasProjects && (
                  <Link to={{ pathname: '/', hash: '#proyek' }} className="pub-btn pub-btn--secondary">
                    <span>{t('hero.viewProjects')}</span>
                    <ArrowRightIcon size={18} />
                  </Link>
                )}
              </div>

              <ProfileLinks social={profile.social} />
            </>
          )}
        </div>

        <HeroStage skills={skills} ready={data.skills.status !== 'loading'} />
      </div>

      <StatusBar available={Boolean(profile?.is_available)} location={profile?.location} />
    </section>
  )
}

/** LinkedIn and GitHub as labelled links (BRIEF §9: shown prominently in the hero). */
function ProfileLinks({ social }) {
  const { t } = useI18n()
  const links = [
    social.linkedin && { href: social.linkedin, label: t('social.linkedin'), Icon: LinkedinIcon },
    social.github && { href: social.github, label: t('social.github'), Icon: GithubIcon },
  ].filter(Boolean)
  if (links.length === 0) return null
  return (
    <ul className="pub-hero-links">
      {links.map(({ href, label, Icon }) => (
        <li key={label}>
          <a href={href} target="_blank" rel="noopener noreferrer" className="pub-hero-link">
            <Icon size={18} />
            <span>{label}</span>
            <span className="pub-sr-only">{t('common.newTab')}</span>
          </a>
        </li>
      ))}
    </ul>
  )
}

function HeroSkeleton() {
  const { t } = useI18n()
  return (
    <div className="pub-hero-skeleton" role="status">
      <span className="pub-sr-only">{t('common.loading')}</span>
      <SkeletonBlock width="9rem" height="1.5rem" />
      <SkeletonBlock width="min(30rem, 92%)" height="clamp(3rem, 7vw, 6rem)" />
      <SkeletonBlock width="min(22rem, 70%)" height="clamp(3rem, 7vw, 6rem)" />
      <SkeletonBlock width="14rem" height="1.75rem" />
      <SkeletonBlock width="20rem" height="3rem" />
    </div>
  )
}

export default HeroSection
