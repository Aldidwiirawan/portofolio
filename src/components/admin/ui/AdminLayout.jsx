import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getCurrentUser, onAuthStateChange, signOut } from '../../../lib/authService'
import { useMessages } from '../../../hooks/useMessages'
import BlueprintBackground from '../../effects/BlueprintBackground'
import ViewfinderCursor from '../../effects/ViewfinderCursor'
import { AdminShellContext, useAdminShell, useLeaveGuard } from './adminContexts'
import { AdminSidebar } from './AdminSidebar'
import { PageHeader } from './PageHeader'
import { SubNav } from './SubNav'
import { ToastProvider } from './Toast'
import { UnsavedChangesProvider } from './UnsavedChangesProvider'
import './admin-ui.css'
import './admin-layout.css'

// Path of the admin page shown last in this tab. A different admin page mounting means in-app
// navigation, so focus moves to its h1. The first page after login gets focus from the shutter
// transition, and a fresh page load leaves focus where the browser puts it. (A path, not a flag,
// so StrictMode's double effect run in development does not count as a navigation.)
let lastShownPath = null

/**
 * Root of every admin page (wraps the page's own component, so its handlers can use toasts and
 * the unsaved-changes guard): light theme, toasts, unsaved-changes guard, session watch, logout and
 * the messages list behind the unread badge (also readable by pages through useAdminShell).
 *
 *   function AdminProjectsPage() {
 *     return <AdminRoot><ProjectsScreen /></AdminRoot>
 *   }
 */
export function AdminRoot({ children }) {
  return (
    <div className="adm" data-theme="light">
      <ToastProvider>
        <UnsavedChangesProvider>
          <AdminSession>{children}</AdminSession>
        </UnsavedChangesProvider>
      </ToastProvider>
    </div>
  )
}

function AdminSession({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const navigate = useNavigate()
  const { confirmLeave } = useLeaveGuard()
  const inbox = useMessages()

  // Session watch and logout, moved unchanged from the old dashboard page
  useEffect(() => {
    let isMounted = true

    async function loadUser() {
      const { user } = await getCurrentUser()
      if (isMounted) {
        setCurrentUser(user)
      }
    }

    loadUser()

    const subscription = onAuthStateChange((_event, session) => {
      if (isMounted) {
        if (!session?.user) {
          navigate('/admin/login', { replace: true })
        } else {
          setCurrentUser(session.user)
        }
      }
    })

    return () => {
      isMounted = false
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe()
      }
    }
  }, [navigate])

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return
    if (!(await confirmLeave())) return
    setIsLoggingOut(true)
    try {
      await signOut()
      // Navigasi ke /admin/login setelah sesi dibersihkan
      navigate('/admin/login', { replace: true })
    } catch {
      setIsLoggingOut(false)
    }
  }, [isLoggingOut, confirmLeave, navigate])

  const shell = useMemo(
    () => ({
      email: currentUser?.email ?? null,
      isLoggingOut,
      logout: handleLogout,
      inbox,
      refreshUnread: inbox.refetch,
    }),
    [currentUser, isLoggingOut, handleLogout, inbox]
  )

  return <AdminShellContext.Provider value={shell}>{children}</AdminShellContext.Provider>
}

/**
 * Visible frame of an admin page (render inside AdminRoot): dark sidebar (drawer below 1024 px),
 * light work area with the calm blueprint backdrop and the viewfinder cursor, skip link, the
 * page header with the page's only h1, and the sub-tabs of the open section.
 *
 * - title / description / actions / breadcrumb / leading: see PageHeader
 * - docTitle: browser tab title (defaults to `title`)
 * - headingRef: optional ref to the h1, for pages that move focus to it (e.g. after a delete)
 */
export function AdminLayout({ title, description, actions, breadcrumb, leading, docTitle, headingRef: outerHeadingRef, children }) {
  const { email, isLoggingOut, logout, inbox } = useAdminShell()
  const { pathname } = useLocation()
  const ownHeadingRef = useRef(null)
  const headingRef = outerHeadingRef || ownHeadingRef
  const lastTitle = useRef(title)

  const pageTitle = docTitle || title
  useEffect(() => {
    const previous = document.title
    document.title = `${pageTitle} · Kelola isi · Aldi Dwi Irawan`
    return () => {
      document.title = previous
    }
  }, [pageTitle])

  // In-app navigation between admin pages: start at the top, focus the new h1
  useEffect(() => {
    if (lastShownPath && lastShownPath !== pathname) {
      window.scrollTo(0, 0)
      headingRef.current?.focus({ preventScroll: true })
    }
    lastShownPath = pathname
  }, [pathname, headingRef])

  // Same page, new view (list ↔ form): focus the new h1 so screen readers announce it
  useEffect(() => {
    if (lastTitle.current === title) return
    lastTitle.current = title
    window.scrollTo(0, 0)
    headingRef.current?.focus({ preventScroll: true })
  }, [title, headingRef])

  return (
    <>
      <a href="#adm-main" className="adm-skip">
        Lewati ke konten
      </a>
      <ViewfinderCursor />
      <div className="adm-shell">
        <AdminSidebar email={email} unreadCount={inbox?.unreadCount ?? 0} onLogout={logout} isLoggingOut={isLoggingOut} />
        <div className="adm-work">
          <BlueprintBackground variant="calm" />
          <main id="adm-main" className="adm-main" tabIndex={-1}>
            <PageHeader
              title={title}
              description={description}
              actions={actions}
              breadcrumb={breadcrumb}
              leading={leading}
              headingRef={headingRef}
            />
            <SubNav unreadCount={inbox?.unreadCount ?? 0} />
            {children}
          </main>
        </div>
      </div>
    </>
  )
}
