/**
 * Readable list of records that works at any width: on wide screens each item is a row
 * (media · details · actions); on phones the same item stacks as a card. Uses list semantics
 * so screen readers announce the number of items.
 */
export function DataList({ label, children, className = '', ...rest }) {
  return (
    <ul className={`adm-list ${className}`.trim()} aria-label={label} {...rest}>
      {children}
    </ul>
  )
}

/**
 * - title: main text (a heading-level-3 element keeps the page outline navigable)
 * - badges: small tags next to the title; subtitle: one or two lines of muted text
 * - meta: monospace details (dates, order); media: optional thumbnail; actions: buttons
 */
export function DataListItem({ media, title, badges, subtitle, meta, actions, children, highlight = false, className = '' }) {
  return (
    <li className={['adm-list-item', media && 'has-media', highlight && 'is-highlight', className].filter(Boolean).join(' ')}>
      {media && <div className="adm-list-media">{media}</div>}
      <div className="adm-list-main">
        <div className="adm-list-title-row">
          <h3 className="adm-list-title">{title}</h3>
          {badges && <div className="adm-list-badges">{badges}</div>}
        </div>
        {subtitle && <p className="adm-list-subtitle">{subtitle}</p>}
        {children}
        {meta && <p className="adm-list-meta">{meta}</p>}
      </div>
      {actions && <div className="adm-list-actions">{actions}</div>}
    </li>
  )
}
