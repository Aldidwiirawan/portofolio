import { useI18n } from '../../../i18n/i18nContext'

/** "Jan 2026 – Jul 2026" / "Jan 2026 – sekarang", with machine-readable dates. */
export function Period({ start, end, current }) {
  const { t, formatDate } = useI18n()
  const from = formatDate(start)
  const to = current ? t('common.present') : formatDate(end)
  if (!from && !to) return null
  return (
    <>
      {from && <time dateTime={String(start).slice(0, 7)}>{from}</time>}
      {from && to && ' – '}
      {to && (current ? <span>{to}</span> : <time dateTime={String(end).slice(0, 7)}>{to}</time>)}
    </>
  )
}

/** "2023 – 2026" / "2023 – sekarang" for entries that only have years (education). */
export function YearPeriod({ start, end, current }) {
  const { t } = useI18n()
  const to = current ? t('common.present') : end
  if (!start && !to) return null
  return (
    <>
      {start && <time dateTime={String(start)}>{start}</time>}
      {start && to && ' – '}
      {to && (current ? <span>{to}</span> : <time dateTime={String(to)}>{to}</time>)}
    </>
  )
}
