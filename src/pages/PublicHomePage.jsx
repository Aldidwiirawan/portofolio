import { usePublicData } from '../components/public/publicContexts'
import { SITE_NAME } from '../components/public/publicFormat'
import { useDocumentTitle } from '../components/public/useDocumentTitle'
import { useHashScroll } from '../components/public/useHashScroll'
import { useI18n } from '../i18n/i18nContext'

/**
 * Public home page (/): the sections in the order of the stage 3A plan. Every section reads the
 * public data from PublicLayout and hides itself when its table is empty.
 */
function PublicHomePage() {
  const data = usePublicData()
  const { t } = useI18n()
  const name = data.profile.data?.full_name || SITE_NAME
  const settled = !['profile', 'projects', 'experiences', 'skills'].some((key) => data[key].status === 'loading')

  useDocumentTitle(t('meta.title', { name }))
  useHashScroll(settled)

  return (
    <div className="pub-container pub-section">
      <h1 className="pub-h2">{name}</h1>
    </div>
  )
}

export default PublicHomePage
