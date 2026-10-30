import { useI18n } from '../../../i18n/i18nContext'

/** Technology tags; with `max`, the rest is folded into a "+n" tag (its full meaning for screen readers). */
function TechList({ items, max, className = '', label }) {
  const { t } = useI18n()
  if (!items?.length) return null
  const shown = max ? items.slice(0, max) : items
  const rest = items.length - shown.length

  return (
    <ul className={`pub-chips ${className}`.trim()} aria-label={label || t('projects.techLabel')}>
      {shown.map((item) => (
        <li key={item} className="pub-chip">
          {item}
        </li>
      ))}
      {rest > 0 && (
        <li className="pub-chip pub-chip--more">
          <span aria-hidden="true">{t('projects.moreTech', { n: rest })}</span>
          <span className="pub-sr-only">{t('projects.moreTechLabel', { n: rest })}</span>
        </li>
      )}
    </ul>
  )
}

export default TechList
