import { Link } from 'react-router-dom'

/**
 * Blueprint Module Card: 6 px corners, 1 px border, optional thin header bar with a monospace label
 * and corner brackets (`corners`, for important blocks such as forms).
 * - label: decorative bar text (hidden from screen readers)
 * - heading + headingId: the bar holds the card's real h2 instead (the card is labelled by it);
 *   barAside goes on the right of that bar (e.g. a count badge)
 */
export function Card({
  as: Tag = 'section',
  label,
  heading,
  headingId,
  barAside,
  labelledBy,
  corners = false,
  flush = false,
  className = '',
  children,
  ...rest
}) {
  return (
    <Tag
      className={['adm-card', corners && 'adm-card--corners adm-corners', flush && 'adm-card--flush', className].filter(Boolean).join(' ')}
      aria-labelledby={labelledBy || (heading ? headingId : undefined)}
      {...rest}
    >
      {heading ? (
        <div className="adm-card-bar">
          <span className="adm-card-led" aria-hidden="true" />
          <h2 id={headingId} className="adm-card-bar-title">
            {heading}
          </h2>
          {barAside && <span className="adm-card-bar-aside">{barAside}</span>}
        </div>
      ) : (
        label && (
          <div className="adm-card-bar" aria-hidden="true">
            <span className="adm-card-led" />
            <span>{label}</span>
          </div>
        )
      )}
      <div className="adm-card-body">{children}</div>
    </Tag>
  )
}

/** Small monospace tag. tone: neutral | accent | success | danger */
export function Badge({ tone = 'neutral', dot = false, className = '', children, ...rest }) {
  return (
    <span className={['adm-badge', `adm-badge--${tone}`, dot && 'adm-badge--dot', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </span>
  )
}

/**
 * Clickable summary tile (Beranda): label, big monospace number and a short note.
 * Hidden punctuation makes screen readers say "Proyek: 6, 2 unggulan".
 */
export function StatCard({ to, icon, label, value, note, highlight = false, className = '' }) {
  return (
    <Link to={to} className={['adm-stat', highlight && 'adm-stat--highlight', className].filter(Boolean).join(' ')}>
      <span className="adm-stat-head">
        <span className="adm-stat-icon">{icon}</span>
        <span className="adm-stat-label">{label}</span>
        <span className="adm-sr-only">: </span>
      </span>
      <span className="adm-stat-value">{value}</span>
      {note && (
        <span className="adm-stat-note">
          <span className="adm-sr-only">, </span>
          {note}
        </span>
      )}
    </Link>
  )
}
