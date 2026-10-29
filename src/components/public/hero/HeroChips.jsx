import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useI18n } from '../../../i18n/i18nContext'
import { usePrefersReducedMotion } from '../../../lib/useMediaQuery'
import { useSound } from '../sound/soundContext'
import { createWorld, place, resize, settle, step } from './chipPhysics'

// Chips shown while "Label panggung hero" in the admin is empty (owner's brief, ID/EN in the dictionary)
const DEFAULT_CHIPS = ['hero.chip.uiux', 'hero.chip.city', 'hero.chip.name', 'hero.chip.role', 'hero.chip.study', 'hero.chip.focus']
const MAX_THROW = 28 // pixels per frame
const sameWord = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase()

function CodeMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m8 7-5 5 5 5" />
      <path d="m16 7 5 5-5 5" />
      <path d="m14 4-4 16" />
    </svg>
  )
}

function StarMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
      <path d="M12 3v18" />
      <path d="M4.2 7.5l15.6 9" />
      <path d="M4.2 16.5l15.6-9" />
    </svg>
  )
}

// Four-pointed star after the first name
function SparkMark() {
  return (
    <svg className="pub-hero-chip-spark" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2c.9 5.6 3.4 8.1 10 10-6.6 1.9-9.1 4.4-10 10-.9-5.6-3.4-8.1-10-10 6.6-1.9 9.1-4.4 10-10z" fill="currentColor" />
    </svg>
  )
}

/**
 * The chips of the hero: the labels of "Label panggung hero" in the admin (text only; without labels
 * the six default chips), the four-pointed star after the chip with the first name, and always two
 * round chips made by the code (black with </>, white with a star). Every chip is a button that can be
 * dragged and thrown with a mouse or finger, and jumps on click, Enter or Space; sounds come from the
 * shared sound module (on by default, only after a visitor gesture).
 *
 * The physics (chipPhysics.js) runs before the first frame, so the pile is already in place when the
 * page shows (no falling on load), and the loop only runs while something moves. With reduced motion
 * nothing moves by itself: a dragged chip drops into place at once and chips do not jump.
 * `labels` is null while the profile loads (the arena keeps its height, empty).
 */
function HeroChips({ labels, firstName }) {
  const { t } = useI18n()
  const { cue } = useSound()
  const reducedMotion = usePrefersReducedMotion()
  const arenaRef = useRef(null)
  const chipRefs = useRef([])
  const worldRef = useRef(createWorld())
  const frameRef = useRef(0)
  const suppressClickRef = useRef(false)
  const reducedRef = useRef(reducedMotion)
  const cueRef = useRef(cue)

  useEffect(() => {
    reducedRef.current = reducedMotion
    cueRef.current = cue
  }, [reducedMotion, cue])

  const items = useMemo(() => {
    if (!labels) return []
    const source = labels.length > 0 ? labels : DEFAULT_CHIPS.map((key) => ({ text: t(key), shape: 'tag' }))
    return [
      ...source.map((label, index) => ({
        key: `label-${index}`,
        kind: label.shape === 'circle' ? 'round' : 'tag',
        text: label.text,
        spark: label.shape !== 'circle' && Boolean(firstName) && sameWord(label.text, firstName),
      })),
      { key: 'code', kind: 'code', aria: t('hero.chip.codeName') },
      { key: 'star', kind: 'star', aria: t('hero.chip.starName') },
    ]
  }, [labels, firstName, t])
  const itemsKey = items.map((item) => `${item.kind}:${item.text ?? ''}`).join('|')

  const paint = useCallback(() => {
    worldRef.current.bodies.forEach((body, index) => {
      const el = chipRefs.current[index]
      if (!el) return
      const tilt = Math.max(-14, Math.min(14, body.vx * 1.6))
      body.r += (tilt - body.r) * 0.25
      el.style.transform = `translate(${body.x.toFixed(1)}px, ${body.y.toFixed(1)}px) rotate(${body.r.toFixed(2)}deg)`
    })
  }, [])

  // Reads the arena and chip sizes; a new set of chips starts from fresh positions
  const measure = useCallback(
    (fresh) => {
      const arena = arenaRef.current
      const world = worldRef.current
      if (!arena) return
      world.width = arena.clientWidth
      world.height = arena.clientHeight
      const sizes = chipRefs.current.slice(0, items.length).map((el) => ({ w: el?.offsetWidth ?? 0, h: el?.offsetHeight ?? 0 }))
      if (fresh || world.bodies.length !== sizes.length) place(world, sizes)
      else resize(world, sizes)
      if (!world.drag) settle(world)
      paint()
      arena.dataset.ready = 'true'
    },
    [items.length, paint]
  )

  // Before the first frame: chips placed and settled
  useLayoutEffect(() => {
    measure(true)
  }, [itemsKey, measure])

  // Font loaded, window resized, language changed the widths: measure again (no visible movement)
  useEffect(() => {
    if (typeof ResizeObserver === 'undefined' || !arenaRef.current) return undefined
    let pending = 0
    const observer = new ResizeObserver(() => {
      if (!pending) {
        pending = requestAnimationFrame(() => {
          pending = 0
          measure(false)
        })
      }
    })
    observer.observe(arenaRef.current)
    chipRefs.current.slice(0, items.length).forEach((el) => el && observer.observe(el))
    return () => {
      cancelAnimationFrame(pending)
      observer.disconnect()
    }
  }, [itemsKey, items.length, measure])

  useEffect(() => () => cancelAnimationFrame(frameRef.current), [])

  // The frame loop runs only while something moves or a chip is held
  const wake = useCallback(() => {
    if (frameRef.current) return
    let calm = 0
    const onHit = (index, strength) => cueRef.current('hit', { strength, source: `chip-${index}` })
    const loop = () => {
      const world = worldRef.current
      const energy = step(world, onHit)
      paint()
      calm = energy < 0.08 && !world.drag ? calm + 1 : 0
      if (calm > 40) {
        frameRef.current = 0
        return
      }
      frameRef.current = requestAnimationFrame(loop)
    }
    frameRef.current = requestAnimationFrame(loop)
  }, [paint])

  const localPoint = (event) => {
    const rect = arenaRef.current.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  const onPointerDown = (index) => (event) => {
    const body = worldRef.current.bodies[index]
    if (!body || event.button !== 0) return
    const point = localPoint(event)
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // capture is only a convenience
    }
    worldRef.current.drag = { index, ox: point.x - body.x, oy: point.y - body.y, sx: point.x, sy: point.y, moved: false }
    cue('pick')
    if (!reducedRef.current) wake()
  }

  const onPointerMove = (index) => (event) => {
    const world = worldRef.current
    const drag = world.drag
    if (!drag || drag.index !== index) return
    const body = world.bodies[index]
    const point = localPoint(event)
    if (Math.abs(point.x - drag.sx) + Math.abs(point.y - drag.sy) > 5) drag.moved = true
    const x = Math.max(0, Math.min(world.width - body.w, point.x - drag.ox))
    const y = Math.max(-260, Math.min(world.height - body.h, point.y - drag.oy))
    body.vx = Math.max(-MAX_THROW, Math.min(MAX_THROW, x - body.x))
    body.vy = Math.max(-MAX_THROW, Math.min(MAX_THROW, y - body.y))
    body.x = x
    body.y = y
    if (reducedRef.current) paint()
  }

  const onPointerUp = (index) => () => {
    const world = worldRef.current
    const drag = world.drag
    if (!drag || drag.index !== index) return
    world.drag = null
    suppressClickRef.current = drag.moved
    if (drag.moved) cue('drop')
    if (reducedRef.current) {
      settle(world)
      paint()
    } else {
      wake()
    }
  }

  const onClick = (index) => () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }
    const body = worldRef.current.bodies[index]
    if (!body || reducedRef.current) return
    body.vy = -15
    body.vx = (Math.random() - 0.5) * 8
    cue('jump')
    wake()
  }

  return (
    <div ref={arenaRef} className="pub-hero-arena" role="group" aria-label={t('hero.chipsLabel')}>
      {items.map((item, index) => (
        <button
          key={item.key}
          ref={(el) => {
            chipRefs.current[index] = el
          }}
          type="button"
          className={`pub-hero-chip pub-hero-chip--${item.kind}`}
          aria-label={t('hero.chipHint', { label: item.text ?? item.aria })}
          onPointerDown={onPointerDown(index)}
          onPointerMove={onPointerMove(index)}
          onPointerUp={onPointerUp(index)}
          onPointerCancel={onPointerUp(index)}
          onClick={onClick(index)}
        >
          {item.kind === 'code' && <CodeMark />}
          {item.kind === 'star' && <StarMark />}
          {item.text && <span>{item.text}</span>}
          {item.spark && <SparkMark />}
        </button>
      ))}
    </div>
  )
}

export default HeroChips
