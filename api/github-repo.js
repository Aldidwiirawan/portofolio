// Vercel function: the GitHub panel of the project page (monochrome redesign, phase 6).
// GET /api/github-repo?slug=<project slug> →
//   { repo: { fullName, url, pushedAt, language }, languages: [{ name, percent }], frameworks: [name] }
// - The repository is the first public github.com code link of a visible project (read from Supabase
//   with the public key, like the page), so this is not an open proxy for any repository.
// - Only public repositories: a private link has no address on the page, and a repository GitHub
//   reports as private is refused.
// - GITHUB_TOKEN: the fine-grained token of github-contributions.js (public data only), on the server
//   only. Answers are cached by the Vercel CDN for an hour; any problem answers 503 without details and
//   the page shows a short message with a link to the repository.

const GITHUB_API = 'https://api.github.com'
const TIMEOUT_MS = 6000
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
// https://github.com/<owner>/<repo>[.git][/…]
const REPO_URL = /^https:\/\/github\.com\/([A-Za-z0-9](?:[A-Za-z0-9-]{0,38}))\/([A-Za-z0-9._-]{1,100}?)(?:\.git)?(?:[/?#].*)?$/

const CACHE_OK = 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400'
const CACHE_FAIL = 'public, max-age=60, s-maxage=300'

// Libraries worth naming, from composer.json and package.json (name → label; a version adds its major)
const COMPOSER_NAMES = {
  'laravel/framework': 'Laravel',
  'laravel/fortify': 'Laravel Fortify',
  'laravel/sanctum': 'Laravel Sanctum',
  'laravel/breeze': 'Laravel Breeze',
  'laravel/ui': 'Laravel UI',
  'livewire/livewire': 'Livewire',
  'filament/filament': 'Filament',
  'inertiajs/inertia-laravel': 'Inertia',
  'midtrans/midtrans-php': 'Midtrans PHP',
  'maatwebsite/excel': 'Laravel Excel',
  'barryvdh/laravel-dompdf': 'DomPDF',
  'spatie/laravel-permission': 'Spatie Permission',
  'guzzlehttp/guzzle': 'Guzzle',
}
const PACKAGE_NAMES = {
  react: 'React',
  vue: 'Vue',
  next: 'Next.js',
  vite: 'Vite',
  tailwindcss: 'Tailwind CSS',
  bootstrap: 'Bootstrap',
  alpinejs: 'Alpine.js',
  jquery: 'jQuery',
  axios: 'Axios',
  'chart.js': 'Chart.js',
  sass: 'Sass',
  express: 'Express',
  '@supabase/supabase-js': 'Supabase JS',
  'react-router-dom': 'React Router',
}
// Libraries whose major version is shown (the others are named only)
const WITH_MAJOR = new Set(['laravel/framework', 'react', 'vue', 'next', 'tailwindcss', 'bootstrap'])

function reply(body, status, cache) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': cache, 'X-Robots-Tag': 'noindex' },
  })
}

/** owner/repo of the first public github.com code link of the visible project, or null. */
async function projectRepo(env, slug) {
  const base = String(env.VITE_SUPABASE_URL || '').replace(/\/+$/, '')
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY
  if (!base || !key) return null
  const params = new URLSearchParams({ select: 'links', slug: `eq.${slug}`, is_visible: 'eq.true', limit: '1' })
  const response = await fetch(`${base}/rest/v1/projects?${params}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!response.ok) return null
  const rows = await response.json()
  const links = Array.isArray(rows?.[0]?.links) ? rows[0].links : []
  for (const link of links) {
    if (link?.type !== 'code' || link.is_private === true || typeof link.url !== 'string') continue
    const match = REPO_URL.exec(link.url.trim())
    if (match) return { owner: match[1], repo: match[2] }
  }
  return null
}

function github(path, token, accept = 'application/vnd.github+json') {
  return fetch(`${GITHUB_API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: accept,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'aldi-portfolio-repo-panel',
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
}

/** A manifest file of the repository as JSON, or null (missing, not JSON). */
async function manifest(path, token) {
  try {
    const response = await github(path, token, 'application/vnd.github.raw+json')
    if (!response.ok) return null
    return JSON.parse(await response.text())
  } catch {
    return null
  }
}

/** "Laravel 11", "Midtrans PHP", … from the dependencies of composer.json and package.json. */
function frameworksOf(composer, pkg) {
  const found = []
  const add = (names, deps) => {
    for (const [name, label] of Object.entries(names)) {
      const version = deps?.[name]
      if (typeof version !== 'string') continue
      const major = WITH_MAJOR.has(name) ? /(\d+)/.exec(version)?.[1] : null
      found.push(major ? `${label} ${major}` : label)
    }
  }
  add(COMPOSER_NAMES, { ...composer?.require, ...composer?.['require-dev'] })
  add(PACKAGE_NAMES, { ...pkg?.dependencies, ...pkg?.devDependencies })
  return [...new Set(found)]
}

export async function GET(request) {
  const env = process.env
  const slug = new URL(request.url).searchParams.get('slug') || ''
  if (!env.GITHUB_TOKEN || !SLUG.test(slug)) return reply({ error: 'unavailable' }, 503, CACHE_FAIL)
  try {
    const target = await projectRepo(env, slug)
    if (!target) return reply({ error: 'unavailable' }, 503, CACHE_FAIL)
    const path = `/repos/${encodeURIComponent(target.owner)}/${encodeURIComponent(target.repo)}`
    const [repoResponse, languagesResponse] = await Promise.all([github(path, env.GITHUB_TOKEN), github(`${path}/languages`, env.GITHUB_TOKEN)])
    if (!repoResponse.ok) return reply({ error: 'unavailable' }, 503, CACHE_FAIL)
    const repo = await repoResponse.json()
    if (repo.private) return reply({ error: 'unavailable' }, 503, CACHE_FAIL)

    const bytes = languagesResponse.ok ? await languagesResponse.json() : {}
    const total = Object.values(bytes).reduce((sum, value) => sum + (Number(value) || 0), 0)
    const languages = Object.entries(bytes)
      .map(([name, value]) => ({ name, percent: total ? Math.round((Number(value) / total) * 1000) / 10 : 0 }))
      .filter((item) => item.percent > 0)
      .sort((a, b) => b.percent - a.percent)

    const [composer, pkg] = await Promise.all([manifest(`${path}/contents/composer.json`, env.GITHUB_TOKEN), manifest(`${path}/contents/package.json`, env.GITHUB_TOKEN)])

    return reply(
      {
        repo: { fullName: repo.full_name, url: repo.html_url, pushedAt: repo.pushed_at, language: repo.language || null },
        languages,
        frameworks: frameworksOf(composer, pkg),
      },
      200,
      CACHE_OK
    )
  } catch {
    return reply({ error: 'unavailable' }, 503, CACHE_FAIL)
  }
}
