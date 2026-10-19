import { Fragment, useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../../../lib/useMediaQuery'
import { usePageHidden } from '../../../lib/usePageHidden'
import { useI18n } from '../../../i18n/i18nContext'
import Phrase from '../Phrase'

const INTERVAL_MS = 2600

/**
 * "Membangun ▸ aplikasi web": cycles through the profile's hero keywords. Screen readers get the
 * whole list once (the moving word is hidden from them). Stops while the tab is hidden or the hero is
 * off screen; with reduced motion all keywords stay visible and still. `langs[n]` is the lang
 * attribute of word n ('id' for an Indonesian word on the English page).
 */
function KeywordRotator({ words, langs = [] }) {
  const { t } = useI18n()
  const reduced = usePrefersReducedMotion()
  const pageHidden = usePageHidden()
  const [index, setIndex] = useState(0)
  const [onScreen, setOnScreen] = useState(true)
  const ref = useRef(null)
  const moving = !reduced && !pageHidden && onScreen && words.length > 1

  useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') return undefined
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting))
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!moving) return undefined
    const timer = setInterval(() => setIndex((value) => value + 1), INTERVAL_MS)
    return () => clearInterval(timer)
  }, [moving])

  const current = index % words.length
  const list = words.map((word, position) => (
    <Fragment key={position}>
      {position > 0 && ', '}
      <span lang={langs[position]}>{word}</span>
    </Fragment>
  ))

  return (
    <p ref={ref} className="pub-hero-keywords">
      <span className="pub-sr-only">
        <Phrase id="hero.keywordsLabel" vars={{ list: <>{list}</> }} />
      </span>
      <span className="pub-hero-keywords-visual" aria-hidden="true">
        <span className="pub-hero-keywords-lead">{t('hero.building')}</span>
        <span className="pub-hero-keywords-caret">▸</span>
        {reduced ? (
          <span className="pub-hero-keywords-word">{words.join(' · ')}</span>
        ) : (
          <span key={index} className="pub-hero-keywords-word pub-hero-keywords-word--enter" lang={langs[current]}>
            {words[current]}
          </span>
        )}
      </span>
    </p>
  )
}

export default KeywordRotator
