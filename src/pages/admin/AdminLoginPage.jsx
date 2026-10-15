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
import { usePageHidden } from '../../lib/usePageHidden'
import './AdminLoginPage.css'

const PAGE_TITLE = 'Masuk · Aldi Dwi Irawan'
const SUCCESS_HOLD_MS = 450 // robot celebrates before the shutter starts
const ERROR_MOOD_MS = 2000
const SHAKE_MS = 400

// Status badge under the robot (decorative; errors are announced by the alert region)
const ROBOT_STATUS = {
  idle: 'Siap',
  watching: 'Membaca email',
  hiding: 'Mata ditutup',
  peeking: 'Mengintip sedikit',
  error: 'Coba lagi',
  success: 'Berhasil masuk',
}

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

function ArrowRightIcon() {
  return (
    <svg {...ICON_PROPS} width={18} height={18} className="admin-login-submit-arrow">
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  )
}

/** "Blueprint module" card: decorative header bar (indicator + label) above the content. */
function LoginCard({ className = '', children }) {
  return (
    <div className={`admin-login-card ${className}`.trim()}>
      <div className="admin-login-card-bar" aria-hidden="true">
        <span className="admin-login-card-led" />
        <span className="admin-login-card-tag">Area pribadi</span>
      </div>
      <div className="admin-login-card-body">{children}</div>
    </div>
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
 * Blueprint HUD behind the robot (one SVG, 460 × 460, centred on the robot): three schematic rings
 * turning very slowly in opposite directions, three graphic-only chips floating gently and two data
 * pulses running along grid traces into the pedestal. Accents use the mood colour (--login-glow).
 * Animations are transform/opacity only and pause with the page.
 */
function StageHud() {
  return (
    <svg className="admin-login-hud" viewBox="0 0 460 460" aria-hidden="true" focusable="false">
      <g className="hud-ring hud-ring--outer">
        <circle className="hud-line hud-dots" cx="230" cy="230" r="190" />
      </g>
      <g className="hud-ring hud-ring--mid">
        <circle className="hud-line hud-dash" cx="230" cy="230" r="168" />
        <path className="hud-arc" d="M367.6 133.6A168 168 0 0 1 395.4 259.2M92.4 326.4A168 168 0 0 1 64.6 200.8" />
      </g>
      <g className="hud-ring hud-ring--inner">
        <circle className="hud-line hud-ticks" cx="230" cy="230" r="146" />
        <path className="hud-arc hud-arc--thin" d="M92.8 180.1A146 146 0 0 1 180.1 92.8" />
      </g>

      <path className="hud-trace" d="M0 300H110V368H146M460 220H340V368H314" />
      <path className="hud-node" d="M108.5 298.5h3v3h-3zM108.5 366.5h3v3h-3zM338.5 218.5h3v3h-3zM338.5 366.5h3v3h-3z" />
      <g className="hud-pulse hud-pulse--a">
        <circle className="hud-pulse-glow" r="6" />
        <circle className="hud-pulse-core" r="2.5" />
      </g>
      <g className="hud-pulse hud-pulse--b">
        <circle className="hud-pulse-glow" r="6" />
        <circle className="hud-pulse-core" r="2.5" />
      </g>

      <g transform="translate(60 70)">
        <g className="hud-chip hud-chip--a">
          <rect className="hud-chip-body" width="56" height="26" rx="3" />
          <path className="hud-chip-wave" d="M8 13H18L22 6L27 20L31 9L34 13H48" />
        </g>
      </g>
      <g transform="translate(344 92)">
        <g className="hud-chip hud-chip--b">
          <rect className="hud-chip-body" width="56" height="26" rx="3" />
          <circle className="hud-chip-dot" cx="14" cy="13" r="3" />
          <circle className="hud-chip-dot" cx="28" cy="13" r="3" />
          <circle className="hud-chip-dot hud-chip-dot--live" cx="42" cy="13" r="3" />
        </g>
      </g>
      <g transform="translate(360 290)">
        <g className="hud-chip hud-chip--c">
          <rect className="hud-chip-body" width="56" height="26" rx="3" />
          <path className="hud-chip-bars" d="M9 8H40M9 13H30M9 18H46" />
        </g>
      </g>
    </svg>
  )
}

/** Schematic docking pedestal the robot stands on in the brand panel (decorative). */
function DockPedestal() {
  return (
    <svg className="admin-login-dock" viewBox="0 0 280 72" aria-hidden="true" focusable="false">
      <path className="admin-login-dock-line" d="M92 30L78 54M188 30L202 54" />
      <path className="admin-login-dock-plate" d="M56 16V24A84 11 0 0 0 224 24V16" />
      <ellipse className="admin-login-dock-plate" cx="140" cy="16" rx="84" ry="11" />
      <ellipse className="admin-login-dock-ring" cx="140" cy="16" rx="58" ry="7" />
      <path className="admin-login-dock-line" d="M24 54H256M24 49V59M256 49V59M140 51V57" />
      <text className="admin-login-dock-label" x="148" y="68">
        DOK-01
      </text>
    </svg>
  )
}

/**
 * Seam between the brand panel and the form area (wide screens): scale ticks along the line, a soft
 * light/shadow transition and a chamfered connector node in the middle whose LED follows the mood.
 * Absolutely positioned on the column boundary, so it never adds width. Decorative.
 */
function DividerRail() {
  return (
    <div className="admin-login-rail" data-theme="dark" aria-hidden="true">
      <span className="admin-login-rail-ticks" />
      <svg className="admin-login-rail-node" viewBox="0 0 72 96" focusable="false">
        <path className="admin-login-rail-stub" d="M0 48H18M54 48H72" />
        <path className="admin-login-rail-body" d="M28 1H44L53 10V86L44 95H28L19 86V10Z" />
        <path className="admin-login-rail-slot" d="M36 18V34M36 62V78" />
        <circle className="admin-login-rail-halo" cx="36" cy="48" r="8" />
        <circle className="admin-login-rail-led" cx="36" cy="48" r="3.5" />
      </svg>
    </div>
  )
}

/**
 * Light page shell shared by the session check and the form, so the layout does not jump
 * when the check finishes. The robot sits in the dark brand panel on wide screens and above
 * the card on smaller ones.
 */
function AdminLoginShell({ children, robot }) {
  const isWide = useMediaQuery('(min-width: 1024px)')
  const pageHidden = usePageHidden()

  return (
    <div
      className="admin-login-page"
      data-theme="light"
      data-mood={robot.mood}
      data-paused={pageHidden ? 'true' : 'false'}
    >
      <ViewfinderCursor />
      <header className="admin-login-brand" data-theme="dark">
        <div className="admin-login-brand-inner">
          {/* Framed logo | thin rule | name + meta line. Logo sizes keep the grid on whole pixels:
              64 px on wide screens, 32 px (snapped viewBox) on small ones. */}
          <div className="admin-login-lockup">
            <span className="admin-login-logo-frame">
              <Logo size={isWide ? 64 : 32} assemble className="admin-login-logo" />
            </span>
            <span className="admin-login-lockup-rule" aria-hidden="true" />
            <div className="admin-login-lockup-text">
              <p className="admin-login-brand-name">Aldi Dwi Irawan</p>
              <p className="admin-login-brand-meta" aria-hidden="true">
                Portofolio // 2026
              </p>
            </div>
          </div>
          {isWide && (
            <div className="admin-login-stage" data-mood={robot.mood}>
              {/* Mood glow: three layers, only the active one is visible (opacity cross-fade) */}
              <span className="admin-login-stage-glow" aria-hidden="true">
                <i data-tone="calm" />
                <i data-tone="error" />
                <i data-tone="success" />
              </span>
              <div className="admin-login-rig">
                <StageHud />
                <div className="admin-login-robot admin-login-robot--panel">
                  <RobotMascot {...robot} size={240} />
                </div>
                <DockPedestal />
              </div>
              <p className="admin-login-status" aria-hidden="true">
                <span className="admin-login-status-dot" />
                {ROBOT_STATUS[robot.mood] || ROBOT_STATUS.idle}
              </p>
            </div>
          )}
        </div>
      </header>
      {isWide && <DividerRail />}
      <main className="admin-login-main">
        <BlueprintBackground variant="busy" />
        <div className="admin-login-stack">
          {!isWide && (
            <div className="admin-login-robot admin-login-pod">
              <RobotMascot {...robot} size={88} />
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
  const pendingAttemptRef = useRef(false)
  const [focusArea, setFocusArea] = useState(null) // 'email' | 'password' | null
  const [gaze, setGaze] = useState(0)
  const [errorCue, setErrorCue] = useState(0)
  const [attempt, setAttempt] = useState(0)
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

  // A failed attempt (a submit that ended with a message): robot reacts, card shakes, and focus
  // returns to the password field. Each submit is counted, so this also works when the request
  // settles before the busy state is ever rendered.
  useEffect(() => {
    const settled = pendingAttemptRef.current && !isSubmitting
    if (settled) pendingAttemptRef.current = false
    if (settled && errorMsg) {
      setErrorCue((cue) => cue + 1)
      setIsErrorMood(true)
      setIsShaking(true)
      passwordRef.current?.focus()
    }
  }, [attempt, isSubmitting, errorMsg])

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
    pendingAttemptRef.current = true
    setAttempt((count) => count + 1)
    handleSubmit(e)
  }

  const displayError = toFriendlyAuthError(errorMsg)
  const errorId = 'admin-login-error'
  const capsHintId = 'admin-password-hint'
  const showCapsHint = capsLockOn && focusArea === 'password'

  if (isCheckingAuth) {
    return (
      <AdminLoginShell robot={robot}>
        <LoginCard>
          <div className="admin-login-checking" role="status">
            <span className="admin-login-spinner admin-login-spinner-lg" aria-hidden="true" />
            <p>Memeriksa status masuk...</p>
          </div>
        </LoginCard>
      </AdminLoginShell>
    )
  }

  return (
    <AdminLoginShell robot={robot}>
      <LoginCard className={isShaking ? 'admin-login-card--shake' : ''}>
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
              <div className="admin-login-control">
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
            </div>

            <div className="admin-login-field">
              <label htmlFor="admin-password" className="admin-login-label">
                Kata sandi
              </label>
              <div
                className="admin-login-control admin-login-password"
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
              {!isSubmitting && <ArrowRightIcon />}
            </button>
          </form>
        )}

        <div className="admin-login-footer">
          <Link to="/" className="admin-login-back">
            <ArrowLeftIcon />
            <span>Kembali ke beranda</span>
          </Link>
        </div>
      </LoginCard>
    </AdminLoginShell>
  )
}

export default AdminLoginPage
