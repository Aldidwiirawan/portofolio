// Project links (projects.links, migration 20261018000000): values for the form, checks before
// saving, the old single-link columns the current public page reads, and the list summary.
import { PROJECT_LINK_TYPES } from './contentLabels'

export const MAX_PROJECT_LINKS = 6
export const LINK_LABEL_MAX = 60

const LINK_TYPES = PROJECT_LINK_TYPES.map((option) => option.value)

/** A new, empty row of the links list. */
export const emptyLink = () => ({ label: '', label_en: '', type: 'code', url: '', is_private: false })

/**
 * Stored links as form rows ({ label, label_en, type, url, is_private }, '' when there is none).
 * label_en is the English label (stage 3C); it belongs to its link, so it moves with it.
 */
export function normalizeLinks(value) {
  if (!Array.isArray(value)) return []
  return value
    .filter((item) => item && typeof item === 'object' && !Array.isArray(item))
    .map((item) => ({
      label: typeof item.label === 'string' ? item.label : '',
      label_en: typeof item.label_en === 'string' ? item.label_en : '',
      type: LINK_TYPES.includes(item.type) ? item.type : 'other',
      url: typeof item.url === 'string' ? item.url : '',
      is_private: item.is_private === true,
    }))
}

/**
 * Links a project form opens with. Without stored links it starts from github_url and demo_url
 * (e.g. an http:// address the migration did not copy), so saving never drops them silently.
 */
export function initialLinks(project) {
  const links = normalizeLinks(project?.links)
  if (links.length > 0) return links
  const legacy = []
  if (project?.github_url?.trim()) {
    legacy.push({ label: 'Kode', label_en: '', type: 'code', url: project.github_url.trim(), is_private: Boolean(project.is_repo_private) })
  }
  if (project?.demo_url?.trim()) {
    legacy.push({ label: 'Demo', label_en: '', type: 'demo', url: project.demo_url.trim(), is_private: false })
  }
  return legacy
}

const isBlank = (link) => !String(link.label ?? '').trim() && !String(link.url ?? '').trim()

/** Message for the address of a link, or null when it is fine (or may stay empty). */
export function checkLinkUrl(url, { isPrivate = false } = {}) {
  const text = String(url ?? '').trim()
  if (!text) return isPrivate ? null : 'Isi alamat tautan, atau nyalakan Privat bila tautan ini tidak boleh dibuka publik.'
  if (/^http:\/\//i.test(text)) return 'Pakai alamat yang diawali https:// (bukan http://).'
  if (!/^https:\/\//i.test(text)) return 'Alamat tautan harus diawali https://, misalnya https://github.com/nama/proyek.'
  if (/\s/.test(text)) return 'Alamat tautan tidak boleh berisi spasi.'
  try {
    const { hostname } = new URL(text)
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(hostname)) throw new Error('no domain')
  } catch {
    return 'Alamat tautan belum lengkap. Contoh: https://github.com/nama/proyek.'
  }
  return null
}

/**
 * Checks the rows before saving. Fully empty rows are dropped, like empty items of a list field.
 * @returns {{ links: Array<{ label: string, label_en?: string, type: string, url: string|null, is_private: boolean }>,
 *   errors: Array<{ label?: string, url?: string } | null>, valid: boolean }}
 *   errors follow the positions of `rows`
 */
export function prepareLinks(rows) {
  const list = Array.isArray(rows) ? rows : []
  const errors = list.map(() => null)
  const links = []
  list.forEach((row, index) => {
    if (isBlank(row)) return
    const label = String(row.label ?? '').trim()
    const error = {}
    if (!label) error.label = 'Tulis nama tautan, misalnya Kode konsol web.'
    else if (label.length > LINK_LABEL_MAX) error.label = `Nama tautan maksimal ${LINK_LABEL_MAX} karakter.`
    const urlProblem = checkLinkUrl(row.url, { isPrivate: row.is_private })
    if (urlProblem) error.url = urlProblem
    if (error.label || error.url) errors[index] = error
    const url = String(row.url ?? '').trim().replace(/^https:\/\//i, 'https://')
    const labelEn = String(row.label_en ?? '').trim().slice(0, LINK_LABEL_MAX)
    links.push({
      label,
      ...(labelEn ? { label_en: labelEn } : {}),
      type: LINK_TYPES.includes(row.type) ? row.type : 'other',
      url: url || null,
      is_private: Boolean(row.is_private),
    })
  })
  return { links, errors, valid: errors.every((error) => !error) }
}

/** The old single-link columns, still read by the public page: first public code and demo link. */
export function legacyUrls(links) {
  const firstPublic = (type) => links.find((link) => link.type === type && !link.is_private && link.url)?.url ?? null
  return { github_url: firstPublic('code'), demo_url: firstPublic('demo') }
}

/** True when the project has code links and every one is private ("Repo privat" turns on by itself). */
export function allCodePrivate(links) {
  const code = (Array.isArray(links) ? links : []).filter((link) => link.type === 'code' && !isBlank(link))
  return code.length > 0 && code.every((link) => link.is_private)
}

/** "2 tautan · 2 privat" for the project list; empty without links. */
export function linkSummary(value) {
  const links = normalizeLinks(value)
  if (links.length === 0) return ''
  const privateCount = links.filter((link) => link.is_private).length
  return `${links.length} tautan${privateCount > 0 ? ` · ${privateCount} privat` : ''}`
}
