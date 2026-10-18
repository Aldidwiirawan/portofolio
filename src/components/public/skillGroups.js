import { SKILL_CATEGORY_KEYS } from '../../i18n/translate'

/**
 * Skills grouped by category, in the fixed category order (Frontend, Backend, Mobile, Database,
 * Jaringan & IT Support, Tools, Soft skill), unknown categories after them. Inside a group the order
 * of the data (sort_order, then name) is kept.
 * @returns {Array<{ category: string, skills: Array<Object> }>}
 */
export function groupSkills(skills) {
  const groups = new Map()
  for (const skill of skills) {
    const category = skill.category?.trim() || 'Tools'
    if (!groups.has(category)) groups.set(category, [])
    groups.get(category).push(skill)
  }
  const known = Object.keys(SKILL_CATEGORY_KEYS).filter((category) => groups.has(category))
  const unknown = [...groups.keys()].filter((category) => !(category in SKILL_CATEGORY_KEYS))
  return [...known, ...unknown].map((category) => ({ category, skills: groups.get(category) }))
}

/**
 * Labels for the hero stage: featured skills (all skills when none is featured), taken in turns from
 * each category so the stage shows the whole range (programming and IT support), at most `max`.
 */
export function pickStageSkills(skills, max = 8) {
  const featured = skills.filter((skill) => skill.is_featured)
  const lists = groupSkills(featured.length > 0 ? featured : skills).map((group) => group.skills)
  const picked = []
  for (let round = 0; picked.length < max && lists.some((list) => list[round]); round += 1) {
    for (const list of lists) {
      if (list[round] && picked.length < max) picked.push(list[round])
    }
  }
  return picked
}
