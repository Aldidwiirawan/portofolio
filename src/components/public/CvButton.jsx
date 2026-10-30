import { useI18n } from '../../i18n/i18nContext'
import { DownloadIcon } from './icons'
import { usePublicData } from './publicContexts'

/**
 * "Unduh CV": opens the PDF uploaded in Profil (old CV link as fallback) in a new tab. Renders
 * nothing while there is no CV, so the button appears by itself once one is uploaded (K2).
 */
function CvButton({ variant = 'primary', size, className = '', iconSize = 18, onClick }) {
  const { t } = useI18n()
  const profile = usePublicData()?.profile
  const cvUrl = profile?.data?.cvUrl
  const classes = ['pub-btn', `pub-btn--${variant}`, size && `pub-btn--${size}`, className].filter(Boolean).join(' ')
  // While the profile loads the button keeps its place, invisible, so the navbar does not move when it
  // appears (stage 3C, no layout shift)
  if (profile?.status === 'loading') {
    return (
      <span className={`${classes} pub-ph-hidden`} aria-hidden="true">
        <DownloadIcon size={iconSize} />
        <span>{t('cv.download')}</span>
      </span>
    )
  }
  if (!cvUrl) return null
  return (
    <a href={cvUrl} target="_blank" rel="noopener noreferrer" className={classes} onClick={onClick}>
      <DownloadIcon size={iconSize} />
      <span>{t('cv.download')}</span>
      <span className="pub-sr-only">{t('cv.hint')}</span>
    </a>
  )
}

export default CvButton
