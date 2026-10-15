import Logo from '../../brand/Logo'

/**
 * Brand lockup used in the admin sidebar and the mobile top bar: transparent logo | thin rule |
 * name and a monospace sub-label. Same proportions as the login lockup on small screens
 * (trimmed 29 px logo, 20 + 2 + 13 px text block), so the logo grid lands on whole pixels.
 */
export function BrandLockup({ sub = 'Kelola isi // 2026' }) {
  return (
    <div className="adm-lockup">
      <Logo size={29} trim className="adm-lockup-logo" />
      <span className="adm-lockup-rule" aria-hidden="true" />
      <div className="adm-lockup-text">
        <p className="adm-lockup-name">Aldi Dwi Irawan</p>
        <p className="adm-lockup-sub" aria-hidden="true">
          {sub}
        </p>
      </div>
    </div>
  )
}
