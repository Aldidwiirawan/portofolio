import { useCallback, useSyncExternalStore } from 'react'

/**
 * Subscribes to a CSS media query and returns whether it currently matches.
 * Returns false during server rendering or when matchMedia is unavailable.
 * @param {string} query e.g. '(min-width: 1024px)'
 * @returns {boolean}
 */
export function useMediaQuery(query) {
  const subscribe = useCallback(
    (onChange) => {
      if (typeof window === 'undefined' || !window.matchMedia) return () => {}
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    [query]
  )

  return useSyncExternalStore(
    subscribe,
    () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false),
    () => false
  )
}

/** True when the visitor asked the OS to reduce motion. */
export function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

/** Non-hook check for event handlers and timers. */
export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false
}
