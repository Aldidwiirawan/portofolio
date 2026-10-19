// English versions of the content (stage 3C, BRIEF §9). On the English page every text uses its _en
// column when it is filled, else the Indonesian text. Lists go item by item (item n of the _en list
// translates item n of the Indonesian list). A text that falls back to Indonesian is recorded in
// row.idText, so its element gets lang="id" and screen readers pronounce it right. The Indonesian page
// gets the rows unchanged.

const FIELDS = {
  profile: { texts: ['tagline', 'bio', 'primary_role'], lists: ['secondary_roles', 'hero_keywords', 'hobbies', 'contact_topics'] },
  projects: { texts: ['title', 'description', 'solution', 'client_name'] },
  experiences: { texts: ['role', 'company', 'description'], lists: ['responsibilities'] },
  educations: { texts: ['degree', 'field_of_study', 'thesis_title'] },
  certifications: { texts: ['name', 'issuer'] },
  achievements: { texts: ['title', 'event_name', 'description'] },
  organizations: { texts: ['role', 'description'] },
  skills: { texts: ['name'] },
  languages: { texts: ['language_name', 'proficiency_level'] },
}

const PROJECT_DETAIL_FIELDS = {
  texts: ['title', 'description', 'client_name', 'my_role', 'problem', 'solution', 'outcome', 'content'],
}

const clean = (value) => (typeof value === 'string' ? value.trim() : '')

/**
 * The row in the page language. On the English page each listed text becomes its _en version when
 * filled; the texts that stay Indonesian are listed in idText ('bio', 'responsibilities.2', …).
 */
export function localizeRow(row, lang, { texts = [], lists = [] }) {
  if (!row || lang !== 'en') return row
  const out = { ...row }
  const idText = new Set()
  for (const field of texts) {
    const english = clean(row[`${field}_en`])
    if (english) out[field] = english
    else if (clean(row[field])) idText.add(field)
  }
  for (const field of lists) {
    const english = Array.isArray(row[`${field}_en`]) ? row[`${field}_en`] : []
    out[field] = (row[field] ?? []).map((item, index) => {
      if (clean(english[index])) return clean(english[index])
      idText.add(`${field}.${index}`)
      return item
    })
  }
  out.idText = idText
  return out
}

/** lang attribute of a localized text: 'id' when the English page shows the Indonesian original. */
export function langOf(row, field, index) {
  return row?.idText?.has(index == null ? field : `${field}.${index}`) ? 'id' : undefined
}

/** A gallery caption or link label in the page language, with lang: 'id' when it falls back. */
function localizeItem(item, field, lang) {
  if (lang !== 'en') return item
  const english = clean(item[`${field}_en`])
  if (english) return { ...item, [field]: english }
  return clean(item[field]) ? { ...item, lang: 'id' } : item
}

function localizeProjectCard(row, lang) {
  if (lang !== 'en') return row
  const out = localizeRow(row, lang, FIELDS.projects)
  // The card summary comes from the same field as on the Indonesian page
  const source = clean(row.description) || clean(row.description_en) ? 'description' : 'solution'
  out.summary = out[source] || ''
  if (out.idText.has(source)) out.idText.add('summary')
  return out
}

function localizeProfile(row, lang) {
  if (!row || lang !== 'en') return row
  return {
    ...localizeRow(row, lang, FIELDS.profile),
    // The contact form shows the English topic but stores the Indonesian one (the admin inbox)
    contact_topic_values: row.contact_topics,
    // Hero stage labels (decorative, aria-hidden): the English text when there is one
    hero_labels: (row.hero_labels ?? []).map((label) => ({ ...label, text: clean(label.text_en) || label.text })),
  }
}

function localizeSkill(row, lang) {
  if (lang !== 'en') return row
  // Logos are looked up by the stored name
  return { ...localizeRow(row, lang, FIELDS.skills), logo_name: row.name }
}

const LOCALIZERS = {
  profile: localizeProfile,
  projects: localizeProjectCard,
  skills: localizeSkill,
}

/** Every table of usePublicPortfolio() in the page language (same shape, same reload). */
export function localizePortfolio(data, lang) {
  if (lang !== 'en') return data
  const out = { ...data }
  for (const key of Object.keys(FIELDS)) {
    const entry = data[key]
    if (!entry) continue
    const localize = LOCALIZERS[key] ?? ((row) => localizeRow(row, lang, FIELDS[key]))
    out[key] = { ...entry, data: Array.isArray(entry.data) ? entry.data.map((row) => localize(row, lang)) : localize(entry.data, lang) }
  }
  return out
}

/** The project of /projects/:slug in the page language, with its gallery captions and link labels. */
export function localizeProject(project, lang) {
  if (!project || lang !== 'en') return project
  return {
    ...localizeRow(project, lang, PROJECT_DETAIL_FIELDS),
    gallery: project.gallery.map((image) => localizeItem(image, 'caption', lang)),
    links: project.links.map((link) => localizeItem(link, 'label', lang)),
  }
}
