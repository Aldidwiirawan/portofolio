import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useMediaQuery } from '../../../lib/useMediaQuery'
import { useLeaveGuard } from './adminContexts'
import { ADMIN_NAV } from './adminNav'
import { BrandLockup } from './BrandLockup'
import { IconButton } from './Button'
import { IconClose, IconExternal, IconLogout, IconMenu } from './icons'
import { useFocusTrap } from './useFocusTrap'

/**
 * Dark sidebar. From 1024 px it is always visible; below that it becomes a drawer opened from the
 * top bar's menu button: focus stays inside while open, Escape / the backdrop / choosing a menu
 * item closes it, and focus then returns to the menu button.
 * Menu links ask before leaving a form with unsaved changes.
 */
export function AdminSidebar({ email, unreadCount = 0, onLogout, isLoggingOut = false }) {
  const isWide = useMediaQuery('(min-width: 1024px)')
  const [open, setOpen] = useState(false)
  const drawerOpen = open && !isWide
  const panelRef = useRef(null)
  const closeRef = useRef(null)
  const panelId = useId()
  const navigate = useNavigate()
  const { isDirty, confirmLeave } = useLeaveGuard()

  const close = useCallback(() => setOpen(false), [])

  useFocusTrap(panelRef, drawerOpen, { onEscape: close, initialFocusRef: closeRef })

  useEffect(() => {
    if (!drawerOpen) return undefined
    const root = document.documentElement
    const previous = root.style.overflow
    root.style.overflow = 'hidden'
    return () => {
      root.style.overflow = previous
    }
  }, [drawerOpen])

  const handleNavClick = (to) => async (e) => {
    // Let new-tab / new-window clicks through untouched
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    if (!isDirty()) {
      setOpen(false)
      return
    }
    e.preventDefault()
    // Close the drawer first so the "Tinggalkan perubahan?" dialog is the only layer on screen
    setOpen(false)
    if (await confirmLeave()) navigate(to)
  }

  const unreadLabel = unreadCount > 0 ? `, ${unreadCount} pesan belum dibaca` : ''

  return (
    <>
      <header className="adm-topbar" data-theme="dark">
        <button
          type="button"
          className="adm-menu-btn"
          aria-expanded={drawerOpen}
          aria-controls={panelId}
          onClick={() => setOpen(true)}
        >
          <IconMenu size={22} />
          <span className="adm-sr-only">Buka menu{unreadLabel}</span>
          {unreadCount > 0 && <span className="adm-menu-btn-dot" aria-hidden="true" />}
        </button>
        <BrandLockup />
      </header>

      <div className={`adm-scrim${drawerOpen ? ' is-open' : ''}`} onClick={close} aria-hidden="true" />

      <div
        ref={panelRef}
        id={panelId}
        className={`adm-sidebar${drawerOpen ? ' is-open' : ''}`}
        data-theme="dark"
        role={isWide ? undefined : 'dialog'}
        aria-modal={drawerOpen || undefined}
        aria-label={isWide ? undefined : 'Menu'}
        inert={!isWide && !drawerOpen}
      >
        <div className="adm-sidebar-head">
          <BrandLockup />
          {!isWide && (
            <IconButton ref={closeRef} label="Tutup menu" icon={<IconClose />} onClick={close} className="adm-sidebar-close" />
          )}
        </div>

        <nav className="adm-nav" aria-label="Menu admin">
          {ADMIN_NAV.map((group) => (
            <div key={group.id} className="adm-nav-group">
              {group.heading && (
                <p className="adm-nav-heading" id={`${panelId}-${group.id}`}>
                  {group.heading}
                </p>
              )}
              <ul className="adm-nav-list" aria-labelledby={group.heading ? `${panelId}-${group.id}` : undefined}>
                {group.items.map(({ to, label, icon: Icon, end, count }) => {
                  const showCount = count === 'unread' && unreadCount > 0
                  return (
                    <li key={to}>
                      <NavLink to={to} end={end} className="adm-nav-link" onClick={handleNavClick(to)}>
                        <Icon size={18} className="adm-nav-icon" />
                        <span className="adm-nav-label">{label}</span>
                        {showCount && (
                          <span className="adm-nav-count">
                            {unreadCount}
                            <span className="adm-sr-only"> belum dibaca</span>
                          </span>
                        )}
                      </NavLink>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="adm-sidebar-foot">
          {email && (
            <p className="adm-sidebar-user">
              <span className="adm-sidebar-user-label">Masuk sebagai</span>
              <span className="adm-sidebar-user-email" title={email}>
                {email}
              </span>
            </p>
          )}
          <a href="/" target="_blank" rel="noopener noreferrer" className="adm-nav-link adm-nav-link--foot">
            <IconExternal size={18} className="adm-nav-icon" />
            <span className="adm-nav-label">Lihat situs</span>
            <span className="adm-sr-only"> (tab baru)</span>
          </a>
          <button
            type="button"
            className="adm-nav-link adm-nav-link--foot adm-nav-logout"
            onClick={onLogout}
            aria-disabled={isLoggingOut || undefined}
          >
            {isLoggingOut ? <span className="adm-spinner" aria-hidden="true" /> : <IconLogout size={18} className="adm-nav-icon" />}
            <span className="adm-nav-label">{isLoggingOut ? 'Sedang keluar...' : 'Keluar'}</span>
          </button>
        </div>
      </div>
    </>
  )
}
