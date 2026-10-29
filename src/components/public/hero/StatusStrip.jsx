import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../../i18n/i18nContext'
import { ChevronDownIcon } from '../icons'

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
 * Bar at the bottom of the hero, four bordered columns (two by two below 1060 px): open to work with a
 * green dot (only when the profile says so), the city, today's date in the page language, and a link
 * to the next section. While the profile loads the first two keep their place unseen (no layout shift).
 */
function StatusStrip({ available, location, pending = false }) {
  const { t, formatDate } = useI18n()
  const today = useToday()

  return (
    <ul className="pub-hero-strip" aria-label={t('status.label')}>
      {(pending || available) && (
        <li className={pending ? 'pub-hero-strip-item pub-ph-hidden' : 'pub-hero-strip-item'} aria-hidden={pending || undefined}>
          <span className="pub-dot" aria-hidden="true" />
          {t('hero.available')}
        </li>
      )}
      {(pending || location) && (
        <li className={pending ? 'pub-hero-strip-item pub-ph-hidden' : 'pub-hero-strip-item'} aria-hidden={pending || undefined}>
          <span>
            <em>{t('hero.basedIn')}</em> {pending ? '—' : `${location}, ID`}
          </span>
        </li>
      )}
      <li className="pub-hero-strip-item">
        <span>
          {t('hero.today')}{' '}
          <em>
            <time dateTime={isoDay(today)}>{formatDate(today, 'day')}</time>
          </em>
        </span>
      </li>
      <li className="pub-hero-strip-item">
        <Link to={{ pathname: '/', hash: '#tentang' }} className="pub-hero-strip-link">
          {t('hero.scroll')}
          <ChevronDownIcon size={18} />
        </Link>
      </li>
    </ul>
  )
}

export default StatusStrip
