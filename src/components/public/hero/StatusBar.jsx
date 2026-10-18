import { useEffect, useState } from 'react'
import { useI18n } from '../../../i18n/i18nContext'
import { CalendarIcon, MapPinIcon } from '../icons'
import CharacterLaneSlot from './CharacterLaneSlot'

/** Today's date, refreshed when the tab comes back (a page left open overnight shows the new day). */
function useToday() {
  const [today, setToday] = useState(() => new Date())
  useEffect(() => {
    const refresh = () => {
      if (!document.hidden) setToday(new Date())
    }
    document.addEventListener('visibilitychange', refresh)
    const timer = setInterval(refresh, 60 * 1000)
    return () => {
      document.removeEventListener('visibilitychange', refresh)
      clearInterval(timer)
    }
  }, [])
  return today
}

const isoDay = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

/**
 * Status bar under the hero (BRIEF §5): "Siap bekerja" with a green dot, the city and today's date.
 * The chicken and the duck walk on its top line (CharacterLaneSlot, stage 3B).
 */
function StatusBar({ available, location }) {
  const { t, formatDate } = useI18n()
  const today = useToday()

  return (
    <div className="pub-statusbar" data-stage="characters">
      <div className="pub-container pub-statusbar-inner">
        <CharacterLaneSlot />
        <ul className="pub-statusbar-list" aria-label={t('status.label')}>
          {available && (
            <li className="pub-statusbar-item pub-statusbar-item--available">
              <span className="pub-dot" aria-hidden="true" />
              {t('hero.available')}
            </li>
          )}
          {location && (
            <li className="pub-statusbar-item">
              <MapPinIcon size={16} />
              <span className="pub-sr-only">{t('status.location')}: </span>
              {location}, ID
            </li>
          )}
          <li className="pub-statusbar-item">
            <CalendarIcon size={16} />
            <span className="pub-sr-only">{t('status.today')}: </span>
            <time dateTime={isoDay(today)}>{formatDate(today, 'full')}</time>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default StatusBar
