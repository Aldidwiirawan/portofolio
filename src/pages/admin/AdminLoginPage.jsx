import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  getCurrentUser,
  onAuthStateChange,
  signIn,
  signOut,
  verifyIsAdmin,
} from '../../lib/authService'
import Logo from '../../components/brand/Logo'
import RobotMascot from '../../components/brand/RobotMascot'
import BlueprintBackground from '../../components/effects/BlueprintBackground'
import ViewfinderCursor from '../../components/effects/ViewfinderCursor'
import { useShutter } from '../../components/effects/shutterContext'
import { prefersReducedMotion, useMediaQuery } from '../../lib/useMediaQuery'
import './AdminLoginPage.css'

const PAGE_TITLE = 'Masuk · Aldi Dwi Irawan'
const SUCCESS_HOLD_MS = 450 // robot celebrates before the shutter starts
const ERROR_MOOD_MS = 2000
const SHAKE_MS = 400

// Supabase Auth returns raw English messages and the auth logic uses technical Indonesian.
// Both are mapped to plain Indonesian at render time; any other message is shown as-is.
const FRIENDLY_AUTH_ERRORS = [
  {
    pattern: /invalid login credentials/i,
    message: 'Email atau kata sandi salah. Periksa lagi, lalu coba sekali lagi.',
  },
  {
    pattern: /email not confirmed/i,
    message: 'Email ini belum dikonfirmasi. Buka tautan konfirmasi di email Anda dulu.',
  },
  {
    pattern: /failed to fetch|networkerror|network request failed|load failed/i,
    message: 'Tidak bisa terhubung ke server. Periksa koneksi internet, lalu coba lagi.',
  },
  {
    pattern: /rate limit|too many requests|for security purposes/i,
    message: 'Terlalu banyak percobaan masuk. Tunggu beberapa menit, lalu coba lagi.',
  },
  {
    pattern: /tidak terdaftar sebagai administrator/i,
    message: 'Akun ini tidak punya akses untuk mengelola situs.',
  },
  {
    pattern: /^gagal masuk/i,
    message: 'Gagal masuk. Periksa email dan kata sandi, lalu coba lagi.',
  },
  {
    pattern: /kesalahan sistem/i,
    message: 'Terjadi kesalahan. Coba lagi sebentar lagi.',
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

let measureContext = null

/** Width in px of `text` rendered with the font of `input` (used to aim the robot's gaze). */
function measureTextWidth(text, input) {
  if (!text || !input) return 0
  measureContext ??= document.createElement('canvas').getContext('2d')
  if (!measureContext) return 0
  const style = getComputedStyle(input)
  measureContext.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
  return measureContext.measureText(text).width
}

/**
 * Drop-in replacement for navigate() on this page. The first call starts the exit sequence
 * (robot success → shutter → navigate behind the closed curtains); later calls are ignored,
 * because the session check, the auth listener and the form can all navigate on success.
 */
function useLoginExitNavigate(onExitStart) {
  const routerNavigate = useNavigate()
  const { runShutter } = useShutter()
  const latest = useRef({ routerNavigate, runShutter, onExitStart })
  const pendingRef = useRef(false)
  const holdTimerRef = useRef(0)

  useEffect(() => {
    latest.current = { routerNavigate, runShutter, onExitStart }
  })

  useEffect(() => () => clearTimeout(holdTimerRef.current), [])

  return useCallback((to, options) => {
    if (pendingRef.current) return
    pendingRef.current = true
    latest.current.onExitStart?.()

    const targetPath = typeof to === 'string' ? to : to?.pathname
    const startShutter = () => {
      const { runShutter: run, routerNavigate: navigateNow } = latest.current
      run({
        onCovered: () => navigateNow(to, options),
        // Destination rendered: route active, its heading present, no loading screen left
        isReady: () => {
          const heading = document.querySelector('h1')
          return (
            window.location.pathname === targetPath &&
            Boolean(heading) &&
            !heading.closest('.admin-login-page') &&
            !document.querySelector('.admin-auth-loading')
          )
        },
        message:
          targetPath === '/admin'
            ? 'Berhasil masuk. Membuka beranda…'
            : 'Berhasil masuk. Membuka halaman tujuan…',
      })
    }

    if (prefersReducedMotion()) startShutter()
    else holdTimerRef.current = setTimeout(startShutter, SUCCESS_HOLD_MS)
  }, [])
}

/**
 * Light page shell shared by the session check and the form, so the layout does not jump
 * when the check finishes. The robot sits in the dark brand panel on wide screens and above
 * the card on smaller ones.
 */
function AdminLoginShell({ children, robot }) {
  const isWide = useMediaQuery('(min-width: 1024px)')

  return (
    <div className="admin-login-page" data-theme="light">
      <ViewfinderCursor />
      <header className="admin-login-brand" data-theme="dark">
        <div className="admin-login-brand-inner">
          <div className="admin-login-lockup">
            <Logo size={32} assemble className="admin-login-logo" />
            <p className="admin-login-brand-name">Aldi Dwi Irawan</p>
          </div>
          {isWide && (
            <div className="admin-login-robot admin-login-robot--panel">
              <RobotMascot {...robot} size={240} />
            </div>
          )}
        </div>
      </header>
      <main className="admin-login-main">
        <BlueprintBackground variant="busy" />
        <div className="admin-login-stack">
          {!isWide && (
            <div className="admin-login-robot admin-login-robot--inline">
              <RobotMascot {...robot} size={104} />
            </div>
          )}
          {children}
        </div>
      </main>
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
  const [isExiting, setIsExiting] = useState(false)
  const navigate = useLoginExitNavigate(() => setIsExiting(true))

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

  // ---- Presentation state (robot, shake, hints); never changes the auth flow above ----

  const emailRef = useRef(null)
  const passwordRef = useRef(null)
  const wasSubmittingRef = useRef(false)
  const [focusArea, setFocusArea] = useState(null) // 'email' | 'password' | null
  const [gaze, setGaze] = useState(0)
  const [errorCue, setErrorCue] = useState(0)
  const [isErrorMood, setIsErrorMood] = useState(false)
  const [isShaking, setIsShaking] = useState(false)
  const [capsLockOn, setCapsLockOn] = useState(false)

  useEffect(() => {
    const previousTitle = document.title
    document.title = PAGE_TITLE
    return () => {
      document.title = previousTitle
    }
  }, [])

  // Eyes follow the end of the typed email: -1 at the start of the field, 1 at its end
  useEffect(() => {
    const input = emailRef.current
    if (focusArea !== 'email' || !input) return
    const style = getComputedStyle(input)
    const usable = input.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
    const progress = usable > 0 ? Math.min(1, measureTextWidth(email, input) / usable) : 0
    setGaze(progress * 2 - 1)
  }, [email, focusArea])

  // A failed attempt (submit finished with a message): robot reacts, card shakes,
  // and focus returns to the password field
  useEffect(() => {
    const wasSubmitting = wasSubmittingRef.current
    wasSubmittingRef.current = isSubmitting
    if (wasSubmitting && !isSubmitting && errorMsg) {
      setErrorCue((cue) => cue + 1)
      setIsErrorMood(true)
      setIsShaking(true)
      passwordRef.current?.focus()
    }
  }, [isSubmitting, errorMsg])

  useEffect(() => {
    if (!isErrorMood) return undefined
    const timer = setTimeout(() => setIsErrorMood(false), ERROR_MOOD_MS)
    return () => clearTimeout(timer)
  }, [isErrorMood, errorCue])

  useEffect(() => {
    if (!isShaking) return undefined
    const timer = setTimeout(() => setIsShaking(false), SHAKE_MS)
    return () => clearTimeout(timer)
  }, [isShaking, errorCue])

  let mood = 'idle'
  if (isExiting) mood = 'success'
  else if (isErrorMood) mood = 'error'
  else if (focusArea === 'password') mood = showPassword ? 'peeking' : 'hiding'
  else if (focusArea === 'email') mood = 'watching'

  const robot = {
    mood,
    lookAt: mood === 'watching' ? gaze : 0,
    cue: isExiting ? 1 : errorCue,
  }

  const handlePasswordAreaBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setFocusArea(null)
  }

  const updateCapsLock = (e) => {
    if (typeof e.getModifierState === 'function') setCapsLockOn(e.getModifierState('CapsLock'))
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
  const capsHintId = 'admin-password-hint'
  const showCapsHint = capsLockOn && focusArea === 'password'

  if (isCheckingAuth) {
    return (
      <AdminLoginShell robot={robot}>
        <div className="admin-login-checking" role="status">
          <span className="admin-login-spinner admin-login-spinner-lg" aria-hidden="true" />
          <p>Memeriksa status masuk...</p>
        </div>
      </AdminLoginShell>
    )
  }

  return (
    <AdminLoginShell robot={robot}>
      <div className={`admin-login-card${isShaking ? ' admin-login-card--shake' : ''}`}>
        <div className="admin-login-header">
          <span className="admin-login-badge">Kelola isi portofolio</span>
          <h1 className="admin-login-title">Masuk</h1>
          <p className="admin-login-subtitle">
            Masuk dengan akun pemilik untuk mengelola isi portofolio dan pesan masuk.
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
              Anda masuk sebagai <strong>{nonAdminUser.email}</strong>. Keluar dulu, lalu masuk
              dengan akun pemilik.
            </p>
            <button
              type="button"
              className="admin-login-submit"
              onClick={handleNonAdminSignOut}
            >
              Keluar dari akun ini
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
                Email
              </label>
              <input
                ref={emailRef}
                id="admin-email"
                name="email"
                type="email"
                className="admin-login-input"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusArea('email')}
                onBlur={() => setFocusArea(null)}
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
                Kata sandi
              </label>
              <div
                className="admin-login-password"
                onFocus={() => setFocusArea('password')}
                onBlur={handlePasswordAreaBlur}
              >
                <input
                  ref={passwordRef}
                  id="admin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="admin-login-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={updateCapsLock}
                  onKeyUp={updateCapsLock}
                  required
                  autoComplete="current-password"
                  autoCapitalize="none"
                  spellCheck={false}
                  aria-describedby={[displayError && errorId, capsHintId].filter(Boolean).join(' ')}
                />
                <button
                  type="button"
                  className="admin-login-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-controls="admin-password"
                  aria-pressed={showPassword}
                  aria-label="Tampilkan kata sandi"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              <p id={capsHintId} className="admin-login-hint" aria-live="polite">
                {showCapsHint ? 'Caps Lock aktif' : ''}
              </p>
            </div>

            <button
              type="submit"
              className="admin-login-submit"
              aria-disabled={isSubmitting || undefined}
            >
              {isSubmitting && <span className="admin-login-spinner" aria-hidden="true" />}
              {isSubmitting ? 'Sedang masuk...' : 'Masuk'}
            </button>
          </form>
        )}

        <div className="admin-login-footer">
          <Link to="/" className="admin-login-back">
            <ArrowLeftIcon />
            <span>Kembali ke beranda</span>
          </Link>
        </div>
      </div>
    </AdminLoginShell>
  )
}

export default AdminLoginPage
