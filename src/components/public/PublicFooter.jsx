import Logo from '../brand/Logo'
import { prefersReducedMotion } from '../../lib/useMediaQuery'
import { useI18n } from '../../i18n/i18nContext'
import { ArrowUpIcon } from './icons'
import { usePublicData } from './publicContexts'
import { SITE_NAME } from './publicFormat'
import SocialLinks from './SocialLinks'
import './PublicFooter.css'

/**
 * Footer: logo and name, copyright, social links and "Kembali ke atas" (scrolls up and moves focus
 * to the top of the content). No admin link: the admin stays at /admin/login.
 */
function PublicFooter() {
  const { t } = useI18n()
  const profile = usePublicData().profile.data
  const name = profile?.full_name || SITE_NAME
  const role = profile?.primary_role

  const backToTop = () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
    document.getElementById('konten')?.focus({ preventScroll: true })
  }

  return (
    <footer className="pub-footer">
      <div className="pub-container pub-footer-inner">
        <div className="pub-footer-brand">
          <Logo size={29} trim />
          <div>
            <p className="pub-footer-name">{name}</p>
            {role && <p className="pub-footer-role">{role}</p>}
          </div>
        </div>

        <SocialLinks social={profile?.social} label={t('footer.social')} className="pub-footer-social" />

        <div className="pub-footer-bottom">
          <p className="pub-footer-rights">{t('footer.rights', { year: new Date().getFullYear(), name })}</p>
          <button type="button" className="pub-btn pub-btn--ghost pub-btn--sm" onClick={backToTop}>
            <ArrowUpIcon size={16} />
            <span>{t('common.backToTop')}</span>
          </button>
        </div>
      </div>
    </footer>
  )
}

export default PublicFooter
