import { Suspense, useRef } from 'react'
import Logo from '../brand/Logo'
import { prefersReducedMotion } from '../../lib/useMediaQuery'
import { useI18n } from '../../i18n/i18nContext'
import { ArrowUpIcon } from './icons'
import { emitInteraction } from './interactionBus'
import { usePublicData } from './publicContexts'
import { SITE_NAME } from './publicFormat'
import SocialLinks from './SocialLinks'
import { lazyDecor, useNearViewport } from './useNearViewport'
import './PublicFooter.css'

const FooterRobot = lazyDecor(() => import('./robot/FooterRobot'))

/**
 * Footer: logo and name, copyright, social links and "Kembali ke atas" (scrolls up and moves focus
 * to the top of the content). Robot a+ stands next to that button (stage 3B, loaded when the footer
 * comes near): a decorative, pointer-only twin of the button. No admin link: the admin stays at
 * /admin/login.
 */
function PublicFooter() {
  const { t } = useI18n()
  const profile = usePublicData().profile.data
  const name = profile?.full_name || SITE_NAME
  const role = profile?.primary_role
  const buttonRef = useRef(null)
  const robotSlotRef = useRef(null)
  const robotNear = useNearViewport(robotSlotRef, '600px')

  const backToTop = () => {
    emitInteraction('back-to-top')
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
          <button ref={buttonRef} type="button" className="pub-btn pub-btn--ghost pub-btn--sm pub-top-btn" onClick={backToTop}>
            <ArrowUpIcon size={16} />
            <span>{t('common.backToTop')}</span>
          </button>
          <div ref={robotSlotRef} className="pub-top-robot" aria-hidden="true">
            {robotNear && (
              <Suspense fallback={null}>
                <FooterRobot slotRef={robotSlotRef} buttonRef={buttonRef} onActivate={backToTop} />
              </Suspense>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default PublicFooter
