import { useEffect, useRef } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Keeps keyboard focus inside `containerRef` while `active` (dialogs, the mobile menu drawer).
 * - Focus moves to `initialFocusRef` (or the first focusable element) when activated.
 * - Tab / Shift+Tab cycle inside the container; Escape calls the latest `onEscape`.
 * - When deactivated, focus returns to the element that had it before.
 */
export function useFocusTrap(containerRef, active, { onEscape, initialFocusRef } = {}) {
  const escapeRef = useRef(onEscape)
  const initialRef = useRef(initialFocusRef)

  useEffect(() => {
    escapeRef.current = onEscape
    initialRef.current = initialFocusRef
  })

  useEffect(() => {
    if (!active) return undefined
    const container = containerRef.current
    if (!container) return undefined
    const previous = document.activeElement

    const focusables = () =>
      Array.from(container.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      )

    const first = initialRef.current?.current || focusables()[0] || container
    if (first === container && !container.hasAttribute('tabindex')) container.setAttribute('tabindex', '-1')
    first.focus({ preventScroll: true })

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (escapeRef.current) {
          e.stopPropagation()
          escapeRef.current()
        }
        return
      }
      if (e.key !== 'Tab') return
      const items = focusables()
      if (items.length === 0) {
        e.preventDefault()
        return
      }
      const firstItem = items[0]
      const lastItem = items[items.length - 1]
      const outside = !container.contains(document.activeElement)
      if (e.shiftKey && (document.activeElement === firstItem || outside)) {
        e.preventDefault()
        lastItem.focus()
      } else if (!e.shiftKey && (document.activeElement === lastItem || outside)) {
        e.preventDefault()
        firstItem.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus({ preventScroll: true })
    }
  }, [active, containerRef])
}
