import { useCallback, useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../../../lib/useMediaQuery'

// How long the save button shows "Tersimpan" (brackets lock on, check appears) before the form closes
const SUCCESS_HOLD_MS = 700

const scrollBehavior = () => (prefersReducedMotion() ? 'auto' : 'smooth')

/**
 * Screen feedback around a form's own submit logic (the logic itself is untouched):
 * - noteSubmit(): call on every submit; afterwards focus moves to the first field marked
 *   aria-invalid (validation errors are set in the same event, so they are rendered by then)
 * - a new `generalError` scrolls `alertRef` into view
 * - finish(done): shows the success state on the save button, then calls `done` (at once with
 *   reduced motion)
 */
export function useFormFeedback(formRef, { generalError, alertRef } = {}) {
  const [attempt, setAttempt] = useState(0)
  const [saved, setSaved] = useState(false)
  const timer = useRef(null)

  useEffect(() => {
    if (attempt === 0) return
    const first = formRef.current?.querySelector('[aria-invalid="true"]')
    if (!first) return
    first.focus({ preventScroll: true })
    first.scrollIntoView({ block: 'center', behavior: scrollBehavior() })
  }, [attempt, formRef])

  useEffect(() => {
    if (generalError) alertRef?.current?.scrollIntoView({ block: 'center', behavior: scrollBehavior() })
  }, [generalError, alertRef])

  useEffect(() => () => clearTimeout(timer.current), [])

  const noteSubmit = useCallback(() => setAttempt((n) => n + 1), [])

  const finish = useCallback((done) => {
    setSaved(true)
    timer.current = setTimeout(done, prefersReducedMotion() ? 0 : SUCCESS_HOLD_MS)
  }, [])

  return { noteSubmit, saved, finish }
}
