import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Logo from '../brand/Logo'
import { prefersReducedMotion } from '../../lib/useMediaQuery'
import { ShutterContext } from './shutterContext'
import './ShutterTransition.css'

// Timeline (ms). Brackets close in, the logo assembles, the curtains shut; navigation happens
// behind the closed curtains, then they open on the destination page.
const COVERED_AT_MS = 600
const FLASH_MS = 120
const OPEN_MS = 280
const READY_TIMEOUT_MS = 2500
const READY_POLL_MS = 50
const STATUS_CLEAR_MS = 4000

function clearTimers(run) {
  run.timers.forEach(clearTimeout)
  run.timers = []
}

function cover(run) {
  if (run.covered) return
  run.covered = true
  try {
    run.onCovered?.()
  } catch (error) {
    console.error(error)
  }
}

function focusDestination(selector) {
  requestAnimationFrame(() => {
    const el = document.querySelector(selector)
    if (!(el instanceof HTMLElement)) return
    if (!el.hasAttribute('tabindex') && !el.matches('a[href], button, input, select, textarea')) {
      el.setAttribute('tabindex', '-1')
      el.addEventListener('blur', () => el.removeAttribute('tabindex'), { once: true })
    }
    el.focus({ preventScroll: true })
  })
}

/**
 * Camera-shutter page transition. Mount once around the routes (outside <Suspense>) so the
 * overlay survives while the next page loads.
 *
 * runShutter({ onCovered, isReady, message, focusSelector })
 * - onCovered(): called once when the screen is covered; navigate here.
 * - isReady(): polled after onCovered; the curtains open when it returns true (max 2.5 s).
 * - message: announced in a polite status region (e.g. "Berhasil masuk. Membuka beranda…").
 * - focusSelector: element focused on the destination page when done (default 'h1').
 *
 * Click or Escape skips the animation. With reduced motion there is no overlay at all:
 * navigation happens at once and focus still moves to the destination heading.
 *
 * Use it from a page with useShutter() (./shutterContext).
 */
function ShutterProvider({ children }) {
  const [phase, setPhase] = useState('idle') // idle | closing | covered | opening
  const [status, setStatus] = useState('')
  const runRef = useRef(null)

  const complete = useCallback((run) => {
    if (run.done) return
    run.done = true
    clearTimers(run)
    if (runRef.current === run) runRef.current = null
    setPhase('idle')
    focusDestination(run.focusSelector)
    run.statusTimer = setTimeout(() => setStatus(''), STATUS_CLEAR_MS)
  }, [])

  // Polls isReady() and resolves the step once it is true (or after the timeout)
  const whenReady = useCallback((run, minDelay, next) => {
    const start = performance.now()
    const token = (run.waitToken = (run.waitToken || 0) + 1)
    const tick = () => {
      if (run.done || token !== run.waitToken) return
      const elapsed = performance.now() - start
      let ready = false
      try {
        ready = Boolean(run.isReady())
      } catch {
        ready = false
      }
      if ((ready && elapsed >= minDelay) || elapsed >= READY_TIMEOUT_MS) next()
      else run.timers.push(setTimeout(tick, READY_POLL_MS))
    }
    tick()
  }, [])

  const runShutter = useCallback(
    ({ onCovered, isReady = () => true, message = '', focusSelector = 'h1' } = {}) => {
      if (runRef.current) return
      const run = { onCovered, isReady, focusSelector, covered: false, done: false, timers: [] }
      runRef.current = run
      setStatus(message)

      if (prefersReducedMotion()) {
        cover(run)
        whenReady(run, 0, () => complete(run))
        return
      }

      setPhase('closing')
      run.timers.push(
        setTimeout(() => {
          cover(run)
          setPhase('covered')
          whenReady(run, FLASH_MS, () => {
            setPhase('opening')
            run.timers.push(setTimeout(() => complete(run), OPEN_MS))
          })
        }, COVERED_AT_MS)
      )
    },
    [complete, whenReady]
  )

  const skip = useCallback(() => {
    const run = runRef.current
    if (!run || run.done) return
    clearTimers(run)
    cover(run)
    setPhase('idle')
    whenReady(run, 0, () => complete(run))
  }, [complete, whenReady])

  useEffect(() => {
    if (phase === 'idle') return undefined
    const onKeyDown = (e) => {
      if (e.key === 'Escape') skip()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [phase, skip])

  useEffect(
    () => () => {
      const run = runRef.current
      if (run) clearTimers(run)
    },
    []
  )

  const value = useMemo(() => ({ runShutter }), [runShutter])

  return (
    <ShutterContext.Provider value={value}>
      {children}
      <p className="shutter-status" role="status" aria-live="polite">
        {status}
      </p>
      {phase !== 'idle' && (
        <div className={`shutter shutter--${phase}`} data-theme="dark" onClick={skip} aria-hidden="true">
          <div className="shutter-scrim" />
          <div className="shutter-curtain shutter-curtain--top" />
          <div className="shutter-curtain shutter-curtain--bottom" />
          <div className="shutter-focus">
            <span className="shutter-bracket shutter-bracket--tl" />
            <span className="shutter-bracket shutter-bracket--tr" />
            <span className="shutter-bracket shutter-bracket--bl" />
            <span className="shutter-bracket shutter-bracket--br" />
            <Logo assemble size={128} className="shutter-logo" />
          </div>
          <div className="shutter-flash" />
        </div>
      )}
    </ShutterContext.Provider>
  )
}

export default ShutterProvider
