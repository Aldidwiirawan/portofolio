import { lazy, Suspense, useState } from 'react'
import { useGuestbook } from '../../../hooks/useGuestbook'
import { useI18n } from '../../../i18n/i18nContext'
import { ChatIcon } from '../icons'
import './Guestbook.css'

const loadDrawer = () => import('./GuestbookDrawer')
const GuestbookDrawer = lazy(loadDrawer)

/**
 * Floating "Buku tamu" button with the number of messages (BRIEF §5). The panel is loaded on first
 * use (prefetched when the pointer or focus reaches the button).
 */
function GuestbookButton() {
  const { t } = useI18n()
  const guestbook = useGuestbook()
  const [open, setOpen] = useState(false)
  const count = guestbook.loading ? null : guestbook.totalCount

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
        <ChatIcon size={20} />
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
