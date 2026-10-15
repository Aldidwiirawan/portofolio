import { createContext, useContext, useEffect, useId } from 'react'

// ---- Toasts ---------------------------------------------------------------

/** Without a provider, toasts are silently ignored. */
export const ToastContext = createContext({
  success: () => {},
  error: () => {},
  info: () => {},
})

/** @returns {{ success: (msg: string) => void, error: (msg: string) => void, info: (msg: string) => void }} */
export function useToast() {
  return useContext(ToastContext)
}

// ---- Unsaved changes ------------------------------------------------------

/** Without a provider, leaving is always allowed. */
export const UnsavedContext = createContext({
  setDirty: () => {},
  isDirty: () => false,
  confirmLeave: async () => true,
})

/**
 * Registers a form as "has unsaved changes" while `dirty` is true and returns `confirmLeave()`,
 * which resolves to true when it is fine to leave (nothing dirty, or the user agreed to discard).
 * Closing/reloading the tab is warned by the provider (beforeunload).
 */
export function useUnsavedChanges(dirty) {
  const id = useId()
  const ctx = useContext(UnsavedContext)
  const { setDirty } = ctx
  useEffect(() => {
    setDirty(id, Boolean(dirty))
    return () => setDirty(id, false)
  }, [id, dirty, setDirty])
  return ctx.confirmLeave
}

/** Access to the guard without registering (sidebar links, logout). */
export function useLeaveGuard() {
  return useContext(UnsavedContext)
}
