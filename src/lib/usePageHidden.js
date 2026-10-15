import { useSyncExternalStore } from 'react'

function subscribe(onChange) {
  if (typeof document === 'undefined') return () => {}
  document.addEventListener('visibilitychange', onChange)
  return () => document.removeEventListener('visibilitychange', onChange)
}

/**
 * True while the tab is hidden (document.visibilityState === 'hidden'). Use it to pause decorative
 * CSS animations, e.g. by setting data-paused and animation-play-state: paused.
 * @returns {boolean}
 */
export function usePageHidden() {
  return useSyncExternalStore(
    subscribe,
    () => typeof document !== 'undefined' && document.hidden,
    () => false
  )
}
