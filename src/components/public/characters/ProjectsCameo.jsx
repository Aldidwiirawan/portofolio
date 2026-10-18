import { useEffect, useState } from 'react'
import { CHARACTER_LINES, lineText } from '../../../i18n/characterLines'
import { useI18n } from '../../../i18n/i18nContext'
import { writeStorage } from '../../../lib/safeStorage'
import { onInteraction } from '../interactionBus'
import { isIntroPlaying } from '../intro/introState'
import { usePublicData } from '../publicContexts'
import { firstName } from '../publicFormat'
import { ChickenArt } from './CharacterArt'
import { CAMEO_STORAGE_KEY } from './cameoKey'
import './bubble.css'
import './characters.css'

const ENTER_MS = 650
const TALK_MS = 3000
const LEAVE_MS = 650

/**
 * The chicken's one appearance next to the "Proyek" heading (owner K4): once the heading is fully on
 * screen it walks in from the right, says "Nah, ini proyek-proyek {name}!" for 3 s and walks off again.
 * Once per visit (session). Decorative and never clickable.
 */
function ProjectsCameo({ slotRef, onDone }) {
  const { lang } = useI18n()
  const name = firstName(usePublicData()?.profile.data?.full_name) || 'Aldi'
  const [phase, setPhase] = useState('wait') // wait | enter | talk | leave

  // Start when the slot (the room beside the heading) is fully visible and no intro covers the page
  useEffect(() => {
    const slot = slotRef.current
    if (phase !== 'wait' || !slot || typeof IntersectionObserver === 'undefined') return undefined
    let off = null
    const begin = () => {
      writeStorage(CAMEO_STORAGE_KEY, '1', 'session')
      setPhase('enter')
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        if (isIntroPlaying()) off = onInteraction('intro-done', begin)
        else begin()
      },
      { threshold: 0.99 }
    )
    observer.observe(slot)
    return () => {
      observer.disconnect()
      off?.()
    }
  }, [phase, slotRef])

  useEffect(() => {
    if (phase === 'wait') return undefined
    const next = { enter: ['talk', ENTER_MS], talk: ['leave', TALK_MS], leave: ['done', LEAVE_MS] }[phase]
    const timer = setTimeout(() => (next[0] === 'done' ? onDone() : setPhase(next[0])), next[1])
    return () => clearTimeout(timer)
  }, [phase, onDone])

  if (phase === 'wait') return null

  return (
    <div className="pub-cameo" data-phase={phase}>
      <div
        className="pub-char pub-char--chicken pub-cameo-char"
        data-pose={phase === 'talk' ? 'stand' : 'walk'}
        data-dir={phase === 'leave' ? '1' : '-1'}
        data-talk={phase === 'talk' ? '1' : undefined}
      >
        <span className="pub-char-shadow" />
        <span className="pub-char-hop">
          <span className="pub-char-body">
            <ChickenArt />
          </span>
        </span>
      </div>
      {phase === 'talk' && (
        <p className="pub-bubble pub-cameo-bubble">{lineText(CHARACTER_LINES.react.projects, lang, { name })}</p>
      )}
    </div>
  )
}

export default ProjectsCameo
