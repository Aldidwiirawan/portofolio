import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PublicHomePage from './pages/PublicHomePage'
import NotFoundPage from './pages/NotFoundPage'
import PublicLayout from './components/public/PublicLayout'
import { AdminPageFallback } from './components/admin/AdminLoading'

// Public pages loaded on demand (inside PublicLayout, which shows its own loading state)
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'))

// The admin is loaded only when an /admin address is opened (stage 3C): its frame (shutter transition)
// and its pages, with the access check, auth and supabase-js, are separate chunks
const AdminShell = lazy(() => import('./components/admin/AdminShell'))
const AdminPage = lazy(() => import('./components/admin/AdminPage'))

// Admin addresses and the page each one opens (AdminPage.jsx). Other /admin… addresses get the 404 page.
const ADMIN_ROUTES = {
  '/admin/login': 'login',
  '/admin': 'dashboard',
  '/admin/projects': 'projects',
  '/admin/skills': 'skills',
  '/admin/experiences': 'experiences',
  '/admin/educations': 'educations',
  '/admin/profile': 'profile',
  '/admin/messages': 'messages',
  '/admin/certifications': 'certifications',
  '/admin/achievements': 'achievements',
  '/admin/languages': 'languages',
  '/admin/organizations': 'organizations',
  '/admin/guestbook': 'guestbook',
}

/**
 * Root Application Component with Public & Admin Route Separation
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login and the protected admin pages, sharing one frame */}
        <Route
          element={
            <Suspense fallback={<AdminPageFallback />}>
              <AdminShell />
            </Suspense>
          }
        >
          {Object.entries(ADMIN_ROUTES).map(([path, page]) => (
            <Route key={path} path={path} element={<AdminPage page={page} />} />
          ))}
        </Route>

        {/* Public pages sharing one frame (theme, language, data): the portfolio, project detail
            and the 404 page for unknown addresses */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<PublicHomePage />} />
          <Route path="/projects/:slug" element={<ProjectDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
