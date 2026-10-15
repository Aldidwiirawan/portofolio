import { useEffect, useLayoutEffect, useRef } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Active traps, newest last. Only the newest one reacts to keys, so a dialog opened on top of the
// mobile menu drawer owns Tab and Escape until it closes.
const stack = []

// Element of the ref held in `holder`, read at call time: the trap's cleanup deliberately wants the
// return target set by the last render, not the one from when the trap opened.
const returnTarget = (holder) => holder.current?.current

/**
 * Keeps keyboard focus inside `containerRef` while `active` (dialogs, the mobile menu drawer).
 * - Focus moves to `initialFocusRef` (or the first focusable element) when activated.
 * - Tab / Shift+Tab cycle inside the container; Escape calls the latest `onEscape`.
 * - When deactivated, focus returns to the element that had it before, or to `returnFocusRef` when
 *   given at that moment (e.g. the page heading after the opener was deleted).
 * - Traps stack: only the most recently activated one handles keys.
 */
export function useFocusTrap(containerRef, active, { onEscape, initialFocusRef, returnFocusRef } = {}) {
  const escapeRef = useRef(onEscape)
  const initialRef = useRef(initialFocusRef)
  const returnRef = useRef(returnFocusRef)

  // Layout effect: the refs are current before the trap's cleanup runs in the same commit
  useLayoutEffect(() => {
    escapeRef.current = onEscape
    initialRef.current = initialFocusRef
    returnRef.current = returnFocusRef
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

    const token = {}
    stack.push(token)

    const onKeyDown = (e) => {
      if (stack[stack.length - 1] !== token) return
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
      stack.splice(stack.indexOf(token), 1)
      document.removeEventListener('keydown', onKeyDown, true)
      const target = returnTarget(returnRef) || previous
      if (target instanceof HTMLElement && target.isConnected) target.focus({ preventScroll: true })
    }
  }, [active, containerRef])
}
