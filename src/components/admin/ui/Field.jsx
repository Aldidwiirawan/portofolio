import { Children, cloneElement, isValidElement } from 'react'
import { IconAlert, IconCheck, IconChevronDown } from './icons'

/**
 * Label + control + hint + error. The control (a single element) receives `id`, `aria-describedby`
 * and `aria-invalid` automatically, so the error under the field is announced with it.
 */
export function Field({ id, label, hint, error, required = false, optional = false, className = '', children }) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined
  const only = Children.only(children)
  const control = isValidElement(only)
    ? cloneElement(only, {
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
        required: only.props.required ?? (required || undefined),
      })
    : only

  return (
    <div className={['adm-field', error && 'is-invalid', className].filter(Boolean).join(' ')}>
      <label htmlFor={id} className="adm-label">
        {label}
        {required && (
          <span className="adm-required" aria-hidden="true">
            *
          </span>
        )}
        {optional && <span className="adm-optional">(opsional)</span>}
      </label>
      {control}
      {hint && (
        <p id={hintId} className="adm-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="adm-error">
          <IconAlert size={16} />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}

export function Input({ className = '', ...props }) {
  return (
    <span className="adm-control">
      <input className={`adm-input ${className}`.trim()} {...props} />
    </span>
  )
}

export function Textarea({ className = '', rows = 4, ...props }) {
  return (
    <span className="adm-control">
      <textarea className={`adm-input adm-textarea ${className}`.trim()} rows={rows} {...props} />
    </span>
  )
}

export function Select({ className = '', children, ...props }) {
  return (
    <span className="adm-control adm-control--select">
      <select className={`adm-input adm-select ${className}`.trim()} {...props}>
        {children}
      </select>
      <IconChevronDown className="adm-select-chevron" size={18} />
    </span>
  )
}

/** Checkbox with its own visible label (and optional description). */
export function Checkbox({ id, label, description, className = '', ...props }) {
  const descId = description ? `${id}-desc` : undefined
  return (
    <div className={`adm-check ${className}`.trim()}>
      <input id={id} type="checkbox" className="adm-check-input" aria-describedby={descId} {...props} />
      <label htmlFor={id} className="adm-check-label">
        <span className="adm-check-box" aria-hidden="true">
          <IconCheck size={14} />
        </span>
        <span className="adm-check-text">{label}</span>
      </label>
      {description && (
        <p id={descId} className="adm-check-desc">
          {description}
        </p>
      )}
    </div>
  )
}

/**
 * Choice chips (radio group): one value from a short list, e.g. a category or a level.
 * options: [{ value, label }] or plain strings.
 */
export function ChoiceGroup({ name, legend, options, value, onChange, hint, error, disabled = false, required = false }) {
  const hintId = hint ? `${name}-hint` : undefined
  const errorId = error ? `${name}-error` : undefined
  return (
    <fieldset
      className={['adm-field', 'adm-choices', error && 'is-invalid'].filter(Boolean).join(' ')}
      aria-describedby={[errorId, hintId].filter(Boolean).join(' ') || undefined}
    >
      <legend className="adm-label">
        {legend}
        {required && (
          <span className="adm-required" aria-hidden="true">
            *
          </span>
        )}
      </legend>
      <div className="adm-choice-list">
        {options.map((option) => {
          const opt = typeof option === 'string' ? { value: option, label: option } : option
          const optId = `${name}-${String(opt.value).replace(/\W+/g, '-').toLowerCase()}`
          return (
            <span key={opt.value} className="adm-choice">
              <input
                id={optId}
                type="radio"
                name={name}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => onChange(opt.value)}
                disabled={disabled}
                className="adm-choice-input"
              />
              <label htmlFor={optId} className="adm-choice-label">
                {opt.label}
              </label>
            </span>
          )
        })}
      </div>
      {hint && (
        <p id={hintId} className="adm-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="adm-error">
          <IconAlert size={16} />
          <span>{error}</span>
        </p>
      )}
    </fieldset>
  )
}

/** Group of related fields with a small monospace heading. */
export function FormSection({ title, description, children, columns = 1 }) {
  return (
    <fieldset className={`adm-form-section adm-form-section--${columns}`}>
      <legend className="adm-form-section-title">{title}</legend>
      {description && <p className="adm-form-section-desc">{description}</p>}
      <div className="adm-form-grid">{children}</div>
    </fieldset>
  )
}

/**
 * Quick picks under a free-text field (e.g. Frontend / Backend), or a filter row above a list.
 * Toggle buttons with aria-pressed; `label` names the group for screen readers.
 */
export function QuickPicks({ label, options, value, onPick, disabled = false, isSelected = (option, current) => option === current }) {
  return (
    <div className="adm-quickpicks" role="group" aria-label={label}>
      {options.map((option) => {
        const opt = typeof option === 'string' ? { value: option, label: option } : option
        return (
          <button
            key={opt.value}
            type="button"
            className="adm-quickpick"
            aria-pressed={isSelected(opt.value, value)}
            onClick={() => onPick(opt.value)}
            disabled={disabled}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
