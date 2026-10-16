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

/** "850 KB", "1,4 MB" — file sizes next to chosen files. */
export function formatFileSize(bytes) {
  if (!Number.isFinite(bytes)) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`
}

export const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

/** '2024-03-01' → { month: '3', year: '2024' } (strings, as the two selects use them) */
export function dateToMonthYear(value) {
  const match = typeof value === 'string' ? value.match(/^(\d{4})-(\d{2})/) : null
  return match ? { month: String(Number(match[2])), year: match[1] } : { month: '', year: '' }
}

/** { month: '3', year: '2024' } → '2024-03-01' (first day of the month), or null when incomplete */
export function monthYearToDate({ month, year } = {}) {
  if (!month || !year) return null
  return `${year}-${String(month).padStart(2, '0')}-01`
}

/** '2024-03-01' → 'Mar 2024'; month/year numbers work too (formatMonthYear(null, 9, 2020) → 'Sep 2020') */
export function formatMonthYear(value, month, year) {
  const parts = value ? dateToMonthYear(value) : { month: month ? String(month) : '', year: year ? String(year) : '' }
  if (!parts.year) return ''
  return parts.month ? `${MONTHS_SHORT[Number(parts.month) - 1]} ${parts.year}` : parts.year
}

/** 'Jan 2023 – Jun 2023', 'Feb 2025 – sekarang' */
export function formatPeriod(start, end, isCurrent = false) {
  const from = formatMonthYear(start)
  const to = isCurrent ? 'sekarang' : formatMonthYear(end)
  if (!from && !to) return ''
  if (!to) return from
  return `${from || '?'} – ${to}`
}
