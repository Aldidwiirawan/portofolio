import { Link } from 'react-router-dom'

/**
 * Blueprint Module Card: 6 px corners, 1 px border, optional thin header bar with a monospace label
 * (`label`) and corner brackets (`corners`, for important blocks such as forms).
 */
export function Card({ as: Tag = 'section', label, labelledBy, corners = false, flush = false, className = '', children, ...rest }) {
  return (
    <Tag
      className={['adm-card', corners && 'adm-card--corners adm-corners', flush && 'adm-card--flush', className].filter(Boolean).join(' ')}
      aria-labelledby={labelledBy}
      {...rest}
    >
      {label && (
        <div className="adm-card-bar" aria-hidden="true">
          <span className="adm-card-led" />
          <span>{label}</span>
        </div>
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

/** Clickable summary tile (Beranda): label, big monospace number and a short note. */
export function StatCard({ to, icon, label, value, note, highlight = false }) {
  return (
    <Link to={to} className={['adm-stat', highlight && 'adm-stat--highlight'].filter(Boolean).join(' ')}>
      <span className="adm-stat-head">
        <span className="adm-stat-icon">{icon}</span>
        <span className="adm-stat-label">{label}</span>
      </span>
      <span className="adm-stat-value">{value}</span>
      {note && <span className="adm-stat-note">{note}</span>}
    </Link>
  )
}
