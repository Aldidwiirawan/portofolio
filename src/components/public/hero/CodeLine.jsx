import { useEffect, useState } from 'react'
import { useI18n } from '../../../i18n/i18nContext'
import { usePrefersReducedMotion } from '../../../lib/useMediaQuery'

// Keywords, strings, comments and punctuation get their own color; the rest stays plain
const TOKEN = /("[^"]*"|\/\/[^\n<]*|<END_OF_SCRIPT>|\b(?:const|async|await|return|if)\b|=>|[{}();=:,.])/
const kindOf = (part) => {
  if (part.startsWith('"')) return 'pub-code-string'
  if (part.startsWith('//') || part === '<END_OF_SCRIPT>') return 'pub-code-comment'
  if (/^(?:const|async|await|return|if)$/.test(part)) return 'pub-code-keyword'
  if (/^(?:=>|[{}();=:,.])$/.test(part)) return 'pub-code-punct'
  return null
}

/**
 * The line of code under the name: thin typography matching the reference,
 * typing character-by-character from left to right like someone typing code on a terminal.
 */
function CodeLine() {
  const { t } = useI18n()
  const rawCode = t('hero.code')
  const reducedMotion = usePrefersReducedMotion()
  const [length, setLength] = useState(() => (reducedMotion ? rawCode.length : 0))

  useEffect(() => {
    if (reducedMotion) {
      return undefined
    }

    let current = 0
    const timer = setInterval(() => {
      current += 3
      if (current >= rawCode.length) {
        setLength(rawCode.length)
        clearInterval(timer)
      } else {
        setLength(current)
      }
    }, 18)

    return () => clearInterval(timer)
  }, [rawCode, reducedMotion])

  const visibleText = rawCode.slice(0, length)
  const isTyping = length < rawCode.length
  const parts = visibleText.split(TOKEN).filter(Boolean)

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
      {isTyping && <span className="pub-code-cursor">▎</span>}
    </p>
  )
}

export default CodeLine
