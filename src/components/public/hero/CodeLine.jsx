import { useI18n } from '../../../i18n/i18nContext'

// Keywords, strings and punctuation get their own color; the rest stays plain
const TOKEN = /("[^"]*"|\b(?:const|async|await)\b|=>|[{}();=:,.])/
const kindOf = (part) => {
  if (part.startsWith('"')) return 'pub-code-string'
  if (/^(?:const|async|await)$/.test(part)) return 'pub-code-keyword'
  if (/^(?:=>|[{}();=:,.])$/.test(part)) return 'pub-code-punct'
  return null
}

/**
 * The line of code under the name (owner's brief), typed once when the page opens (CSS, see Hero.css;
 * shown whole at once with reduced motion or without animation support). Decorative: the same facts
 * are in the about section, so screen readers skip it.
 */
function CodeLine() {
  const { t } = useI18n()
  const parts = t('hero.code').split(TOKEN).filter(Boolean)
  return (
    <p className="pub-hero-code" aria-hidden="true">
      <span className="pub-hero-code-text">
        {parts.map((part, index) => {
          const kind = kindOf(part)
          return kind ? (
            <span key={index} className={kind}>
              {part}
            </span>
          ) : (
            part
          )
        })}
      </span>
    </p>
  )
}

export default CodeLine
