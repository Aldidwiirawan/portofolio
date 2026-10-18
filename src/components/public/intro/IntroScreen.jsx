import { useEffect, useRef, useState } from 'react'
import Logo from '../../brand/Logo'
import { prefersReducedMotion } from '../../../lib/useMediaQuery'
import { readStorage, writeStorage } from '../../../lib/safeStorage'
import { emitInteraction } from '../interactionBus'
import './IntroScreen.css'

const INTRO_STORAGE_KEY = 'aldi-portfolio-intro'
const LOGO_SIZE = 116 // trimmed logo: a multiple of 58 px is sharp, and 116 → 29 (navbar) is exactly ¼
const ASSEMBLE_MS = 720 // Logo assemble is 600 ms + 7 × 25 ms stagger; the last piece is nearly home by then
const FLY_MS = 260
const LEAVE_MS = 160
const SKIP_EVENTS = ['pointerdown', 'keydown', 'wheel', 'touchstart']
const CORNERS = [
  ['tl', -1, -1],
  ['tr', 1, -1],
  ['bl', -1, 1],
  ['br', 1, 1],
]

/** First public page of this browser session, motion allowed and the tab visible (not a background tab). */
function shouldPlay() {
  if (typeof document === 'undefined' || document.visibilityState !== 'visible') return false
  if (prefersReducedMotion()) return false
  return readStorage(INTRO_STORAGE_KEY, 'session') !== '1'
}

/**
 * Opening screen (BRIEF §5): the logo assembles itself in the middle of the screen while brackets close
 * in from the corners, then it flies into the navbar logo as the screen fades (about 1 s). Only on the
 * first public page of a browser session; skipped with reduced motion or in a background tab. The page
 * loads and renders underneath the whole time; a click, tap, key or wheel ends the intro at once (Tab
 * still moves focus). Decorative: aria-hidden and never focusable.
 */
function IntroScreen() {
  const [phase, setPhase] = useState(() => (shouldPlay() ? 'assemble' : 'done')) // assemble | fly | leave | done
  const [fly, setFly] = useState(null)
  const logoRef = useRef(null)
  const playedRef = useRef(phase !== 'done')
  const playing = phase !== 'done'

  // Tell the decorative pieces waiting for the intro (physics labels) that the page is now in view
  useEffect(() => {
    if (phase === 'done' && playedRef.current) {
      playedRef.current = false
      emitInteraction('intro-done')
    }
  }, [phase])

  // Remember for this session as soon as it starts (a reload during the intro does not replay it)
  useEffect(() => {
    if (playing) writeStorage(INTRO_STORAGE_KEY, '1', 'session')
  }, [playing])

  // Timeline: assemble → fly into the navbar logo → done
  useEffect(() => {
    if (phase === 'assemble') {
      const timer = setTimeout(() => {
        const from = logoRef.current?.getBoundingClientRect()
        const to = document.querySelector('.pub-nav-brand .brand-logo')?.getBoundingClientRect()
        if (from && to && to.width > 0) {
          setFly({
            x: to.left + to.width / 2 - (from.left + from.width / 2),
            y: to.top + to.height / 2 - (from.top + from.height / 2),
            scale: to.width / from.width,
          })
          setPhase('fly')
        } else {
          setPhase('leave')
        }
      }, ASSEMBLE_MS)
      return () => clearTimeout(timer)
    }
    if (phase === 'fly' || phase === 'leave') {
      // The fly ends on transitionend (below); this is only the fallback
      const timer = setTimeout(() => setPhase('done'), phase === 'fly' ? FLY_MS + 200 : LEAVE_MS)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [phase])

  // Any click, tap, key or wheel skips it; a tab switch ends it
  useEffect(() => {
    if (phase !== 'assemble') return undefined
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
    <div className="pub-intro" data-phase={phase} aria-hidden="true">
      <div className="pub-intro-backdrop" />
      <div
        ref={logoRef}
        className="pub-intro-logo"
        style={fly ? { transform: `translate(${fly.x}px, ${fly.y}px) scale(${fly.scale})` } : undefined}
        onTransitionEnd={(event) => {
          // Landed exactly on the navbar logo: the overlay goes, the navbar logo stays
          if (phase === 'fly' && event.target === event.currentTarget && event.propertyName === 'transform') setPhase('done')
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
