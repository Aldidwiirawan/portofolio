import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getCurrentUser, onAuthStateChange, signOut } from '../../../lib/authService'
import { useMessages } from '../../../hooks/useMessages'
import BlueprintBackground from '../../effects/BlueprintBackground'
import ViewfinderCursor from '../../effects/ViewfinderCursor'
import { AdminShellContext, useLeaveGuard } from './adminContexts'
import { AdminSidebar } from './AdminSidebar'
import { PageHeader } from './PageHeader'
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
 * Frame for every admin page: dark sidebar (drawer below 1024 px), light work area with the calm
 * blueprint backdrop and the viewfinder cursor, page header with the page's only h1, toasts and
 * the unsaved-changes guard.
 *
 * - title / description / actions / breadcrumb: see PageHeader
 * - docTitle: browser tab title (defaults to `title`)
 */
export function AdminLayout(props) {
  return (
    <div className="adm" data-theme="light">
      <ToastProvider>
        <UnsavedChangesProvider>
          <AdminShell {...props} />
        </UnsavedChangesProvider>
      </ToastProvider>
    </div>
  )
}

function AdminShell({ title, description, actions, breadcrumb, docTitle, children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { confirmLeave } = useLeaveGuard()
  const { unreadCount, refetch: refreshUnread } = useMessages()
  const headingRef = useRef(null)
  const lastTitle = useRef(title)

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

  const handleLogout = async () => {
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
  }

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
  }, [pathname])

  // Same page, new view (list ↔ form): focus the new h1 so screen readers announce it
  useEffect(() => {
    if (lastTitle.current === title) return
    lastTitle.current = title
    window.scrollTo(0, 0)
    headingRef.current?.focus({ preventScroll: true })
  }, [title])

  const shell = useMemo(() => ({ refreshUnread }), [refreshUnread])

  return (
    <AdminShellContext.Provider value={shell}>
      <a href="#adm-main" className="adm-skip">
        Lewati ke konten
      </a>
      <ViewfinderCursor />
      <div className="adm-shell">
        <AdminSidebar
          email={currentUser?.email}
          unreadCount={unreadCount}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
        />
        <div className="adm-work">
          <BlueprintBackground variant="calm" />
          <main id="adm-main" className="adm-main" tabIndex={-1}>
            <PageHeader
              title={title}
              description={description}
              actions={actions}
              breadcrumb={breadcrumb}
              headingRef={headingRef}
            />
            {children}
          </main>
        </div>
      </div>
    </AdminShellContext.Provider>
  )
}
