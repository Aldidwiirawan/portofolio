import { useEffect, useState } from 'react'
import { useI18n } from '../../../i18n/i18nContext'

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
 * The line of code under the name: subtle, camouflaged background typography,
 * typing character-by-character from left to right like someone typing code on a terminal.
 * After reaching the end (<END_OF_SCRIPT>), it pauses for 5 seconds, then repeats typing from 'const'.
 */
function CodeLine() {
  const { t } = useI18n()
  const rawCode = t('hero.code')
  const [charCount, setCharCount] = useState(0)

  useEffect(() => {
    let intervalId = null
    let pauseTimeoutId = null
    let isDisposed = false

    const startTyping = () => {
      setCharCount(0)
      let current = 0

      intervalId = setInterval(() => {
        if (isDisposed) return
        current += 1
        if (current >= rawCode.length) {
          setCharCount(rawCode.length)
          clearInterval(intervalId)
          intervalId = null

          // Tunggu 5 detik di ujung, lalu ulangi mengetik dari awal (const)
          pauseTimeoutId = setTimeout(() => {
            if (!isDisposed) {
              startTyping()
            }
          }, 5000)
        } else {
          setCharCount(current)
        }
      }, 14)
    }

    startTyping()

    return () => {
      isDisposed = true
      if (intervalId) clearInterval(intervalId)
      if (pauseTimeoutId) clearTimeout(pauseTimeoutId)
    }
  }, [rawCode])

  const visibleText = rawCode.slice(0, charCount)
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
      <span className="pub-code-cursor">▎</span>
    </p>
  )
}

export default CodeLine

