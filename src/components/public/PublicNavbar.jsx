import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Logo from '../brand/Logo'
import { useFocusTrap } from '../admin/ui/useFocusTrap'
import { useScrollLock } from '../admin/ui/useScrollLock'
import { useMediaQuery, prefersReducedMotion } from '../../lib/useMediaQuery'
import { useI18n } from '../../i18n/i18nContext'
import CvButton from './CvButton'
import { CloseIcon, MenuIcon } from './icons'
import { usePublicData } from './publicContexts'
import { SITE_NAME } from './publicFormat'
import { LangToggle, ThemeToggle } from './Toggles'
import './PublicNavbar.css'

// Sections in the menu, with the data that decides whether the section exists (null = always)
const NAV_SECTIONS = [
  { id: 'tentang', label: 'nav.about', data: 'profile' },
  { id: 'proyek', label: 'nav.projects', data: 'projects' },
  { id: 'pengalaman', label: 'nav.experience', data: 'experiences' },
  { id: 'keahlian', label: 'nav.skills', data: 'skills' },
  { id: 'sertifikat', label: 'nav.certificates', data: 'certifications' },
  { id: 'kontak', label: 'nav.contact', data: null },
]

function hasSection(data, key) {
  if (!key) return true
  const entry = data[key]
  if (entry.status !== 'ready') return true // loading or failed: the section still shows (skeleton / message)
  return Array.isArray(entry.data) ? entry.data.length > 0 : Boolean(entry.data)
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
 * Sticky navbar of the public pages: logo, section menu, language and theme switches and "Unduh CV"
 * (only when a CV exists). Below 1024 px the menu opens as a full-screen dialog with focus kept inside;
 * Escape, the close button or choosing a section closes it.
 */
function PublicNavbar() {
  const data = usePublicData()
  const { t } = useI18n()
  const { pathname, hash } = useLocation()
  const navigate = useNavigate()
  const isHome = pathname === '/'
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef(null)

  const name = data.profile.data?.full_name || SITE_NAME
  const items = NAV_SECTIONS.filter((item) => hasSection(data, item.data))
  const statusKey = Object.keys(data)
    .map((key) => data[key]?.status ?? '')
    .join('|')
  const active = useActiveSection(
    items.map((item) => item.id),
    isHome,
    statusKey
  )

  // The full-screen menu only exists on small screens (it closes when the window grows past 1024 px)
  const menuShown = menuOpen && !isDesktop
  const closeMenu = () => setMenuOpen(false)
  useFocusTrap(menuRef, menuShown, { onEscape: closeMenu })
  useScrollLock(menuShown)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      setScrolled(window.scrollY > 4)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const onBrandClick = (event) => {
    if (!isHome) return
    event.preventDefault()
    if (hash) navigate('/')
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }

  const links = (onChoose) =>
    items.map((item) => (
      <li key={item.id}>
        <Link
          to={{ pathname: '/', hash: `#${item.id}` }}
          className="pub-nav-link"
          aria-current={active === item.id ? 'location' : undefined}
          onClick={onChoose}
        >
          {t(item.label)}
        </Link>
      </li>
    ))

  return (
    <>
      <header className="pub-nav" data-scrolled={scrolled}>
        <div className="pub-container pub-nav-bar">
          <Link to="/" className="pub-nav-brand" aria-label={t('nav.home', { name })} onClick={onBrandClick}>
            <Logo size={29} trim />
            <span className="pub-nav-name" aria-hidden="true">
              {name}
            </span>
          </Link>

          <nav className="pub-nav-links" aria-label={t('nav.label')}>
            <ul>{links()}</ul>
          </nav>

          <div className="pub-nav-actions">
            <LangToggle />
            <ThemeToggle />
            <CvButton size="sm" className="pub-nav-cv" />
            <button
              type="button"
              className="pub-icon-btn pub-nav-menu-btn"
              aria-expanded={menuShown}
              aria-controls="pub-menu"
              aria-label={t('nav.open')}
              onClick={() => setMenuOpen(true)}
            >
              <MenuIcon size={22} />
            </button>
          </div>
        </div>
      </header>

      {menuShown && (
        <div id="pub-menu" ref={menuRef} className="pub-menu" role="dialog" aria-modal="true" aria-labelledby="pub-menu-title">
          <div className="pub-container pub-menu-head">
            <p id="pub-menu-title" className="pub-tag">
              {t('nav.menuLabel')}
            </p>
            <button type="button" className="pub-icon-btn" aria-label={t('nav.closeMenu')} onClick={closeMenu}>
              <CloseIcon size={22} />
            </button>
          </div>
          <nav className="pub-container" aria-label={t('nav.label')}>
            <ul className="pub-menu-list">{links(closeMenu)}</ul>
          </nav>
          <div className="pub-container pub-menu-foot">
            <CvButton className="pub-menu-cv" onClick={closeMenu} />
            <div className="pub-menu-switches">
              <LangToggle />
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default PublicNavbar
