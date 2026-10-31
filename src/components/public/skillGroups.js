/**
 * Three-tier skill grouping matching modern developer portfolio standards (Styfen Sagala reference):
 * 1. CORE LANGUAGES
 * 2. FRAMEWORKS & UI
 * 3. TOOLS & ECOSYSTEM
 *
 * Keeps the existing database and Admin intact (Approach 1) by automatically mapping categories.
 */

const CORE_LANG_NAMES = new Set([
  'html', 'html5', 'css', 'css3', 'javascript', 'js', 'typescript', 'ts',
  'php', 'python', 'dart', 'java', 'kotlin', 'sql', 'c', 'c++', 'c#', 'go', 'rust', 'ruby', 'swift'
])

const TOOLS_NAMES = new Set([
  'mysql', 'postgresql', 'postgres', 'supabase', 'sqlite', 'firebase', 'mongodb', 'redis',
  'git', 'github', 'gitlab', 'figma', 'postman', 'docker', 'vite', 'npm', 'yarn',
  'vscode', 'vs code', 'android studio', 'xampp', 'laragon', 'uv', 'canva',
  'microsoft office', 'google sheets / apps script', 'mikrotik (mtcna)', 'mikrotik',
  'cisco packet tracer', 'linux', 'windows server'
])

export function groupSkills(skills) {
  if (!skills || skills.length === 0) return []

  const core = []
  const frameworks = []
  const tools = []

  for (const skill of skills) {
    if (skill.is_visible === false) continue
    const nameLower = (skill.name || '').trim().toLowerCase()
    const catLower = (skill.category || '').trim().toLowerCase()

    // Omit generic soft skills and general desktop support actions from the technical stack card
    if (
      catLower === 'soft skill' ||
      catLower === 'soft' ||
      nameLower === 'instalasi sistem operasi' ||
      nameLower === 'troubleshooting' ||
      nameLower === 'integrasi scanner barcode' ||
      nameLower === 'jaringan komputer'
    ) {
      continue
    }

    if (CORE_LANG_NAMES.has(nameLower)) {
      core.push(skill)
    } else if (
      TOOLS_NAMES.has(nameLower) ||
      catLower === 'database' ||
      catLower === 'tools' ||
      catLower.includes('jaringan') ||
      catLower.includes('it support')
    ) {
      tools.push(skill)
    } else {
      frameworks.push(skill)
    }
  }

  const groups = []
  if (core.length > 0) {
    groups.push({ key: 'core', category: 'Core Languages', skills: core })
  }
  if (frameworks.length > 0) {
    groups.push({ key: 'frameworks', category: 'Frameworks & UI', skills: frameworks })
  }
  if (tools.length > 0) {
    groups.push({ key: 'tools', category: 'Tools & Ecosystem', skills: tools })
  }

  return groups
}
