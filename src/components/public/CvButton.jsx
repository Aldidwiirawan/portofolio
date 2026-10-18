import { useI18n } from '../../i18n/i18nContext'
import { DownloadIcon } from './icons'
import { usePublicData } from './publicContexts'

/**
 * "Unduh CV": opens the PDF uploaded in Profil (old CV link as fallback) in a new tab. Renders
 * nothing while there is no CV, so the button appears by itself once one is uploaded (K2).
 */
function CvButton({ variant = 'primary', size, className = '', onClick }) {
  const { t } = useI18n()
  const cvUrl = usePublicData()?.profile.data?.cvUrl
  if (!cvUrl) return null
  const classes = ['pub-btn', `pub-btn--${variant}`, size && `pub-btn--${size}`, className].filter(Boolean).join(' ')
  return (
    <a href={cvUrl} target="_blank" rel="noopener noreferrer" className={classes} onClick={onClick}>
      <DownloadIcon size={18} />
      <span>{t('cv.download')}</span>
      <span className="pub-sr-only">{t('cv.hint')}</span>
    </a>
  )
}

export default CvButton
