import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useMediaQuery } from '../../../lib/useMediaQuery'
import { ADMIN_NAV_GROUPS, ADMIN_SECTIONS, findAdminSection, normalizeAdminPath } from './adminNav'
import { BrandLockup } from './BrandLockup'
import { IconButton } from './Button'
import { IconClose, IconExternal, IconLogout, IconMenu } from './icons'
import { useFocusTrap } from './useFocusTrap'
import { useGuardedNav } from './useGuardedNav'

/**
 * Dark sidebar with the five admin sections. From 1024 px it is always visible; below that it
 * becomes a drawer opened from the top bar's menu button: focus stays inside while open, Escape /
 * the backdrop / choosing a menu item closes it, and focus then returns to the menu button.
 * A section stays marked while any of its pages is open: aria-current="page" when its link is the
 * open page, "true" on its other pages (their sub-tab carries "page").
 * Menu links ask before leaving a form with unsaved changes.
 */
export function AdminSidebar({ email, unreadCount = 0, onLogout, isLoggingOut = false }) {
  const isWide = useMediaQuery('(min-width: 1024px)')
  const [open, setOpen] = useState(false)
  const drawerOpen = open && !isWide
  const panelRef = useRef(null)
  const closeRef = useRef(null)
  const panelId = useId()
  const guardedClick = useGuardedNav()
  const { pathname } = useLocation()
  const path = normalizeAdminPath(pathname)
  const activeSection = findAdminSection(pathname)

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
          {ADMIN_NAV_GROUPS.map((group) => (
            <div key={group.id} className="adm-nav-group">
              {group.heading && (
                <p className="adm-nav-heading" id={`${panelId}-${group.id}`}>
                  {group.heading}
                </p>
              )}
              <ul className="adm-nav-list" aria-labelledby={group.heading ? `${panelId}-${group.id}` : undefined}>
                {ADMIN_SECTIONS.filter((section) => group.sections.includes(section.id)).map((section) => {
                  const { id, label, icon: Icon, count } = section
                  const to = section.items[0].to
                  const isActive = activeSection?.id === id
                  const showCount = count === 'unread' && unreadCount > 0
                  return (
                    <li key={id}>
                      <Link
                        to={to}
                        className="adm-nav-link"
                        aria-current={isActive ? (path === to ? 'page' : 'true') : undefined}
                        onClick={guardedClick(to, close)}
                      >
                        <Icon size={18} className="adm-nav-icon" />
                        <span className="adm-nav-label">{label}</span>
                        {showCount && (
                          <span className="adm-nav-count">
                            {unreadCount}
                            <span className="adm-sr-only"> pesan belum dibaca</span>
                          </span>
                        )}
                      </Link>
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
