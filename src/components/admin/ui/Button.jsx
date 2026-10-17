import { Link } from 'react-router-dom'
import { useLock } from './adminContexts'
import { IconCheck } from './icons'

function classes({ variant, size, block, className, status }) {
  return [
    'adm-btn',
    `adm-btn--${variant}`,
    size === 'sm' && 'adm-btn--sm',
    block && 'adm-btn--block',
    status === 'success' && 'is-success',
    className,
  ]
    .filter(Boolean)
    .join(' ')
}

/**
 * Admin button.
 * - variant: primary | secondary | danger | ghost
 * - loading: shows a spinner and `loadingText` (e.g. "Menyimpan..."); uses aria-disabled so keyboard
 *   focus stays on the button, and clicks are ignored meanwhile
 * - status="success": brackets lock onto the button and a check mark appears (`successText`)
 * - disabled: native, except while its form saves (see useLock) or with `softDisabled`, which
 *   keeps the button focusable: it looks unavailable, has aria-disabled and ignores clicks. Use
 *   softDisabled when the button itself may have focus at the moment it becomes unavailable.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  icon,
  loading = false,
  loadingText,
  status,
  successText = 'Tersimpan',
  block = false,
  className = '',
  disabled = false,
  softDisabled = false,
  onClick,
  children,
  ...rest
}) {
  const success = status === 'success' && !loading
  const lock = useLock(disabled)
  const unavailable = softDisabled || lock.soft
  const handleClick = (e) => {
    if (loading || unavailable) {
      e.preventDefault()
      return
    }
    onClick?.(e)
  }

  return (
    <button
      type={type}
      className={classes({ variant, size, block, className: [className, unavailable && !loading && 'is-unavailable'].filter(Boolean).join(' '), status: success ? 'success' : undefined })}
      aria-disabled={loading || unavailable || undefined}
      disabled={lock.hard || undefined}
      onClick={handleClick}
      {...rest}
    >
      {loading ? (
        <span className="adm-spinner" aria-hidden="true" />
      ) : success ? (
        <IconCheck className="adm-btn-check" size={18} />
      ) : (
        icon
      )}
      <span className="adm-btn-label">{loading ? loadingText || children : success ? successText : children}</span>
    </button>
  )
}

/** Router link that looks like a button (`to`), or a plain anchor when `href` is given. */
export function ButtonLink({ variant = 'secondary', size = 'md', block = false, icon, to, href, className = '', children, ...rest }) {
  const cls = classes({ variant, size, block, className })
  const content = (
    <>
      {icon}
      <span className="adm-btn-label">{children}</span>
    </>
  )
  if (href) {
    return (
      <a href={href} className={cls} {...rest}>
        {content}
      </a>
    )
  }
  return (
    <Link to={to} className={cls} {...rest}>
      {content}
    </Link>
  )
}

/** Square icon-only button; `label` is its accessible name (and tooltip). */
export function IconButton({ label, icon, variant = 'ghost', size = 'md', className = '', ...rest }) {
  return (
    <button
      type="button"
      className={['adm-icon-btn', `adm-icon-btn--${variant}`, size === 'sm' && 'adm-icon-btn--sm', className].filter(Boolean).join(' ')}
      aria-label={label}
      title={label}
      {...rest}
    >
      {icon}
    </button>
  )
}
