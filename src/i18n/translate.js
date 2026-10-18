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

const DATE_STYLES = {
  monthYear: { month: 'short', year: 'numeric' },
  day: { day: 'numeric', month: 'short', year: 'numeric' },
  full: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
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
  const dateFormats = new Map()

  const t = (key, vars) => interpolate(dictionary[key] ?? id[key] ?? key, vars)

  const formatDate = (value, style = 'monthYear') => {
    const date = parseDate(value)
    if (!date) return ''
    if (!dateFormats.has(style)) {
      dateFormats.set(style, new Intl.DateTimeFormat(locale, DATE_STYLES[style] ?? DATE_STYLES.monthYear))
    }
    return dateFormats.get(style).format(date)
  }

  return {
    lang,
    locale,
    t,
    formatDate,
    /** 3.54 → '3,54' (ID) or '3.54' (EN), always two decimals. */
    formatGpa: (value) =>
      new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value)),
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
