import { useEffect, useState } from 'react'
import RobotMascot from '../../brand/RobotMascot'
import { CHARACTER_LINES, lineText } from '../../../i18n/characterLines'
import { useI18n } from '../../../i18n/i18nContext'
import '../characters/bubble.css'
import './robot.css'

const BUBBLE_MS = 2600
const MOOD_MS = { success: 1400, error: 1100 }
// What happened in the form → robot line and the mood it shows for a moment
const EVENTS = {
  typing: { line: CHARACTER_LINES.robot.typing },
  emptyName: { line: CHARACTER_LINES.robot.emptyName, mood: 'error' },
  emptyMessage: { line: CHARACTER_LINES.robot.emptyMessage, mood: 'error' },
  sent: { line: CHARACTER_LINES.robot.sent, mood: 'success' },
  failed: { line: CHARACTER_LINES.robot.failed, mood: 'error' },
}

/**
 * Robot a+ sitting on the top edge of the guestbook form (BRIEF §5): it watches the text while the
 * visitor types (eyes follow the length of the text), says "Tulis yang baik, ya!" once, shakes its
 * head when a required field is empty, jumps for joy when the message is sent. The form's own status
 * and error texts stay the accessible messages; the robot and its bubble are decorative (aria-hidden).
 * @param {{ watching: boolean, lookAt: number, event: { kind: string, key: number } | null }} props
 */
function GuestbookRobot({ watching, lookAt, event }) {
  const { lang } = useI18n()
  // Keys of the last event whose bubble / mood has run out; the newest event shows until then
  const [bubbleDone, setBubbleDone] = useState(0)
  const [moodDone, setMoodDone] = useState(0)
  const config = event ? EVENTS[event.kind] : null

  useEffect(() => {
    if (!event || !config) return undefined
    const timers = [setTimeout(() => setBubbleDone(event.key), BUBBLE_MS)]
    if (config.mood) timers.push(setTimeout(() => setMoodDone(event.key), MOOD_MS[config.mood]))
    return () => timers.forEach(clearTimeout)
  }, [event, config])

  const shown = config && event.key > bubbleDone ? event : null
  const moodEvent = config?.mood && event.key > moodDone ? event : null
  const mood = moodEvent ? config.mood : watching ? 'watching' : 'idle'
  const line = shown ? config.line : null

  return (
    <div className="pub-gb-robot" aria-hidden="true">
      {line && (
        <p key={shown.key} className="pub-bubble pub-gb-robot-bubble">
          {lineText(line, lang)}
        </p>
      )}
      <div className="pub-gb-robot-figure">
        <RobotMascot size={52} mood={mood} lookAt={lookAt} cue={moodEvent?.key ?? 0} />
      </div>
    </div>
  )
}

export default GuestbookRobot
