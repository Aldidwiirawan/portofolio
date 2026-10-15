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
import RobotMascot from '../../components/brand/RobotMascot'
import { AdminLayout, AdminRoot } from '../../components/admin/ui/AdminLayout'
import { useAdminShell } from '../../components/admin/ui/adminContexts'
import { Alert } from '../../components/admin/ui/Alert'
import { Button, ButtonLink } from '../../components/admin/ui/Button'
import { Badge, Card, StatCard } from '../../components/admin/ui/Card'
import { Skeleton } from '../../components/admin/ui/Feedback'
import { formatDateTime, formatRelativeDate } from '../../components/admin/ui/format'
import {
  IconArrowRight,
  IconAward,
  IconBook,
  IconBriefcase,
  IconCap,
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

// Main profile fields shown on the public page; the Profil card counts how many are filled in
const PROFILE_KEY_FIELDS = [
  (p) => p.full_name,
  (p) => p.tagline,
  (p) => p.bio,
  (p) => p.email,
  (p) => p.avatar_url,
  (p) => p.location,
  (p) => p.resume_url || p.resume_link,
]

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
  const profile = useProfile()
  const projects = useProjects()
  const skills = useSkills()
  const experiences = useExperiences()
  const educations = useEducations()
  const certifications = useCertifications()
  const achievements = useAchievements()
  const languages = useLanguages()
  const organizations = useOrganizations()

  const messages = inbox?.messages ?? []
  const unread = inbox?.unreadCount ?? 0
  const entries = guestbook.entries ?? []
  const unreplied = entries.filter((e) => !e.admin_reply).length

  const profileFilled = profile.profile ? PROFILE_KEY_FIELDS.filter((get) => Boolean(get(profile.profile))).length : 0
  const countWhere = (list, test) => (list ?? []).filter(test).length

  const contentCards = [
    {
      to: '/admin/profile',
      label: 'Profil',
      icon: IconUser,
      state: profile,
      value: `${profileFilled}/${PROFILE_KEY_FIELDS.length}`,
      note: profile.profile ? 'data utama terisi' : 'Belum diisi',
    },
    {
      to: '/admin/projects',
      label: 'Proyek',
      icon: IconFolder,
      state: projects,
      list: projects.projects,
      note: (list) => `${countWhere(list, (p) => p.is_featured)} unggulan`,
    },
    {
      to: '/admin/skills',
      label: 'Keahlian',
      icon: IconCode,
      state: skills,
      list: skills.skills,
      note: (list) => `${new Set(list.map((s) => s.category).filter(Boolean)).size} kategori`,
    },
    {
      to: '/admin/experiences',
      label: 'Pengalaman',
      icon: IconBriefcase,
      state: experiences,
      list: experiences.experiences,
      note: (list) => currentNote(countWhere(list, (x) => x.is_current)),
    },
    {
      to: '/admin/educations',
      label: 'Pendidikan',
      icon: IconCap,
      state: educations,
      list: educations.educations,
      note: (list) => currentNote(countWhere(list, (x) => x.is_current)),
    },
    { to: '/admin/certifications', label: 'Sertifikat', icon: IconAward, state: certifications, list: certifications.certifications },
    { to: '/admin/achievements', label: 'Prestasi', icon: IconTrophy, state: achievements, list: achievements.achievements },
    { to: '/admin/languages', label: 'Bahasa', icon: IconGlobe, state: languages, list: languages.languages },
    { to: '/admin/organizations', label: 'Organisasi', icon: IconUsers, state: organizations, list: organizations.organizations },
  ]

  const failed = [
    inbox?.error && inbox.refetch,
    guestbook.error && guestbook.refresh,
    ...contentCards.map((c) => c.state.error && c.state.refetch),
  ].filter(Boolean)

  const latestMessages = messages.slice(0, LATEST_COUNT)
  const latestEntries = [...entries]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, LATEST_COUNT)

  return (
    <AdminLayout
      title="Selamat datang, Aldi"
      docTitle="Beranda"
      description="Ringkasan isi portofolio dan pesan yang masuk. Pilih kartu untuk mengelola bagiannya."
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
            Periksa koneksi internet, lalu coba muat ulang.
          </Alert>
        </div>
      )}

      <section className="adm-home-section" aria-labelledby="home-interaksi">
        <h2 id="home-interaksi" className="adm-section-title">
          Interaksi
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

      <section className="adm-home-section" aria-labelledby="home-isi">
        <h2 id="home-isi" className="adm-section-title">
          Isi portofolio
        </h2>
        <div className="adm-home-grid adm-home-grid--content">
          {contentCards.map((card) => {
            const list = card.list ?? []
            const value = card.value ?? list.length
            const note = typeof card.note === 'function' ? (list.length === 0 ? 'Belum ada isi' : card.note(list)) : (card.note ?? (list.length === 0 ? 'Belum ada isi' : null))
            return (
              <SummaryCard
                key={card.to}
                to={card.to}
                label={card.label}
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
