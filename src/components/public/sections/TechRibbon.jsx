import { useI18n } from '../../../i18n/i18nContext'
import { usePublicData } from '../publicContexts'
import { groupSkills } from '../skillGroups'
import './TechRibbon.css'

// Each row repeats its words until it is wider than any screen, so its ends never show while it moves
const MIN_WORDS = 12
const repeatTo = (words) => {
  if (words.length === 0) return []
  const out = []
  while (out.length < MIN_WORDS) out.push(...words)
  return out
}

/**
 * Two lines of large text between "Tentang" and "Proyek": the featured skills (outlined) and the
 * skill categories (filled). They slide in opposite directions while the page scrolls (CSS
 * scroll-driven animation, no motion by itself; still with reduced motion or without support).
 * Decorative: the same words are in the tech stack card.
 */
function TechRibbon() {
  const data = usePublicData()
  const { skillCategory } = useI18n()
  const skills = data.skills.data
  const featured = skills.filter((skill) => skill.is_featured)
  const top = repeatTo((featured.length > 0 ? featured : skills).slice(0, 8).map((skill) => skill.name))
  const bottom = repeatTo(groupSkills(skills).map((group) => skillCategory(group.category)))
  if (top.length === 0) return null

  return (
    <div className="pub-ribbon" aria-hidden="true">
      <p className="pub-ribbon-line pub-ribbon-line--outline">{top.join(' · ')}</p>
      <p className="pub-ribbon-line pub-ribbon-line--fill">{bottom.join(' · ')}</p>
    </div>
  )
}

export default TechRibbon
