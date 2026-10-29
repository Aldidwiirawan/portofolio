import { useId, useRef, useState } from 'react'
import { useFocusTrap } from '../../admin/ui/useFocusTrap'
import { useScrollLock } from '../../admin/ui/useScrollLock'
import { useI18n } from '../../../i18n/i18nContext'
import { AlertIcon, CheckIcon, CloseIcon, SendIcon } from '../icons'
import { usePublicData } from '../publicContexts'
import { firstName } from '../publicFormat'

// Same limits as the guestbook table (CHECK constraints) and useGuestbook
const NAME_MAX = 100
const MESSAGE_MAX = 240

/**
 * Guestbook panel (right side, full screen on phones): short form and the messages, pinned ones
 * first, with the owner's replies. A dialog with focus kept inside; Escape, "Tutup" or a click on
 * the dimmed page closes it. Messages appear for every visitor right away (useGuestbook). Avatars are
 * monochrome initials (the stored avatar color is not used by the monochrome page).
 */
function GuestbookDrawer({ guestbook, onClose }) {
  const { t, formatDate } = useI18n()
  const owner = firstName(usePublicData()?.profile.data?.full_name) || 'Aldi'
  const id = useId()
  const panelRef = useRef(null)
  const nameRef = useRef(null)
  const messageRef = useRef(null)
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState({})
  const [state, setState] = useState('idle') // idle | sending | sent | failed

  useFocusTrap(panelRef, true, { onEscape: onClose, initialFocusRef: nameRef })
  useScrollLock(true)

  const onSubmit = async (event) => {
    event.preventDefault()
    if (state === 'sending') return
    const found = {}
    if (!name.trim()) found.name = t('form.required', { field: t('guestbook.name') })
    else if (name.trim().length > NAME_MAX) found.name = t('form.tooLong', { field: t('guestbook.name'), n: NAME_MAX })
    if (!message.trim()) found.message = t('form.required', { field: t('guestbook.message') })
    else if (message.trim().length > MESSAGE_MAX) found.message = t('form.tooLong', { field: t('guestbook.message'), n: MESSAGE_MAX })
    setErrors(found)
    if (found.name || found.message) {
      ;(found.name ? nameRef : messageRef).current?.focus()
      return
    }
    setState('sending')
    try {
      await guestbook.addEntry({ name, message })
      setName('')
      setMessage('')
      setState('sent')
    } catch {
      setState('failed')
    }
  }

  const left = MESSAGE_MAX - message.length
  const sending = state === 'sending'

  return (
    <div className="pub-gb-layer">
      <div className="pub-gb-backdrop" onClick={onClose} aria-hidden="true" />
      <div ref={panelRef} className="pub-gb-panel" role="dialog" aria-modal="true" aria-labelledby={`${id}-title`}>
        <div className="pub-gb-head">
          <h2 id={`${id}-title`} className="pub-gb-title">
            {t('guestbook.title')}
          </h2>
          <button type="button" className="pub-icon-btn" onClick={onClose} aria-label={t('common.close')}>
            <CloseIcon size={22} />
          </button>
        </div>

        <div className="pub-gb-body">
          <p className="pub-gb-intro">{t('guestbook.intro')}</p>

          <form className="pub-gb-form" onSubmit={onSubmit} noValidate>
            <div className="pub-field" data-invalid={errors.name ? '' : undefined}>
              <label className="pub-label" htmlFor={`${id}-name`}>
                {t('guestbook.name')}
              </label>
              <span className="pub-control">
                <input
                  ref={nameRef}
                  id={`${id}-name`}
                  className="pub-input"
                  type="text"
                  autoComplete="name"
                  maxLength={NAME_MAX}
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value)
                    if (state !== 'sending') setState('idle')
                  }}
                  aria-invalid={errors.name ? true : undefined}
                  aria-describedby={errors.name ? `${id}-name-error` : undefined}
                  aria-required="true"
                />
              </span>
              {errors.name && (
                <p id={`${id}-name-error`} className="pub-field-error">
                  <AlertIcon size={16} />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            <div className="pub-field" data-invalid={errors.message ? '' : undefined}>
              <div className="pub-label-row">
                <label className="pub-label" htmlFor={`${id}-message`}>
                  {t('guestbook.message')}
                </label>
                <span id={`${id}-left`} className="pub-hint" data-low={left < 20 || undefined}>
                  {t('guestbook.charsLeft', { n: left })}
                </span>
              </div>
              <span className="pub-control">
                <textarea
                  ref={messageRef}
                  id={`${id}-message`}
                  className="pub-input pub-textarea pub-gb-textarea"
                  rows={3}
                  maxLength={MESSAGE_MAX}
                  value={message}
                  onChange={(event) => {
                    setMessage(event.target.value)
                    if (state !== 'sending') setState('idle')
                  }}
                  aria-invalid={errors.message ? true : undefined}
                  aria-describedby={[errors.message && `${id}-message-error`, `${id}-left`].filter(Boolean).join(' ')}
                  aria-required="true"
                />
              </span>
              {errors.message && (
                <p id={`${id}-message-error`} className="pub-field-error">
                  <AlertIcon size={16} />
                  <span>{errors.message}</span>
                </p>
              )}
            </div>

            <div>
              <button type="submit" className="pub-btn pub-btn--primary pub-gb-send" aria-disabled={sending || undefined}>
                {sending ? <span className="pub-spinner" aria-hidden="true" /> : <SendIcon size={18} />}
                <span>{t(sending ? 'guestbook.sending' : 'guestbook.send')}</span>
              </button>
              <div role="status">
                {state === 'sent' && (
                  <p className="pub-form-status pub-form-status--success">
                    <CheckIcon size={18} />
                    <span>{t('guestbook.sent')}</span>
                  </p>
                )}
              </div>
              <div role="alert">
                {state === 'failed' && (
                  <p className="pub-form-status pub-form-status--error">
                    <AlertIcon size={18} />
                    <span>{t('guestbook.sendFailed')}</span>
                  </p>
                )}
              </div>
            </div>
          </form>

          <section className="pub-gb-list" aria-labelledby={`${id}-list`}>
            <h3 id={`${id}-list`} className="pub-gb-list-title">
              {t('guestbook.listTitle')} <span>· {t('guestbook.count', { n: guestbook.totalCount })}</span>
            </h3>
            {guestbook.error && guestbook.entries.length === 0 ? (
              <p className="pub-notice" role="alert">
                <AlertIcon size={18} />
                <span>{t('guestbook.loadError')}</span>
              </p>
            ) : guestbook.entries.length === 0 ? (
              <p className="pub-gb-empty">{t('guestbook.empty')}</p>
            ) : (
              <ul className="pub-gb-entries">
                {guestbook.entries.map((entry) => (
                  <li key={entry.id} className="pub-gb-entry">
                    <div className="pub-gb-entry-head">
                      <span className="pub-gb-avatar" aria-hidden="true">
                        {(entry.name || '?').trim().charAt(0).toUpperCase()}
                      </span>
                      <p className="pub-gb-name">{entry.name}</p>
                      {entry.is_pinned && <span className="pub-badge pub-badge--accent">{t('guestbook.pinned')}</span>}
                      {entry.created_at && (
                        <time className="pub-gb-date" dateTime={entry.created_at}>
                          {formatDate(entry.created_at, 'day')}
                        </time>
                      )}
                    </div>
                    <p className="pub-gb-message">{entry.message}</p>
                    {entry.admin_reply && (
                      <div className="pub-gb-reply">
                        <p className="pub-gb-reply-label">{t('guestbook.reply', { name: owner })}</p>
                        <p>{entry.admin_reply}</p>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default GuestbookDrawer
