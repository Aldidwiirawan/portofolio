import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../../i18n/i18nContext'
import { ArrowDownIcon } from '../icons'

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
 * Bar at the bottom of the hero, four bordered columns (two by two below 768 px) like the reference site
 * of phase 8: open to work in bold with a green dot (only when the profile says so), the city, "Hari ini:"
 * in bold with today's date in the page language, and a link to the next section. Each column turns
 * black on hover. While the profile loads the first two keep their place unseen (no layout shift).
 */
function StatusStrip({ available, location, pending = false }) {
  const { t, formatDate } = useI18n()
  const today = useToday()

  return (
    <div className="pub-hero-strip-wrap">
      <ul className="pub-hero-strip" aria-label={t('status.label')}>
        {(pending || available) && (
          <li className={pending ? 'pub-hero-strip-item pub-ph-hidden' : 'pub-hero-strip-item'} aria-hidden={pending || undefined}>
            <span className="pub-dot" aria-hidden="true" />
            <strong>{t('hero.available')}</strong>
          </li>
        )}
        {(pending || location) && (
          <li className={pending ? 'pub-hero-strip-item pub-ph-hidden' : 'pub-hero-strip-item'} aria-hidden={pending || undefined}>
            <span>
              {t('hero.basedIn')} {pending ? '—' : `${location}, ID`}
            </span>
          </li>
        )}
        <li className="pub-hero-strip-item">
          <span className="pub-hero-strip-today">
            <strong>{t('hero.today')}</strong>
            <time dateTime={isoDay(today)}>{formatDate(today, 'day')}</time>
          </span>
        </li>
        <li className="pub-hero-strip-item pub-hero-strip-item--scroll">
          <Link to={{ pathname: '/', hash: '#tentang' }} className="pub-hero-strip-link">
            {t('hero.scroll')}
            <ArrowDownIcon size={16} />
          </Link>
        </li>
      </ul>
    </div>
  )
}

export default StatusStrip
