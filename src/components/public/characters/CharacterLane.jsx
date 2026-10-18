import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { CHARACTER_LINES, lineText } from '../../../i18n/characterLines'
import { useI18n } from '../../../i18n/i18nContext'
import { useMediaQuery, usePrefersReducedMotion } from '../../../lib/useMediaQuery'
import { usePageHidden } from '../../../lib/usePageHidden'
import { onInteraction } from '../interactionBus'
import { isIntroPlaying } from '../intro/introState'
import { usePublicData, useTheme } from '../publicContexts'
import { firstName } from '../publicFormat'
import { useSound } from '../sound/soundContext'
import { ChickenArt, DuckArt } from './CharacterArt'
import { createCharacterDirector } from './characterDirector'
import './bubble.css'
import './characters.css'

/** True once the opening screen is gone (at once when there is none). */
function useIntroDone() {
  const [done, setDone] = useState(() => !isIntroPlaying())
  useEffect(() => {
    if (done) return undefined
    const off = onInteraction('intro-done', () => setDone(true))
    // In case the intro ended between the first render and this effect
    if (!isIntroPlaying()) queueMicrotask(() => setDone(true))
    return off
  }, [done])
  return done
}

/** Skips the first value: reactions are for changes the visitor makes, not for the page load. */
function useOnChange(value, callback) {
  const previous = useRef(value)
  const callbackRef = useRef(callback)
  useEffect(() => {
    callbackRef.current = callback
  })
  useEffect(() => {
    if (previous.current === value) return
    previous.current = value
    callbackRef.current(value)
  }, [value])
}

/**
 * The chicken and the duck in the lane above the status bar (BRIEF §6). This component draws them and
 * the speech bubble (text in the page language); characterDirector.js decides where they walk and what
 * they say. They pause while the lane is off screen, the tab is hidden or the opening screen still
 * covers the page. With reduced motion they stand still and only talk when greeted or clicked.
 */
function CharacterLane({ laneRef }) {
  const { lang } = useI18n()
  const { theme } = useTheme()
  const profile = usePublicData()?.profile.data
  const name = firstName(profile?.full_name) || 'Aldi'
  const hasCv = Boolean(profile?.cvUrl)
  const reduced = usePrefersReducedMotion()
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)')
  const pageHidden = usePageHidden()
  const introDone = useIntroDone()
  const { play } = useSound()
  const [bubble, setBubble] = useState(null)
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined')
  const chickenRef = useRef(null)
  const duckRef = useRef(null)
  const bubbleRef = useRef(null)
  const directorRef = useRef(null)
  const live = useRef({ lang, name, hasCv, play })

  useEffect(() => {
    live.current = { lang, name, hasCv, play }
  })

  useEffect(() => {
    const lane = laneRef.current
    if (!lane || !chickenRef.current || !duckRef.current) return undefined
    let counter = 0
    const director = createCharacterDirector({
      lane,
      els: { chicken: chickenRef.current, duck: duckRef.current },
      getBubble: () => bubbleRef.current,
      show: (next) => {
        counter += 1
        setBubble(next ? { ...next, key: counter } : null)
      },
      textOf: (line) => lineText(line, live.current.lang, { name: live.current.name }),
      context: () => ({ hasCv: live.current.hasCv }),
      onJump: (who) => live.current.play({ strength: 0.45, pitch: who === 'chicken' ? 1.6 : 1.4, source: who }),
      reduced,
      finePointer,
    })
    directorRef.current = director
    return () => {
      director.destroy()
      directorRef.current = null
      setBubble(null)
    }
  }, [laneRef, reduced, finePointer])

  // On screen?
  useEffect(() => {
    const lane = laneRef.current
    if (!lane || typeof IntersectionObserver === 'undefined') return undefined
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    observer.observe(lane)
    return () => observer.disconnect()
  }, [laneRef])

  useEffect(() => {
    directorRef.current?.setActive(visible && !pageHidden && introDone)
  }, [visible, pageHidden, introDone, reduced, finePointer])

  // Reactions to the visitor's actions
  useOnChange(theme, (next) => directorRef.current?.react(next === 'dark' ? 'dark' : 'light'))
  useOnChange(lang, (next) => directorRef.current?.react(next === 'en' ? 'toEnglish' : 'toIndonesian'))
  useEffect(() => onInteraction('label-impact', (impact) => directorRef.current?.react('impact', impact)), [])

  // Place the bubble above its speaker once its text (or language) is rendered
  useLayoutEffect(() => {
    directorRef.current?.positionBubble()
  }, [bubble, lang])

  return (
    <>
      <div ref={chickenRef} className="pub-char pub-char--chicken" data-cursor-lock="">
        <span className="pub-char-shadow" />
        <span className="pub-char-hop">
          <span className="pub-char-body">
            <ChickenArt />
          </span>
        </span>
        <span className="pub-char-zzz">{lineText(CHARACTER_LINES.idle.sleep, lang)}</span>
      </div>
      <div ref={duckRef} className="pub-char pub-char--duck" data-cursor-lock="">
        <span className="pub-char-shadow" />
        <span className="pub-char-hop">
          <span className="pub-char-body">
            <DuckArt />
          </span>
        </span>
        <span className="pub-char-zzz">{lineText(CHARACTER_LINES.idle.sleep, lang)}</span>
      </div>
      {bubble && (
        <p key={bubble.key} ref={bubbleRef} className="pub-bubble pub-lane-bubble" data-who={bubble.who}>
          {lineText(bubble.line, lang, { name })}
        </p>
      )}
    </>
  )
}

export default CharacterLane
