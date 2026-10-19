import { Fragment, isValidElement } from 'react'
import { useI18n } from '../../i18n/i18nContext'

const MARK = '\u0001'

/**
 * A dictionary sentence with content inside it, e.g. "View project: {title}". A value given as
 * { text, lang } is wrapped in <span lang> (content that stays Indonesian on the English page); a
 * React element is placed as it is.
 * @param {{ id: string, vars: Record<string, string | { text: string, lang?: string } | React.ReactElement> }} props
 */
function Phrase({ id, vars }) {
  const { t } = useI18n()
  const marked = Object.fromEntries(Object.keys(vars).map((name) => [name, `${MARK}${name}${MARK}`]))
  const parts = t(id, marked).split(MARK)
  return parts.map((part, index) => {
    if (index % 2 === 0) return part ? <Fragment key={index}>{part}</Fragment> : null
    const value = vars[part]
    if (isValidElement(value)) return <Fragment key={index}>{value}</Fragment>
    const content = typeof value === 'object' && value ? value : { text: value ?? '' }
    return content.lang ? (
      <span key={index} lang={content.lang}>
        {content.text}
      </span>
    ) : (
      <Fragment key={index}>{content.text}</Fragment>
    )
  })
}

export default Phrase
