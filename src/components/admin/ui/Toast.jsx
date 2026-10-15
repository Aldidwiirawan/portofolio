import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ToastContext } from './adminContexts'
import { IconAlert, IconCheck, IconClose, IconInfo } from './icons'

const AUTO_DISMISS_MS = 4000
const MAX_VISIBLE = 4
const ICONS = { success: IconCheck, error: IconAlert, info: IconInfo }

/**
 * Toast messages for the admin. Success/info go to a polite status region and disappear after 4 s
 * (paused while hovered or focused); errors go to an alert region and stay until closed.
 * Use with useToast() from ./adminContexts.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())
  const nextId = useRef(0)

  const remove = useCallback((id) => {
    clearTimeout(timers.current.get(id))
    timers.current.delete(id)
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const schedule = useCallback(
    (id, ms = AUTO_DISMISS_MS) => {
      clearTimeout(timers.current.get(id))
      timers.current.set(id, setTimeout(() => remove(id), ms))
    },
    [remove]
  )

  const push = useCallback(
    (tone, message) => {
      if (!message) return
      nextId.current += 1
      const id = nextId.current
      setToasts((list) => [...list.slice(-(MAX_VISIBLE - 1)), { id, tone, message }])
      if (tone !== 'error') schedule(id)
    },
    [schedule]
  )

  useEffect(() => {
    const map = timers.current
    return () => map.forEach((t) => clearTimeout(t))
  }, [])

  const api = useMemo(
    () => ({
      success: (m) => push('success', m),
      error: (m) => push('error', m),
      info: (m) => push('info', m),
    }),
    [push]
  )

  const renderToast = (t) => {
    const Icon = ICONS[t.tone]
    return (
      <div
        key={t.id}
        className={`adm-toast adm-toast--${t.tone}`}
        onMouseEnter={() => clearTimeout(timers.current.get(t.id))}
        onMouseLeave={() => t.tone !== 'error' && schedule(t.id, 2000)}
        onFocus={() => clearTimeout(timers.current.get(t.id))}
        onBlur={() => t.tone !== 'error' && schedule(t.id, 2000)}
      >
        <Icon className="adm-toast-icon" size={20} />
        <p className="adm-toast-text">{t.message}</p>
        <button type="button" className="adm-toast-close" onClick={() => remove(t.id)} aria-label="Tutup pemberitahuan">
          <IconClose size={16} />
        </button>
      </div>
    )
  }

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <div className="adm-portal adm-toasts" data-theme="light">
          <div className="adm-toast-region" role="status" aria-live="polite">
            {toasts.filter((t) => t.tone !== 'error').map(renderToast)}
          </div>
          <div className="adm-toast-region" role="alert" aria-live="assertive">
            {toasts.filter((t) => t.tone === 'error').map(renderToast)}
          </div>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  )
}
