import { useCallback, useRef } from 'react'
import { useI18n } from '../../../i18n/i18nContext'
import { usePrefersReducedMotion } from '../../../lib/useMediaQuery'
import { usePageHidden } from '../../../lib/usePageHidden'
import { pickStageSkills } from '../skillGroups'
import { useSound } from '../sound/soundContext'
import { usePhysicsStage } from './usePhysicsStage'

// Small tilts so the static labels look dropped onto the stage (before the physics starts)
const TILTS = [-5, 3, -2, 6, -4, 2, -6, 4]

// Phones: at most 6 skill labels (+ the two round marks), or the first 8 labels chosen in the admin
const PHONE_SKILLS = 6
const PHONE_LABELS = 8

/** Items of the pile: the labels chosen in the admin (stage 3C), in their order and shape. */
function adminItems(labels) {
  return labels.map((label, index) => ({
    key: `label-${index}-${label.text}`,
    text: label.text,
    orb: label.shape === 'circle',
    extra: index >= PHONE_LABELS,
  }))
}

/** Items of the pile without admin labels: featured skills with the round marks </> and * among them. */
function skillItems(skills) {
  const items = pickStageSkills(skills, 8).map((skill, index) => ({ key: skill.id, text: skill.name, extra: index >= PHONE_SKILLS }))
  // The round marks sit inside the pile, not at its edges
  items.splice(Math.min(2, items.length), 0, { key: 'orb-code', text: '</>', orb: true })
  items.splice(Math.min(6, items.length), 0, { key: 'orb-star', text: '*', orb: true })
  return items
}

/**
 * Stage on the right of the hero: blueprint frame with the labels chosen in the admin (Profil → "Label
 * panggung hero", stage 3C: at most 10, phones show the first 8) or, without them, the featured skills
 * (at most 8 on large screens and 6 on phones) and the two round marks </> and *. The static pile shows
 * first; once the stage is on screen the labels become physics labels (stage 3B): they drop in,
 * collide, can be dragged and thrown with a mouse, and tossed with a tap on touch screens. With reduced
 * motion the pile stays still. The caption follows the source: "Keahlian unggulan" for the skills,
 * "Yang saya kerjakan" for the admin labels (they may hold more than skills). While the profile loads
 * the pile stays empty and the caption keeps its place unseen (no swap from skills to the chosen
 * labels). Decorative (aria-hidden): the skills section lists the skills.
 */
function HeroStage({ labels = [], skills, pending = false, ready }) {
  const { t } = useI18n()
  const reducedMotion = usePrefersReducedMotion()
  const pageHidden = usePageHidden()
  const { play } = useSound()
  const stageRef = useRef(null)

  const useLabels = labels.length > 0
  let items = []
  if (!pending) items = useLabels ? adminItems(labels) : skillItems(skills)

  const onImpact = useCallback((impact) => play(impact), [play])
  usePhysicsStage(stageRef, {
    enabled: ready && !reducedMotion,
    rebuildKey: items.map((item) => item.text).join('|'),
    paused: pageHidden,
    onImpact,
  })

  return (
    <div ref={stageRef} className="pub-stage" aria-hidden="true" data-stage="labels">
      <p className={pending ? 'pub-stage-caption pub-hero-ph-hidden' : 'pub-stage-caption'}>
        {t(useLabels ? 'hero.stageCaptionLabels' : 'hero.stageCaption')}
      </p>
      <div className="pub-stage-pile">
        {items.map((item, position) => (
          <span
            key={item.key}
            className={item.orb ? 'pub-stage-orb' : 'pub-stage-label'}
            data-extra={item.extra ? 'true' : undefined}
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
