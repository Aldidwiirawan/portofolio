import { lazy, Suspense, useState } from 'react'
import { usePublicGuestbook } from '../../../hooks/usePublicGuestbook'
import { useI18n } from '../../../i18n/i18nContext'
import { ChatIcon } from '../icons'
import { useCoveredAreasVisible } from '../useCoveredAreas'
import './Guestbook.css'

const loadDrawer = () => import('./GuestbookDrawer')
const GuestbookDrawer = lazy(loadDrawer)

/**
 * Floating "Buku tamu" pill with the real number of messages. It slides away while the hero status
 * bar or the contact form is on screen, so it never covers them (it can't be focused then either).
 * The panel is loaded on first use (prefetched when the pointer or focus reaches the button).
 */
function GuestbookButton() {
  const { t } = useI18n()
  const guestbook = usePublicGuestbook()
  const [open, setOpen] = useState(false)
  const covered = useCoveredAreasVisible()
  const count = guestbook.loading ? null : guestbook.totalCount

  return (
    <>
      <button
        type="button"
        className="pub-gb-fab"
        data-hidden={(covered && !open) || undefined}
        aria-haspopup="dialog"
        aria-label={count == null ? t('guestbook.open') : t('guestbook.openLabel', { n: count })}
        onClick={() => setOpen(true)}
        onPointerEnter={loadDrawer}
        onFocus={loadDrawer}
      >
        <ChatIcon size={22} />
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
