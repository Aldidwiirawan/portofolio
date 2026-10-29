import { useI18n } from '../../i18n/i18nContext'
import { AlertIcon } from './icons'

/**
 * Home page section (Prestasi, Organisasi): the large h2 and an optional intro, inside the page
 * container. The section is labelled by its heading; `id` is the address used by the menu (/#id).
 */
export function Section({ id, title, intro, actions, className = '', children }) {
  const headingId = `${id}-judul`
  return (
    <section id={id} className={`pub-section ${className}`.trim()} aria-labelledby={headingId}>
      <div className="pub-container">
        <div className={`pub-section-head${actions ? ' pub-section-head--actions' : ''}`}>
          <h2 id={headingId} className="pub-h2">
            {title}
          </h2>
          {intro && <p className="pub-lead">{intro}</p>}
          {actions && <div className="pub-section-actions">{actions}</div>}
        </div>
        {children}
      </div>
    </section>
  )
}

/** "This section could not be loaded" with a retry button (one failed table only affects its section). */
export function SectionError({ onRetry, message }) {
  const { t } = useI18n()
  return (
    <div className="pub-notice" role="alert">
      <AlertIcon size={20} />
      <p>{message || t('common.sectionError')}</p>
      {onRetry && (
        <button type="button" className="pub-btn pub-btn--secondary pub-btn--sm" onClick={onRetry}>
          {t('common.retry')}
        </button>
      )}
    </div>
  )
}

/** Grey placeholder blocks while a section loads (decorative; the page announces loading once). */
export function SkeletonBlock({ width = '100%', height = '1rem', className = '' }) {
  return <span className={`pub-skeleton ${className}`.trim()} style={{ width, height }} aria-hidden="true" />
}
