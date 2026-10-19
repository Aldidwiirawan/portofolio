import { useEffect, useRef, useState } from 'react'
import Logo from '../../brand/Logo'
import { prefersReducedMotion } from '../../../lib/useMediaQuery'
import { readStorage, writeStorage } from '../../../lib/safeStorage'
import { emitInteraction } from '../interactionBus'
import './IntroScreen.css'

const INTRO_STORAGE_KEY = 'aldi-portfolio-intro'
const LOGO_SIZE = 116 // trimmed logo: a multiple of 58 px is sharp, and 116 → 29 (navbar) is exactly ¼
// The timeline itself is CSS (IntroScreen.css): assemble 0–720 ms, fly and fade 720–980 ms
const TOTAL_MS = 980
const LEAVE_MS = 160
const SKIP_EVENTS = ['pointerdown', 'keydown', 'wheel', 'touchstart']
// A page that took this long to show up (slow phone or connection) goes straight to the content: the
// visitor has waited enough
const LATE_START_MS = 1500
const CORNERS = [
  ['tl', -1, -1],
  ['tr', 1, -1],
  ['bl', -1, 1],
  ['br', 1, 1],
]

/**
 * First public page of this browser session, motion allowed, the tab visible (not a background tab) and
 * the page ready quickly enough.
 */
function shouldPlay() {
  if (typeof document === 'undefined' || document.visibilityState !== 'visible') return false
  if (performance.now() > LATE_START_MS) return false
  if (prefersReducedMotion()) return false
  return readStorage(INTRO_STORAGE_KEY, 'session') !== '1'
}

/**
 * Opening screen (BRIEF §5): the logo assembles itself in the middle of the screen while brackets close
 * in from the corners, then it flies into the navbar logo as the screen fades (about 1 s). Only on the
 * first public page of a browser session; skipped with reduced motion, in a background tab, or when the
 * page took more than 1.5 s to show up (slow device or connection). The page loads and renders
 * underneath the whole time. The timeline runs as CSS animations of transform and opacity, so the
 * screen clears on time even while the device is busy rendering the page. A click, tap, key or wheel
 * ends it at once (Tab still moves focus). Decorative: aria-hidden and never focusable.
 */
function IntroScreen() {
  const [phase, setPhase] = useState(() => (shouldPlay() ? 'play' : 'done')) // play | leave | done
  const rootRef = useRef(null)
  const logoRef = useRef(null)
  const playedRef = useRef(phase !== 'done')
  const playing = phase !== 'done'

  // Where the navbar logo is: the CSS fly (at 720 ms) lands there. Measured in the frame after the
  // first paint, when the layout is already done, instead of forcing one before it (stage 3C: the
  // first paint of the page comes sooner)
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const root = rootRef.current
      const from = logoRef.current?.getBoundingClientRect()
      const to = document.querySelector('.pub-nav-brand .brand-logo')?.getBoundingClientRect()
      if (!root || !from || !to || to.width === 0) return
      root.style.setProperty('--fly-x', `${to.left + to.width / 2 - (from.left + from.width / 2)}px`)
      root.style.setProperty('--fly-y', `${to.top + to.height / 2 - (from.top + from.height / 2)}px`)
      root.style.setProperty('--fly-s', String(to.width / from.width))
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  // Remember for this session as soon as it starts (a reload during the intro does not replay it)
  useEffect(() => {
    if (playing) writeStorage(INTRO_STORAGE_KEY, '1', 'session')
  }, [playing])

  // Tell the decorative pieces waiting for the intro (physics labels) that the page is now in view
  useEffect(() => {
    if (phase === 'done' && playedRef.current) {
      playedRef.current = false
      emitInteraction('intro-done')
    }
  }, [phase])

  // The fly ends on animationend (below); these timers are the fallback and the end of a skip
  useEffect(() => {
    if (phase === 'done') return undefined
    const timer = setTimeout(() => setPhase('done'), phase === 'play' ? TOTAL_MS + 400 : LEAVE_MS)
    return () => clearTimeout(timer)
  }, [phase])

  // Any click, tap, key or wheel skips it; a tab switch ends it
  useEffect(() => {
    if (phase !== 'play') return undefined
    const skip = () => setPhase('leave')
    const onVisibility = () => {
      if (document.hidden) setPhase('done')
    }
    SKIP_EVENTS.forEach((type) => window.addEventListener(type, skip, { capture: true, passive: true }))
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      SKIP_EVENTS.forEach((type) => window.removeEventListener(type, skip, { capture: true }))
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [phase])

  if (!playing) return null

  return (
    <div ref={rootRef} className="pub-intro" data-phase={phase} aria-hidden="true">
      <div className="pub-intro-backdrop" />
      <div
        ref={logoRef}
        className="pub-intro-logo"
        onAnimationEnd={(event) => {
          // Landed on the navbar logo: the overlay goes, the navbar logo stays
          if (event.target === event.currentTarget && event.animationName === 'pub-intro-fly') setPhase('done')
        }}
      >
        <Logo size={LOGO_SIZE} trim assemble />
      </div>
      {CORNERS.map(([key, x, y]) => (
        <span key={key} className={`pub-intro-corner pub-intro-corner--${key}`} style={{ '--x': x, '--y': y }} />
      ))}
    </div>
  )
}

export default IntroScreen
