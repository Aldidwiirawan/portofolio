import RobotMascot from '../../brand/RobotMascot'

/** Empty list: small robot a+, a short explanation and a call to action (e.g. "Tambah proyek pertama"). */
export function EmptyState({ title, children, action, mood = 'idle' }) {
  return (
    <div className="adm-empty">
      <RobotMascot mood={mood} size={76} className="adm-empty-robot" />
      <h2 className="adm-empty-title">{title}</h2>
      {children && <p className="adm-empty-text">{children}</p>}
      {action && <div className="adm-empty-action">{action}</div>}
    </div>
  )
}

/**
 * Loading placeholder. variant: list | stats | form. The text is only for screen readers;
 * the shapes are decorative.
 */
export function Skeleton({ variant = 'list', rows = 3, label = 'Memuat data...' }) {
  const items = Array.from({ length: rows }, (_, i) => i)
  return (
    <div className={`adm-skeleton adm-skeleton--${variant}`} role="status">
      <span className="adm-sr-only">{label}</span>
      {variant === 'stats' &&
        items.map((i) => (
          <div key={i} className="adm-skel-stat" aria-hidden="true">
            <span className="adm-skel adm-skel--line" style={{ width: '45%' }} />
            <span className="adm-skel adm-skel--value" />
            <span className="adm-skel adm-skel--line" style={{ width: '70%' }} />
          </div>
        ))}
      {variant === 'form' &&
        items.map((i) => (
          <div key={i} className="adm-skel-field" aria-hidden="true">
            <span className="adm-skel adm-skel--line" style={{ width: '25%' }} />
            <span className="adm-skel adm-skel--input" />
          </div>
        ))}
      {variant === 'list' &&
        items.map((i) => (
          <div key={i} className="adm-skel-row" aria-hidden="true">
            <span className="adm-skel adm-skel--media" />
            <span className="adm-skel-lines">
              <span className="adm-skel adm-skel--line" style={{ width: `${55 - i * 7}%` }} />
              <span className="adm-skel adm-skel--line" style={{ width: '85%' }} />
              <span className="adm-skel adm-skel--line" style={{ width: '35%' }} />
            </span>
          </div>
        ))}
    </div>
  )
}
