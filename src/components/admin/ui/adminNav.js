import {
  IconAward,
  IconBook,
  IconBriefcase,
  IconCap,
  IconCode,
  IconFolder,
  IconGlobe,
  IconHome,
  IconMail,
  IconTrophy,
  IconUser,
  IconUsers,
} from './icons'

/**
 * Sidebar menu, in three groups. Paths are the existing routes in App.jsx (routing is unchanged).
 * `count: 'unread'` shows the unread-messages badge.
 */
export const ADMIN_NAV = [
  {
    id: 'home',
    items: [{ to: '/admin', label: 'Beranda', icon: IconHome, end: true }],
  },
  {
    id: 'content',
    heading: 'Isi portofolio',
    items: [
      { to: '/admin/profile', label: 'Profil', icon: IconUser },
      { to: '/admin/projects', label: 'Proyek', icon: IconFolder },
      { to: '/admin/skills', label: 'Keahlian', icon: IconCode },
      { to: '/admin/experiences', label: 'Pengalaman', icon: IconBriefcase },
      { to: '/admin/educations', label: 'Pendidikan', icon: IconCap },
      { to: '/admin/certifications', label: 'Sertifikat', icon: IconAward },
      { to: '/admin/achievements', label: 'Prestasi', icon: IconTrophy },
      { to: '/admin/languages', label: 'Bahasa', icon: IconGlobe },
      { to: '/admin/organizations', label: 'Organisasi', icon: IconUsers },
    ],
  },
  {
    id: 'inbox',
    heading: 'Interaksi',
    items: [
      { to: '/admin/messages', label: 'Pesan', icon: IconMail, count: 'unread' },
      { to: '/admin/guestbook', label: 'Buku tamu', icon: IconBook },
    ],
  },
]
