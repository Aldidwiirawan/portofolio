import { useI18n } from '../../../i18n/i18nContext'
import { pickStageSkills } from '../skillGroups'

// Small tilts so the labels look dropped onto the stage (they become physics labels in stage 3B)
const TILTS = [-5, 3, -2, 6, -4, 2, -6, 4]

/**
 * Stage on the right of the hero: blueprint frame with a pile of skill labels (featured skills,
 * at most 8 on large screens and 6 on phones) and the two round marks </> and *. Static in 3A; in
 * 3B the labels can be dragged and thrown. Decorative (aria-hidden): the skills section lists them.
 */
function HeroStage({ skills }) {
  const { t } = useI18n()
  const labels = pickStageSkills(skills, 8)
  const items = labels.map((skill, index) => ({ key: skill.id, text: skill.name, index }))
  // The round marks sit inside the pile, not at its edges
  items.splice(Math.min(2, items.length), 0, { key: 'orb-code', text: '</>', orb: true })
  items.splice(Math.min(6, items.length), 0, { key: 'orb-star', text: '*', orb: true })

  return (
    <div className="pub-stage" aria-hidden="true" data-stage="labels">
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
