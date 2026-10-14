import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  getCurrentUser,
  onAuthStateChange,
  signIn,
  signOut,
  verifyIsAdmin,
} from '../../lib/authService'
import './AdminLoginPage.css'

// Supabase Auth returns raw English messages. Map the common ones to clear Indonesian copy
// at render time; any other message (including our own Indonesian ones) is shown as-is.
const FRIENDLY_AUTH_ERRORS = [
  {
    pattern: /invalid login credentials/i,
    message: 'Email atau password salah. Periksa kembali, lalu coba lagi.',
  },
  {
    pattern: /email not confirmed/i,
    message:
      'Email ini belum dikonfirmasi. Buka tautan konfirmasi di kotak masuk email Anda terlebih dahulu.',
  },
  {
    pattern: /failed to fetch|networkerror|network request failed|load failed/i,
    message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda, lalu coba lagi.',
  },
  {
    pattern: /rate limit|too many requests|for security purposes/i,
    message: 'Terlalu banyak percobaan masuk. Tunggu beberapa menit, lalu coba lagi.',
  },
]

function toFriendlyAuthError(message) {
  if (!message) return ''
  const match = FRIENDLY_AUTH_ERRORS.find(({ pattern }) => pattern.test(message))
  return match ? match.message : message
}

const ICON_PROPS = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
}

function EyeIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M3 3l18 18" />
      <path d="M10.6 5.1A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.2" />
      <path d="M6.6 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7a10.6 10.6 0 0 0 5.4-1.6" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5" />
      <path d="M12 16.2v.3" />
    </svg>
  )
}

function ArrowLeftIcon() {
  return (
    <svg {...ICON_PROPS} width={18} height={18}>
      <path d="M19 12H5" />
      <path d="M11 18l-6-6 6-6" />
    </svg>
  )
}

/**
 * Light-themed page shell shared by the session check and the form,
 * so the layout does not jump when the check finishes.
 */
function AdminLoginShell({ children }) {
  return (
    <div className="admin-login-page" data-theme="light">
      <header className="admin-login-brand" data-theme="dark">
        <div className="admin-login-brand-inner">
          <span className="admin-login-monogram" aria-hidden="true">
            AD
          </span>
          <p className="admin-login-brand-name">Aldi Dwi Irawan</p>
          <span className="admin-login-brand-rule" aria-hidden="true" />
        </div>
      </header>
      <main className="admin-login-main">{children}</main>
    </div>
  )
}

/**
 * AdminLoginPage Component
 * Provides authentication interface for portfolio owner / admin.
 * Verifies admin privileges before redirecting to dashboard.
 */
function AdminLoginPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState(location.state?.deniedMessage || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [nonAdminUser, setNonAdminUser] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

  const destination = location.state?.from?.pathname || '/admin'

  useEffect(() => {
    let isMounted = true

    // Check existing session on mount
    async function checkExistingAuth() {
      try {
        const { user } = await getCurrentUser()
        if (isMounted) {
          if (user) {
            const isAdmin = await verifyIsAdmin(user.id)
            if (isAdmin) {
              navigate(destination, { replace: true })
              return
            } else {
              setNonAdminUser(user)
              setErrorMsg(
                'Akun Anda saat ini tidak terdaftar sebagai administrator portfolio.'
              )
            }
          }
          setIsCheckingAuth(false)
        }
      } catch {
        if (isMounted) {
          setIsCheckingAuth(false)
        }
      }
    }

    checkExistingAuth()

    const subscription = onAuthStateChange(async (_event, session) => {
      if (isMounted && session?.user) {
        const isAdmin = await verifyIsAdmin(session.user.id)
        if (isAdmin) {
          navigate(destination, { replace: true })
        } else {
          setNonAdminUser(session.user)
          setErrorMsg(
            'Akun Anda saat ini tidak terdaftar sebagai administrator portfolio.'
          )
        }
      }
    })

    return () => {
      isMounted = false
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe()
      }
    }
  }, [navigate, destination])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setIsSubmitting(true)

    try {
      const { data, error } = await signIn(email, password)

      if (error) {
        setErrorMsg(error.message || 'Gagal masuk. Periksa kembali email dan password Anda.')
        setIsSubmitting(false)
        return
      }

      if (data?.user) {
        // Enforce admin profile verification
        const isAdmin = await verifyIsAdmin(data.user.id)

        if (!isAdmin) {
          await signOut()
          setErrorMsg(
            'Akses ditolak: Akun terotentikasi ini tidak terdaftar sebagai administrator portfolio.'
          )
          setIsSubmitting(false)
          return
        }

        navigate(destination, { replace: true })
      }
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem saat mencoba autentikasi.')
      setIsSubmitting(false)
    }
  }

  const handleNonAdminSignOut = async () => {
    await signOut()
    setNonAdminUser(null)
    setErrorMsg('')
  }

  // The submit button uses aria-disabled (not disabled) so keyboard focus is kept while
  // the request runs; this guard blocks a second submit in the meantime.
  const handleFormSubmit = (e) => {
    if (isSubmitting) {
      e.preventDefault()
      return
    }
    handleSubmit(e)
  }

  const displayError = toFriendlyAuthError(errorMsg)
  const errorId = 'admin-login-error'

  if (isCheckingAuth) {
    return (
      <AdminLoginShell>
        <div className="admin-login-checking" role="status">
          <span className="admin-login-spinner admin-login-spinner-lg" aria-hidden="true" />
          <p>Memeriksa status login...</p>
        </div>
      </AdminLoginShell>
    )
  }

  return (
    <AdminLoginShell>
      <div className="admin-login-card">
        <div className="admin-login-header">
          <span className="admin-login-badge">Portal CMS Portfolio</span>
          <h1 className="admin-login-title">Admin Login</h1>
          <p className="admin-login-subtitle">
            Masuk dengan akun pemilik portfolio untuk mengelola konten dan pesan masuk.
          </p>
        </div>

        {/* Always mounted so screen readers announce messages as soon as they appear */}
        <div id={errorId} className="admin-login-alert-region" role="alert" aria-atomic="true">
          {displayError && (
            <div className="admin-login-alert">
              <AlertIcon />
              <p>{displayError}</p>
            </div>
          )}
        </div>

        {nonAdminUser ? (
          <div className="admin-login-session">
            <p>
              Sedang login sebagai: <strong>{nonAdminUser.email}</strong> (Non-Admin). Silakan
              keluar untuk masuk dengan akun administrator.
            </p>
            <button
              type="button"
              className="admin-login-submit"
              onClick={handleNonAdminSignOut}
            >
              Keluar dari Akun Ini
            </button>
          </div>
        ) : (
          <form
            className="admin-login-form"
            onSubmit={handleFormSubmit}
            aria-busy={isSubmitting}
          >
            <div className="admin-login-field">
              <label htmlFor="admin-email" className="admin-login-label">
                Email Admin
              </label>
              <input
                id="admin-email"
                name="email"
                type="email"
                className="admin-login-input"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                inputMode="email"
                autoCapitalize="none"
                spellCheck={false}
                aria-describedby={displayError ? errorId : undefined}
              />
            </div>

            <div className="admin-login-field">
              <label htmlFor="admin-password" className="admin-login-label">
                Password
              </label>
              <div className="admin-login-password">
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="admin-login-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  autoCapitalize="none"
                  spellCheck={false}
                  aria-describedby={displayError ? errorId : undefined}
                />
                <button
                  type="button"
                  className="admin-login-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-controls="admin-password"
                  aria-pressed={showPassword}
                  aria-label="Tampilkan password"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="admin-login-submit"
              aria-disabled={isSubmitting || undefined}
            >
              {isSubmitting && <span className="admin-login-spinner" aria-hidden="true" />}
              {isSubmitting ? 'Memverifikasi...' : 'Masuk ke Dashboard'}
            </button>
          </form>
        )}

        <div className="admin-login-footer">
          <Link to="/" className="admin-login-back">
            <ArrowLeftIcon />
            <span>Kembali ke Halaman Utama</span>
          </Link>
        </div>
      </div>
    </AdminLoginShell>
  )
}

export default AdminLoginPage
