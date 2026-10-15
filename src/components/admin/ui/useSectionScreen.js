import { useCallback, useRef, useState } from 'react'
import { useLeaveGuard, useToast } from './adminContexts'

/**
 * Screen helpers for a section page: toasts, the h1 ref, where focus goes after a delete (the
 * deleted row's "Hapus" button disappears, so it goes to the heading), and `guarded(action)` which
 * asks before leaving a form with unsaved changes (used by the breadcrumb).
 */
export function useSectionScreen() {
  const toast = useToast()
  const { confirmLeave } = useLeaveGuard()
  const headingRef = useRef(null)
  const [returnToHeading, setReturnToHeading] = useState(false)

  const guarded = useCallback(
    (action) => async () => {
      if (await confirmLeave()) action()
    },
    [confirmLeave]
  )

  return { toast, headingRef, returnToHeading, setReturnToHeading, guarded }
}
