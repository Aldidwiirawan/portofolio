import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Address of the site (DEPLOY.md). On Vercel without VITE_SITE_URL, the project's production address
// is used, so link previews, canonical addresses and the sitemap still get absolute addresses.
if (!process.env.VITE_SITE_URL && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
  process.env.VITE_SITE_URL = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
}

/**
 * Preloads the Inter font file (latin, variable weight) used by the hero name, so the largest text of
 * the page does not wait for the stylesheet to discover it (stage 3C, LCP). Its file name has a build
 * hash, so the link is added to index.html at build time.
 */
function preloadHeroFont() {
  return {
    name: 'preload-hero-font',
    apply: 'build',
    transformIndexHtml(html, ctx) {
      const font = Object.keys(ctx.bundle ?? {}).find((file) => /inter-latin-wght-normal-[\w-]+\.woff2$/.test(file))
      if (!font) return html
      return [{ tag: 'link', attrs: { rel: 'preload', href: `/${font}`, as: 'font', type: 'font/woff2', crossorigin: '' }, injectTo: 'head' }]
    },
  }
}

const xml = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Slugs and last change of the visible projects, read with the public key like the public pages. */
async function visibleProjects(env) {
  const params = new URLSearchParams({
    select: 'slug,updated_at',
    is_visible: 'eq.true',
    order: 'sort_order.asc',
    apikey: env.VITE_SUPABASE_PUBLISHABLE_KEY,
  })
  const response = await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/projects?${params}`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(10000),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

/**
 * Files for search engines and link previews, made at build time (stage 3C, SEO):
 * - og:image / twitter:image of index.html made absolute (link previews need the full address);
 * - robots.txt: everything except /admin and /api, plus the sitemap address;
 * - sitemap.xml: the home page and every visible project (K7: a new project is listed after the next
 *   deploy). When Supabase cannot be read the sitemap lists the home page only and the build goes on.
 * Without a site address (local build) there is no sitemap and robots.txt has no Sitemap line.
 */
function siteFiles() {
  let site = ''
  let env = {}
  return {
    name: 'site-files',
    apply: 'build',
    configResolved(config) {
      env = config.env
      site = String(env.VITE_SITE_URL || '').replace(/\/+$/, '')
    },
    transformIndexHtml(html) {
      return html.replaceAll('content="/og-image.png"', `content="${site}/og-image.png"`)
    },
    async generateBundle() {
      const robots = ['User-agent: *', 'Disallow: /admin', 'Disallow: /api/', ...(site ? ['', `Sitemap: ${site}/sitemap.xml`] : [])]
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `${robots.join('\n')}\n` })
      if (!site) return
      let projects = []
      try {
        projects = await visibleProjects(env)
      } catch (error) {
        this.warn(`sitemap.xml: project list not read (${error.message}); only the home page is listed`)
      }
      const urls = [
        `  <url><loc>${xml(`${site}/`)}</loc></url>`,
        ...projects
          .filter((row) => row.slug)
          .map((row) => {
            const lastmod = /^\d{4}-\d{2}-\d{2}/.exec(row.updated_at || '')?.[0]
            const loc = xml(`${site}/projects/${encodeURIComponent(row.slug)}`)
            return `  <url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`
          }),
      ]
      const sitemap = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...urls, '</urlset>', '']
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap.join('\n') })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), preloadHeroFont(), siteFiles()],
})
