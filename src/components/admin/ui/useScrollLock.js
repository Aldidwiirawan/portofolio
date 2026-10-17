import { useEffect } from 'react'

// Shared by every dialog and the mobile menu drawer. Two layers can close in the same commit (e.g.
// the message dialog and its delete confirmation), so each one restoring its own saved value would
// leave the page locked. A count releases the lock only when the last layer closes.
let lockCount = 0
let savedOverflow = ''

/** Locks page scroll (`overflow: hidden` on <html>) while `active`. */
export function useScrollLock(active) {
  useEffect(() => {
    if (!active) return undefined
    const root = document.documentElement
    if (lockCount === 0) {
      savedOverflow = root.style.overflow
      root.style.overflow = 'hidden'
    }
    lockCount += 1
    return () => {
      lockCount -= 1
      if (lockCount === 0) root.style.overflow = savedOverflow
    }
  }, [active])
}
