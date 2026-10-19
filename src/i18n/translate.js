import id from './id'
import en from './en'

export const LANGUAGES = ['id', 'en']
export const DEFAULT_LANGUAGE = 'id'

const DICTIONARIES = { id, en }
const LOCALES = { id: 'id-ID', en: 'en-US' }

// Older choice columns (experience type, language level) store the Indonesian label itself. These map
// that label to its dictionary key, so the English page can translate it.
const STORED_LABEL_KEYS = {
  exp: { Magang: 'internship', PKL: 'internship', Kerja: 'work', Freelance: 'freelance', Organisasi: 'organization' },
  langLevel: { 'Penutur asli': 'native', Aktif: 'fluent', Menengah: 'intermediate', Dasar: 'basic' },
}

// Skill categories in display order (the admin stores the label). Unknown categories follow these.
export const SKILL_CATEGORY_KEYS = {
  Frontend: 'frontend',
  Backend: 'backend',
  Mobile: 'mobile',
  Database: 'database',
  'Jaringan & IT Support': 'network',
  Tools: 'tools',
  'Soft skill': 'soft',
}

// Names for dates in both languages. The page formats its few date styles itself instead of with Intl:
// the first Intl formatter of a page loads the locale data, which costs more than a whole frame on a
// slow phone (stage 3C). The output is the same as Intl id-ID / en-US.
const MONTHS = {
  id: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
}
const MONTHS_SHORT = {
  id: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
}
const WEEKDAYS = {
  id: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
}

// monthYear: Jan 2026 · day: 1 Jan 2026 / Jan 1, 2026 · full: Kamis, 1 Januari 2026 / Thursday, January 1, 2026
const DATE_STYLES = {
  monthYear: (d, l) => `${MONTHS_SHORT[l][d.getMonth()]} ${d.getFullYear()}`,
  day: (d, l) =>
    l === 'en'
      ? `${MONTHS_SHORT.en[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
      : `${d.getDate()} ${MONTHS_SHORT.id[d.getMonth()]} ${d.getFullYear()}`,
  full: (d, l) =>
    l === 'en'
      ? `${WEEKDAYS.en[d.getDay()]}, ${MONTHS.en[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
      : `${WEEKDAYS.id[d.getDay()]}, ${d.getDate()} ${MONTHS.id[d.getMonth()]} ${d.getFullYear()}`,
}

/** 1234.5 → '1.234,50' (id) or '1,234.50' (en) with the given number of decimals. */
function formatNumberIn(lang, value, decimals = 0) {
  const [whole, fraction] = Math.abs(Number(value)).toFixed(decimals).split('.')
  const [group, point] = lang === 'en' ? [',', '.'] : ['.', ',']
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, group)
  return `${Number(value) < 0 ? '-' : ''}${grouped}${fraction ? point + fraction : ''}`
}

/** '2026-01-01' (a DATE column) as a local date, so the day never shifts with the time zone. */
export function parseDate(value) {
  if (!value) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value))
  const date = match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function interpolate(text, vars) {
  if (!vars) return text
  return text.replace(/\{(\w+)\}/g, (_, name) => (vars[name] == null ? '' : String(vars[name])))
}

/**
 * Translation helpers for one language. t() falls back to Indonesian, then to the key itself.
 * @param {'id' | 'en'} lang
 */
export function createI18n(lang) {
  const dictionary = DICTIONARIES[lang] ?? id
  const locale = LOCALES[lang] ?? LOCALES.id
  const names = lang === 'en' ? 'en' : 'id'

  const t = (key, vars) => interpolate(dictionary[key] ?? id[key] ?? key, vars)

  const formatDate = (value, style = 'monthYear') => {
    const date = parseDate(value)
    if (!date) return ''
    return (DATE_STYLES[style] ?? DATE_STYLES.monthYear)(date, names)
  }

  return {
    lang,
    locale,
    t,
    formatDate,
    /** 3.54 → '3,54' (ID) or '3.54' (EN), always two decimals. */
    formatGpa: (value) => formatNumberIn(names, value, 2),
    /** 1234 → '1.234' (ID) or '1,234' (EN). */
    formatNumber: (value) => formatNumberIn(names, value),
    /** Short name of month 0–11: 'Agu' (ID), 'Aug' (EN). */
    shortMonth: (index) => MONTHS_SHORT[names][index] ?? '',
    /** Label of a stored code, e.g. code('status', 'production'); '' for an unknown code. */
    code: (group, value) => (value ? (dictionary[`code.${group}.${value}`] ?? id[`code.${group}.${value}`] ?? '') : ''),
    /** A stored Indonesian label (experience type, language level) in the page language. */
    storedLabel: (group, value) => {
      if (!value) return ''
      const key = STORED_LABEL_KEYS[group]?.[value]
      return lang === 'id' || !key ? value : t(`code.${group}.${key}`)
    },
    /** Name of a skill category in the page language (unknown categories keep their stored name). */
    skillCategory: (label) => {
      const key = SKILL_CATEGORY_KEYS[label]
      return key ? t(`skills.cat.${key}`) : label
    },
  }
}
