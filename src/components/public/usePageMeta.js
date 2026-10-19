import { useEffect } from 'react'

// Address of the site, set in Vercel (DEPLOY.md). Without it (local) canonical and og:url are left out.
const SITE_URL = String(import.meta.env.VITE_SITE_URL || '').replace(/\/+$/, '')
const DESCRIPTION_MAX = 160

/** A description for search results: one line, at most 160 characters, cut at a word. */
export function shortDescription(text) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim()
  if (clean.length <= DESCRIPTION_MAX) return clean
  const cut = clean.slice(0, DESCRIPTION_MAX - 1)
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), 100))}…`
}

/** The <meta> (or <link>) element for `selector`, created in <head> when missing. */
function headTag(selector, create) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = create()
    document.head.appendChild(el)
  }
  return el
}

function setMeta(attr, key, value) {
  const el = headTag(`meta[${attr}="${key}"]`, () => {
    const meta = document.createElement('meta')
    meta.setAttribute(attr, key)
    return meta
  })
  const previous = el.getAttribute('content')
  el.setAttribute('content', value)
  return () => {
    if (previous == null) el.remove()
    else el.setAttribute('content', previous)
  }
}

function setCanonical(href) {
  const el = headTag('link[rel="canonical"]', () => {
    const link = document.createElement('link')
    link.rel = 'canonical'
    return link
  })
  const previous = el.getAttribute('href')
  el.setAttribute('href', href)
  return () => {
    if (previous == null) el.remove()
    else el.setAttribute('href', previous)
  }
}

/**
 * Description, Open Graph, canonical address and robots of the page shown (stage 3C, SEO). Search
 * engines that run JavaScript read these; link previews (WhatsApp, LinkedIn) only read the defaults in
 * index.html (K11). Everything is put back when the page changes.
 * @param {{ title?: string, description?: string, path?: string, lang?: 'id' | 'en', noindex?: boolean }} meta
 */
export function usePageMeta({ title, description, path, lang = 'id', noindex = false }) {
  useEffect(() => {
    const undo = []
    if (description) {
      const text = shortDescription(description)
      undo.push(setMeta('name', 'description', text), setMeta('property', 'og:description', text), setMeta('name', 'twitter:description', text))
    }
    if (title) undo.push(setMeta('property', 'og:title', title), setMeta('name', 'twitter:title', title))
    undo.push(setMeta('property', 'og:locale', lang === 'en' ? 'en_US' : 'id_ID'))
    undo.push(setMeta('property', 'og:locale:alternate', lang === 'en' ? 'id_ID' : 'en_US'))
    if (SITE_URL && path != null) {
      const url = `${SITE_URL}${path === '/' ? '/' : path}`
      undo.push(setCanonical(url), setMeta('property', 'og:url', url))
    }
    if (noindex) undo.push(setMeta('name', 'robots', 'noindex, follow'))
    return () => undo.reverse().forEach((fn) => fn())
  }, [title, description, path, lang, noindex])
}

/**
 * Structured data about the owner (schema.org Person, JSON-LD) while the public pages are shown. Only
 * public facts: name, roles, city, school and profile links; never the phone number or address.
 */
export function usePersonJsonLd(person) {
  const json = person ? JSON.stringify(person) : ''
  useEffect(() => {
    if (!json) return undefined
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = 'ld-person'
    script.textContent = json
    document.head.appendChild(script)
    return () => script.remove()
  }, [json])
}

/**
 * The schema.org Person of the public profile (localized data from PublicLayout), or null while the
 * profile loads. Graduated schools become alumniOf; the city is the only address part.
 */
export function personFromProfile(profile, educations = []) {
  if (!profile?.full_name) return null
  const sameAs = [profile.github_url, profile.linkedin_url, profile.instagram_url].filter((url) => /^https:\/\//.test(url || ''))
  const schools = [...new Set(educations.filter((row) => !row.is_current && row.institution).map((row) => row.institution))]
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.full_name,
    ...((profile.primary_role || profile.tagline) && { jobTitle: profile.primary_role || profile.tagline }),
    ...(profile.tagline && { description: profile.tagline }),
    ...(SITE_URL && { url: `${SITE_URL}/` }),
    ...(/^https:\/\//.test(profile.avatar_url || '') && { image: profile.avatar_url }),
    ...(profile.location && { address: { '@type': 'PostalAddress', addressLocality: profile.location } }),
    ...(schools.length > 0 && { alumniOf: schools.map((name) => ({ '@type': 'EducationalOrganization', name })) }),
    ...(sameAs.length > 0 && { sameAs }),
  }
}
