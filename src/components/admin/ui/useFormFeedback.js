import { useCallback, useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../../../lib/useMediaQuery'
import { useUnsavedChanges } from './adminContexts'

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

/**
 * Comparable form values: numbers typed into inputs come back as strings, so compare as text;
 * lists and objects (list fields, month/year pairs) compare by content.
 */
export function formSnapshot(data) {
  return JSON.stringify(
    Object.entries(data).map(([key, value]) => [
      key,
      typeof value === 'boolean' ? value : value !== null && typeof value === 'object' ? JSON.stringify(value) : String(value ?? ''),
    ])
  )
}

/**
 * Everything a form screen needs around its own logic: feedback (see useFormFeedback), whether
 * `data` differs from the values the form opened with, the unsaved-changes guard, and a guarded
 * cancel that asks before discarding changes.
 * - extraDirty: changes kept outside `data`, e.g. file fields (useAssetField().dirty)
 */
export function useFormScreen({ data, generalError, onCancel, extraDirty = false }) {
  const formRef = useRef(null)
  const alertRef = useRef(null)
  const feedback = useFormFeedback(formRef, { generalError, alertRef })
  const [initial] = useState(() => formSnapshot(data))
  const isDirty = formSnapshot(data) !== initial || Boolean(extraDirty)
  const confirmLeave = useUnsavedChanges(isDirty && !feedback.saved)
  const cancel = async () => {
    if (await confirmLeave()) onCancel()
  }
  return { formRef, alertRef, ...feedback, isDirty, cancel }
}
