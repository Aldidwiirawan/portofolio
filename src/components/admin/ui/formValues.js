// Helpers for form values (list fields and month/year pairs) used by the content forms.

/** Trimmed items without empty ones (what gets saved). */
export function cleanList(items) {
  return (items || []).map((item) => String(item).trim()).filter(Boolean)
}

/**
 * Checks a month/year value for a form. Returns a message or null.
 * - required: both parts needed (or only the year with monthOptional)
 * - a partly filled value is always an error
 */
export function checkMonthYear({ month, year } = {}, { required = false, monthOptional = false, label = 'Tanggal' } = {}) {
  if (!month && !year) return required ? `${label} wajib diisi.` : null
  if (!year) return 'Pilih tahunnya juga.'
  if (!month && !monthOptional) return 'Pilih bulannya juga.'
  return null
}
