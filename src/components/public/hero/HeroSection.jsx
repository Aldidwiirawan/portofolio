import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import BlueprintBackground from '../../effects/BlueprintBackground'
import { useI18n } from '../../../i18n/i18nContext'
import CvButton from '../CvButton'
import { ArrowRightIcon, GithubIcon, LinkedinIcon } from '../icons'
import { langOf } from '../localize'
import { usePublicData } from '../publicContexts'
import { SITE_NAME } from '../publicFormat'
import { SectionError } from '../Section'
import HeroStage from './HeroStage'
import KeywordRotator from './KeywordRotator'
import StatusBar from './StatusBar'
import './Hero.css'

/**
 * Hero of the home page: availability, the name as the page's h1, roles, rotating keywords (only
 * when the profile has them), "Unduh CV" (or "Hubungi saya" while there is no CV), "Lihat proyek",
 * LinkedIn and GitHub, the label stage and the status bar. While the profile loads it shows the name
 * (the site name, which is the owner's name) and placeholders of the same size (HeroLoadingRows); when
 * it fails, the name and a short message with "Coba lagi" instead of made-up data.
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
          {/* One and the same h1 while loading and after: the name painted first stays the largest
              element (LCP) instead of being replaced by a new node when the profile arrives (3C) */}
          {status === 'loading' ? (
            <p className="pub-tag pub-hero-available pub-hero-ph-hidden" aria-hidden="true">
              <span className="pub-dot" />
              {t('hero.available')}
            </p>
          ) : (
            profile?.is_available && (
              <p className="pub-tag pub-hero-available">
                <span className="pub-dot" aria-hidden="true" />
                {t('hero.available')}
              </p>
            )
          )}
          <h1 id="pub-hero-name" className="pub-hero-name">
            {profile?.full_name || SITE_NAME}
          </h1>
          {status === 'loading' && <HeroLoadingRows />}
          {status === 'error' && !profile && (
            <SectionError message={t('hero.profileError')} onRetry={() => data.reload('profile')} />
          )}
          {profile && (
            <>
              {profile.primary_role && (
                <p className="pub-hero-role" lang={langOf(profile, 'primary_role')}>
                  {profile.primary_role}
                </p>
              )}
              {profile.secondary_roles.length > 0 && (
                <p className="pub-hero-also">
                  <span>{t('hero.also')}</span>{' '}
                  {profile.secondary_roles.map((role, index) => (
                    <Fragment key={index}>
                      {index > 0 && ' · '}
                      <span lang={langOf(profile, 'secondary_roles', index)}>{role}</span>
                    </Fragment>
                  ))}
                </p>
              )}
              {profile.hero_keywords.length > 0 && (
                <KeywordRotator
                  words={profile.hero_keywords}
                  langs={profile.hero_keywords.map((_, index) => langOf(profile, 'hero_keywords', index))}
                />
              )}

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

        <HeroStage
          labels={profile?.hero_labels ?? []}
          skills={skills}
          pending={status === 'loading'}
          ready={status !== 'loading' && (profile?.hero_labels?.length > 0 || data.skills.status !== 'loading')}
        />
      </div>

      <StatusBar available={Boolean(profile?.is_available)} location={profile?.location} pending={status === 'loading'} />
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

/**
 * The rows under the name while the profile loads (stage 3C): each row has a placeholder with the
 * classes of the real row, so nothing moves when the profile arrives (no layout shift).
 */
function HeroLoadingRows() {
  const { t } = useI18n()
  return (
    <>
      <span className="pub-sr-only" role="status">
        {t('common.loading')}
      </span>
      <p className="pub-hero-role" aria-hidden="true">
        <span className="pub-hero-ph" style={{ width: '11ch' }} />
      </p>
      <p className="pub-hero-also" aria-hidden="true">
        <span className="pub-hero-ph" style={{ width: '24ch' }} />
      </p>
      <p className="pub-hero-keywords" aria-hidden="true">
        <span className="pub-hero-ph" style={{ width: '22ch' }} />
      </p>
      <div className="pub-hero-actions" aria-hidden="true">
        <span className="pub-btn pub-btn--primary pub-hero-ph-box">{t('hero.contact')}</span>
        <span className="pub-btn pub-btn--secondary pub-hero-ph-box">{t('hero.viewProjects')}</span>
      </div>
      <ul className="pub-hero-links" aria-hidden="true">
        <li>
          <span className="pub-hero-link pub-hero-ph-box">{t('social.linkedin')}</span>
        </li>
        <li>
          <span className="pub-hero-link pub-hero-ph-box">{t('social.github')}</span>
        </li>
      </ul>
    </>
  )
}

export default HeroSection
