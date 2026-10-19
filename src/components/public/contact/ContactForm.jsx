import { useId, useRef, useState } from 'react'
import { sendContactMessage } from '../../../hooks/usePublicPortfolio'
import { useI18n } from '../../../i18n/i18nContext'
import { AlertIcon, CheckIcon, SendIcon } from '../icons'

const LIMITS = { name: 100, email: 254, message: 2000 }
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const EMPTY = { name: '', email: '', topic: '', message: '' }

/**
 * Contact form → public.messages (the admin inbox), with the topic chosen from the profile's
 * contact topics (no subject field, K9). Errors are shown per field and focus moves to the first
 * one; the result is announced in a status/alert region that is always in the DOM. While sending,
 * the button uses aria-disabled + a guard so keyboard focus stays on it.
 * @param {{ topics: Array<{ value: string, label: string, lang?: string }> }} props value = the
 *   Indonesian topic that is stored, label = the topic in the page language
 */
function ContactForm({ topics }) {
  const { t } = useI18n()
  const id = useId()
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [state, setState] = useState('idle') // idle | sending | sent | failed
  const refs = { name: useRef(null), email: useRef(null), topic: useRef(null), message: useRef(null) }
  const hasTopics = topics.length > 0

  const label = (field) => t(`form.${field}`)

  const validate = (next) => {
    const found = {}
    for (const field of ['name', 'email', 'topic', 'message']) {
      if (field === 'topic' && !hasTopics) continue
      const value = next[field].trim()
      if (!value) found[field] = t('form.required', { field: label(field) })
      else if (LIMITS[field] && value.length > LIMITS[field]) found[field] = t('form.tooLong', { field: label(field), n: LIMITS[field] })
    }
    if (!found.email && !EMAIL_PATTERN.test(next.email.trim())) found.email = t('form.badEmail')
    return found
  }

  const onChange = (field) => (event) => {
    const next = { ...values, [field]: event.target.value }
    setValues(next)
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: validate(next)[field] }))
    if (state === 'sent' || state === 'failed') setState('idle')
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    if (state === 'sending') return
    const found = validate(values)
    setErrors(found)
    const first = ['name', 'email', 'topic', 'message'].find((field) => found[field])
    if (first) {
      refs[first].current?.focus()
      return
    }
    setState('sending')
    try {
      await sendContactMessage({
        name: values.name.trim(),
        email: values.email.trim(),
        topic: hasTopics ? values.topic : null,
        message: values.message.trim(),
      })
      setValues(EMPTY)
      setState('sent')
    } catch {
      setState('failed')
    }
  }

  const field = (name, input) => {
    const errorId = `${id}-${name}-error`
    const error = errors[name]
    return (
      <div className="pub-field" data-invalid={error ? '' : undefined}>
        <label className="pub-label" htmlFor={`${id}-${name}`}>
          {label(name)}
        </label>
        <span className="pub-control">
          {input({
            id: `${id}-${name}`,
            ref: refs[name],
            value: values[name],
            onChange: onChange(name),
            'aria-invalid': error ? true : undefined,
            'aria-describedby': error ? errorId : undefined,
            'aria-required': true,
          })}
        </span>
        {error && (
          <p id={errorId} className="pub-field-error">
            <AlertIcon size={16} />
            <span>{error}</span>
          </p>
        )}
      </div>
    )
  }

  const sending = state === 'sending'

  return (
    <form className="pub-contact-form" onSubmit={onSubmit} noValidate aria-labelledby={`${id}-title`}>
      <div className="pub-contact-form-head">
        <h3 id={`${id}-title`} className="pub-contact-form-title">
          {t('contact.formTitle')}
        </h3>
        <p className="pub-hint">{t('form.requiredNote')}</p>
      </div>

      <div className="pub-contact-form-row">
        {field('name', (props) => (
          <input {...props} className="pub-input" type="text" name="name" autoComplete="name" maxLength={LIMITS.name} placeholder={t('form.namePlaceholder')} />
        ))}
        {field('email', (props) => (
          <input
            {...props}
            className="pub-input"
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            spellCheck={false}
            maxLength={LIMITS.email}
            placeholder={t('form.emailPlaceholder')}
          />
        ))}
      </div>

      {hasTopics &&
        field('topic', (props) => (
          <select {...props} className="pub-input" name="topic">
            <option value="">{t('form.topicPick')}</option>
            {topics.map((topic) => (
              <option key={topic.value} value={topic.value} lang={topic.lang}>
                {topic.label}
              </option>
            ))}
          </select>
        ))}

      {field('message', (props) => (
        <textarea {...props} className="pub-input pub-textarea" name="message" rows={6} maxLength={LIMITS.message} />
      ))}

      <div className="pub-contact-form-foot">
        <button type="submit" className="pub-btn pub-btn--primary" aria-disabled={sending || undefined}>
          {sending ? <span className="pub-spinner" aria-hidden="true" /> : <SendIcon size={18} />}
          <span>{t(sending ? 'form.sending' : 'form.send')}</span>
        </button>
        <div role="status">
          {state === 'sent' && (
            <p className="pub-form-status pub-form-status--success">
              <CheckIcon size={18} />
              <span>{t('form.success')}</span>
            </p>
          )}
        </div>
        <div role="alert">
          {state === 'failed' && (
            <p className="pub-form-status pub-form-status--error">
              <AlertIcon size={18} />
              <span>{t('form.failed')}</span>
            </p>
          )}
        </div>
      </div>
    </form>
  )
}

export default ContactForm
