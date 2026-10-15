import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useMediaQuery, usePrefersReducedMotion } from '../../lib/useMediaQuery'
import './ViewfinderCursor.css'

const LOCK_SELECTOR = 'a[href], button, input, select, textarea, [role="button"], [data-cursor-lock]'
const TEXT_SELECTOR =
  'input:not([type="button"], [type="submit"], [type="reset"], [type="checkbox"], [type="radio"], [type="range"], [type="color"], [type="file"], [type="image"]), textarea, [contenteditable=""], [contenteditable="true"]'
const NAV_KEYS = new Set(['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'])
const LOCK_PAD = 6 // px of air between the element and its brackets
const CORNER = 10 // bracket arm length in px (matches the CSS)
const FREE_BOX = 10 // half size of the hidden bracket box around the pointer
const ACTIVE_CLASS = 'vf-cursor-active'
const REDUCED_CLASS = 'vf-cursor-reduced'

/**
 * Viewfinder cursor: a minimal crosshair (with a centre dot) that turns into four brackets locking
 * onto links, buttons, fields, [role=button] and [data-cursor-lock]. Keyboard focus gets the
 * brackets too. Only active for a fine, hovering pointer (not on touch screens or in forced
 * colors). With reduced motion the native cursor stays and the brackets move without animation.
 * Decorative: rendered in a portal on <body>, aria-hidden and never catches clicks.
 */
function ViewfinderCursor() {
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)')
  const forcedColors = useMediaQuery('(forced-colors: active)')
  const reducedMotion = usePrefersReducedMotion()

  if (!finePointer || forcedColors || typeof document === 'undefined') return null
  return createPortal(<ViewfinderLayer reducedMotion={reducedMotion} />, document.body)
}

function ViewfinderLayer({ reducedMotion }) {
  const crossRef = useRef(null)
  const lockRef = useRef(null)

  useEffect(() => {
    const root = document.documentElement
    const cross = crossRef.current
    const lock = lockRef.current
    const corners = Array.from(lock.children)
    const state = {
      x: -100,
      y: -100,
      pointerInside: false,
      overText: false,
      modality: 'pointer',
      hoverTarget: null,
      focusTarget: null,
      frame: 0,
      box: '',
      theme: null,
    }

    root.classList.add(reducedMotion ? REDUCED_CLASS : ACTIVE_CLASS)

    const place = (left, top, right, bottom) => {
      const key = `${left}|${top}|${right}|${bottom}`
      if (key === state.box) return
      state.box = key
      const [tl, tr, bl, br] = corners
      tl.style.transform = `translate3d(${left}px, ${top}px, 0)`
      tr.style.transform = `translate3d(${right - CORNER}px, ${top}px, 0)`
      bl.style.transform = `translate3d(${left}px, ${bottom - CORNER}px, 0)`
      br.style.transform = `translate3d(${right - CORNER}px, ${bottom - CORNER}px, 0)`
    }

    const render = () => {
      state.frame = 0
      const candidate = state.modality === 'keyboard' ? state.focusTarget : state.hoverTarget
      const target = candidate && candidate.isConnected ? candidate : null

      if (cross) {
        cross.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`
        const hidden = !state.pointerInside || state.modality === 'keyboard' || state.overText
        cross.dataset.hidden = String(hidden)
        // Locked: the crosshair hands over to the brackets, only the centre dot stays
        cross.dataset.locked = String(Boolean(target))
      }

      if (target) {
        const r = target.getBoundingClientRect()
        place(
          Math.round(r.left - LOCK_PAD),
          Math.round(r.top - LOCK_PAD),
          Math.round(r.right + LOCK_PAD),
          Math.round(r.bottom + LOCK_PAD)
        )
        // Brackets take the theme of what they lock onto (light card vs dark panel)
        const theme = target.closest('[data-theme]')?.getAttribute('data-theme') || null
        if (theme !== state.theme) {
          state.theme = theme
          if (theme) lock.setAttribute('data-theme', theme)
          else lock.removeAttribute('data-theme')
        }
        lock.dataset.state = 'locked'
        // Keep following the element while locked (layout can shift, e.g. when an error appears)
        state.frame = requestAnimationFrame(render)
      } else {
        place(state.x - FREE_BOX, state.y - FREE_BOX, state.x + FREE_BOX, state.y + FREE_BOX)
        lock.dataset.state = 'free'
      }
    }

    const schedule = () => {
      if (!state.frame) state.frame = requestAnimationFrame(render)
    }

    const onPointerMove = (e) => {
      if (e.pointerType === 'touch') {
        state.pointerInside = false
        state.hoverTarget = null
      } else {
        const el = e.target instanceof Element ? e.target : null
        state.x = e.clientX
        state.y = e.clientY
        state.pointerInside = true
        state.modality = 'pointer'
        state.hoverTarget = el?.closest(LOCK_SELECTOR) ?? null
        state.overText = Boolean(el?.closest(TEXT_SELECTOR))
      }
      schedule()
    }

    const onPointerOut = (e) => {
      if (e.relatedTarget) return
      state.pointerInside = false
      state.hoverTarget = null
      schedule()
    }

    const onKeyDown = (e) => {
      if (!NAV_KEYS.has(e.key) && !(e.target instanceof Element && e.target.closest(TEXT_SELECTOR))) return
      state.modality = 'keyboard'
      schedule()
    }

    const onFocusIn = (e) => {
      const el = e.target
      if (!(el instanceof Element)) return
      state.focusTarget = el.matches(':focus-visible') ? el : null
      schedule()
    }

    const onFocusOut = (e) => {
      if (e.target === state.focusTarget) {
        state.focusTarget = null
        schedule()
      }
    }

    const onWindowBlur = () => {
      state.pointerInside = false
      schedule()
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('pointerout', onPointerOut, { passive: true })
    window.addEventListener('keydown', onKeyDown, true)
    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('focusout', onFocusOut)
    window.addEventListener('scroll', schedule, { passive: true, capture: true })
    window.addEventListener('resize', schedule, { passive: true })
    window.addEventListener('blur', onWindowBlur)

    // An element focused before mount (e.g. autofocus) still gets brackets
    if (document.activeElement instanceof Element && document.activeElement.matches(':focus-visible')) {
      state.focusTarget = document.activeElement
      state.modality = 'keyboard'
    }
    schedule()

    return () => {
      cancelAnimationFrame(state.frame)
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerout', onPointerOut)
      window.removeEventListener('keydown', onKeyDown, true)
      document.removeEventListener('focusin', onFocusIn)
      document.removeEventListener('focusout', onFocusOut)
      window.removeEventListener('scroll', schedule, { capture: true })
      window.removeEventListener('resize', schedule)
      window.removeEventListener('blur', onWindowBlur)
      root.classList.remove(ACTIVE_CLASS, REDUCED_CLASS)
    }
  }, [reducedMotion])

  return (
    <>
      {!reducedMotion && (
        <div ref={crossRef} className="vf-cross" data-hidden="true" aria-hidden="true" />
      )}
      <div ref={lockRef} className="vf-lock" data-state="free" aria-hidden="true">
        <span className="vf-corner vf-corner--tl" />
        <span className="vf-corner vf-corner--tr" />
        <span className="vf-corner vf-corner--bl" />
        <span className="vf-corner vf-corner--br" />
      </div>
    </>
  )
}

export default ViewfinderCursor
