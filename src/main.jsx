import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Design system fonts (self-hosted, CSP font-src 'self'). Family names end in "Variable", so pages
// still on the legacy --font-sans ('Inter') are unaffected until they migrate to --ds-font-sans.
// Inter: login and admin. Space Grotesk: public pages (.pub, public.css). JetBrains Mono: code.
// A browser only downloads the files of a family that is actually rendered.
import '@fontsource-variable/inter'
import '@fontsource-variable/space-grotesk'
import '@fontsource-variable/jetbrains-mono'
import './index.css'
// Base styles of the public pages right after the global ones, so every component stylesheet (loaded
// later) can override them at equal specificity
import './components/public/public.css'
import App from './App.jsx'
import { prefetchProject } from './hooks/usePublicPortfolio'

// Opened on a project address: its data (and cover image) start loading before the app renders
const projectPath = /^\/projects\/([^/]+)\/?$/.exec(window.location.pathname)
if (projectPath) {
  try {
    prefetchProject(decodeURIComponent(projectPath[1]))
  } catch {
    // a malformed address: the page shows its 404
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
