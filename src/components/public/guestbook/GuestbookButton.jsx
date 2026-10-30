import { lazy, Suspense, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { usePublicGuestbook } from '../../../hooks/usePublicGuestbook'
import { useI18n } from '../../../i18n/i18nContext'
import { NotebookPenIcon } from '../icons'
import { GUESTBOOK_OPEN_EVENT } from './guestbookEvents'
import './Guestbook.css'

const loadDrawer = () => import('./GuestbookDrawer')
const GuestbookDrawer = lazy(loadDrawer)

/**
 * Floating "Buku Tamu" pill (bottom right, always visible like the reference site of phase 8) with the
 * real number of messages. The panel is loaded on first use (prefetched when the pointer or focus
 * reaches the button) and also opens from the "Buku Tamu" menu item (GUESTBOOK_OPEN_EVENT) or the
 * address /#bukutamu.
 */
function GuestbookButton() {
  const { t } = useI18n()
  const guestbook = usePublicGuestbook()
  const { hash } = useLocation()
  const navigate = useNavigate()
  // /#bukutamu (the menu item from another page, or a shared link) opens the panel when the home page
  // comes in; on the home page itself the menu item sends GUESTBOOK_OPEN_EVENT
  const [open, setOpen] = useState(() => hash === '#bukutamu')
  const count = guestbook.loading ? null : guestbook.totalCount

  useEffect(() => {
    const onOpen = () => setOpen(true)
    window.addEventListener(GUESTBOOK_OPEN_EVENT, onOpen)
    return () => window.removeEventListener(GUESTBOOK_OPEN_EVENT, onOpen)
  }, [])

  // The address keeps no #bukutamu once the panel is open
  useEffect(() => {
    if (hash === '#bukutamu') navigate({ hash: '' }, { replace: true })
  }, [hash, navigate])

  return (
    <>
      <button
        type="button"
        className="pub-gb-fab"
        aria-haspopup="dialog"
        aria-label={count == null ? t('guestbook.open') : t('guestbook.openLabel', { n: count })}
        onClick={() => setOpen(true)}
        onPointerEnter={loadDrawer}
        onFocus={loadDrawer}
      >
        <NotebookPenIcon size={16} className="pub-gb-fab-icon" />
        <span className="pub-gb-fab-text">{t('guestbook.open')}</span>
        {count != null && (
          <span className="pub-gb-fab-count" aria-hidden="true">
            {count}
          </span>
        )}
      </button>
      {open && (
        <Suspense fallback={null}>
          <GuestbookDrawer guestbook={guestbook} onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </>
  )
}

export default GuestbookButton
