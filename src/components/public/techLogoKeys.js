// Which brand logo (techLogoPaths.js) belongs to a skill name. Names are compared without case,
// spaces or punctuation ("React.js" → "reactjs"), so small spelling differences still match.
// Skills without a logo here (UI/UX, REST API, soft skills, …) get a generic icon per category.
const ALIASES = {
  html5: ['html', 'html5'],
  css: ['css', 'css3'],
  javascript: ['javascript', 'js'],
  react: ['react', 'reactjs', 'reactnative'],
  vite: ['vite', 'vitejs'],
  tailwindcss: ['tailwind', 'tailwindcss'],
  jinja: ['jinja', 'jinja2'],
  laravel: ['laravel', 'blade', 'laravelblade'],
  bootstrap: ['bootstrap'],
  nextdotjs: ['next', 'nextjs'],
  python: ['python'],
  fastapi: ['fastapi'],
  sqlalchemy: ['sqlalchemy'],
  jsonwebtokens: ['jwt', 'jsonwebtoken', 'jsonwebtokens'],
  php: ['php'],
  nodedotjs: ['node', 'nodejs'],
  openjdk: ['java', 'openjdk'],
  flutter: ['flutter'],
  dart: ['dart'],
  kotlin: ['kotlin'],
  postgresql: ['postgres', 'postgresql'],
  mysql: ['mysql'],
  supabase: ['supabase'],
  sqlite: ['sqlite'],
  firebase: ['firebase'],
  mikrotik: ['mikrotik', 'mikrotikmtcna', 'mtcna'],
  cisco: ['cisco', 'ciscopackettracer', 'packettracer'],
  linux: ['linux'],
  figma: ['figma'],
  git: ['git'],
  github: ['github'],
  androidstudio: ['androidstudio'],
  xampp: ['xampp'],
  laragon: ['laragon'],
  uv: ['uv'],
  postman: ['postman'],
  docker: ['docker'],
  googlesheets: ['googlesheets', 'googlesheetsappsscript', 'googleappsscript', 'appsscript'],
}

const BY_NAME = new Map(Object.entries(ALIASES).flatMap(([key, names]) => names.map((name) => [name, key])))

/** Logo key for a skill name, or null when there is no brand logo for it. */
export function techLogoKey(name) {
  const normalized = String(name ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')
  return BY_NAME.get(normalized) ?? null
}
