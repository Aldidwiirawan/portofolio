import { IconAlert, IconCheck, IconClose, IconInfo } from './icons'

const ICONS = { danger: IconAlert, success: IconCheck, info: IconInfo }

/**
 * Inline message. Errors use role="alert" (announced at once); other tones role="status".
 * tone: danger | success | info
 */
export function Alert({ tone = 'danger', title, children, action, onClose, className = '' }) {
  const Icon = ICONS[tone] || IconInfo
  return (
    <div className={`adm-alert adm-alert--${tone} ${className}`.trim()} role={tone === 'danger' ? 'alert' : 'status'}>
      <Icon className="adm-alert-icon" size={20} />
      <div className="adm-alert-content">
        {title && <p className="adm-alert-title">{title}</p>}
        {children && <div className="adm-alert-text">{children}</div>}
        {action && <div className="adm-alert-action">{action}</div>}
      </div>
      {onClose && (
        <button type="button" className="adm-alert-close" onClick={onClose} aria-label="Tutup pesan">
          <IconClose size={18} />
        </button>
      )}
    </div>
  )
}
