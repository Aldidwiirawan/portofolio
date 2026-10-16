import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLeaveGuard } from './adminContexts'

/**
 * Click handlers for admin navigation links (sidebar, sub-tabs): a plain click asks
 * "Tinggalkan perubahan?" first while a form has unsaved changes. New-tab / new-window clicks pass
 * through untouched. `before` runs on every plain click, before the dialog (the drawer uses it to
 * close itself, so the dialog is the only layer on screen).
 *
 *   const guardedClick = useGuardedNav()
 *   <Link to={to} onClick={guardedClick(to, closeDrawer)} />
 */
export function useGuardedNav() {
  const navigate = useNavigate()
  const { isDirty, confirmLeave } = useLeaveGuard()

  return useCallback(
    (to, before) => async (e) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      before?.()
      if (!isDirty()) return
      e.preventDefault()
      if (await confirmLeave()) navigate(to)
    },
    [navigate, isDirty, confirmLeave]
  )
}
