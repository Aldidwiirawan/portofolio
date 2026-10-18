// Small helpers shared by the public pages.

/** Shown only until the profile has loaded (tab title, logo label). */
export const SITE_NAME = 'Aldi Dwi Irawan'

/** The address when it is a web address (http/https), otherwise null, so no other scheme is rendered. */
export function safeUrl(value) {
  const text = typeof value === 'string' ? value.trim() : ''
  if (!/^https?:\/\/\S+$/i.test(text)) return null
  try {
    return new URL(text).href
  } catch {
    return null
  }
}

/** 'mailto:' link for a plausible email address, otherwise null. */
export function mailtoUrl(email) {
  const text = typeof email === 'string' ? email.trim() : ''
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text) ? `mailto:${text}` : null
}

/** First word of a name ("Aldi Dwi Irawan" → "Aldi"). */
export function firstName(name) {
  return String(name ?? '').trim().split(/\s+/)[0] || ''
}
