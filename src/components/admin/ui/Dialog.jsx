import { useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Button, IconButton } from './Button'
import { Alert } from './Alert'
import { IconAlert, IconClose } from './icons'
import { useFocusTrap } from './useFocusTrap'
import { useScrollLock } from './useScrollLock'

/**
 * Modal dialog: rendered in a light-themed portal, focus trapped inside, Escape and the backdrop
 * close it (unless `busy`), page scroll locked, focus returns to the opener afterwards.
 */
export function Dialog({ open, onClose, title, description, icon, tone, size = 'sm', busy = false, initialFocusRef, returnFocusRef, footer, children }) {
  const panelRef = useRef(null)
  const titleId = useId()
  const descId = useId()

  useFocusTrap(panelRef, open, { onEscape: () => !busy && onClose?.(), initialFocusRef, returnFocusRef })

  useScrollLock(open)

  if (!open) return null

  return createPortal(
    <div className="adm-portal" data-theme="light">
      <div
        className="adm-dialog-backdrop"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget && !busy) onClose?.()
        }}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descId : undefined}
          className={['adm-dialog', `adm-dialog--${size}`, tone && `adm-dialog--${tone}`].filter(Boolean).join(' ')}
        >
          <header className="adm-dialog-head">
            {icon && <span className="adm-dialog-icon">{icon}</span>}
            <div className="adm-dialog-titles">
              <h2 id={titleId} className="adm-dialog-title">
                {title}
              </h2>
              {description && (
                <p id={descId} className="adm-dialog-desc">
                  {description}
                </p>
              )}
            </div>
            <IconButton label="Tutup" icon={<IconClose />} onClick={() => !busy && onClose?.()} className="adm-dialog-close" />
          </header>
          <div className="adm-dialog-body">{children}</div>
          {footer && <footer className="adm-dialog-foot">{footer}</footer>}
        </div>
      </div>
    </div>,
    document.body
  )
}

/**
 * Confirmation before a destructive action. Focus starts on the safe choice ("Batal").
 */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = 'Ya, hapus',
  cancelLabel = 'Batal',
  busy = false,
  busyLabel = 'Menghapus...',
  error,
  tone = 'danger',
  returnFocusRef,
  onConfirm,
  onCancel,
}) {
  const cancelRef = useRef(null)
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title={title}
      icon={<IconAlert />}
      tone={tone}
      busy={busy}
      initialFocusRef={cancelRef}
      returnFocusRef={returnFocusRef}
      footer={
        <>
          <Button ref={cancelRef} variant="secondary" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} loading={busy} loadingText={busyLabel} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="adm-dialog-text">{children}</div>
      {error && <Alert tone="danger">{error}</Alert>}
    </Dialog>
  )
}
