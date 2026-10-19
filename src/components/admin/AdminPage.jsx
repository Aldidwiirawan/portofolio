import { lazy } from 'react'
import AdminRoute from './AdminRoute'

// Every admin page is its own chunk, loaded when it is opened
const PAGES = {
  login: lazy(() => import('../../pages/admin/AdminLoginPage')),
  dashboard: lazy(() => import('../../pages/admin/AdminDashboardPage')),
  projects: lazy(() => import('../../pages/admin/AdminProjectsPage')),
  skills: lazy(() => import('../../pages/admin/AdminSkillsPage')),
  experiences: lazy(() => import('../../pages/admin/AdminExperiencesPage')),
  educations: lazy(() => import('../../pages/admin/AdminEducationsPage')),
  profile: lazy(() => import('../../pages/admin/AdminProfilePage')),
  messages: lazy(() => import('../../pages/admin/AdminMessagesPage')),
  certifications: lazy(() => import('../../pages/admin/AdminCertificationsPage')),
  achievements: lazy(() => import('../../pages/admin/AdminAchievementsPage')),
  languages: lazy(() => import('../../pages/admin/AdminLanguagesPage')),
  organizations: lazy(() => import('../../pages/admin/AdminOrganizationsPage')),
  guestbook: lazy(() => import('../../pages/admin/AdminGuestbookPage')),
}

/**
 * One admin page by name (see ADMIN_ROUTES in App.jsx). Every page except the login is behind
 * AdminRoute (session + admin check).
 * @param {{ page: keyof typeof PAGES }} props
 */
function AdminPage({ page }) {
  const Page = PAGES[page]
  if (page === 'login') return <Page />
  return (
    <AdminRoute>
      <Page />
    </AdminRoute>
  )
}

export default AdminPage
