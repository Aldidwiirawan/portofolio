# Analisa Project Portofolio

Tanggal analisa: 14 Oktober 2026 · Branch: `chore/cleanup-analysis`

> **Catatan 18 Oktober 2026:** halaman publik dibangun ulang di tahap 3A. Bagian dokumen ini tentang komponen
> publik lama dan data cadangan `src/data/portfolioData.js` sudah tidak berlaku (keduanya dihapus); lihat
> `design-system/aldi-portfolio/pages/public.md`.

## 1. Ringkasan project

Website portofolio pribadi Aldi Dwi Irawan berupa SPA satu halaman untuk publik, ditambah panel admin
(CMS) privat untuk mengelola seluruh isi portofolio. Data disimpan di Supabase. Halaman publik tetap
tampil dengan data statis cadangan (`src/data/portfolioData.js`) bila tabel di database kosong.

| Komponen | Versi terpasang | Keterangan |
|---|---|---|
| React / React DOM | 19.3.0 | UI |
| react-router-dom | 7.18.4 | Routing client-side |
| @supabase/supabase-js | 2.117.1 | Database, Auth, Storage |
| Vite | 8.3.0 | Dev server & bundler (Rolldown) |
| @vitejs/plugin-react | 6.1.1 | JSX transform |
| oxlint | 1.85.0 | Linter (`package.json` menulis `^1.81.0`) |
| Node.js / npm (mesin ini) | 24.15.0 / 11.12.1 | |

Styling memakai CSS biasa per komponen (tanpa framework CSS) dengan CSS variables di `src/index.css`.
Bahasa JavaScript (bukan TypeScript), tanpa test runner.

## 2. Struktur folder

```text
portofolio/
├── index.html                 # Entry HTML, memuat /src/main.jsx dan /favicon.svg
├── vite.config.js             # Hanya plugin React
├── .oxlintrc.json             # Plugin react + oxc, rules-of-hooks = error
├── package.json               # Script: dev, build, lint, preview
├── .env.local                 # Kredensial Supabase (di-ignore git)
├── .agent/rules/              # Kosong
├── PROJECT_SUMMARY.md         # Catatan handover lama (sebagian sudah usang, lihat §10)
├── README.md                  # Masih README bawaan template Vite
├── public/
│   └── favicon.svg            # Favicon (dipakai index.html)
├── supabase/migrations/       # 3 file migrasi SQL (lihat §4)
└── src/
    ├── main.jsx               # createRoot + StrictMode + index.css
    ├── App.jsx                # Router: 1 rute publik, 13 rute admin (lazy) + catch-all
    ├── App.css, index.css     # Style global & design tokens
    ├── data/portfolioData.js  # Data statis cadangan untuk halaman publik
    ├── lib/
    │   ├── supabaseClient.js  # createClient dari env VITE_*
    │   ├── authService.js     # signIn, signOut, getCurrentUser, onAuthStateChange, verifyIsAdmin
    │   └── storageUtils.js    # extractStoragePath() untuk bucket portfolio-assets
    ├── hooks/                 # 11 hook data, satu per tabel (useProjects, useSkills, … useGuestbook)
    ├── pages/
    │   ├── PublicPortfolioPage.jsx   # Merakit semua section + menggabungkan data DB & fallback
    │   └── admin/             # 13 halaman admin (+ CSS masing-masing)
    └── components/
        ├── Navbar, Footer, HeroSection, ProjectsSection, ProjectCard, AboutSection,
        │   SkillsSection, SkillCard, TechBadge, JourneySection, TimelineItem, SectionTitle,
        │   ContactSection, ContactForm, GuestbookDrawer, CustomCursor   (+ CSS)
        ├── CertificationsSection.css, TimelineContainer.css   # Dipakai oleh JourneySection
        └── admin/             # AdminRoute (guard) + 8 form CRUD (Project, Skill, Experience, …)
```

## 3. Routing

Didefinisikan di `src/App.jsx` dengan `BrowserRouter`. Semua halaman admin di-load dengan `lazy()`
sehingga terpisah dari bundle publik.

**Publik**

| Path | Komponen |
|---|---|
| `/` | `PublicPortfolioPage` (section: hero, projects, about, skills, journey, contact + guestbook drawer) |
| `*` | Redirect ke `/` |

**Admin** (semua kecuali login dibungkus `AdminRoute`)

| Path | Halaman | Tabel |
|---|---|---|
| `/admin/login` | AdminLoginPage | – (Supabase Auth) |
| `/admin` | AdminDashboardPage | ringkasan modul |
| `/admin/projects` | AdminProjectsPage + ProjectForm | `projects` + Storage |
| `/admin/skills` | AdminSkillsPage + SkillForm | `skills` |
| `/admin/experiences` | AdminExperiencesPage + ExperienceForm | `experiences` |
| `/admin/educations` | AdminEducationsPage + EducationForm | `educations` |
| `/admin/profile` | AdminProfilePage | `profiles` |
| `/admin/messages` | AdminMessagesPage | `messages` |
| `/admin/certifications` | AdminCertificationsPage + CertificationForm | `certifications` |
| `/admin/achievements` | AdminAchievementsPage + AchievementForm | `achievements` |
| `/admin/languages` | AdminLanguagesPage + LanguageForm | `languages` |
| `/admin/organizations` | AdminOrganizationsPage + OrganizationForm | `organizations` |
| `/admin/guestbook` | AdminGuestbookPage | `guestbooks` |

`AdminRoute` memeriksa sesi (`supabase.auth.getUser()`) lalu memastikan `auth.uid()` ada di
`profiles.user_id`. Tanpa sesi → redirect ke `/admin/login`; terverifikasi di uji localhost.

## 4. Integrasi Supabase

**Client & env.** `src/lib/supabaseClient.js` membaca `VITE_SUPABASE_URL` dan
`VITE_SUPABASE_PUBLISHABLE_KEY`. Keduanya ikut ke bundle browser (memang publishable); keamanan data
sepenuhnya bergantung pada RLS.

**Auth.** Email + password (`signInWithPassword`). Hak admin dicek di client lewat `verifyIsAdmin()`
dan di database lewat fungsi `private.is_admin()` di policy RLS. Setting Auth saat ini: **signup publik
masih aktif** (konfirmasi email wajib).

**Tabel yang dipakai kode**

| Tabel | Dibaca publik | Ditulis oleh | Ada di migrations? |
|---|---|---|---|
| profiles | ya (`select *`) | admin | hanya ALTER (kolom tambahan) |
| projects | ya | admin | tidak |
| skills | ya | admin | tidak |
| experiences | ya | admin | hanya ALTER (`experience_type`) |
| educations | ya | admin | tidak |
| messages | tidak (anon membaca 0 baris) | publik INSERT via ContactForm, admin kelola | tidak |
| certifications, achievements, languages, organizations | ya | admin | ya |
| guestbooks | ya | publik INSERT, admin balas/hapus | ya, **tapi belum diterapkan di database** (API 404) |

**Storage.** Bucket publik `portfolio-assets`, maks 2 MB, MIME `image/*`. Upload thumbnail ke
`projects/<uuid>.<ext>` dari `ProjectForm.jsx`; file lama dihapus best-effort via `extractStoragePath()`.

**Ringkasan migrations**

1. `20260928000000_storage_portfolio_assets.sql` — membuat bucket dan 4 policy (select/insert/update/
   delete) di `storage.objects`, khusus folder `projects/` dan `private.is_admin()`.
2. `20261008000000_cv_builder_extensions.sql` — kolom tambahan di `profiles` (phone_number,
   full_address, instagram/linkedin/github_url, resume_link, hobbies) dan `experiences`
   (experience_type); tabel baru certifications, achievements, languages, organizations dengan RLS
   "publik SELECT, admin INSERT/UPDATE/DELETE".
3. `20261008010000_guestbook_schema.sql` — tabel `guestbooks`, RLS: publik SELECT & INSERT
   (`WITH CHECK (true)`), UPDATE/DELETE untuk **semua** user `authenticated`, plus 2 baris seed.

Catatan: fungsi `private.is_admin()` dan skema/RLS tabel dasar (profiles, projects, skills,
experiences, educations, messages) tidak ada di repo — dibuat langsung di dashboard Supabase.

## 5. Alur data utama

1. **Admin mengubah konten**: login di `/admin/login` → `AdminRoute` memverifikasi → form admin
   memanggil `supabase.from(<tabel>).insert/update/delete` → RLS mengecek `private.is_admin()`.
2. **Halaman publik membaca**: `PublicPortfolioPage` memanggil 10 hook baca secara paralel saat mount.
   Untuk projects, skills, experiences, educations, certifications, languages: **jika tabel kosong,
   data statis dari `portfolioData.js` yang tampil**; untuk profile, field kosong diisi dari data statis.
   Achievements dan organizations tidak punya cadangan.
   Kondisi database saat ini: profiles 1, projects 2, languages 2, tabel lain 0 baris — jadi skills,
   pengalaman, pendidikan, dan sertifikasi yang terlihat di situs berasal dari file statis, bukan CMS.
3. **Thumbnail project**: upload ke Storage → URL publik disimpan di `projects.thumbnail_url`.
4. **Pesan kontak**: `ContactForm` → INSERT `messages` → admin membaca di `/admin/messages`.
5. **Guestbook**: `GuestbookDrawer` → `useGuestbook.addEntry()` → INSERT `guestbooks`; admin membalas di
   `/admin/guestbook`. Bila query/insert gagal, hook diam-diam memakai data mock/lokal (lihat §10).

## 6. Cara menjalankan

```bash
npm install
# buat .env.local berisi:
#   VITE_SUPABASE_URL=<URL project Supabase>
#   VITE_SUPABASE_PUBLISHABLE_KEY=<publishable/anon key>
npm run dev       # http://localhost:5173
npm run lint      # oxlint
npm run build     # output ke dist/
npm run preview   # sajikan hasil build
```

Database: jalankan file di `supabase/migrations/` berurutan (SQL editor atau `supabase db push`).
Prasyarat yang tidak ada di repo: tabel dasar dan fungsi `private.is_admin()`.

## 7. Hasil build, lint, dan pengecekan localhost

| Cek | Sebelum cleanup | Sesudah cleanup |
|---|---|---|
| `npm run build` | Sukses, 162 modul | Sukses, 162 modul, hash bundle identik |
| Warning build | Chunk `index-*.js` 541 kB (154 kB gzip) > 500 kB | Sama |
| `npm run lint` | 0 error, 0 warning (60 file, 104 rule) | 0 error, 0 warning (56 file) |

Pengecekan browser (Chrome headless via DevTools Protocol, 1440×900):

- `/` — semua section render (hero, projects, about, skills, journey, contact, footer, guestbook),
  tidak ada gambar rusak, tidak ada scroll horizontal, tidak ada exception JS.
- Console: **404 pada `/rest/v1/guestbooks`** + warning "Guestbook table not available yet, using
  fallback data" — tabel guestbook belum dibuat di database.
- `/admin/login` — form login render normal.
- `/admin`, `/admin/guestbook` tanpa sesi — redirect ke `/admin/login` (benar).
- `/tidak-ada` — redirect ke `/` (benar).
- Hasil sebelum dan sesudah cleanup identik.

Catatan proses: percobaan menjalankan `npm run dev` kedua kali membuat Vite menghapus cache
`node_modules/.vite/deps` yang dipakai dev server yang sudah berjalan di port 5173, sehingga server itu
membalas 504 "Outdated Optimize Dep". Pengujian dilakukan di server terpisah port 5174. **Dev server di
5173 perlu di-restart** (Ctrl+C lalu `npm run dev`).

## 8. File dan dependency yang dihapus

Metode: grafik import dari `src/main.jsx` (termasuk `lazy()` dan import CSS), lalu grep nama file dan
nama export di seluruh repo, cek `index.html`/CSS `url()`/config, dan cek isi semua tabel publik
Supabase untuk path asset. Tidak ada `import.meta.glob` di project.

| File | Alasan |
|---|---|
| `src/components/ExperienceSection.jsx` | Tidak di-import di mana pun; digantikan tab di `JourneySection` |
| `src/components/EducationSection.jsx` | Sama |
| `src/components/CertificationsSection.jsx` | Sama (CSS-nya **tetap dipertahankan** karena di-import `JourneySection.jsx`) |
| `src/components/OrganizationsSection.jsx` | Sama |
| `src/assets/hero.png` | Sisa template Vite, 0 referensi |
| `src/assets/react.svg` | Sisa template Vite, 0 referensi |
| `src/assets/vite.svg` | Sisa template Vite, 0 referensi |
| `public/icons.svg` | Sprite template Vite, tidak direferensikan di kode, HTML, CSS, atau data Supabase |

Total 8 file. Tidak ada dependency yang di-uninstall: semua dependency runtime dipakai. Tidak ada file
yang perlu dikembalikan.

## 9. Perlu dicek manual

- **`@types/react` dan `@types/react-dom`** (devDependencies) — tidak di-import karena project JS murni;
  hanya membantu IntelliSense editor. Aman dihapus bila tidak dibutuhkan (`npm uninstall @types/react
  @types/react-dom`), dibiarkan karena ragu.
- **Export `trainingsData`** di `src/data/portfolioData.js` — tidak dipakai di mana pun. Bukan file
  terpisah sehingga tidak dihapus; bisa dibuang bila memang tidak direncanakan.
- **`PROJECT_SUMMARY.md`** masih menyebut keempat komponen section yang dihapus dan klaim yang sudah
  tidak sesuai (lihat §10). Tidak diubah sesuai instruksi; perlu diperbarui manual.
- **`.agent/rules/`** kosong.

## 10. Temuan dan saran perbaikan (urut prioritas)

1. **[Keamanan – tinggi] Signup publik aktif + policy guestbook terlalu longgar.** Siapa pun bisa
   mendaftar akun Supabase dan menjadi `authenticated`. Policy `guestbooks` mengizinkan UPDATE/DELETE
   untuk *semua* `authenticated` (`USING (true)`), jadi setelah tabel dibuat, orang asing bisa
   menghapus/mengedit seluruh guestbook. Saran: matikan signup (Auth → Providers → Email → "Allow new
   users to sign up") dan ubah policy menjadi `USING ((select private.is_admin()))`.
2. **[Keamanan – tinggi] Pengunjung bisa memalsukan balasan admin di guestbook.** Policy INSERT
   `WITH CHECK (true)` membuat anon bisa mengirim `admin_reply`, `admin_reply_at`, `is_pinned`, dan
   `avatar_color` sendiri lewat API langsung; UI akan menampilkannya sebagai balasan resmi
   "[DEV ALDI]" yang tersemat. Saran: `WITH CHECK (admin_reply IS NULL AND admin_reply_at IS NULL AND
   is_pinned = false)` plus constraint panjang (`char_length(message) <= 240`, nama ≤ 100) karena batas
   240 karakter saat ini hanya di client.
3. **[Bug – tinggi] Tabel `guestbooks` belum ada di database.** Migrasi ke-3 belum dijalankan. Akibatnya
   pengunjung melihat 2 entri mock, dan pesan yang mereka kirim "berhasil" padahal hanya tersimpan di
   state lokal lalu hilang saat reload. Saran: jalankan migrasi (setelah memperbaiki poin 1–2).
4. **[Bug – sedang] Kegagalan disembunyikan di `useGuestbook`.** `addEntry`, `replyEntry`, dan
   `deleteEntry` memperbarui state lokal walau Supabase mengembalikan error, sehingga admin mengira
   balasan/hapus berhasil. Fallback mock juga ikut terhitung di badge jumlah. Saran: tampilkan error
   ke pengguna dan hanya ubah state setelah sukses; batasi data mock ke mode development.
5. **[Keamanan/privasi – sedang] `profiles` dibaca publik dengan `select('*')`.** Kolom `user_id`
   (UUID akun admin), `email`, `phone_number`, dan `full_address` terbuka untuk siapa saja lewat API.
   Saran: pilih kolom eksplisit di `useProfile`, dan pertimbangkan view publik tanpa `user_id`/alamat
   lengkap, atau batasi SELECT kolom sensitif via RLS/view.
6. **[Kerapian DB – sedang] Skema tidak lengkap di repo.** Tabel dasar (profiles, projects, skills,
   experiences, educations, messages), RLS-nya, dan `private.is_admin()` tidak punya migrasi, sehingga
   database tidak bisa dibuat ulang dari repo dan RLS-nya tidak bisa direview. Saran:
   `supabase db pull` untuk menghasilkan migrasi baseline.
7. **[Alur data – sedang] CMS dan data statis bercampur diam-diam.** Skills, pengalaman, pendidikan,
   dan sertifikasi di situs saat ini berasal dari `portfolioData.js` karena tabelnya kosong. Mengisi
   satu baris di admin akan *menggantikan seluruh* daftar statis; menghapus semua baris
   mengembalikannya. Saran: migrasikan data statis ke database lalu hapus fallback, atau beri
   penanda jelas di dashboard admin.
8. **[Performa – sedang] Bundle publik 541 kB (154 kB gzip).** Supabase JS, React, dan router berada
   dalam satu chunk. Saran: pisahkan vendor chunk lewat `build.rolldownOptions.output` (codeSplitting),
   dan pertimbangkan lazy-load `GuestbookDrawer`/`CustomCursor`.
9. **[Keamanan – rendah] Upload `image/*` menerima SVG.** Bucket publik + MIME `image/*` mengizinkan
   SVG yang bisa berisi script bila dibuka langsung. Risiko kecil karena hanya admin yang upload, tapi
   lebih aman membatasi ke `image/png, image/jpeg, image/webp`. Ekstensi file juga diambil dari nama
   file, bukan dari MIME.
10. **[UX – rendah] Tombol "Login Admin" tampil di navbar publik** (`Navbar.jsx`, ditandai "temporary"
    di komentar), bertentangan dengan desain "Hidden Admin Entry" di PROJECT_SUMMARY. Hapus bila tidak
    disengaja.
11. **[Kerapian – rendah]**
    - README.md masih README template Vite; `package.json` bernama `my-react-app` versi `0.0.0`.
    - PROJECT_SUMMARY.md usang: menyebut komponen yang sudah tidak ada, jumlah rute dan file lama.
    - Fungsi `formatDate` diduplikasi di `JourneySection.jsx`, `AdminExperiencesPage.jsx`,
      `AdminGuestbookPage.jsx`; bisa dipindah ke `src/lib/`.
    - 11 hook data punya pola fetch/loading/error/refetch yang hampir sama; bisa diringkas jadi satu
      hook generik.
    - Belum ada test otomatis.

## 11. Perbaikan yang sudah dilakukan

Branch `fix/security-guestbook` (dari `main`, 15 Oktober 2026). Menindaklanjuti temuan §10 nomor 1–5
dan 10. **Migrasi belum dijalankan ke database**; harus dijalankan manual di SQL Editor Supabase.

| Temuan | Perbaikan | File |
|---|---|---|
| §10.1 UPDATE/DELETE guestbook untuk semua `authenticated` | Policy diganti menjadi khusus admin: UPDATE `USING`/`WITH CHECK ((select private.is_admin()))`, DELETE `USING ((select private.is_admin()))` (Postgres tidak mendukung `WITH CHECK` pada DELETE) | `supabase/migrations/20261008010000_guestbook_schema.sql` |
| §10.2 Pengunjung bisa memalsukan balasan admin | INSERT publik hanya jika `admin_reply IS NULL AND admin_reply_at IS NULL AND is_pinned = false`; `is_pinned` dan `created_at` menjadi `NOT NULL`; CHECK `char_length(name) <= 100` dan `char_length(message) <= 240`; 2 baris seed contoh dihapus | sama |
| §10.3 Tabel guestbook belum ada | File migrasi siap dijalankan (lihat di bawah) | sama |
| §10.4 Kegagalan disembunyikan | `addEntry`/`replyEntry`/`deleteEntry` hanya mengubah state setelah Supabase sukses dan melempar `Error` berisi pesan untuk pengguna bila gagal. `deleteEntry` juga mendeteksi hapus yang diblokir RLS (0 baris). Insert tidak lagi mengirim `admin_reply`, `is_pinned`, `created_at`. Data mock hanya dipakai saat `import.meta.env.DEV` (terverifikasi tidak ada di bundle produksi) | `src/hooks/useGuestbook.js` |
| §10.4 (UI) | Drawer publik dan halaman admin menampilkan pesan gagal (kirim, balas, hapus, dan gagal memuat) dengan style error baru | `GuestbookDrawer.jsx/.css`, `AdminGuestbookPage.jsx/.css`, `PublicPortfolioPage.jsx` |
| §10.5 `profiles` diambil dengan `select('*')` | Halaman publik mengambil 14 kolom eksplisit (tanpa `id`, `user_id`, `full_address`, `created_at`, `updated_at`). Admin memakai `useProfile({ includePrivateFields: true })` yang menambah `id` dan `full_address`. Tanpa `id` form admin akan meng-insert profil baru, bukan meng-update | `src/hooks/useProfile.js`, `src/pages/admin/AdminProfilePage.jsx` |
| §10.10 Tombol "Login Admin" di navbar | Dihapus beserta CSS-nya. `/admin/login` tetap bisa dibuka lewat URL | `src/components/Navbar.jsx/.css` |

**Verifikasi:** `npm run lint` 0 diagnostik (56 file); `npm run build` sukses (162 modul, bundle utama
540 kB). Di `http://localhost:5173/` (Chrome headless): semua section tampil, tombol "Login Admin" sudah
tidak ada, request `profiles` hanya memuat kolom publik, dan mengirim guestbook memunculkan "Gagal
mengirim pesan. Silakan coba lagi nanti." (wajar karena tabel belum ada). Entri tidak bertambah palsu,
dan body insert hanya berisi `name`, `message`, `avatar_color`. Tidak ada scroll horizontal di lebar 390 px.

**Masih terbuka / temuan baru selama perbaikan**

1. **Signup publik masih aktif** di Supabase Auth. Policy guestbook sudah aman, tapi tetap sebaiknya
   dimatikan di dashboard (Authentication → Sign In / Providers → Email → nonaktifkan "Allow new users
   to sign up").
2. **Membatasi kolom di client belum mengamankan data.** Siapa pun masih bisa memanggil REST API
   `profiles?select=*` dan mendapat `user_id` serta `full_address`. Perlindungan yang sebenarnya:
   `REVOKE SELECT (user_id, full_address) ON public.profiles FROM anon` (column privilege) atau view
   publik khusus.
3. **Alamat lengkap tetap tampil di halaman publik.** `PublicPortfolioPage` memakai cadangan
   `profileData.address` dari `src/data/portfolioData.js` saat `full_address` kosong, dan alamat itu
   memang sudah ikut di bundle JS publik. Kalau alamat tidak boleh publik, hapus dari file statis dan
   ubah `AboutSection` agar hanya menampilkan `location`.
4. **Link admin kedua di footer.** `Footer.jsx` punya ikon gembok kecil ke `/admin/login` (sengaja,
   "subtle discovery entry point"). Tidak diubah karena di luar permintaan.
5. **Class alert admin tidak punya style.** `admin-alert`, `admin-alert-success`, `admin-alert-error`,
   `admin-alert-banner`, `alert-banner-*` dipakai di 4 file halaman admin tapi tidak didefinisikan di CSS
   mana pun, jadi pesan sukses/gagal di sana tampil sebagai teks polos. Guestbook sudah memakai class
   baru; halaman admin lain belum.
6. **Insert guestbook masih bisa mengisi `avatar_color` dan `created_at` sendiri** lewat API langsung
   (misalnya `created_at` di masa depan agar selalu di urutan atas). Bisa ditambah ke `WITH CHECK`:
   `created_at <= now() + interval '1 minute'` dan validasi format warna.
