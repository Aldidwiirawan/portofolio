import { startTransition, useCallback, useEffect, useRef, useState } from 'react'
import { afterFirstPaint } from '../lib/afterFirstPaint'
import { selectWithEnglish, selectWithOptional } from '../lib/englishColumns'
import { restInsert, restSelect } from '../lib/publicApi'
import { enrichProject, enrichExperience, enrichEducation } from '../data/projectDataOverrides'

// Data of the public pages (stage 3A). The old hooks stay unchanged for the admin. Since stage 3C the
// requests go through lib/publicApi.js (fetch, no supabase-js in the public bundle).
// - Explicit columns only. Never user_id, phone_number or full_address (BRIEF §9).
// - Only rows with is_visible = true, ordered by sort_order (the admin's Naik/Turun buttons).
// - Every table loads on its own: a failed table only hides its own section.
// - The English versions (_en columns, stage 3C) are read next to the Indonesian ones; the page picks
//   one per language (components/public/localize.js).

const PROFILE_COLUMNS =
  'full_name, tagline, primary_role, secondary_roles, hero_keywords, bio, location, email, github_url, github_username, linkedin_url, instagram_url, avatar_url, is_available, cv_file_url, resume_link, hobbies, contact_topics'

// my_role and links feed the project cards of the monochrome page (Peran fact, "Kunjungi" button)
const PROJECT_LIST_COLUMNS =
  'id, slug, title, description, solution, thumbnail_url, status, year, project_type, client_name, my_role, tech_stack, links, is_featured, sort_order'

const PROJECT_DETAIL_COLUMNS =
  'id, slug, title, description, content, thumbnail_url, status, year, project_type, client_name, my_role, problem, solution, outcome, tech_stack, gallery, links'

// Columns of migration 20261019000000 (English content). The captions and labels in gallery and
// links need no column of their own.
const PROJECT_DETAIL_EN_COLUMNS =
  'title_en, description_en, client_name_en, my_role_en, problem_en, solution_en, outcome_en, content_en'

// The four points of the monochrome project page (migration 20261030000000): read only when they exist,
// so the page keeps working before the owner runs that migration
const PROJECT_DETAIL_OPTIONAL = ['background', 'features', 'background_en', 'features_en']

const TABLES = {
  profile: {
    table: 'profiles',
    columns: PROFILE_COLUMNS,
    enColumns: 'tagline_en, bio_en, primary_role_en, secondary_roles_en, hero_keywords_en, hobbies_en, contact_topics_en, hero_labels',
    single: true,
    normalize: normalizeProfile,
  },
  projects: {
    table: 'projects',
    columns: PROJECT_LIST_COLUMNS,
    enColumns: 'title_en, description_en, solution_en, client_name_en, my_role_en',
    order: [['sort_order'], ['created_at', { ascending: false }]],
    normalize: (row) => {
      const enriched = enrichProject(row)
      return {
        ...enriched,
        thumbnail_url: safeAssetUrl(enriched.thumbnail_url),
        tech_stack: toTextList(enriched.tech_stack),
        links: publicLinks(enriched.links),
        summary: text(enriched.description) || text(enriched.solution),
      }
    },
  },
  experiences: {
    table: 'experiences',
    // photos (migration 20261016000000): the folder of the journey timeline
    columns:
      'id, role, company, experience_type, location, start_date, end_date, is_current, description, responsibilities, skill_tags, logo_url, photos, related_project_id, sort_order',
    enColumns: 'role_en, company_en, description_en, responsibilities_en',
    order: [['sort_order'], ['start_date', { ascending: false }]],
    normalize: (rawRow) => {
      const row = enrichExperience(rawRow)
      const [responsibilities, responsibilitiesEn] = parallelLists(row.responsibilities, row.responsibilities_en)
      return {
        ...row,
        description: text(row.description),
        description_en: text(row.description_en),
        responsibilities,
        responsibilities_en: responsibilitiesEn,
        skill_tags: toTextList(row.skill_tags),
        logo_url: safeAssetUrl(row.logo_url),
        photos: photoList(row.photos),
      }
    },
  },
  educations: {
    table: 'educations',
    columns: 'id, institution, degree, field_of_study, start_year, end_year, is_current, gpa, thesis_title, logo_url, sort_order, description',
    enColumns: 'degree_en, field_of_study_en, thesis_title_en',
    // educations.photos comes with migration 20261030000000; until then the page shows no folder
    optional: ['photos'],
    order: [['sort_order'], ['start_year', { ascending: false }]],
    normalize: (rawRow) => {
      const row = enrichEducation(rawRow)
      return {
        ...row,
        description: text(row.description),
        description_en: text(row.description_en),
        logo_url: safeAssetUrl(row.logo_url),
        photos: photoList(row.photos),
      }
    },
  },
  certifications: {
    table: 'certifications',
    columns:
      'id, name, issuer, category, issue_date, expiry_date, no_expiry, score, image_url, pdf_url, credential_url, is_featured, sort_order',
    enColumns: 'name_en, issuer_en',
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
    enColumns: 'title_en, event_name_en, description_en',
    order: [['sort_order'], ['year', { ascending: false }]],
    normalize: (row) => ({ ...row, photo_url: safeAssetUrl(row.photo_url), document_url: safeAssetUrl(row.document_url) }),
  },
  organizations: {
    table: 'organizations',
    
    columns: 'id, name, role, start_date, end_date, description, logo_url, sort_order',
    enColumns: 'role_en, description_en',
    order: [['sort_order'], ['start_date', { ascending: false }]],
    normalize: (row) => ({ ...row, logo_url: safeAssetUrl(row.logo_url) }),
  },
  skills: {
    table: 'skills',
    columns: 'id, name, category, icon_url, is_featured, sort_order',
    enColumns: 'name_en',
    order: [['sort_order'], ['name']],
    normalize: (row) => ({ ...row, icon_url: safeAssetUrl(row.icon_url) }),
  },
  languages: {
    table: 'languages',
    columns: 'id, language_name, proficiency_level, sort_order',
    enColumns: 'language_name_en, proficiency_level_en',
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

/**
 * An Indonesian list without its empty items, and the English list kept parallel to it: item n of
 * the English list translates item n of the Indonesian list ('' = not translated).
 */
function parallelLists(idList, enList) {
  const english = Array.isArray(enList) ? enList : []
  const pairs = (Array.isArray(idList) ? idList : []).map((item, index) => [text(item), text(english[index])])
  const kept = pairs.filter(([item]) => item)
  return [kept.map(([item]) => item), kept.map(([, translation]) => translation)]
}

/** A web address (http/https) or relative asset path (/...), or null, so no other scheme ever reaches an href or src. */
function safeAssetUrl(value) {
  const url = text(value)
  return /^https?:\/\/\S+$/i.test(url) || /^\/[a-zA-Z0-9_\-./]+$/i.test(url) ? url : null
}

/** Labels of the hero stage chosen in the admin (at most 10; empty = the featured skills). */
function heroLabels(value) {
  if (!Array.isArray(value)) return []
  return value
    .filter((item) => item && typeof item === 'object' && text(item.text))
    .slice(0, 10)
    .map((item) => ({ text: text(item.text), text_en: text(item.text_en), shape: item.shape === 'circle' ? 'circle' : 'tag' }))
}

function normalizeProfile(row) {
  if (!row) return null
  const email = text(row.email)
  const lists = Object.fromEntries(
    ['secondary_roles', 'hero_keywords', 'hobbies', 'contact_topics'].flatMap((field) => {
      const [items, translations] = parallelLists(row[field], row[`${field}_en`])
      return [
        [field, items],
        [`${field}_en`, translations],
      ]
    })
  )
  return {
    ...row,
    ...lists,
    full_name: text(row.full_name),
    primary_role: text(row.primary_role),
    github_username: text(row.github_username),
    hero_labels: heroLabels(row.hero_labels),
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
      const labels = { label: text(item.label), label_en: text(item.label_en) }
      if (item.is_private === true) return { ...labels, type, is_private: true }
      const url = text(item.url)
      return /^https:\/\/\S+$/i.test(url) ? { ...labels, type, url, is_private: false } : null
    })
    .filter(Boolean)
}

/** Journey photos [{ url, caption, caption_en }]: at most 3, safe addresses only (caption = alt text). */
function photoList(value) {
  return (Array.isArray(value) ? value : [])
    .map((item) => ({ url: safeAssetUrl(item?.url), caption: text(item?.caption), caption_en: text(item?.caption_en) }))
    .filter((item) => item.url)
    .slice(0, 3)
}

function normalizeProjectDetail(row) {
  const enriched = enrichProject(row)
  const [features, featuresEn] = parallelLists(enriched.features, enriched.features_en)
  return {
    ...enriched,
    background: text(enriched.background),
    background_en: text(enriched.background_en),
    features,
    features_en: featuresEn,
    tech_stack: toTextList(enriched.tech_stack),
    thumbnail_url: safeAssetUrl(enriched.thumbnail_url),
    // kind: gallery or diagram; device: web or mobile (the media viewer's tabs and "Layar Web / Layar HP")
    gallery: (Array.isArray(enriched.gallery) ? enriched.gallery : (Array.isArray(row.gallery) ? row.gallery : []))
      .map((item) => ({
        url: safeAssetUrl(item?.url),
        caption: text(item?.caption),
        caption_en: text(item?.caption_en),
        kind: item?.kind === 'diagram' ? 'diagram' : 'gallery',
        device: item?.device === 'mobile' ? 'mobile' : 'web',
        label: text(item?.label),
        label_en: text(item?.label_en),
      }))
      .filter((item) => item.url),
    links: publicLinks(row.links),
  }
}

function runQuery({ table, columns, enColumns, optional, single, order = [] }) {
  return selectWithEnglish(
    (selected) =>
      selectWithOptional(
        (all) => restSelect(table, { columns: all, filters: single ? [] : [['is_visible', true]], order, single }),
        selected,
        table,
        optional
      ),
    columns,
    enColumns
  )
}

function emptyValue(key) {
  return TABLES[key].single ? null : []
}

/** The next state of one table: { status: 'ready', data } or { status: 'error', data: empty }. */
async function fetchTable(key) {
  const spec = TABLES[key]
  try {
    const { data, error } = await runQuery(spec)
    if (error) throw new Error(error.message || `Gagal memuat ${spec.table}.`)
    const normalize = spec.normalize ?? ((row) => row)
    return { status: 'ready', data: spec.single ? normalize(data) : (data ?? []).map(normalize) }
  } catch (err) {
    if (import.meta.env.DEV) console.warn(`Public page: ${spec.table} could not be loaded:`, err.message)
    return { status: 'error', data: emptyValue(key) }
  }
}

const BATCH_WAIT_MS = 1000

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

  /** Starts a request for one table; the callback gets its next state unless a newer request replaced it. */
  const request = useCallback((key, onResult) => {
    const id = (requests.current[key] ?? 0) + 1
    requests.current[key] = id
    fetchTable(key).then((next) => {
      if (mounted.current && requests.current[key] === id) onResult(next)
    })
  }, [])

  const load = useCallback(
    (key) => {
      if (!TABLES[key]) return
      setState((prev) => ({ ...prev, [key]: { ...prev[key], status: 'loading' } }))
      request(key, (next) => setState((prev) => ({ ...prev, [key]: next })))
    },
    [request]
  )

  useEffect(() => {
    mounted.current = true
    // The first answers are applied together: one render of the whole page instead of one per table
    // (stage 3C, less work while the page loads). A table still loading BATCH_WAIT_MS after the first
    // answer comes in on its own. These updates are transitions: React renders them in small slices,
    // so the page stays responsive (no long task) while every section fills in.
    let pending = {}
    let timer = 0
    const flush = () => {
      clearTimeout(timer)
      const batch = pending
      pending = null
      startTransition(() => setState((prev) => ({ ...prev, ...batch })))
    }
    // Requested right after the first paint: the name and the page frame never wait for them
    const cancel = afterFirstPaint(() => {
      for (const key of KEYS) {
        request(key, (next) => {
          if (!pending) {
            startTransition(() => setState((prev) => ({ ...prev, [key]: next })))
            return
          }
          pending[key] = next
          if (Object.keys(pending).length === KEYS.length) flush()
          else if (!timer) timer = setTimeout(flush, BATCH_WAIT_MS)
        })
      }
    })
    return () => {
      mounted.current = false
      cancel()
      clearTimeout(timer)
    }
  }, [request])

  return { ...state, reload: load }
}

/** The visible project row with this slug (or null): { data, error } like restSelect. */
function fetchProject(slug) {
  return selectWithEnglish(
    (selected) =>
      selectWithOptional(
        (all) => restSelect('projects', { columns: all, filters: [['slug', slug], ['is_visible', true]], single: true }),
        selected,
        'projects',
        PROJECT_DETAIL_OPTIONAL
      ),
    PROJECT_DETAIL_COLUMNS,
    PROJECT_DETAIL_EN_COLUMNS
  )
}

// Requests started before the project page exists (prefetchProject), used once by usePublicProject
const prefetched = new Map()

/**
 * Starts loading a project as soon as the app starts on /projects/:slug (main.jsx), and its cover
 * image as soon as the row arrives, so neither waits for the page code and its first render (stage
 * 3C: the cover is the largest element of the page).
 */
export function prefetchProject(slug) {
  const request = fetchProject(slug)
  prefetched.set(slug, request)
  request.then(({ data }) => {
    const cover = safeAssetUrl(data?.thumbnail_url)
    if (!cover) return
    const image = new Image()
    image.fetchPriority = 'high'
    image.src = cover
  })
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
        const request = (attempt === 0 && prefetched.get(slug)) || fetchProject(slug)
        prefetched.delete(slug)
        const { data, error } = await request
        if (error) throw new Error(error.message || 'Gagal memuat proyek.')
        if (!active) return
        startTransition(() =>
          setResult({ slug, status: data ? 'ready' : 'missing', project: data ? normalizeProjectDetail(data) : null })
        )
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
  let { error } = await restInsert('messages', row)
  if (error && /topic/.test(error.message || '')) {
    const { topic: _topic, ...withoutTopic } = row
    ;({ error } = await restInsert('messages', withoutTopic))
  }
  if (error) {
    if (import.meta.env.DEV) console.warn('Contact message could not be saved:', error.message)
    throw new Error(error.message || 'insert failed')
  }
}
