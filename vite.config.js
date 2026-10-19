import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

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

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), preloadHeroFont()],
})
