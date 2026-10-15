import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { UnsavedContext } from './adminContexts'
import { ConfirmDialog } from './Dialog'

/**
 * Tracks forms with unsaved changes (useUnsavedChanges) and asks before leaving them:
 * - closing or reloading the tab → the browser's own warning (beforeunload)
 * - sidebar links, logout and "Batal" call confirmLeave() → "Tinggalkan perubahan?" dialog
 * The browser Back button is not intercepted (that would need a different router setup).
 */
export function UnsavedChangesProvider({ children }) {
  const dirty = useRef(new Set())
  const [prompt, setPrompt] = useState(null)

  const setDirty = useCallback((id, value) => {
    if (value) dirty.current.add(id)
    else dirty.current.delete(id)
  }, [])

  const isDirty = useCallback(() => dirty.current.size > 0, [])

  const confirmLeave = useCallback(() => {
    if (dirty.current.size === 0) return Promise.resolve(true)
    return new Promise((resolve) => setPrompt({ resolve }))
  }, [])

  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (dirty.current.size === 0) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [])

  const answer = (leave) => {
    if (leave) dirty.current.clear()
    prompt?.resolve(leave)
    setPrompt(null)
  }

  const value = useMemo(() => ({ setDirty, isDirty, confirmLeave }), [setDirty, isDirty, confirmLeave])

  return (
    <UnsavedContext.Provider value={value}>
      {children}
      <ConfirmDialog
        open={Boolean(prompt)}
        title="Tinggalkan perubahan?"
        confirmLabel="Tinggalkan"
        cancelLabel="Tetap di sini"
        onConfirm={() => answer(true)}
        onCancel={() => answer(false)}
      >
        Ada perubahan yang belum disimpan. Kalau Anda pergi sekarang, perubahan itu akan hilang.
      </ConfirmDialog>
    </UnsavedContext.Provider>
  )
}
