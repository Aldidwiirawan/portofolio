import { prefersReducedMotion } from '../../lib/useMediaQuery'
import { useI18n } from '../../i18n/i18nContext'
import { ArrowUpIcon } from './icons'
import { usePublicData } from './publicContexts'
import { SITE_NAME } from './publicFormat'
import './PublicFooter.css'

/**
 * Simple black footer (monochrome redesign): copyright, city, "Terbuka untuk kerja" when the profile
 * says so, and "Kembali ke atas" (scrolls up and moves focus to the top of the content). On the home
 * page it continues the black contact section. No admin link: the admin stays at /admin/login.
 */
function PublicFooter() {
  const { t } = useI18n()
  const profile = usePublicData().profile.data
  const name = profile?.full_name || SITE_NAME

  const backToTop = () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
    document.getElementById('konten')?.focus({ preventScroll: true })
  }

  return (
    <footer className="pub-footer pub-invert">
      <div className="pub-container pub-footer-inner">
        <p>{t('footer.rights', { year: new Date().getFullYear(), name })}</p>
        {profile?.location && <p>{t('footer.basedIn', { city: profile.location })}</p>}
        {profile?.is_available && <p>{t('hero.available')}</p>}
        <button type="button" className="pub-footer-top" onClick={backToTop}>
          <ArrowUpIcon size={16} />
          <span>{t('common.backToTop')}</span>
        </button>
      </div>
    </footer>
  )
}

export default PublicFooter
