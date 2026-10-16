import { IconBriefcase, IconFolder, IconHome, IconInbox, IconUser } from './icons'

/**
 * Admin menu: five sections in the sidebar; a section with several pages shows them as sub-tabs
 * under the page header. Paths are the existing routes in App.jsx (routing is unchanged); a
 * section's sidebar link goes to its first page.
 * `count: 'unread'` shows the unread-messages badge.
 */
export const ADMIN_SECTIONS = [
  {
    id: 'home',
    label: 'Beranda',
    icon: IconHome,
    items: [{ to: '/admin', label: 'Beranda' }],
  },
  {
    id: 'about',
    label: 'Tentang Saya',
    icon: IconUser,
    group: 'content',
    items: [
      { to: '/admin/profile', label: 'Profil' },
      { to: '/admin/educations', label: 'Pendidikan' },
      { to: '/admin/languages', label: 'Bahasa' },
    ],
  },
  {
    id: 'work',
    label: 'Karya & Keahlian',
    icon: IconFolder,
    group: 'content',
    items: [
      { to: '/admin/projects', label: 'Proyek' },
      { to: '/admin/skills', label: 'Keahlian' },
      { to: '/admin/certifications', label: 'Sertifikat' },
    ],
  },
  {
    id: 'track',
    label: 'Rekam Jejak',
    icon: IconBriefcase,
    group: 'content',
    items: [
      { to: '/admin/experiences', label: 'Pengalaman' },
      { to: '/admin/organizations', label: 'Organisasi' },
      { to: '/admin/achievements', label: 'Prestasi' },
    ],
  },
  {
    id: 'inbox',
    label: 'Kotak Masuk',
    icon: IconInbox,
    group: 'inbox',
    count: 'unread',
    items: [
      { to: '/admin/messages', label: 'Pesan', count: 'unread' },
      { to: '/admin/guestbook', label: 'Buku tamu' },
    ],
  },
]

/** Sidebar groups: headings above the sections that share a `group` (Beranda has none). */
export const ADMIN_NAV_GROUPS = [
  { id: 'home', sections: ['home'] },
  { id: 'content', heading: 'Isi portofolio', sections: ['about', 'work', 'track'] },
  { id: 'inbox', heading: 'Interaksi', sections: ['inbox'] },
]

/** '/admin/projects/' → '/admin/projects' */
export function normalizeAdminPath(pathname) {
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
}

/** The section the current page belongs to, or null. */
export function findAdminSection(pathname) {
  const path = normalizeAdminPath(pathname)
  return ADMIN_SECTIONS.find((section) => section.items.some((item) => item.to === path)) ?? null
}
