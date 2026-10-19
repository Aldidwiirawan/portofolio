// Labels of the hero stage (profiles.hero_labels, migration 20261019000000, BRIEF §5): values for
// the form and checks before saving. The database checks the same limits.

export const MAX_HERO_LABELS = 10
export const HERO_LABEL_MAX = { tag: 24, circle: 3 }

/** Characters as the database counts them (an emoji is one). */
const length = (text) => [...String(text ?? '')].length

/** A new, empty row. */
export const emptyHeroLabel = () => ({ text: '', text_en: '', shape: 'tag' })

/** Stored labels as form rows ({ text, text_en, shape }, '' when there is none). */
export function normalizeHeroLabels(value) {
  if (!Array.isArray(value)) return []
  return value
    .filter((item) => item && typeof item === 'object' && !Array.isArray(item))
    .map((item) => ({
      text: typeof item.text === 'string' ? item.text : '',
      text_en: typeof item.text_en === 'string' ? item.text_en : '',
      shape: item.shape === 'circle' ? 'circle' : 'tag',
    }))
}

/**
 * Checks the rows before saving. Fully empty rows are dropped.
 * @returns {{ labels: Array<{ text: string, text_en?: string, shape: 'tag' | 'circle' }>,
 *   errors: Array<{ text?: string, text_en?: string } | null>, valid: boolean }} errors follow `rows`
 */
export function prepareHeroLabels(rows) {
  const list = Array.isArray(rows) ? rows : []
  const errors = list.map(() => null)
  const labels = []
  list.forEach((row, index) => {
    const text = String(row.text ?? '').trim()
    const textEn = String(row.text_en ?? '').trim()
    if (!text && !textEn) return
    const shape = row.shape === 'circle' ? 'circle' : 'tag'
    const max = HERO_LABEL_MAX[shape]
    const error = {}
    if (!text) error.text = 'Tulis teks labelnya.'
    else if (length(text) > max) {
      error.text = shape === 'circle' ? `Lingkaran muat ${max} karakter, misalnya </> atau *.` : `Teks label maksimal ${max} karakter.`
    }
    if (length(textEn) > max) error.text_en = `Teks Inggris maksimal ${max} karakter.`
    if (error.text || error.text_en) errors[index] = error
    labels.push({ text, ...(textEn ? { text_en: textEn } : {}), shape })
  })
  return { labels, errors, valid: errors.every((error) => !error) }
}
