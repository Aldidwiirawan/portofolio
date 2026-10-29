import { useCallback, useEffect, useRef, useState } from 'react'
import { useI18n } from '../../../i18n/i18nContext'
import { usePrefersReducedMotion } from '../../../lib/useMediaQuery'
import { useSound } from '../sound/soundContext'
import { onScreen } from '../useCoveredAreas'
import { createCat, stepCat } from './catSim'
import './CatPets.css'

const CATS = [
  { key: 'kopi', share: 0.22, offset: -70, hz: 620, says: 'cats.kopiSays', name: 'cats.kopiName' },
  { key: 'susu', share: 0.64, offset: 70, hz: 820, says: 'cats.susuSays', name: 'cats.susuName' },
]
const MAX_THROW = 30
// Elements a cat must not cover: when one is under it, the cat ducks out of sight until it moves on
const INTERACTIVE = 'a[href], button, input, select, textarea, label, summary, [role="button"], [tabindex]:not([tabindex="-1"])'
const CHECK_EVERY = 12 // frames between the checks of covered areas

/** Kopi (black) and Susu (white): same shape; the colors follow the theme, so dark mode swaps them. */
function CatArt({ white, leftEye, rightEye }) {
  return (
    <svg viewBox="0 0 120 112" aria-hidden="true" focusable="false">
      {white ? (
        <>
          <path className="pub-cat-tail pub-cat-s-fg" d="M98 104 C118 96 118 70 106 62" strokeWidth="11" />
          <path className="pub-cat-tail pub-cat-s-bg" d="M98 104 C118 96 118 70 106 62" strokeWidth="4.5" />
          <path d="M28 50 L34 14 L58 36 Z M92 50 L86 14 L62 36 Z" className="pub-cat-f-bg pub-cat-line" />
          <path d="M36 36 L38 24 L47 33 Z M84 36 L82 24 L73 33 Z" className="pub-cat-f-fg" />
          <path d="M22 112 C22 62 38 32 60 32 C82 32 98 62 98 112 Z" className="pub-cat-f-bg pub-cat-line" />
          <g className="pub-cat-blink">
            <ellipse cx="46" cy="64" rx="7" ry="8.5" className="pub-cat-f-fg" />
            <g ref={leftEye}>
              <circle cx="47.5" cy="62" r="2.4" className="pub-cat-f-bg" />
            </g>
          </g>
          <g className="pub-cat-blink">
            <ellipse cx="74" cy="64" rx="7" ry="8.5" className="pub-cat-f-fg" />
            <g ref={rightEye}>
              <circle cx="75.5" cy="62" r="2.4" className="pub-cat-f-bg" />
            </g>
          </g>
          <path d="M56.5 79 L63.5 79 L60 83 Z" className="pub-cat-f-fg" />
          <path d="M60 83 C58 88 54 88 52 85 M60 83 C62 88 66 88 68 85 M30 78 H44 M31 85 L44 82 M76 78 H90 M76 82 L89 85" className="pub-cat-s-fg" strokeWidth="2.4" />
          <ellipse cx="34" cy="106" rx="13" ry="8" className="pub-cat-f-bg pub-cat-line" />
          <ellipse cx="86" cy="106" rx="13" ry="8" className="pub-cat-f-bg pub-cat-line" />
        </>
      ) : (
        <>
          <path className="pub-cat-tail pub-cat-s-fg" d="M98 104 C118 96 118 70 106 62" strokeWidth="7" />
          <path d="M28 50 L34 14 L58 36 Z M92 50 L86 14 L62 36 Z" className="pub-cat-f-fg" />
          <path d="M36 36 L38 24 L47 33 Z M84 36 L82 24 L73 33 Z" className="pub-cat-f-bg" />
          <path d="M22 112 C22 62 38 32 60 32 C82 32 98 62 98 112 Z" className="pub-cat-f-fg" />
          <g className="pub-cat-blink">
            <ellipse cx="46" cy="64" rx="9" ry="10" className="pub-cat-f-bg" />
            <g ref={leftEye}>
              <circle cx="46" cy="65" r="5" className="pub-cat-f-fg" />
            </g>
          </g>
          <g className="pub-cat-blink">
            <ellipse cx="74" cy="64" rx="9" ry="10" className="pub-cat-f-bg" />
            <g ref={rightEye}>
              <circle cx="74" cy="65" r="5" className="pub-cat-f-fg" />
            </g>
          </g>
          <path d="M56.5 79 L63.5 79 L60 83 Z" className="pub-cat-f-bg" />
          <path d="M60 83 C58 88 54 88 52 85 M60 83 C62 88 66 88 68 85 M30 78 H44 M31 85 L44 82 M76 78 H90 M76 82 L89 85" className="pub-cat-s-bg" strokeWidth="2.4" />
          <ellipse cx="34" cy="106" rx="13" ry="8" className="pub-cat-f-fg" />
          <ellipse cx="86" cy="106" rx="13" ry="8" className="pub-cat-f-fg" />
        </>
      )}
    </svg>
  )
}

/**
 * Kopi and Susu at the bottom of the home page (owner's brief, phase 5). Without reduced motion they
 * peek (eyes follow the pointer, blink, tail wags), wander to random spots now and then and look at
 * the pointer, and follow it while it is in the lower 280 px of the screen (on touch screens: the last
 * touch there). Each cat is a button: drag it to make it dangle and meow softly, let go to throw it
 * (it falls, bounces, lands with a sound and meows after a hard fall); a click, Enter or Space makes it
 * jump with a speech bubble. With reduced motion they stay still (dragging still works, without the
 * fall). Smaller on phones.
 *
 * They never cover what matters: on the first screen they sit on top of the hero status bar, they
 * duck away while the contact form is on screen, a cat that ends up over a link, button or field
 * ducks until it walks on, and on phones both duck while the page scrolls. The guestbook button always stays above them.
 */
function CatPets() {
  const { t } = useI18n()
  const { cue } = useSound()
  const reducedMotion = usePrefersReducedMotion()
  const [talk, setTalk] = useState('')
  const [tucked, setTucked] = useState(false)
  const layerRef = useRef(null)
  const catRefs = useRef([])
  const flipRefs = useRef([])
  const pupilRefs = useRef([
    [null, null],
    [null, null],
  ])
  // Callback refs of the pupils, made once (they only write to pupilRefs when React attaches them)
  const [pupilSetters] = useState(() =>
    CATS.map((_, i) =>
      [0, 1].map((j) => (el) => {
        pupilRefs.current[i][j] = el
      })
    )
  )
  const catsRef = useRef(null)
  const pointerRef = useRef(null)
  const floorRef = useRef(0)
  const shyRef = useRef([false, false])
  const tapAtRef = useRef(0)
  const talkTimer = useRef(0)
  const stillRef = useRef(reducedMotion)
  const cueRef = useRef(cue)

  useEffect(() => {
    stillRef.current = reducedMotion
    cueRef.current = cue
  }, [reducedMotion, cue])

  const say = useCallback(
    (index) => {
      const cat = CATS[index]
      cueRef.current('meow', { hz: cat.hz })
      setTalk(cat.key)
      clearTimeout(talkTimer.current)
      talkTimer.current = setTimeout(() => setTalk(''), 1600)
    },
    []
  )

  useEffect(() => {
    const width = window.innerWidth
    catsRef.current = CATS.map((cat, index) => createCat(Math.max(10, Math.min(width - 130, cat.share * width)), index))
    const onPointer = (event) => {
      pointerRef.current = { x: event.clientX, y: event.clientY, at: performance.now() }
    }
    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('pointerdown', onPointer, { passive: true })
    // Phones: the cats duck while the page scrolls (they would cover the text going by) and come back
    // half a second after it stops
    const phone = window.matchMedia('(max-width: 619px)')
    let scrollTimer = 0
    const onScroll = () => {
      if (!phone.matches || !layerRef.current) return
      layerRef.current.dataset.scrolling = 'true'
      clearTimeout(scrollTimer)
      scrollTimer = setTimeout(() => {
        if (layerRef.current) delete layerRef.current.dataset.scrolling
      }, 500)
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    let frame = 0
    let tick = 0
    let lastTucked = false
    const loop = () => {
      frame = requestAnimationFrame(loop)
      const now = performance.now()
      const width = window.innerWidth
      const height = window.innerHeight
      const pointer = pointerRef.current
      tick += 1

      // Covered areas (every few frames): sit on the hero status bar while it is at the bottom of the
      // screen, duck while it is higher up or while the contact form is on screen
      if (tick % CHECK_EVERY === 0) {
        const strip = document.querySelector('.pub-hero-strip')
        const stripTop = onScreen(strip) ? strip.getBoundingClientRect().top : null
        const formShown = onScreen(document.querySelector('.pub-contact-form'))
        const nextTucked = formShown || (stripTop != null && stripTop < height * 0.55)
        // On the bar the whole cat stands above its top line (no peeking over the bar's text)
        const peek = catRefs.current[0] ? -parseFloat(getComputedStyle(catRefs.current[0]).bottom) || 0 : 0
        floorRef.current = stripTop != null && !nextTucked ? Math.max(0, height - stripTop + peek) : 0
        if (nextTucked !== lastTucked) {
          lastTucked = nextTucked
          setTucked(nextTucked)
        }
      }

      catsRef.current.forEach((cat, index) => {
        const el = catRefs.current[index]
        if (!el) return
        const catWidth = el.offsetWidth
        const walking = stepCat(
          cat,
          {
            width,
            catWidth,
            height: height - floorRef.current,
            pointer: lastTucked ? null : pointer,
            offset: CATS[index].offset,
            still: stillRef.current,
            now,
          },
          (strength) => {
            cueRef.current('land', { strength })
            if (strength > 0.5) setTimeout(() => cueRef.current('meow', { strength: 0.7, hz: CATS[index].hz }), 120)
          }
        )
        if (!walking && pointer && cat.mode !== 'air' && !stillRef.current) cat.dir = pointer.x > cat.x + catWidth / 2 ? 1 : -1
        const tilt = cat.mode === 'air' ? Math.max(-25, Math.min(25, cat.vx * 1.5)) : 0
        el.style.transform = `translate(${cat.x.toFixed(1)}px, ${(-(cat.y + floorRef.current)).toFixed(1)}px) rotate(${tilt.toFixed(1)}deg)`
        const state = cat.mode === 'held' ? 'held' : cat.mode === 'air' ? 'air' : walking ? 'walk' : 'idle'
        if (el.dataset.state !== state) el.dataset.state = state
        const flip = flipRefs.current[index]
        if (flip && flip.dataset.dir !== String(cat.dir)) {
          flip.dataset.dir = String(cat.dir)
          flip.style.transform = `scaleX(${cat.dir})`
        }

        // A cat over a link, button or field ducks until it moves on (not while it is held or flying)
        if (tick % CHECK_EVERY === index * 6 && cat.mode !== 'held' && cat.mode !== 'air') {
          const rect = el.getBoundingClientRect()
          const top = Math.max(rect.top, 0) + 12
          const points = [
            [rect.left + rect.width / 2, top],
            [rect.left + rect.width * 0.25, top + 10],
            [rect.left + rect.width * 0.75, top + 10],
          ]
          const shy = !lastTucked && points.some(([x, y]) =>
            document.elementsFromPoint(x, y).some((node) => !node.closest('.pub-pets, .pub-gb-fab') && node.closest(INTERACTIVE))
          )
          if (shy !== shyRef.current[index]) {
            shyRef.current[index] = shy
            el.dataset.shy = shy ? 'true' : ''
          }
        }

        // Eyes follow the pointer for a moment after it moves
        if (pointer && now - pointer.at < 1500 && !stillRef.current) {
          pupilRefs.current[index].forEach((pupil) => {
            if (!pupil?.parentNode) return
            const box = pupil.parentNode.getBoundingClientRect()
            const cx = box.left + box.width / 2
            const cy = box.top + box.height / 2
            const angle = Math.atan2(pointer.y - cy, pointer.x - cx)
            const reach = Math.min(1, Math.hypot(pointer.x - cx, pointer.y - cy) / 160) * (index === 0 ? 4 : 2.6)
            pupil.style.transform = `translate(${(Math.cos(angle) * reach * cat.dir).toFixed(2)}px, ${(Math.sin(angle) * reach).toFixed(2)}px)`
          })
        }
      })
    }
    frame = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(talkTimer.current)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('scroll', onScroll)
      clearTimeout(scrollTimer)
    }
  }, [])

  const onPointerDown = (index) => (event) => {
    const cat = catsRef.current?.[index]
    if (!cat || event.button !== 0) return
    event.preventDefault()
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // capture is only a convenience
    }
    cat.mode = 'held'
    cat.grab = { sx: event.clientX, sy: event.clientY, x0: cat.x, y0: cat.y, lx: event.clientX, ly: event.clientY, moved: false }
    cue('meow', { strength: 0.5, hz: CATS[index].hz })
  }

  const onPointerMove = (index) => (event) => {
    const cat = catsRef.current?.[index]
    if (!cat || cat.mode !== 'held' || !cat.grab) return
    const grab = cat.grab
    const catWidth = catRefs.current[index]?.offsetWidth ?? 116
    cat.x = Math.max(0, Math.min(window.innerWidth - catWidth, grab.x0 + (event.clientX - grab.sx)))
    cat.y = Math.max(0, grab.y0 - (event.clientY - grab.sy))
    cat.vx = event.clientX - grab.lx
    cat.vy = -(event.clientY - grab.ly)
    grab.lx = event.clientX
    grab.ly = event.clientY
    if (Math.abs(event.clientX - grab.sx) + Math.abs(event.clientY - grab.sy) > 6) grab.moved = true
  }

  const onPointerUp = (index) => () => {
    const cat = catsRef.current?.[index]
    if (!cat || cat.mode !== 'held') return
    const grab = cat.grab
    cat.grab = null
    tapAtRef.current = performance.now()
    if (!grab?.moved) {
      // A tap: jump and say hello
      say(index)
      if (stillRef.current) cat.mode = 'idle'
      else Object.assign(cat, { mode: 'air', vx: 0, vy: 12 })
      return
    }
    if (stillRef.current) {
      Object.assign(cat, { mode: 'idle', y: 0, vx: 0, vy: 0 })
      return
    }
    cat.mode = 'air'
    cat.vx = Math.max(-MAX_THROW, Math.min(MAX_THROW, cat.vx))
    cat.vy = Math.max(-MAX_THROW, Math.min(MAX_THROW, cat.vy))
  }

  // Keyboard (Enter, Space) and clicks without a pointer press before them
  const onClick = (index) => () => {
    if (performance.now() - tapAtRef.current < 400) return
    const cat = catsRef.current?.[index]
    if (!cat) return
    say(index)
    if (!stillRef.current) Object.assign(cat, { mode: 'air', vx: 0, vy: 12 })
  }

  const talking = CATS.find((cat) => cat.key === talk)

  return (
    <div ref={layerRef} className="pub-pets" data-tucked={tucked || undefined}>
      {CATS.map((cat, index) => (
        <div
          key={cat.key}
          ref={(el) => {
            catRefs.current[index] = el
          }}
          className={`pub-cat pub-cat--${cat.key}`}
          data-state="idle"
        >
          {talk === cat.key && (
            <span className="pub-cat-bubble" aria-hidden="true">
              {t(cat.says)}
            </span>
          )}
          <button
            type="button"
            className="pub-cat-button"
            aria-label={t('cats.label', { name: t(cat.name) })}
            tabIndex={tucked ? -1 : undefined}
            onPointerDown={onPointerDown(index)}
            onPointerMove={onPointerMove(index)}
            onPointerUp={onPointerUp(index)}
            onPointerCancel={onPointerUp(index)}
            onClick={onClick(index)}
          >
            <span
              className="pub-cat-flip"
              ref={(el) => {
                flipRefs.current[index] = el
              }}
            >
              <span className="pub-cat-bob">
                <CatArt white={cat.key === 'susu'} leftEye={pupilSetters[index][0]} rightEye={pupilSetters[index][1]} />
              </span>
            </span>
          </button>
        </div>
      ))}
      <p className="pub-sr-only" aria-live="polite">
        {talking ? t(talking.says) : ''}
      </p>
    </div>
  )
}

export default CatPets
