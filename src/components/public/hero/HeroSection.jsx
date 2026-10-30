import { Fragment } from 'react'
import { useI18n } from '../../../i18n/i18nContext'
import { usePublicData } from '../publicContexts'
import { SITE_NAME } from '../publicFormat'
import { SectionError } from '../Section'
import CodeLine from './CodeLine'
import HeroChips from './HeroChips'
import StatusStrip from './StatusStrip'
import './Hero.css'

/**
 * Hero of the home page, laid out like the reference site of phase 8: one screen high, the chips that
 * fall in and can be dragged, the name as the page's h1 in one line from edge to edge, the line of code
 * typed once, and the status bar near the bottom. The name is one and the same h1 while the profile loads and after (the site name is the
 * owner's name), so the first painted text stays the largest element (LCP). When the profile fails,
 * a short message with "Coba lagi" appears under the name instead of made-up data.
 */
function HeroSection() {
  const data = usePublicData()
  const { t } = useI18n()
  const { status, data: profile } = data.profile
  const name = profile?.full_name || SITE_NAME
  const words = name.split(/\s+/).filter(Boolean)
  const labels = status === 'loading' ? null : (profile?.hero_labels ?? [])

  return (
    <section id="beranda" className="pub-hero" aria-labelledby="pub-hero-name">
      <div className="pub-hero-stage">
        <HeroChips labels={labels} firstName={words[0] ?? ''} />
      </div>

      <div className="pub-hero-namebox">
        <h1 id="pub-hero-name" className="pub-hero-name">
          {words.map((word, index) => (
            <Fragment key={index}>
              {index > 0 && ' '}
              <span className="pub-hero-word">{word}</span>
            </Fragment>
          ))}
        </h1>
        <CodeLine />
        {status === 'error' && !profile && (
          <div className="pub-container">
            <SectionError message={t('hero.profileError')} onRetry={() => data.reload('profile')} />
          </div>
        )}
      </div>

      <StatusStrip available={Boolean(profile?.is_available)} location={profile?.location} pending={status === 'loading'} />
    </section>
  )
}

export default HeroSection
