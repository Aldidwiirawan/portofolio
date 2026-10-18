import { useEffect, useRef } from 'react'

const loadPhysics = () => import('./physicsStage')

// After the page has painted: when the browser is idle (at most 1.2 s later)
function whenIdle(callback) {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(callback, { timeout: 1200 })
    return () => window.cancelIdleCallback(id)
  }
  const id = setTimeout(callback, 300)
  return () => clearTimeout(id)
}

/**
 * Turns the static label pile of the hero stage into physics labels once the stage is on screen and
 * the page has painted. matter-js is only downloaded then (its own chunk). The loop pauses while the
 * stage is off screen or `paused` (hidden tab). Nothing happens while `enabled` is false (reduced
 * motion, data still loading); if loading fails the static pile simply stays.
 * @param {React.RefObject<HTMLElement>} stageRef the `.pub-stage` element
 * @param {{ enabled: boolean, rebuildKey: string, paused: boolean, onImpact: Function }} options
 */
export function usePhysicsStage(stageRef, { enabled, rebuildKey, paused, onImpact }) {
  const controllerRef = useRef(null)
  const visibleRef = useRef(false)
  const pausedRef = useRef(paused)
  const impactRef = useRef(onImpact)

  useEffect(() => {
    impactRef.current = onImpact
  }, [onImpact])

  useEffect(() => {
    pausedRef.current = paused
    controllerRef.current?.setPaused(paused || !visibleRef.current)
  }, [paused])

  useEffect(() => {
    const stage = stageRef.current
    if (!enabled || !stage || typeof IntersectionObserver === 'undefined') return undefined
    let cancelled = false
    let started = false
    let cancelIdle = null

    const start = () => {
      cancelIdle = null
      loadPhysics()
        .then(({ createPhysicsStage }) => {
          if (cancelled) return
          controllerRef.current = createPhysicsStage(stage, { onImpact: (impact) => impactRef.current?.(impact) })
          controllerRef.current.setPaused(pausedRef.current || !visibleRef.current)
        })
        .catch(() => {
          // Offline or blocked: the static pile of labels stays
        })
    }

    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting
      if (entry.isIntersecting && !started) {
        started = true
        cancelIdle = whenIdle(start)
      }
      controllerRef.current?.setPaused(pausedRef.current || !entry.isIntersecting)
    })
    observer.observe(stage)

    return () => {
      cancelled = true
      observer.disconnect()
      cancelIdle?.()
      controllerRef.current?.destroy()
      controllerRef.current = null
    }
  }, [stageRef, enabled, rebuildKey])
}
