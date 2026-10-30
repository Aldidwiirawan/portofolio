import { useI18n } from '../../i18n/i18nContext'
import { usePublicData } from './publicContexts'
import { SITE_NAME } from './publicFormat'
import './PublicFooter.css'

/**
 * Footer of the public pages: a thin line, the copyright on the left, the city and
 * "Terbuka untuk kerja" on the right. On the home page it continues the black contact section.
 * No admin link: the admin stays at /admin/login.
 */
function PublicFooter() {
  const { t } = useI18n()
  const profile = usePublicData().profile.data
  const name = profile?.full_name || SITE_NAME

  return (
    <footer className="pub-footer pub-invert">
      <div className="pub-footer-inner">
        <p>{t('footer.rights', { year: new Date().getFullYear(), name })}</p>
        <div className="pub-footer-right">
          {profile?.location && <span>{t('footer.basedIn', { city: profile.location })}</span>}
          {profile?.is_available && <span>{t('hero.available')}</span>}
        </div>
      </div>
    </footer>
  )
}

export default PublicFooter
