import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { usePageHidden } from '../../../lib/usePageHidden'
import { useI18n } from '../../../i18n/i18nContext'
import { StarIcon } from '../icons'
import TechLogo from './TechLogo'

const SPEED = 36 // px per second, the same for every row
const TOUCH_RESUME_MS = 2500

function SkillItems({ skills, paths }) {
  const { t } = useI18n()
  return skills.map((skill) => (
    <li key={skill.id} className="pub-skill" data-featured={skill.is_featured || undefined}>
      <TechLogo skill={skill} paths={paths} />
      <span>{skill.name}</span>
      {skill.is_featured && (
        <>
          <StarIcon size={14} className="pub-skill-star" />
          <span className="pub-sr-only">({t('skills.featured')})</span>
        </>
      )}
    </li>
  ))
}

/**
 * One row of skills that slowly runs sideways (BRIEF §5 "Tampilan keahlian").
 * - The first list is the real one; the copies needed for a seamless loop are aria-hidden, so screen
 *   readers read every skill once.
 * - Enough copies are made to fill the row at any width, and every row moves at the same speed.
 * - Stops on hover, while touched, when `paused` (the section's "Hentikan gerak" button), while the
 *   tab is hidden and while the row is off screen. With `still` (reduced motion) there are no copies:
 *   the list wraps and does not move.
 */
function SkillMarquee({ skills, paths, reverse = false, paused = false, still = false, label }) {
  const viewportRef = useRef(null)
  const listRef = useRef(null)
  const [metrics, setMetrics] = useState(null) // { copies, shift }
  const [onScreen, setOnScreen] = useState(false)
  const [touched, setTouched] = useState(false)
  const touchTimer = useRef(0)
  const pageHidden = usePageHidden()

  useLayoutEffect(() => {
    if (still) return undefined
    const viewport = viewportRef.current
    const list = listRef.current
    if (!viewport || !list || typeof ResizeObserver === 'undefined') return undefined
    const measure = () => {
      const gap = parseFloat(getComputedStyle(list).columnGap) || 0
      const shift = list.getBoundingClientRect().width + gap
      if (shift <= gap) return
      const copies = Math.max(1, Math.ceil(viewport.clientWidth / shift))
      setMetrics((prev) => (prev && prev.copies === copies && Math.abs(prev.shift - shift) < 0.5 ? prev : { copies, shift }))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    observer.observe(list)
    return () => observer.disconnect()
  }, [still, skills, paths])

  useEffect(() => {
    const node = viewportRef.current
    if (still || !node || typeof IntersectionObserver === 'undefined') return undefined
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { rootMargin: '64px 0px' })
    observer.observe(node)
    return () => observer.disconnect()
  }, [still])

  useEffect(() => () => clearTimeout(touchTimer.current), [])

  const onPointerDown = (event) => {
    if (event.pointerType !== 'touch') return
    clearTimeout(touchTimer.current)
    setTouched(true)
  }
  const onPointerUp = (event) => {
    if (event.pointerType !== 'touch') return
    clearTimeout(touchTimer.current)
    touchTimer.current = setTimeout(() => setTouched(false), TOUCH_RESUME_MS)
  }

  if (still) {
    return (
      <div className="pub-marquee" data-still="true">
        <ul className="pub-marquee-list" aria-label={label}>
          <SkillItems skills={skills} paths={paths} />
        </ul>
      </div>
    )
  }

  const running = Boolean(metrics) && onScreen && !paused && !touched && !pageHidden
  const style = metrics
    ? { '--marquee-shift': `${-metrics.shift}px`, '--marquee-duration': `${(metrics.shift / SPEED).toFixed(2)}s` }
    : undefined

  return (
    <div
      ref={viewportRef}
      className="pub-marquee"
      data-running={running}
      data-reverse={reverse || undefined}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="pub-marquee-track" style={style}>
        <ul ref={listRef} className="pub-marquee-list" aria-label={label}>
          <SkillItems skills={skills} paths={paths} />
        </ul>
        {metrics &&
          Array.from({ length: metrics.copies }, (_, copy) => (
            <ul key={copy} className="pub-marquee-list" aria-hidden="true">
              <SkillItems skills={skills} paths={paths} />
            </ul>
          ))}
      </div>
    </div>
  )
}

export default SkillMarquee
