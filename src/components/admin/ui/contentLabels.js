/**
 * Choice lists of the content forms. New choice columns store a code (translated on the public site
 * in stage 3); the admin shows the Indonesian label. Older columns (experience type, skill
 * category, language level) store the label itself, as the public page shows it directly.
 */

export const PROJECT_STATUSES = [
  { value: 'production', label: 'Produksi' },
  { value: 'completed', label: 'Selesai' },
  { value: 'final_project', label: 'Tugas akhir' },
  { value: 'in_development', label: 'Dalam pengembangan' },
  { value: 'concept', label: 'Konsep' },
]

export const PROJECT_TYPES = [
  { value: 'web', label: 'Web' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'desktop', label: 'Desktop' },
  { value: 'network', label: 'Jaringan' },
  { value: 'other', label: 'Lainnya' },
]

export const CERTIFICATE_CATEGORIES = [
  { value: 'competency', label: 'Kompetensi' },
  { value: 'network', label: 'Jaringan' },
  { value: 'language', label: 'Bahasa' },
  { value: 'training', label: 'Pelatihan' },
  { value: 'internship', label: 'Magang' },
]

export const EXPERIENCE_TYPES = ['Magang', 'Kerja', 'Freelance', 'Organisasi']

export const SKILL_CATEGORIES = ['Backend', 'Frontend', 'Mobile', 'Database', 'Jaringan & IT Support', 'Tools', 'Soft skill']

export const LANGUAGE_LEVELS = ['Penutur asli', 'Aktif', 'Menengah', 'Dasar']

/** Label of a stored code, e.g. labelOf(PROJECT_STATUSES, 'production') → 'Produksi' */
export function labelOf(options, value) {
  return options.find((option) => option.value === value)?.label ?? ''
}

const DAY = 24 * 60 * 60 * 1000

/**
 * Validity of a certificate for list badges and Beranda reminders.
 * @returns {{ state: 'none' | 'permanent' | 'valid' | 'soon' | 'expired', label: string, tone: string }}
 */
export function certificateValidity(cert, now = new Date()) {
  if (cert?.no_expiry) return { state: 'permanent', label: 'Tidak kedaluwarsa', tone: 'neutral' }
  if (!cert?.expiry_date) return { state: 'none', label: '', tone: 'neutral' }
  const expiry = new Date(`${cert.expiry_date}T00:00:00`)
  const year = cert.expiry_date.slice(0, 4)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (expiry < today) return { state: 'expired', label: 'Kedaluwarsa', tone: 'danger' }
  const threeMonths = new Date(today)
  threeMonths.setMonth(threeMonths.getMonth() + 3)
  if (expiry <= threeMonths) {
    const days = Math.round((expiry - today) / DAY)
    const label = days <= 31 ? `Kedaluwarsa dalam ${days} hari` : `Kedaluwarsa dalam ${Math.round(days / 30)} bulan`
    return { state: 'soon', label, tone: 'danger' }
  }
  return { state: 'valid', label: `Berlaku sampai ${year}`, tone: 'success' }
}

/** Highest sort_order + 1, so a new item lands at the end of the list. */
export function nextSortOrder(items) {
  return items.reduce((max, item) => Math.max(max, Number(item.sort_order) || 0), -1) + 1
}

/** Items in their display order: sort_order, then the given fallback comparator. */
export function bySortOrder(items, fallback = () => 0) {
  return [...items].sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0) || fallback(a, b))
}
