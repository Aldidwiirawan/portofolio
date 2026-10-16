import { useAchievements } from '../../hooks/useAchievements'
import { useCertifications } from '../../hooks/useCertifications'
import { useEducations } from '../../hooks/useEducations'
import { useExperiences } from '../../hooks/useExperiences'
import { useGuestbook } from '../../hooks/useGuestbook'
import { useLanguages } from '../../hooks/useLanguages'
import { useOrganizations } from '../../hooks/useOrganizations'
import { useProfile } from '../../hooks/useProfile'
import { useProjects } from '../../hooks/useProjects'
import { useSkills } from '../../hooks/useSkills'
import { Link } from 'react-router-dom'
import RobotMascot from '../../components/brand/RobotMascot'
import { AdminLayout, AdminRoot } from '../../components/admin/ui/AdminLayout'
import { useAdminShell } from '../../components/admin/ui/adminContexts'
import { ADMIN_SECTIONS } from '../../components/admin/ui/adminNav'
import { Alert } from '../../components/admin/ui/Alert'
import { Button, ButtonLink } from '../../components/admin/ui/Button'
import { Badge, Card, StatCard } from '../../components/admin/ui/Card'
import { certificateValidity } from '../../components/admin/ui/contentLabels'
import { Skeleton } from '../../components/admin/ui/Feedback'
import { formatDateTime, formatRelativeDate } from '../../components/admin/ui/format'
import { toFriendlyError } from '../../components/admin/ui/friendlyError'
import {
  IconAlert,
  IconArrowRight,
  IconAward,
  IconBook,
  IconBriefcase,
  IconCap,
  IconCheck,
  IconCode,
  IconFolder,
  IconGlobe,
  IconMail,
  IconRefresh,
  IconTrophy,
  IconUser,
  IconUsers,
} from '../../components/admin/ui/icons'
import './AdminDashboardPage.css'

const LATEST_COUNT = 5

// Main profile data for the public page; the Profil card counts how many are filled in
const PROFILE_KEY_FIELDS = [
  (p) => p.full_name,
  (p) => p.primary_role || p.tagline,
  (p) => p.bio,
  (p) => p.avatar_url,
  (p) => p.cv_file_url || p.resume_url || p.resume_link,
  (p) => p.location,
  (p) => p.linkedin_url,
  (p) => p.github_username,
]

const visibleOnly = (list) => (list ?? []).filter((item) => item.is_visible !== false)

/**
 * Completeness reminders computed from the data (only for parts that loaded):
 * [{ id, text, to, tone }] — tone 'danger' for something already wrong (e.g. expired).
 */
function buildReminders({ profile, projects, certifications, experiences }) {
  const out = []
  const add = (id, text, to, tone = 'warn') => out.push({ id, text, to, tone })

  if (profile.ready) {
    const p = profile.data || {}
    if (!p.avatar_url) add('avatar', 'Foto profil belum diunggah', '/admin/profile')
    if (!p.cv_file_url) {
      add('cv', p.resume_url || p.resume_link ? 'CV PDF belum diunggah (masih memakai tautan cadangan)' : 'CV belum diunggah', '/admin/profile')
    }
    if (!p.primary_role) add('role', 'Peran utama belum diisi', '/admin/profile')
    if (!Array.isArray(p.hero_keywords) || p.hero_keywords.length === 0) add('keywords', 'Kata berganti di bagian pembuka belum diisi', '/admin/profile')
    if (!p.linkedin_url) add('linkedin', 'Tautan LinkedIn belum diisi', '/admin/profile')
    if (!p.github_username) add('github', 'Username GitHub belum diisi', '/admin/profile')
  }

  if (projects.ready) {
    const shown = visibleOnly(projects.data)
    const featured = shown.filter((x) => x.is_featured).length
    if (shown.length > 0 && featured === 0) add('projects-featured', 'Proyek unggulan belum dipilih', '/admin/projects')
    if (featured > 4) add('projects-too-many', `${featured} proyek unggulan; pilih 3–4 saja`, '/admin/projects')
    const noCover = shown.filter((x) => !x.thumbnail_url).length
    if (noCover > 0) add('projects-cover', `${noCover} proyek belum punya gambar sampul`, '/admin/projects')
    const noStatus = shown.filter((x) => !x.status).length
    if (noStatus > 0) add('projects-status', `${noStatus} proyek belum punya status`, '/admin/projects')
  }

  if (certifications.ready) {
    const shown = visibleOnly(certifications.data)
    const noImage = shown.filter((x) => !x.image_url).length
    if (noImage > 0) add('cert-image', `${noImage} sertifikat belum punya gambar`, '/admin/certifications')
    const states = shown.map((x) => certificateValidity(x).state)
    const soon = states.filter((x) => x === 'soon').length
    if (soon > 0) add('cert-soon', `${soon} sertifikat akan kedaluwarsa dalam 3 bulan`, '/admin/certifications', 'danger')
    const expired = states.filter((x) => x === 'expired').length
    if (expired > 0) add('cert-expired', `${expired} sertifikat sudah kedaluwarsa`, '/admin/certifications', 'danger')
    if (shown.length > 0 && !shown.some((x) => x.is_featured)) add('cert-featured', 'Sertifikat unggulan belum dipilih', '/admin/certifications')
  }

  if (experiences.ready) {
    const shown = visibleOnly(experiences.data)
    const noTasks = shown.filter((x) => !Array.isArray(x.responsibilities) || x.responsibilities.length === 0).length
    if (noTasks > 0) add('exp-tasks', `${noTasks} pengalaman belum punya poin tugas`, '/admin/experiences')
    if (shown.length > 0 && !shown.some((x) => x.is_featured)) add('exp-featured', 'Pengalaman unggulan belum dipilih', '/admin/experiences')
  }

  return out
}

/** Beranda admin: ringkasan setiap bagian, pesan dan buku tamu terbaru. Data lewat hooks yang ada. */
function AdminDashboardPage() {
  return (
    <AdminRoot>
      <DashboardScreen />
    </AdminRoot>
  )
}

function DashboardScreen() {
  const { inbox } = useAdminShell()
  const guestbook = useGuestbook()
  const profile = useProfile({ includePrivateFields: true })
  const projects = useProjects({ includeAdminFields: true })
  const skills = useSkills({ includeAdminFields: true })
  const experiences = useExperiences({ includeAdminFields: true })
  const educations = useEducations({ includeAdminFields: true })
  const certifications = useCertifications({ includeAdminFields: true })
  const achievements = useAchievements({ includeAdminFields: true })
  const languages = useLanguages({ includeAdminFields: true })
  const organizations = useOrganizations({ includeAdminFields: true })

  const messages = inbox?.messages ?? []
  const unread = inbox?.unreadCount ?? 0
  const entries = guestbook.entries ?? []
  const unreplied = entries.filter((e) => !e.admin_reply).length

  const profileFilled = profile.profile ? PROFILE_KEY_FIELDS.filter((get) => Boolean(get(profile.profile))).length : 0
  const countWhere = (list, test) => (list ?? []).filter(test).length

  const featuredNote = (list) => {
    const featured = countWhere(list, (x) => x.is_featured)
    const hidden = countWhere(list, (x) => x.is_visible === false)
    return [featured > 0 && `${featured} unggulan`, hidden > 0 && `${hidden} disembunyikan`].filter(Boolean).join(' · ') || null
  }

  // Summary cards per menu section (paths and order from adminNav)
  const cards = {
    '/admin/profile': {
      icon: IconUser,
      state: profile,
      value: `${profileFilled}/${PROFILE_KEY_FIELDS.length}`,
      note: profile.profile ? 'data utama terisi' : 'Belum diisi',
    },
    '/admin/educations': {
      icon: IconCap,
      state: educations,
      list: educations.educations,
      note: (list) => currentNote(countWhere(list, (x) => x.is_current)) || featuredNote(list),
    },
    '/admin/languages': { icon: IconGlobe, state: languages, list: languages.languages, note: featuredNote },
    '/admin/projects': { icon: IconFolder, state: projects, list: projects.projects, note: (list) => `${countWhere(list, (p) => p.is_featured)} unggulan` },
    '/admin/skills': {
      icon: IconCode,
      state: skills,
      list: skills.skills,
      note: (list) => `${new Set(list.map((s) => s.category).filter(Boolean)).size} kategori`,
    },
    '/admin/certifications': { icon: IconAward, state: certifications, list: certifications.certifications, note: featuredNote },
    '/admin/experiences': {
      icon: IconBriefcase,
      state: experiences,
      list: experiences.experiences,
      note: (list) => [currentNote(countWhere(list, (x) => x.is_current)), featuredNote(list)].filter(Boolean).join(' · ') || null,
    },
    '/admin/organizations': { icon: IconUsers, state: organizations, list: organizations.organizations, note: featuredNote },
    '/admin/achievements': { icon: IconTrophy, state: achievements, list: achievements.achievements, note: featuredNote },
  }
  const contentCards = Object.values(cards)
  const contentSections = ADMIN_SECTIONS.filter((section) => section.group === 'content')

  const reminderSources = {
    profile: { ready: !profile.isLoading && !profile.error, data: profile.profile },
    projects: { ready: !projects.isLoading && !projects.error, data: projects.projects },
    certifications: { ready: !certifications.isLoading && !certifications.error, data: certifications.certifications },
    experiences: { ready: !experiences.isLoading && !experiences.error, data: experiences.experiences },
  }
  const remindersLoading = [profile, projects, certifications, experiences].some((x) => x.isLoading)
  const reminders = buildReminders(reminderSources)

  const failed = [
    inbox?.error && inbox.refetch,
    guestbook.error && guestbook.refresh,
    ...contentCards.map((c) => c.state.error && c.state.refetch),
  ].filter(Boolean)
  const firstError = [inbox?.error, guestbook.error, ...contentCards.map((c) => c.state.error)].find(Boolean)

  const latestMessages = messages.slice(0, LATEST_COUNT)
  const latestEntries = [...entries]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, LATEST_COUNT)

  return (
    <AdminLayout
      title="Selamat datang, Aldi"
      docTitle="Beranda"
      description="Hal yang perlu dilengkapi, ringkasan isi portofolio, dan pesan yang masuk. Pilih kartu untuk mengelola bagiannya."
      leading={<RobotMascot mood="idle" size={64} className="adm-home-robot" />}
    >
      {failed.length > 0 && (
        <div className="adm-home-alert">
          <Alert
            tone="danger"
            title="Sebagian data belum bisa dimuat."
            action={
              <Button size="sm" variant="secondary" icon={<IconRefresh size={16} />} onClick={() => failed.forEach((retry) => retry())}>
                Muat ulang
              </Button>
            }
          >
            {toFriendlyError(firstError, 'Periksa koneksi internet, lalu coba muat ulang.')}
          </Alert>
        </div>
      )}

      <section className="adm-home-section" aria-labelledby="home-todo">
        <Card as="div" heading="Perlu dilengkapi" headingId="home-todo" barAside={!remindersLoading && reminders.length > 0 ? <Badge tone="neutral">{reminders.length}</Badge> : null} flush>
          {remindersLoading ? (
            <Skeleton rows={2} label="Memeriksa kelengkapan..." />
          ) : reminders.length === 0 ? (
            <p className="adm-todo-done">
              <IconCheck size={18} />
              <span>Semua data utama sudah lengkap.</span>
            </p>
          ) : (
            <ul className="adm-todo">
              {reminders.map((item) => (
                <li key={item.id}>
                  <Link to={item.to} className={`adm-todo-link${item.tone === 'danger' ? ' is-danger' : ''}`}>
                    <IconAlert size={16} className="adm-todo-icon" />
                    <span className="adm-todo-text">{item.text}</span>
                    <IconArrowRight size={16} className="adm-todo-go" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      {contentSections.map((section) => (
        <section key={section.id} className="adm-home-section" aria-labelledby={`home-${section.id}`}>
          <h2 id={`home-${section.id}`} className="adm-section-title">
            {section.label}
          </h2>
          <div className="adm-home-grid adm-home-grid--content">
            {section.items.map((item) => {
              const card = cards[item.to]
              const list = card.list ?? []
              const value = card.value ?? list.length
              const note =
                typeof card.note === 'function' ? (list.length === 0 ? 'Belum ada isi' : card.note(list)) : (card.note ?? (list.length === 0 ? 'Belum ada isi' : null))
              return (
                <SummaryCard
                  key={item.to}
                  to={item.to}
                  label={item.label}
                  icon={card.icon}
                  loading={card.state.isLoading}
                  error={card.state.error}
                  value={value}
                  note={note}
                />
              )
            })}
          </div>
        </section>
      ))}

      <section className="adm-home-section" aria-labelledby="home-inbox">
        <h2 id="home-inbox" className="adm-section-title">
          Kotak Masuk
        </h2>
        <div className="adm-home-grid adm-home-grid--pair">
          <SummaryCard
            to="/admin/messages"
            label="Pesan"
            icon={IconMail}
            loading={!inbox || inbox.isLoading}
            error={inbox?.error}
            value={unread}
            note={messages.length === 0 ? 'Belum ada pesan' : unread > 0 ? `baru dari ${messages.length} pesan` : `tidak ada yang baru · ${messages.length} pesan`}
            highlight={unread > 0}
          />
          <SummaryCard
            to="/admin/guestbook"
            label="Buku tamu"
            icon={IconBook}
            loading={guestbook.loading}
            error={guestbook.error}
            value={entries.length}
            note={entries.length === 0 ? 'Belum ada entri' : unreplied > 0 ? `${unreplied} belum dibalas` : 'semua sudah dibalas'}
            highlight={unreplied > 0}
          />
        </div>
      </section>

      <section className="adm-home-section" aria-labelledby="home-terbaru">
        <h2 id="home-terbaru" className="adm-section-title">
          Terbaru
        </h2>
        <div className="adm-home-latest">
          <Card
            heading="Pesan terbaru"
            headingId="home-latest-messages"
            barAside={unread > 0 ? <Badge tone="accent" dot>{unread} baru</Badge> : null}
            flush
            className="adm-home-panel"
          >
            {!inbox || inbox.isLoading ? (
              <Skeleton rows={3} label="Memuat pesan..." />
            ) : inbox.error ? (
              <p className="adm-home-empty">Pesan belum bisa dimuat.</p>
            ) : latestMessages.length === 0 ? (
              <p className="adm-home-empty">Belum ada pesan masuk.</p>
            ) : (
              <ul className="adm-feed">
                {latestMessages.map((m) => (
                  <li key={m.id} className={`adm-feed-item${m.is_read ? '' : ' is-unread'}`}>
                    <div className="adm-feed-main">
                      <p className="adm-feed-title">
                        <span className="adm-feed-name">{m.name}</span>
                        {!m.is_read && <Badge tone="accent">Baru</Badge>}
                      </p>
                      {m.subject && <p className="adm-feed-subject">{m.subject}</p>}
                      <p className="adm-feed-text">{m.message}</p>
                    </div>
                    <time className="adm-feed-time" dateTime={m.created_at} title={formatDateTime(m.created_at)}>
                      {formatRelativeDate(m.created_at)}
                    </time>
                  </li>
                ))}
              </ul>
            )}
            <div className="adm-home-panel-foot">
              <ButtonLink to="/admin/messages" size="sm" variant="secondary" icon={<IconArrowRight size={16} />}>
                Buka semua pesan
              </ButtonLink>
            </div>
          </Card>

          <Card
            heading="Buku tamu terbaru"
            headingId="home-latest-guestbook"
            barAside={unreplied > 0 ? <Badge tone="neutral">{unreplied} belum dibalas</Badge> : null}
            flush
            className="adm-home-panel"
          >
            {guestbook.loading ? (
              <Skeleton rows={3} label="Memuat buku tamu..." />
            ) : guestbook.error ? (
              <p className="adm-home-empty">Buku tamu belum bisa dimuat.</p>
            ) : latestEntries.length === 0 ? (
              <p className="adm-home-empty">Belum ada entri buku tamu.</p>
            ) : (
              <ul className="adm-feed">
                {latestEntries.map((e) => (
                  <li key={e.id} className="adm-feed-item">
                    <div className="adm-feed-main">
                      <p className="adm-feed-title">
                        <span className="adm-feed-name">{e.name}</span>
                        {!e.admin_reply && <Badge tone="neutral">Belum dibalas</Badge>}
                      </p>
                      <p className="adm-feed-text">{e.message}</p>
                    </div>
                    <time className="adm-feed-time" dateTime={e.created_at} title={formatDateTime(e.created_at)}>
                      {formatRelativeDate(e.created_at)}
                    </time>
                  </li>
                ))}
              </ul>
            )}
            <div className="adm-home-panel-foot">
              <ButtonLink to="/admin/guestbook" size="sm" variant="secondary" icon={<IconArrowRight size={16} />}>
                Buka buku tamu
              </ButtonLink>
            </div>
          </Card>
        </div>
      </section>
    </AdminLayout>
  )
}

function currentNote(count) {
  return count > 0 ? `${count} masih berjalan` : null
}

/** StatCard with loading and error states. */
function SummaryCard({ to, label, icon: Icon, loading, error, value, note, highlight = false }) {
  return (
    <StatCard
      to={to}
      label={label}
      icon={<Icon size={18} />}
      highlight={!loading && !error && highlight}
      value={
        loading ? (
          <>
            <span className="adm-skel adm-home-skel-value" aria-hidden="true" />
            <span className="adm-sr-only">memuat</span>
          </>
        ) : error ? (
          '–'
        ) : (
          value
        )
      }
      note={loading ? null : error ? 'Belum bisa dimuat' : note}
    />
  )
}

export default AdminDashboardPage
