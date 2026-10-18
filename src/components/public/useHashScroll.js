import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { prefersReducedMotion } from '../../lib/useMediaQuery'

/**
 * Scrolls to the section named in the address (e.g. /#proyek from the project page or the navbar)
 * once `ready` (the section exists), and moves focus to it for keyboard and screen reader users.
 * Every navigation has its own location key, so choosing the same menu item again scrolls again.
 */
export function useHashScroll(ready) {
  const { hash, key } = useLocation()

  useEffect(() => {
    if (!ready || !hash || hash === '#') return
    let id
    try {
      id = decodeURIComponent(hash.slice(1))
    } catch {
      return
    }
    const target = document.getElementById(id)
    if (!target) return
    target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
    target.focus({ preventScroll: true })
  }, [ready, hash, key])
}
