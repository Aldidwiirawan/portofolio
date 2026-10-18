import { useEffect, useRef, useState } from 'react'
import RobotMascot from '../../brand/RobotMascot'
import { CHARACTER_LINES, lineText } from '../../../i18n/characterLines'
import { useI18n } from '../../../i18n/i18nContext'
import { useMediaQuery, usePrefersReducedMotion } from '../../../lib/useMediaQuery'
import { usePageHidden } from '../../../lib/usePageHidden'
import { onInteraction } from '../interactionBus'
import '../characters/bubble.css'
import './robot.css'

const PEEK_EVERY_MS = [7000, 12000]
const PEEK_MS = 1500
const NEAR_PX = 120 // mouse this close to the robot or on the button: it comes up
const TOUCH_SHOW_MS = 3000
const CELEBRATE_MS = 700
const rand = (min, max) => min + Math.random() * (max - min)

/**
 * Robot a+ in the bottom-right corner of the footer, next to "Kembali ke atas" (BRIEF §5, owner K6).
 * It hides below the page's bottom edge and now and then peeks out. When the mouse comes near, or the
 * button gets keyboard focus, it stands up and asks "Kembali ke atas?"; on a touch screen it stands up
 * once each time the footer comes into view. Clicking it does what the button does (the robot jumps,
 * the page scrolls up). With reduced motion it simply stands there. Decorative: the button next to it
 * is the accessible control; the robot is aria-hidden and never focusable.
 */
function FooterRobot({ slotRef, buttonRef, onActivate }) {
  const { lang } = useI18n()
  const reduced = usePrefersReducedMotion()
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)')
  const pageHidden = usePageHidden()
  const [visible, setVisible] = useState(false)
  const [peeking, setPeeking] = useState(false)
  const [near, setNear] = useState(false) // mouse close or button focused
  const [touchShow, setTouchShow] = useState(false)
  const [lookAt, setLookAt] = useState(0)
  const [cue, setCue] = useState(0)
  const [celebrating, setCelebrating] = useState(false)
  const touchTimer = useRef(0)
  const up = reduced || near || touchShow
  const pose = up ? 'up' : peeking ? 'peek' : 'down'
  const talking = near || touchShow

  // In view? (the slot is the robot's corner of the footer). On touch screens it stands up for a moment
  // each time the footer comes into view.
  useEffect(() => {
    const slot = slotRef.current
    if (!slot || typeof IntersectionObserver === 'undefined') return undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting)
        if (entry.isIntersecting && !finePointer && !reduced) {
          setTouchShow(true)
          clearTimeout(touchTimer.current)
          touchTimer.current = setTimeout(() => setTouchShow(false), TOUCH_SHOW_MS)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(slot)
    return () => {
      observer.disconnect()
      clearTimeout(touchTimer.current)
    }
  }, [slotRef, finePointer, reduced])

  const active = visible && !pageHidden

  // Peek now and then while the footer is in view and nothing else is going on
  useEffect(() => {
    if (!active || reduced || up) return undefined
    let timer = setTimeout(function peek() {
      setPeeking(true)
      timer = setTimeout(() => {
        setPeeking(false)
        timer = setTimeout(peek, rand(...PEEK_EVERY_MS))
      }, PEEK_MS)
    }, rand(1500, 4000))
    return () => {
      clearTimeout(timer)
      setPeeking(false)
    }
  }, [active, reduced, up])

  // Mouse nearby (desktop): stands up, watches the pointer
  useEffect(() => {
    if (!active || !finePointer || reduced) return undefined
    let frame = 0
    let last = null
    const check = () => {
      frame = 0
      const slot = slotRef.current?.getBoundingClientRect()
      const button = buttonRef.current?.getBoundingClientRect()
      if (!slot || !last) return
      const cx = slot.left + slot.width / 2
      const cy = slot.bottom - 32
      const overButton = button && last.x >= button.left && last.x <= button.right && last.y >= button.top && last.y <= button.bottom
      const close = overButton || Math.hypot(last.x - cx, last.y - cy) < NEAR_PX
      setNear((was) => (was === close ? was : close))
      if (close) setLookAt(Math.max(-1, Math.min(1, (last.x - cx) / 150)))
    }
    const onMove = (event) => {
      if (event.pointerType === 'touch') return
      last = { x: event.clientX, y: event.clientY }
      if (!frame) frame = requestAnimationFrame(check)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(frame)
      setNear(false)
    }
  }, [active, finePointer, reduced, slotRef, buttonRef])

  // Keyboard focus on the button: stands up too
  useEffect(() => {
    const button = buttonRef.current
    if (!button) return undefined
    const onFocus = () => {
      if (button.matches(':focus-visible')) setNear(true)
    }
    const onBlur = () => setNear(false)
    button.addEventListener('focus', onFocus)
    button.addEventListener('blur', onBlur)
    return () => {
      button.removeEventListener('focus', onFocus)
      button.removeEventListener('blur', onBlur)
    }
  }, [buttonRef])

  // The button or the robot was used: a happy jump, then back to normal
  useEffect(
    () =>
      onInteraction('back-to-top', () => {
        setCue((value) => value + 1)
        setCelebrating(true)
      }),
    []
  )

  useEffect(() => {
    if (!celebrating) return undefined
    const timer = setTimeout(() => setCelebrating(false), CELEBRATE_MS)
    return () => clearTimeout(timer)
  }, [celebrating, cue])

  return (
    <div className="pub-top-robot-inner" data-pose={pose} data-paused={active ? undefined : ''}>
      {talking && <p className="pub-bubble pub-top-robot-bubble">{lineText(CHARACTER_LINES.robot.backToTop, lang)}</p>}
      <div className="pub-top-robot-figure" data-cursor-lock="" onClick={onActivate}>
        <RobotMascot size={52} mood={celebrating ? 'success' : near ? 'watching' : 'idle'} lookAt={lookAt} cue={cue} />
      </div>
    </div>
  )
}

export default FooterRobot
