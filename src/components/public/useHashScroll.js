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
    // Sections below the hero use content-visibility (public.css): one not shown yet has a placeholder
    // height, so the jump would land in the wrong place. They are laid out for real first; afterwards
    // each keeps its real height (contain-intrinsic-size: auto) and skipping resumes (stage 3C).
    const root = document.documentElement
    root.classList.add('pub-sections-laid-out')
    target.getBoundingClientRect()
    target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
    target.focus({ preventScroll: true })
    const done = () => root.classList.remove('pub-sections-laid-out')
    window.addEventListener('scrollend', done, { once: true })
    const timer = setTimeout(done, 2000)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('scrollend', done)
      done()
    }
  }, [ready, hash, key])
}
