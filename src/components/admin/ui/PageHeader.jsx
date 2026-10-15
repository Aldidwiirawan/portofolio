/**
 * Page header: optional breadcrumb, the page's only h1, a short description and the page actions.
 * - breadcrumb: [{ label, onClick }] for the levels above this page (e.g. "Proyek" while the
 *   "Tambah proyek" form is open). The current title is appended as the last, current crumb.
 * - leading: optional decoration before the title block (e.g. the small robot on Beranda).
 * - headingRef: the h1 (tabIndex -1) so the layout can move focus to it after navigation.
 */
export function PageHeader({ title, description, actions, breadcrumb, leading, headingRef }) {
  return (
    <header className="adm-page-header">
      {breadcrumb?.length > 0 && (
        <nav className="adm-breadcrumb" aria-label="Jejak halaman">
          <ol>
            {breadcrumb.map((crumb) => (
              <li key={crumb.label}>
                <button type="button" className="adm-breadcrumb-link" onClick={crumb.onClick}>
                  {crumb.label}
                </button>
                <span className="adm-breadcrumb-sep" aria-hidden="true">
                  /
                </span>
              </li>
            ))}
            <li aria-current="page">{title}</li>
          </ol>
        </nav>
      )}
      <div className="adm-page-header-row">
        {leading && <div className="adm-page-leading">{leading}</div>}
        <div className="adm-page-heading">
          <h1 ref={headingRef} className="adm-page-title" tabIndex={-1}>
            {title}
          </h1>
          {description && <p className="adm-page-desc">{description}</p>}
        </div>
        {actions && <div className="adm-page-actions">{actions}</div>}
      </div>
    </header>
  )
}
