import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

// Data of the public pages (stage 3A). The old hooks stay unchanged for the admin.
// - Explicit columns only. Never user_id, phone_number or full_address (BRIEF §9).
// - Only rows with is_visible = true, ordered by sort_order (the admin's Naik/Turun buttons).
// - Every table loads on its own: a failed table only hides its own section.

const PROFILE_COLUMNS =
  'full_name, primary_role, secondary_roles, hero_keywords, bio, location, email, github_url, linkedin_url, instagram_url, avatar_url, is_available, cv_file_url, resume_link, hobbies, contact_topics'

const PROJECT_LIST_COLUMNS =
  'id, slug, title, description, solution, thumbnail_url, status, year, project_type, client_name, tech_stack, is_featured, sort_order'

const PROJECT_DETAIL_COLUMNS =
  'id, slug, title, description, content, thumbnail_url, status, year, project_type, client_name, my_role, problem, solution, outcome, tech_stack, gallery, links'

const TABLES = {
  profile: {
    table: 'profiles',
    columns: PROFILE_COLUMNS,
    single: true,
    normalize: normalizeProfile,
  },
  projects: {
    table: 'projects',
    columns: PROJECT_LIST_COLUMNS,
    order: [['sort_order'], ['created_at', { ascending: false }]],
    normalize: (row) => ({
      ...row,
      tech_stack: toTextList(row.tech_stack),
      summary: text(row.description) || text(row.solution),
    }),
  },
  experiences: {
    table: 'experiences',
    columns:
      'id, role, company, experience_type, location, start_date, end_date, is_current, responsibilities, skill_tags, logo_url, related_project_id, sort_order',
    order: [['sort_order'], ['start_date', { ascending: false }]],
    normalize: (row) => ({
      ...row,
      responsibilities: toTextList(row.responsibilities),
      skill_tags: toTextList(row.skill_tags),
      logo_url: safeAssetUrl(row.logo_url),
    }),
  },
  educations: {
    table: 'educations',
    columns: 'id, institution, degree, field_of_study, start_year, end_year, is_current, gpa, thesis_title, logo_url, sort_order',
    order: [['sort_order'], ['start_year', { ascending: false }]],
    normalize: (row) => ({ ...row, logo_url: safeAssetUrl(row.logo_url) }),
  },
  certifications: {
    table: 'certifications',
    columns:
      'id, name, issuer, category, issue_date, expiry_date, no_expiry, score, image_url, pdf_url, credential_url, is_featured, sort_order',
    order: [['sort_order'], ['issue_date', { ascending: false }]],
    normalize: (row) => ({
      ...row,
      image_url: safeAssetUrl(row.image_url),
      pdf_url: safeAssetUrl(row.pdf_url),
      credential_url: safeAssetUrl(row.credential_url),
    }),
  },
  achievements: {
    table: 'achievements',
    columns: 'id, title, event_name, month, year, description, photo_url, document_url, sort_order',
    order: [['sort_order'], ['year', { ascending: false }]],
    normalize: (row) => ({ ...row, photo_url: safeAssetUrl(row.photo_url), document_url: safeAssetUrl(row.document_url) }),
  },
  organizations: {
    table: 'organizations',
    columns: 'id, name, role, start_date, end_date, description, logo_url, sort_order',
    order: [['sort_order'], ['start_date', { ascending: false }]],
    normalize: (row) => ({ ...row, logo_url: safeAssetUrl(row.logo_url) }),
  },
  skills: {
    table: 'skills',
    columns: 'id, name, category, icon_url, is_featured, sort_order',
    order: [['sort_order'], ['name']],
    normalize: (row) => ({ ...row, icon_url: safeAssetUrl(row.icon_url) }),
  },
  languages: {
    table: 'languages',
    columns: 'id, language_name, proficiency_level, sort_order',
    order: [['sort_order'], ['language_name']],
  },
}

const KEYS = Object.keys(TABLES)

// ---- normalising ---------------------------------------------------------------

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function toTextList(value) {
  return Array.isArray(value) ? value.map(text).filter(Boolean) : []
}

/** A web address (http/https) or null, so no other scheme ever reaches an href or src. */
function safeAssetUrl(value) {
  const url = text(value)
  return /^https?:\/\/\S+$/i.test(url) ? url : null
}

function normalizeProfile(row) {
  if (!row) return null
  const email = text(row.email)
  return {
    ...row,
    full_name: text(row.full_name),
    primary_role: text(row.primary_role),
    secondary_roles: toTextList(row.secondary_roles),
    hero_keywords: toTextList(row.hero_keywords),
    hobbies: toTextList(row.hobbies),
    contact_topics: toTextList(row.contact_topics),
    avatar_url: safeAssetUrl(row.avatar_url),
    // The PDF uploaded in Profil; the old CV link is only the fallback (BRIEF §9)
    cvUrl: safeAssetUrl(row.cv_file_url) || safeAssetUrl(row.resume_link),
    social: {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null,
      github: safeAssetUrl(row.github_url),
      linkedin: safeAssetUrl(row.linkedin_url),
      instagram: safeAssetUrl(row.instagram_url),
    },
  }
}

const LINK_TYPES = ['code', 'demo', 'docs', 'video', 'other']

/**
 * Project links for the page. The address of a private link is dropped right here, so it never
 * reaches the DOM; public links need an https:// address (BRIEF §5 "Tautan proyek").
 */
export function publicLinks(value) {
  if (!Array.isArray(value)) return []
  return value
    .filter((item) => item && typeof item === 'object' && text(item.label))
    .map((item) => {
      const type = LINK_TYPES.includes(item.type) ? item.type : 'other'
      if (item.is_private === true) return { label: text(item.label), type, is_private: true }
      const url = text(item.url)
      return /^https:\/\/\S+$/i.test(url) ? { label: text(item.label), type, url, is_private: false } : null
    })
    .filter(Boolean)
}

function normalizeProjectDetail(row) {
  return {
    ...row,
    tech_stack: toTextList(row.tech_stack),
    thumbnail_url: safeAssetUrl(row.thumbnail_url),
    gallery: (Array.isArray(row.gallery) ? row.gallery : [])
      .map((item) => ({ url: safeAssetUrl(item?.url), caption: text(item?.caption) }))
      .filter((item) => item.url),
    links: publicLinks(row.links),
  }
}

function runQuery({ table, columns, single, order = [] }) {
  let query = supabase.from(table).select(columns)
  if (!single) query = query.eq('is_visible', true)
  for (const [column, options] of order) query = query.order(column, { ascending: true, ...options })
  return single ? query.limit(1).maybeSingle() : query
}

function emptyValue(key) {
  return TABLES[key].single ? null : []
}

// ---- hooks -----------------------------------------------------------------------

/**
 * Everything the public pages show, loaded once in PublicLayout.
 * @returns {{ [key: string]: { status: 'loading' | 'ready' | 'error', data: any } } & {
 *   reload: (key: string) => void }}
 *   keys: profile (object or null), projects, experiences, educations, certifications, achievements,
 *   organizations, skills, languages (arrays)
 */
export function usePublicPortfolio() {
  const [state, setState] = useState(() =>
    Object.fromEntries(KEYS.map((key) => [key, { status: 'loading', data: emptyValue(key) }]))
  )
  const requests = useRef({})
  const mounted = useRef(false)

  const load = useCallback(async (key, { initial = false } = {}) => {
    const spec = TABLES[key]
    if (!spec) return
    const request = (requests.current[key] ?? 0) + 1
    requests.current[key] = request
    if (!initial) setState((prev) => ({ ...prev, [key]: { ...prev[key], status: 'loading' } }))

    let next
    try {
      const { data, error } = await runQuery(spec)
      if (error) throw new Error(error.message || `Gagal memuat ${spec.table}.`)
      const normalize = spec.normalize ?? ((row) => row)
      next = { status: 'ready', data: spec.single ? normalize(data) : (data ?? []).map(normalize) }
    } catch (err) {
      if (import.meta.env.DEV) console.warn(`Public page: ${spec.table} could not be loaded:`, err.message)
      next = { status: 'error', data: emptyValue(key) }
    }
    if (mounted.current && requests.current[key] === request) {
      setState((prev) => ({ ...prev, [key]: next }))
    }
  }, [])

  useEffect(() => {
    mounted.current = true
    KEYS.forEach((key) => load(key, { initial: true }))
    return () => {
      mounted.current = false
    }
  }, [load])

  return { ...state, reload: load }
}

/**
 * One visible project by its slug, for /projects/:slug.
 * @returns {{ status: 'loading' | 'ready' | 'missing' | 'error', project: Object | null, reload: () => void }}
 *   'missing' = no visible project with that slug (the page shows 404)
 */
export function usePublicProject(slug) {
  const [result, setResult] = useState({ slug, status: 'loading', project: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    async function loadProject() {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select(PROJECT_DETAIL_COLUMNS)
          .eq('slug', slug)
          .eq('is_visible', true)
          .limit(1)
          .maybeSingle()
        if (error) throw new Error(error.message || 'Gagal memuat proyek.')
        if (!active) return
        setResult({ slug, status: data ? 'ready' : 'missing', project: data ? normalizeProjectDetail(data) : null })
      } catch (err) {
        if (import.meta.env.DEV) console.warn('Public page: project could not be loaded:', err.message)
        if (active) setResult({ slug, status: 'error', project: null })
      }
    }
    loadProject()
    return () => {
      active = false
    }
  }, [slug, attempt])

  const reload = useCallback(() => {
    setResult({ slug, status: 'loading', project: null })
    setAttempt((value) => value + 1)
  }, [slug])

  // A new slug shows the loading state until its own result arrives
  return result.slug === slug ? { ...result, reload } : { status: 'loading', project: null, reload }
}

/**
 * Sends the contact form to public.messages (the admin inbox). topic is one of the profile's
 * contact topics; while the topic column does not exist yet (migration 20261016000000 not run), the
 * message is sent without it.
 * @throws {Error} when the message could not be saved
 */
export async function sendContactMessage({ name, email, topic, message }) {
  const row = { name, email, message, topic: topic || null }
  let { error } = await supabase.from('messages').insert([row])
  if (error && /topic/.test(error.message || '')) {
    const { topic: _topic, ...withoutTopic } = row
    ;({ error } = await supabase.from('messages').insert([withoutTopic]))
  }
  if (error) {
    if (import.meta.env.DEV) console.warn('Contact message could not be saved:', error.message)
    throw new Error(error.message || 'insert failed')
  }
}
