import { Suspense, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import ShutterProvider from '../effects/ShutterTransition'
import { AdminPageFallback } from './AdminLoading'

/**
 * Frame of every /admin route (loaded on demand, stage 3C: none of the admin code is in the public
 * bundle). The shutter overlay sits outside Suspense, so it survives while the next admin page loads.
 */
function AdminShell() {
  // Login and admin pages stay out of search engines (robots.txt and vercel.json close them too)
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])

  return (
    <ShutterProvider>
      <Suspense fallback={<AdminPageFallback />}>
        <Outlet />
      </Suspense>
    </ShutterProvider>
  )
}

export default AdminShell
