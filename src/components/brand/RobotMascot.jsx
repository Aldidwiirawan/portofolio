import { useEffect, useState } from 'react'
import Logo from './Logo'
import { usePrefersReducedMotion } from '../../lib/useMediaQuery'
import './RobotMascot.css'

// Eye shape per mood: [left, right]
const EYES = {
  idle: ['open', 'open'],
  watching: ['open', 'open'],
  hiding: ['closed', 'closed'],
  peeking: ['closed', 'open'],
  error: ['x', 'x'],
  success: ['happy', 'happy'],
}

const MOUTHS = {
  idle: 'M90 121Q100 128 110 121',
  watching: 'M94 123H106',
  hiding: 'M93 124H107',
  peeking: 'M92 124Q102 128 109 120',
  error: 'M89 127Q100 117 111 127',
  success: 'M87 119Q100 134 113 119',
}

const BLINK_MS = 140
const BLINK_MIN_GAP_MS = 3000
const BLINK_MAX_GAP_MS = 6000

function Eye({ cx, cy, shape }) {
  if (shape === 'closed') return <path className="robot-eye-line" d={`M${cx - 8} ${cy + 2}H${cx + 8}`} />
  if (shape === 'x') {
    return (
      <path
        className="robot-eye-line"
        d={`M${cx - 6} ${cy - 6}L${cx + 6} ${cy + 6}M${cx + 6} ${cy - 6}L${cx - 6} ${cy + 6}`}
      />
    )
  }
  if (shape === 'happy') {
    return <path className="robot-eye-line" d={`M${cx - 8} ${cy + 4}L${cx} ${cy - 4}L${cx + 8} ${cy + 4}`} />
  }
  return <rect className="robot-eye-open" x={cx - 7} y={cy - 10} width="14" height="20" rx="4" />
}

/**
 * Robot "a+" mascot (decorative, hidden from assistive tech).
 *
 * - `mood`: idle | watching | hiding | peeking | error | success
 * - `lookAt`: -1 (left) … 1 (right); moves the eyes while watching
 * - `cue`: change it to replay the one-shot motion of the current mood (head shake, jump)
 * - `size`: width in px (height is 1.2 × width). Always size the robot with this prop: the arm
 *   strokes are non-scaling (so they can stretch) and are compensated with it.
 *
 * Idle breathes gently; hiding raises both arms over the face screen and peeking lowers one.
 * With reduced motion the robot only switches poses: no blinking, breathing, gaze, shake or jump.
 */
function RobotMascot({ mood = 'idle', lookAt = 0, cue = 0, size = 200, className = '' }) {
  const reducedMotion = usePrefersReducedMotion()
  const [isBlinking, setIsBlinking] = useState(false)
  const safeMood = EYES[mood] ? mood : 'idle'
  const canBlink = (safeMood === 'idle' || safeMood === 'watching') && !reducedMotion

  useEffect(() => {
    if (!canBlink) return undefined
    let timer
    const schedule = () => {
      const gap = BLINK_MIN_GAP_MS + Math.random() * (BLINK_MAX_GAP_MS - BLINK_MIN_GAP_MS)
      timer = setTimeout(() => {
        if (document.hidden) {
          schedule()
          return
        }
        setIsBlinking(true)
        timer = setTimeout(() => {
          setIsBlinking(false)
          schedule()
        }, BLINK_MS)
      }, gap)
    }
    schedule()
    return () => {
      clearTimeout(timer)
      setIsBlinking(false)
    }
  }, [canBlink])

  const look = Math.max(-1, Math.min(1, Number(lookAt) || 0))
  const [leftEye, rightEye] = EYES[safeMood]
  const classes = ['robot', `robot--${safeMood}`, isBlinking && canBlink && 'robot--blink', className]
    .filter(Boolean)
    .join(' ')

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 240"
      width={size}
      height={size * 1.2}
      className={classes}
      style={{ '--look': look.toFixed(3), '--robot-k': (size / 200).toFixed(4) }}
      data-cue={cue % 2}
      aria-hidden="true"
      focusable="false"
    >
      <ellipse className="robot-shadow" cx="100" cy="235" rx="46" ry="4" />
      <g className="robot-figure">
        <rect className="robot-ink-fill" x="78" y="210" width="12" height="14" />
        <rect className="robot-ink-fill" x="110" y="210" width="12" height="14" />
        <rect className="robot-part" x="68" y="222" width="30" height="10" rx="5" />
        <rect className="robot-part" x="102" y="222" width="30" height="10" rx="5" />

        <g className="robot-upper">
          <rect className="robot-part" x="54" y="158" width="92" height="56" rx="12" />
          <Logo size={30} x={85} y={170} className="robot-chest-logo" />
          <rect className="robot-ink-fill" x="88" y="148" width="24" height="12" />

          <g className="robot-head">
            <g className="robot-antenna">
              <path className="robot-stroke" d="M100 42V56" />
              <circle className="robot-light-glow" cx="100" cy="24" r="11" />
              <circle className="robot-light" cx="100" cy="24" r="5.5" />
              <path className="robot-stroke robot-bracket robot-bracket--tl" d="M83 16V7H92" />
              <path className="robot-stroke robot-bracket robot-bracket--tr" d="M108 7H117V16" />
              <path className="robot-stroke robot-bracket robot-bracket--bl" d="M83 32V41H92" />
              <path className="robot-stroke robot-bracket robot-bracket--br" d="M108 41H117V32" />
            </g>
            <rect className="robot-part" x="24" y="86" width="12" height="34" rx="4" />
            <rect className="robot-part" x="164" y="86" width="12" height="34" rx="4" />
            <rect className="robot-part" x="34" y="54" width="132" height="98" rx="18" />
            <rect className="robot-screen" x="48" y="68" width="104" height="70" rx="10" />
            <g className="robot-eyes">
              <Eye cx={78} cy={98} shape={leftEye} />
              <Eye cx={122} cy={98} shape={rightEye} />
            </g>
            <path className="robot-mouth" d={MOUTHS[safeMood]} />
          </g>

          {/* Arms are drawn last so they can cover the face screen. Two strokes (outline + fill)
              on one line; the line stretches with scaleY while the strokes keep their width. */}
          <g className="robot-arm robot-arm--left">
            <path className="robot-arm-outline" d="M45 171V193" />
            <path className="robot-arm-fill" d="M45 171V193" />
          </g>
          <g className="robot-arm robot-arm--right">
            <path className="robot-arm-outline" d="M155 171V193" />
            <path className="robot-arm-fill" d="M155 171V193" />
          </g>
          {/* Palms: hidden at the arm tips, they cover the eyes while hiding/peeking */}
          <g transform="translate(45 193)">
            <g className="robot-hand robot-hand--left">
              <rect className="robot-part" x="-13" y="-11" width="26" height="22" rx="9" />
              <path className="robot-hand-lines" d="M-4.5 -11V-4M4.5 -11V-4" />
            </g>
          </g>
          <g transform="translate(155 193)">
            <g className="robot-hand robot-hand--right">
              <rect className="robot-part" x="-13" y="-11" width="26" height="22" rx="9" />
              <path className="robot-hand-lines" d="M-4.5 -11V-4M4.5 -11V-4" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  )
}

export default RobotMascot
