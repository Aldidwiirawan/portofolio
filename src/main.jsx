import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Design system fonts (self-hosted). Family names end in "Variable", so pages still on the
// legacy --font-sans ('Inter') are unaffected until they migrate to --ds-font-sans.
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
