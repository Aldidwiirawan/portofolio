import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '../../../lib/useMediaQuery'
import { readStorage, writeStorage } from '../../../lib/safeStorage'
import { useI18n } from '../../../i18n/i18nContext'
import { SKILL_CATEGORY_KEYS } from '../../../i18n/translate'
import { PauseIcon, PlayIcon } from '../icons'
import { usePublicData } from '../publicContexts'
import { Section, SectionError, SkeletonBlock } from '../Section'
import { groupSkills } from '../skillGroups'
import SkillMarquee from './SkillMarquee'
import './SkillsSection.css'

// "Hentikan gerak" is remembered for the rest of the visit (K6)
const PAUSE_STORAGE_KEY = 'aldi-portfolio-skills-paused'

/**
 * "Keahlian": one running row per category with its name, one sentence and the number of skills.
 * The pause button (WCAG 2.2.2) stops every row; reduced motion shows still, wrapped lists instead.
 * Brand logos load on demand, after the section has mounted.
 */
function SkillsSection() {
  const { t, skillCategory } = useI18n()
  const { status, data: skills } = usePublicData().skills
  const { reload } = usePublicData()
  const reduced = usePrefersReducedMotion()
  const [paused, setPaused] = useState(() => readStorage(PAUSE_STORAGE_KEY, 'session') === '1')
  const [paths, setPaths] = useState(null)

  useEffect(() => {
    let active = true
    import('../techLogoPaths')
      .then((module) => {
        if (active) setPaths(module.TECH_LOGO_PATHS)
      })
      .catch(() => {
        // Without the logo file the skills keep their names; the empty icon boxes stay
      })
    return () => {
      active = false
    }
  }, [])

  if (status === 'ready' && skills.length === 0) return null

  const togglePause = () => {
    const next = !paused
    setPaused(next)
    writeStorage(PAUSE_STORAGE_KEY, next ? '1' : '0', 'session')
  }

  const pauseButton =
    status === 'ready' && !reduced ? (
      <button type="button" className="pub-btn pub-btn--secondary pub-btn--sm pub-skills-pause" onClick={togglePause}>
        {paused ? <PlayIcon size={16} /> : <PauseIcon size={16} />}
        <span>{t(paused ? 'skills.play' : 'skills.pause')}</span>
      </button>
    ) : null

  return (
    <Section id="keahlian" tag={t('skills.tag')} title={t('skills.title')} intro={t('skills.intro')} actions={pauseButton}>
      {status === 'loading' && (
        <div className="pub-skillrows" aria-hidden="true">
          {[0, 1, 2].map((key) => (
            <div key={key} className="pub-skillrow">
              <SkeletonBlock width="12rem" height="1.5rem" />
              <SkeletonBlock height="2.75rem" />
            </div>
          ))}
        </div>
      )}
      {status === 'error' && <SectionError onRetry={() => reload('skills')} />}
      {status === 'ready' && (
        <div className="pub-skillrows">
          {groupSkills(skills).map((group, index) => {
            const key = SKILL_CATEGORY_KEYS[group.category]
            const name = skillCategory(group.category)
            const headingId = `keahlian-${key || index}`
            return (
              <section key={group.category} className="pub-skillrow" aria-labelledby={headingId}>
                <div className="pub-skillrow-head">
                  <h3 id={headingId} className="pub-skillrow-title">
                    {name}
                  </h3>
                  <p className="pub-skillrow-count">{t('skills.count', { n: group.skills.length })}</p>
                  {key && <p className="pub-skillrow-desc">{t(`skills.cat.${key}.desc`)}</p>}
                </div>
                <SkillMarquee
                  skills={group.skills}
                  paths={paths}
                  reverse={index % 2 === 1}
                  paused={paused}
                  still={reduced}
                  label={name}
                />
              </section>
            )
          })}
        </div>
      )}
    </Section>
  )
}

export default SkillsSection
