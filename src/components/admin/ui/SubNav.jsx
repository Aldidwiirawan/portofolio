import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { findAdminSection, normalizeAdminPath } from './adminNav'
import { useGuardedNav } from './useGuardedNav'

/**
 * Sub-tabs of the open admin section (e.g. Proyek · Keahlian · Sertifikat), under the page header.
 * Every tab is its own route, so this is a <nav> of links with aria-current="page" rather than a
 * tablist. When the tabs do not fit, the row scrolls sideways on its own (the page never does),
 * the open tab is scrolled into view, and the edges fade to show there is more.
 * Clicks ask before leaving a form with unsaved changes.
 */
export function SubNav({ unreadCount = 0 }) {
  const { pathname } = useLocation()
  const path = normalizeAdminPath(pathname)
  const section = findAdminSection(pathname)
  const listRef = useRef(null)
  const guardedClick = useGuardedNav()
  const [more, setMore] = useState({ start: false, end: false })
  const hasTabs = Boolean(section && section.items.length > 1)

  // Keep the open tab visible inside the row
  useLayoutEffect(() => {
    const list = listRef.current
    const current = list?.querySelector('[aria-current="page"]')
    if (!list || !current) return
    const pad = 24
    const left = current.offsetLeft
    const right = left + current.offsetWidth
    if (left - pad < list.scrollLeft) {
      list.scrollLeft = Math.max(0, left - pad)
    } else if (right + pad > list.scrollLeft + list.clientWidth) {
      list.scrollLeft = right + pad - list.clientWidth
    }
  }, [path, hasTabs])

  // Fade the edge(s) that still have tabs beyond them
  useEffect(() => {
    const list = listRef.current
    if (!list) return undefined
    const update = () => {
      const max = list.scrollWidth - list.clientWidth
      const start = list.scrollLeft > 1
      const end = max - list.scrollLeft > 1
      setMore((prev) => (prev.start === start && prev.end === end ? prev : { start, end }))
    }
    update()
    list.addEventListener('scroll', update, { passive: true })
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update)
    observer?.observe(list)
    return () => {
      list.removeEventListener('scroll', update)
      observer?.disconnect()
    }
  }, [hasTabs])

  if (!hasTabs) return null

  const listClass = ['adm-subnav-list', more.start && 'has-more-start', more.end && 'has-more-end'].filter(Boolean).join(' ')

  return (
    <nav className="adm-subnav" aria-label={section.label}>
      <ul ref={listRef} className={listClass}>
        {section.items.map((item) => {
          const showCount = item.count === 'unread' && unreadCount > 0
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className="adm-subnav-link"
                aria-current={item.to === path ? 'page' : undefined}
                onClick={guardedClick(item.to)}
              >
                {item.label}
                {showCount && (
                  <span className="adm-nav-count">
                    {unreadCount}
                    <span className="adm-sr-only"> belum dibaca</span>
                  </span>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
