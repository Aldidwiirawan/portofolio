// Vercel function: the GitHub contribution calendar of the public page (stage 3C, K5).
// GET /api/github-contributions → { username, total, weeks: [[{ date, count, level }]] }
// - The account is the profile's github_username (read from Supabase like the public page), so this is
//   not an open proxy for any GitHub account.
// - GITHUB_TOKEN: a fine-grained token without any repository permission (public data only), set in
//   the Vercel project settings (DEPLOY.md). It stays on the server and never reaches the browser.
// - Answers are cached by the Vercel CDN for 12 hours. Any problem answers 503 without details, and
//   the page then leaves the graph out.

const GITHUB_GRAPHQL = 'https://api.github.com/graphql'
const TIMEOUT_MS = 6000
// GitHub usernames: letters, digits and single hyphens, not at the start or end, at most 39 characters
const USERNAME = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/
const LEVELS = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 }
const QUERY = `query ($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount contributionLevel } }
      }
    }
  }
}`

const CACHE_OK = 'public, max-age=3600, s-maxage=43200, stale-while-revalidate=86400'
const CACHE_FAIL = 'public, max-age=60, s-maxage=600'

function reply(body, status, cache) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': cache, 'X-Robots-Tag': 'noindex' },
  })
}

/** github_username of the profile, through the public Supabase API (same key and RLS as the page). */
async function profileUsername(env) {
  const base = String(env.VITE_SUPABASE_URL || '').replace(/\/+$/, '')
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY
  if (!base || !key) return null
  const response = await fetch(`${base}/rest/v1/profiles?select=github_username&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!response.ok) return null
  const rows = await response.json()
  const name = typeof rows?.[0]?.github_username === 'string' ? rows[0].github_username.trim() : ''
  return USERNAME.test(name) ? name : null
}

/** The calendar from the GitHub GraphQL API, or null. */
async function contributions(username, token) {
  const response = await fetch(GITHUB_GRAPHQL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'aldi-portfolio-contributions',
    },
    body: JSON.stringify({ query: QUERY, variables: { login: username } }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!response.ok) return null
  const body = await response.json()
  const calendar = body?.data?.user?.contributionsCollection?.contributionCalendar
  if (!calendar || !Array.isArray(calendar.weeks)) return null
  return {
    total: Number(calendar.totalContributions) || 0,
    weeks: calendar.weeks.map((week) =>
      (week.contributionDays || []).map((day) => ({
        date: day.date,
        count: Number(day.contributionCount) || 0,
        level: LEVELS[day.contributionLevel] ?? 0,
      }))
    ),
  }
}

export async function GET() {
  const env = process.env
  if (!env.GITHUB_TOKEN) return reply({ error: 'unavailable' }, 503, CACHE_FAIL)
  try {
    const username = await profileUsername(env)
    if (!username) return reply({ error: 'unavailable' }, 503, CACHE_FAIL)
    const calendar = await contributions(username, env.GITHUB_TOKEN)
    if (!calendar) return reply({ error: 'unavailable' }, 503, CACHE_FAIL)
    return reply({ username, ...calendar }, 200, CACHE_OK)
  } catch {
    return reply({ error: 'unavailable' }, 503, CACHE_FAIL)
  }
}
