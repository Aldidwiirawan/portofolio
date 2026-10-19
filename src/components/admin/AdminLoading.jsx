import { useLocation } from 'react-router-dom'
import './AdminLoading.css'

/**
 * Loading screen of the admin area: the light admin frame with a spinner that appears after 0.3 s.
 * Small and in the main bundle, so it is styled even while the admin code itself is loading.
 * @param {{ text?: string, plain?: boolean }} props plain: without the dark admin bar (login)
 */
function AdminLoading({ text = 'Memuat halaman...', plain = false }) {
  return (
    <div className={`admin-auth-loading${plain ? ' admin-auth-loading--plain' : ''}`} role="status" aria-live="polite">
      <div className="admin-loading-spinner" aria-hidden="true" />
      <p className="admin-loading-text">{text}</p>
    </div>
  )
}

/** Fallback while admin code loads: the admin frame, or a plain light screen for the login page. */
export function AdminPageFallback() {
  const { pathname } = useLocation()
  return <AdminLoading plain={pathname === '/admin/login'} />
}

export default AdminLoading
