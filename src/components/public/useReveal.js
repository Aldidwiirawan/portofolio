import { useEffect } from 'react'

/**
 * Cards and headings with the class pub-reveal fade up once, the first time they come on screen (like the
 * reference site of phase 8). One observer for the whole public page; elements rendered later (lazy
 * sections, data that arrives) are picked up as they appear. The hidden state only applies while this
 * runs (html.pub-reveal-on), so nothing stays invisible without it; reduced motion skips it in CSS.
 */
export function useRevealObserver() {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined' || typeof MutationObserver === 'undefined') return undefined
    const root = document.documentElement
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.dataset.revealed = ''
          io.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -40px 0px' }
    )
    const watch = () => {
      document.querySelectorAll('.pub-reveal:not([data-revealed]):not([data-reveal-watched])').forEach((el) => {
        el.dataset.revealWatched = ''
        io.observe(el)
      })
    }
    watch()
    root.classList.add('pub-reveal-on')
    let frame = 0
    const mo = new MutationObserver(() => {
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0
          watch()
        })
      }
    })
    mo.observe(document.body, { childList: true, subtree: true })
    return () => {
      cancelAnimationFrame(frame)
      io.disconnect()
      mo.disconnect()
      root.classList.remove('pub-reveal-on')
    }
  }, [])
}
