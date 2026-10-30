import { useI18n } from '../../i18n/i18nContext'
import { usePublicData } from './publicContexts'
import { SITE_NAME } from './publicFormat'
import './PublicFooter.css'

const REFERENCE_URL = 'https://styfensagala.vercel.app'

/**
 * Footer of the public pages, like the reference site of phase 8: a thin line, the copyright on the
 * left, the city and "Terbuka untuk kerja" (only from the profile, no new claims) on the right, and a
 * small credit to the site whose design this follows. On the home page it continues the black contact
 * section. No admin link: the admin stays at /admin/login.
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
          <span>
            {t('footer.credit', { site: '' })}
            <a href={REFERENCE_URL} target="_blank" rel="noopener noreferrer" className="pub-footer-credit">
              styfensagala.vercel.app
              <span className="pub-sr-only"> {t('common.newTab')}</span>
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}

export default PublicFooter
