import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { readStorage, writeStorage } from '../../../lib/safeStorage'
import { usePageHidden } from '../../../lib/usePageHidden'
import { SoundContext } from './soundContext'
import { playCue, playTok, setAudioPaused, unlockAudio } from './tokSynth'

export const SOUND_STORAGE_KEY = 'aldi-portfolio-sound'
// Events that count as a visitor gesture for the browser's autoplay rules
const GESTURES = ['pointerdown', 'pointerup', 'keydown', 'touchend']

/**
 * Sound switch of the public pages (BRIEF §5): off by default, the visitor's choice is remembered in
 * the browser. All sounds are made with the Web Audio API (no audio files): the short "tok" and the
 * named cues of the monochrome page (tokSynth.playCue: chips, cats, folders). Nothing plays before a
 * visitor gesture. Turning it on plays one tok as a sign that it works. The audio pauses while the
 * tab is hidden.
 */
function SoundProvider({ children }) {
  const [enabled, setEnabled] = useState(() => readStorage(SOUND_STORAGE_KEY) === 'on')
  const enabledRef = useRef(enabled)
  const pageHidden = usePageHidden()

  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])

  // Sound remembered as on: browsers only allow audio after the first click, tap or key press
  useEffect(() => {
    if (!enabled) return undefined
    let done = false
    const remove = () => GESTURES.forEach((type) => window.removeEventListener(type, unlock, true))
    function unlock() {
      unlockAudio().then((running) => {
        if (running && !done) {
          done = true
          remove()
        }
      })
    }
    GESTURES.forEach((type) => window.addEventListener(type, unlock, { capture: true, passive: true }))
    return () => {
      done = true
      remove()
    }
  }, [enabled])

  useEffect(() => {
    setAudioPaused(pageHidden || !enabled)
  }, [pageHidden, enabled])

  const toggle = useCallback(() => {
    const next = !enabledRef.current
    enabledRef.current = next
    setEnabled(next)
    writeStorage(SOUND_STORAGE_KEY, next ? 'on' : 'off')
    if (next) {
      unlockAudio().then((running) => {
        if (running && enabledRef.current) playTok({ strength: 0.6 })
      })
    }
  }, [])

  const play = useCallback((options) => (enabledRef.current ? playTok(options) : false), [])
  const cue = useCallback((name, options) => (enabledRef.current ? playCue(name, options) : false), [])
  const value = useMemo(() => ({ enabled, toggle, play, cue }), [enabled, toggle, play, cue])

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
}

export default SoundProvider
