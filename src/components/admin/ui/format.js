// Date helpers for admin lists, in plain Indonesian ("2 jam yang lalu", "kemarin", "5 Okt 2026").

const relative = new Intl.RelativeTimeFormat('id', { numeric: 'auto' })
const numericRelative = new Intl.RelativeTimeFormat('id', { numeric: 'always' })
const shortDate = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
const longDateTime = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

function toDate(value) {
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/** "baru saja", "5 menit yang lalu", "kemarin", … up to a week; then "5 Okt 2026". */
export function formatRelativeDate(value, now = Date.now()) {
  const date = toDate(value)
  if (!date) return ''
  const seconds = (date.getTime() - now) / 1000
  const abs = Math.abs(seconds)
  if (abs < 60) return 'baru saja'
  if (abs < 3600) return relative.format(Math.round(seconds / 60), 'minute')
  if (abs < 86400) return relative.format(Math.round(seconds / 3600), 'hour')
  if (abs < 7 * 86400) {
    const days = Math.round(seconds / 86400)
    // "kemarin" reads naturally; "kemarin dulu" (2 days) is clearer as "2 hari yang lalu"
    return Math.abs(days) === 1 ? relative.format(days, 'day') : numericRelative.format(days, 'day')
  }
  return shortDate.format(date)
}

/** "15 Oktober 2026 pukul 14.30" — for tooltips and <time> titles. */
export function formatDateTime(value) {
  const date = toDate(value)
  return date ? longDateTime.format(date) : ''
}
