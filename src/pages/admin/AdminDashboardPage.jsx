import { Link } from 'react-router-dom'
import { AdminLayout } from '../../components/admin/ui/AdminLayout'
import './AdminDashboardPage.css'

/**
 * Beranda admin. Navigasi, sesi, dan tombol Keluar ada di AdminLayout.
 * Daftar modul di bawah masih tampilan lama sampai isi Beranda dibuat ulang (tahap 2, butir 4).
 */
function AdminDashboardPage() {
  const cmsModules = [
    {
      name: 'Profile',
      description: 'Pengelolaan data biografi, status ketersediaan, kontak, dan tautan sosial.',
      table: 'public.profiles',
    },
    {
      name: 'Projects',
      description: 'Pengelolaan daftar karya proyek, thumbnail, deskripsi, demo, dan repository.',
      table: 'public.projects',
    },
    {
      name: 'Skills',
      description: 'Pengelompokan keahlian teknis (Frontend, Backend, Database, Tools).',
      table: 'public.skills',
    },
    {
      name: 'Experiences',
      description: 'Pengelolaan riwayat pengalaman kerja dan proyek pengembangan.',
      table: 'public.experiences',
    },
    {
      name: 'Educations',
      description: 'Pengelolaan riwayat akademis dan sertifikasi formal.',
      table: 'public.educations',
    },
    {
      name: 'Messages',
      description: 'Melihat dan meninjau pesan masuk dari formulir kontak publik.',
      table: 'public.messages',
    },
    {
      name: 'Certifications',
      description: 'Pengelolaan sertifikasi profesional, kursus, lisensi, dan tautan kredensial.',
      table: 'public.certifications',
    },
    {
      name: 'Achievements',
      description: 'Pengelolaan prestasi, kejuaraan kompetisi, dan penghargaan yang diraih.',
      table: 'public.achievements',
    },
    {
      name: 'Languages',
      description: 'Pengelolaan bahasa komunikasi dan tingkat kemahiran (profisiensi).',
      table: 'public.languages',
    },
    {
      name: 'Organizations',
      description: 'Pengelolaan pengalaman organisasi kampus, komunitas IT, dan kepanitiaan.',
      table: 'public.organizations',
    },
    {
      name: 'Guestbook',
      description: 'Pengelolaan buku tamu publik dan memberikan balasan resmi [DEV ALDI].',
      table: 'public.guestbooks',
    },
  ]

  return (
    <AdminLayout title="Selamat datang, Aldi" docTitle="Beranda">
      <h3 className="admin-modules-title">Modul Pengelolaan Konten</h3>
      <div className="admin-modules-grid">
        {cmsModules.map((module) => {
          const routeMap = {
            Profile: '/admin/profile',
            Projects: '/admin/projects',
            Skills: '/admin/skills',
            Experiences: '/admin/experiences',
            Educations: '/admin/educations',
            Messages: '/admin/messages',
            Certifications: '/admin/certifications',
            Achievements: '/admin/achievements',
            Languages: '/admin/languages',
            Organizations: '/admin/organizations',
            Guestbook: '/admin/guestbook',
          }
          const targetPath = routeMap[module.name]

          if (targetPath) {
            return (
              <Link
                key={module.name}
                to={targetPath}
                className="admin-module-card clickable"
                title={`Buka Manajemen ${module.name}`}
                aria-label={`Buka Manajemen ${module.name}`}
              >
                <div className="admin-module-header">
                  <h4 className="admin-module-name">{module.name}</h4>
                  <span className="admin-module-status">Buka Modul &rarr;</span>
                </div>
                <p className="admin-module-desc">{module.description}</p>
                <div className="badge badge-primary" style={{ alignSelf: 'flex-start' }}>
                  {module.table}
                </div>
              </Link>
            )
          }

          return (
            <div key={module.name} className="admin-module-card">
              <div className="admin-module-header">
                <h4 className="admin-module-name">{module.name}</h4>
                <span className="admin-module-status">Tahap Berikutnya</span>
              </div>
              <p className="admin-module-desc">{module.description}</p>
              <div className="badge badge-primary" style={{ alignSelf: 'flex-start' }}>
                {module.table}
              </div>
            </div>
          )
        })}
      </div>
    </AdminLayout>
  )
}

export default AdminDashboardPage
