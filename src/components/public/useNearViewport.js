import { lazy, useEffect, useState } from 'react'

// After the element is near: wait until the browser is idle (at most this long), so a decorative chunk
// never competes with the page that is still rendering
const IDLE_TIMEOUT_MS = 2000

function whenIdle(callback) {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(callback, { timeout: IDLE_TIMEOUT_MS })
    return () => window.cancelIdleCallback(id)
  }
  const id = setTimeout(callback, 300)
  return () => clearTimeout(id)
}

/**
 * True once the element has come within `rootMargin` of the screen and the browser has had an idle
 * moment (and stays true). Used to load the decorative pieces (chicken and duck, robot, cameo) only when
 * the visitor gets close to them, without slowing down the page itself.
 * @param {React.RefObject<Element>} ref
 * @param {string} [rootMargin] e.g. '200px'
 */
export function useNearViewport(ref, rootMargin = '200px') {
  // Without IntersectionObserver (very old browsers) everything loads at once
  const [near, setNear] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const el = ref.current
    if (near || !el) return undefined
    let cancelIdle = null
    // Still near when the idle moment comes: an element that was near only for a moment (e.g. the
    // footer before the sections below the hero arrive, stage 3C) does not load anything
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          cancelIdle?.()
          cancelIdle = null
          return
        }
        if (cancelIdle) return
        cancelIdle = whenIdle(() => {
          observer.disconnect()
          setNear(true)
        })
      },
      { rootMargin }
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      cancelIdle?.()
    }
  }, [ref, rootMargin, near])

  return near
}

/**
 * React.lazy for decorative pieces: if the chunk cannot be loaded (offline, or a new deploy replaced
 * the file) the piece is simply left out instead of breaking the page.
 * @param {() => Promise<{ default: React.ComponentType }>} load
 */
export function lazyDecor(load) {
  return lazy(() => load().catch(() => ({ default: () => null })))
}
