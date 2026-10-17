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

// ---- Admin shell ----------------------------------------------------------

/**
 * Provided by AdminRoot: signed-in email, logout, and `inbox` (the useMessages() result behind the
 * unread badge). `refreshUnread()` reloads it after a page marks or deletes messages.
 */
export const AdminShellContext = createContext({
  email: null,
  isLoggingOut: false,
  logout: () => {},
  inbox: null,
  refreshUnread: () => {},
})

export function useAdminShell() {
  return useContext(AdminShellContext)
}

// ---- Form saving ----------------------------------------------------------

/** True while the surrounding FormPanel saves (and while it shows "Tersimpan"). */
export const FormBusyContext = createContext(false)

/**
 * How a control is locked. While its form saves, a native `disabled` would drop keyboard focus to
 * <body> (e.g. from the field the user pressed Enter in), so the control is locked softly instead:
 * it stays focusable, gets aria-disabled, and is made readOnly or ignores changes. Outside a save,
 * `disabled` stays native.
 * @returns {{ hard: boolean, soft: boolean }}
 */
export function useLock(disabled) {
  const saving = useContext(FormBusyContext)
  const on = Boolean(disabled)
  return { hard: on && !saving, soft: on && saving }
}
