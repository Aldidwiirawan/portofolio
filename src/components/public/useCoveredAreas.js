import { useEffect, useState } from 'react'

/**
 * Areas the floating pieces (guestbook button, cats) must never cover: the status bar of the hero and
 * the contact form. Checked on scroll and resize (one measurement per frame at most), so it also works
 * for sections that load after the hook starts.
 */
export const COVER_SELECTORS = ['.pub-hero-strip', '.pub-contact-form']

/** Whether an element is at least partly on screen. */
export function onScreen(element) {
  if (!element) return false
  const rect = element.getBoundingClientRect()
  return rect.bottom > 0 && rect.top < window.innerHeight && rect.height > 0
}

/** True while any of the covered areas is on screen. */
export function useCoveredAreasVisible(selectors = COVER_SELECTORS) {
  const [visible, setVisible] = useState(false)
  const key = selectors.join(',')

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      setVisible(key.split(',').some((selector) => onScreen(document.querySelector(selector))))
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    // The sections below the hero render a moment later: check again once they are there
    const timer = setTimeout(update, 1500)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(timer)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [key])

  return visible
}
