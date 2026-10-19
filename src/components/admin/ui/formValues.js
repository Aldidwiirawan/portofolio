// Helpers for form values (list fields and month/year pairs) used by the content forms.

/** Trimmed items without empty ones (what gets saved). */
export function cleanList(items) {
  return (items || []).map((item) => String(item).trim()).filter(Boolean)
}

// ---- English versions (stage 3C) ----------------------------------------------------------------
// A list's English version is parallel to it: item n translates item n of the Indonesian list.

/** Trimmed English text, or null when empty (the site then shows the Indonesian text). */
export function englishText(value) {
  const text = String(value ?? '').trim()
  return text || null
}

/** The stored English list as form rows, one per Indonesian item ('' = not translated yet). */
export function alignList(items, translations) {
  const english = Array.isArray(translations) ? translations : []
  return (Array.isArray(items) ? items : []).map((_, index) => (typeof english[index] === 'string' ? english[index] : ''))
}

/**
 * English rows after the Indonesian list changed shape (ListInput onRowsChange): order[n] is the old
 * position of row n, or null for a new row.
 */
export function remapList(translations, order) {
  return order.map((from) => (from == null ? '' : (translations?.[from] ?? '')))
}

/**
 * The English list to save next to cleanList(items): it keeps the pairs whose Indonesian item is
 * saved, so item n still translates item n; empty items at the end are left out.
 */
export function cleanParallelList(items, translations) {
  const english = (items || [])
    .map((item, index) => [String(item).trim(), String(translations?.[index] ?? '').trim()])
    .filter(([item]) => item)
    .map(([, translation]) => translation)
  while (english.length > 0 && !english[english.length - 1]) english.pop()
  return english
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
