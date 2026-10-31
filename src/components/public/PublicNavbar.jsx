import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useFocusTrap } from '../admin/ui/useFocusTrap'
import { useMediaQuery, prefersReducedMotion } from '../../lib/useMediaQuery'
import { useI18n } from '../../i18n/i18nContext'
import { CloseIcon, MenuIcon } from './icons'
import { openGuestbook } from './guestbook/guestbookEvents'
import { usePublicData } from './publicContexts'
import { SITE_NAME } from './publicFormat'
import Logo from '../brand/Logo'
import { LangToggle, SoundToggle, ThemeToggle } from './Toggles'
import './PublicNavbar.css'

// Sections in the menu, with the data that decides whether the section exists (null = always).
// "Buku Tamu" is not a section: it opens the guestbook panel (on another page: /#bukutamu, which
// opens it once the home page is there).
const NAV_SECTIONS = [
  { id: 'beranda', label: 'nav.top', data: null },
  { id: 'tentang', label: 'nav.about', data: 'profile' },
  { id: 'proyek', label: 'nav.projects', data: 'projects' },
  { id: 'perjalanan', label: 'nav.journey', data: ['experiences', 'educations'] },
  { id: 'sertifikat', label: 'nav.certificates', data: 'certifications' },
  { id: 'bukutamu', label: 'nav.guestbook', data: null, guestbook: true },
]

function hasSection(data, key) {
  if (!key) return true
  if (Array.isArray(key)) return key.some((one) => hasSection(data, one))
  const entry = data[key]
  if (entry.status !== 'ready') return true // loading or failed: the section still shows (skeleton / message)
  return Array.isArray(entry.data) ? entry.data.length > 0 : Boolean(entry.data)
}

/** "AD" from "Aldi Dwi Irawan": first letters of the first two words. */
function initialsOf(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

/**
 * Section of the home page currently in the middle of the screen (for the menu highlight).
 * `refreshKey` changes when sections may have appeared or gone (data loaded), so they are observed again.
 */
function useActiveSection(ids, enabled, refreshKey) {
  const [active, setActive] = useState(null)
  const key = ids.join(',')

  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === 'undefined') return undefined
    const elements = key.split(',').map((id) => document.getElementById(id)).filter(Boolean)
    const visible = new Map()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) visible.set(entry.target.id, entry.isIntersecting)
        setActive(elements.find((el) => visible.get(el.id))?.id ?? null)
      },
      { rootMargin: '-45% 0px -50% 0px' }
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [key, enabled, refreshKey])

  return enabled ? active : null
}

/**
 * Navbar of the public pages, laid out like the reference site of phase 8: the initials on the left, the
 * menu in the middle, and sound, theme and language on the right. Below 1240 px (seven items with
 * Indonesian labels need that width) the menu button opens a panel under the bar; while it is open the
 * bar and the panel keep the focus, and Escape, the close button, a click outside or choosing an item
 * closes it.
 */
function PublicNavbar() {
  const data = usePublicData()
  const { t } = useI18n()
  const { pathname, hash } = useLocation()
  const navigate = useNavigate()
  const isHome = pathname === '/'
  const isDesktop = useMediaQuery('(min-width: 1120px)')
  const [menuOpen, setMenuOpen] = useState(false)
  const headerRef = useRef(null)

  const name = data.profile.data?.full_name || SITE_NAME
  const items = NAV_SECTIONS.filter((item) => hasSection(data, item.data))
  const statusKey = Object.keys(data)
    .map((key) => data[key]?.status ?? '')
    .join('|')
  const active = useActiveSection(
    items.filter((item) => !item.guestbook).map((item) => item.id),
    isHome,
    statusKey
  )

  // The panel only exists on small screens (it closes when the window grows past 1240 px)
  const menuShown = menuOpen && !isDesktop
  const closeMenu = () => setMenuOpen(false)
  useFocusTrap(headerRef, menuShown, { onEscape: closeMenu })

  useEffect(() => {
    if (!menuShown) return undefined
    const onPointer = (event) => {
      if (!headerRef.current?.contains(event.target)) setMenuOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    return () => document.removeEventListener('pointerdown', onPointer)
  }, [menuShown])

  const onBrandClick = (event) => {
    if (!isHome) return
    event.preventDefault()
    if (hash) navigate('/')
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }

  const onItemClick = (item) => (event) => {
    closeMenu()
    if (item.guestbook && isHome) {
      event.preventDefault()
      openGuestbook()
    }
  }

  const links = (className) =>
    items.map((item) => (
      <li key={item.id}>
        <Link
          to={{ pathname: '/', hash: `#${item.id}` }}
          className={className}
          aria-current={active === item.id ? 'location' : undefined}
          aria-haspopup={item.guestbook ? 'dialog' : undefined}
          onClick={onItemClick(item)}
        >
          {t(item.label)}
        </Link>
      </li>
    ))

  return (
    <header ref={headerRef} className="pub-nav" data-menu-open={menuShown || undefined}>
      <div className="pub-nav-bar">
        {/* Logo Monogram Aldi */}
        <Link to="/" className="pub-nav-brand" aria-label={t('nav.home', { initials: initialsOf(name), name })} onClick={onBrandClick}>
          <Logo size={32} trim assemble className="pub-nav-logo" />
        </Link>

        <nav className="pub-nav-links" aria-label={t('nav.label')}>
          <ul>{links('pub-nav-link')}</ul>
        </nav>

        <div className="pub-nav-actions">
          <SoundToggle className="pub-nav-btn" />
          <ThemeToggle className="pub-nav-btn" />
          <LangToggle />
          <a
            href="/#kontak"
            className="pub-nav-contact-btn"
            onClick={(e) => {
              if (isHome) {
                e.preventDefault()
                const el = document.getElementById('kontak')
                if (el) el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
              }
            }}
          >
            {t('nav.contactMe')}
          </a>
          <button
            type="button"
            className="pub-nav-menu-btn"
            aria-expanded={menuShown}
            aria-controls="pub-menu"
            aria-label={t(menuShown ? 'nav.closeMenu' : 'nav.open')}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuShown ? <CloseIcon size={28} /> : <MenuIcon size={28} />}
          </button>
        </div>
      </div>

      {menuShown && (
        <nav id="pub-menu" className="pub-menu" aria-label={t('nav.label')}>
          <ul>
            {links('pub-menu-link')}
            <li className="pub-menu-cta-item">
              <a
                href="/#kontak"
                className="pub-menu-contact-btn"
                onClick={(e) => {
                  closeMenu()
                  if (isHome) {
                    e.preventDefault()
                    const el = document.getElementById('kontak')
                    if (el) el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
                  }
                }}
              >
                {t('nav.contactMe')}
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}

export default PublicNavbar
