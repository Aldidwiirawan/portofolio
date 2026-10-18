import { useCallback, useRef } from 'react'
import { useI18n } from '../../../i18n/i18nContext'
import { usePrefersReducedMotion } from '../../../lib/useMediaQuery'
import { usePageHidden } from '../../../lib/usePageHidden'
import { pickStageSkills } from '../skillGroups'
import { useSound } from '../sound/soundContext'
import { usePhysicsStage } from './usePhysicsStage'

// Small tilts so the static labels look dropped onto the stage (before the physics starts)
const TILTS = [-5, 3, -2, 6, -4, 2, -6, 4]

/**
 * Stage on the right of the hero: blueprint frame with skill labels (featured skills, at most 8 on
 * large screens and 6 on phones) and the two round marks </> and *. The static pile shows first;
 * once the stage is on screen the labels become physics labels (stage 3B): they drop in, collide,
 * can be dragged and thrown with a mouse, and tossed with a tap on touch screens. With reduced motion
 * the pile stays still. Decorative (aria-hidden): the skills section lists the same skills.
 */
function HeroStage({ skills, ready }) {
  const { t } = useI18n()
  const reducedMotion = usePrefersReducedMotion()
  const pageHidden = usePageHidden()
  const { play } = useSound()
  const stageRef = useRef(null)

  const labels = pickStageSkills(skills, 8)
  const items = labels.map((skill, index) => ({ key: skill.id, text: skill.name, index }))
  // The round marks sit inside the pile, not at its edges
  items.splice(Math.min(2, items.length), 0, { key: 'orb-code', text: '</>', orb: true })
  items.splice(Math.min(6, items.length), 0, { key: 'orb-star', text: '*', orb: true })

  const onImpact = useCallback((impact) => play(impact), [play])
  usePhysicsStage(stageRef, {
    enabled: ready && !reducedMotion,
    rebuildKey: items.map((item) => item.text).join('|'),
    paused: pageHidden,
    onImpact,
  })

  return (
    <div ref={stageRef} className="pub-stage" aria-hidden="true" data-stage="labels">
      <p className="pub-stage-caption">{t('hero.stageCaption')}</p>
      <div className="pub-stage-pile">
        {items.map((item, position) => (
          <span
            key={item.key}
            className={item.orb ? 'pub-stage-orb' : 'pub-stage-label'}
            data-extra={!item.orb && item.index >= 6 ? 'true' : undefined}
            style={{ '--tilt': `${TILTS[position % TILTS.length]}deg` }}
          >
            {item.text}
          </span>
        ))}
      </div>
    </div>
  )
}

export default HeroStage
