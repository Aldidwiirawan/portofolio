import { useEffect, useState } from 'react'

/**
 * True once the element has come within `rootMargin` of the screen (and stays true). Used to load the
 * decorative pieces (chicken and duck, robot) only when the visitor gets close to them.
 * @param {React.RefObject<Element>} ref
 * @param {string} [rootMargin] e.g. '200px'
 */
export function useNearViewport(ref, rootMargin = '200px') {
  // Without IntersectionObserver (very old browsers) everything loads at once
  const [near, setNear] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const el = ref.current
    if (near || !el) return undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNear(true)
      },
      { rootMargin }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, rootMargin, near])

  return near
}
