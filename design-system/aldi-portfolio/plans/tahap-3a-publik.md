# Rencana Tahap 3A — Halaman publik: struktur dan isi

> **Status:** disetujui pemilik project 18 Oktober 2026 (K1–K10, dengan catatan di §6a); Langkah 2 berjalan ·
> **Branch:** `feat/public-3a` (dari `main` 24d387f) · **Tanggal:** 18 Oktober 2026. Acuan: `BRIEF.md` (utama),
> `MASTER.md`, `pages/public.md`, `DESIGN.md` (ringkasan), `PRODUCT.md`.

**Cara melanjutkan bila konteks terputus:** baca file ini, cek `git status` dan `git log --oneline -5`, lalu
kerjakan butir pertama yang belum dicentang di §9 "Urutan commit". Setiap butir dicentang di commit yang sama
dengan pekerjaannya. Jangan mengulang pekerjaan yang sudah di-commit.

**Aturan:**
- React + Vite + CSS biasa (token Blueprint `--ds-*`). Tanpa Tailwind. i18n memakai context dan kamus buatan
  sendiri. **Tanyakan dulu** sebelum menambah library atau CDN apa pun (termasuk sumber logo teknologi).
- RLS, `authService`, logika `AdminRoute`, dan rute admin tidak diubah. Boleh menambah rute publik
  `/projects/:slug` dan halaman 404.
- Login dan admin tidak berubah, kecuali: (1) catatan sementara di `DisplaySettings` dihapus, (2) folder
  `.claude/` masuk daftar abaikan lint.
- Hook data publik: hanya baris `is_visible = true`, urut `sort_order`, kolom eksplisit. Nomor HP dan alamat
  lengkap tidak pernah diambil. URL tautan privat tidak dirender.
- Fitur 3B (label fisika, ayam dan bebek, layar pembuka, robot a+, suara) **tidak** dikerjakan; hanya ruangnya.
- Commit per bagian, jangan push atau merge, screenshot tidak di-commit. Tanpa skill huashu-design.

---

## 1. Ringkasan audit

### Kode publik sekarang
- `PublicPortfolioPage` memanggil 10 hook bersama admin (`useProjects()` dsb.) **tanpa filter `is_visible`**
  dan dengan kolom lama, lalu mencampur hasilnya dengan `src/data/portfolioData.js` (profil, proyek, keahlian,
  pengalaman, pendidikan, sertifikat, bahasa). Proyek tersembunyi dan data karangan bisa tampil.
- `AdminExperiencesPage` juga memakai `useProjects()` versi publik (untuk pilihan "Proyek terkait"). Karena itu
  hook lama **tidak diubah**; halaman publik mendapat hook sendiri (lihat §3), jadi query admin tetap sama.
- Tampilan lama: token lama (`--color-*`, `#3B82F6` 3,68:1, teks muted 4,08:1), font `'Inter'` yang tidak dimuat,
  emoji sebagai ikon (⚡ 🛡️ 🎓 💬 📍 📅 🟢), angka hero yang ditulis di kode ("3+ Solusi Web & IT Rilis"),
  teks bahasa campuran ("Open to Work", "Scroll to Explore"), kartu ID 3D, spotlight mouse, `CustomCursor` lama,
  ikon gembok ke `/admin/login` di footer, dan belum ada `prefers-reduced-motion`.
- Rute `*` sekarang mengalihkan ke `/` (belum ada 404). Tidak ada halaman detail proyek.
- Gaya dasar global di `index.css` (`html`, `h1–h6`, `p`, `a`, `.btn`, `.container`) dipakai login/admin juga,
  jadi **tidak diubah**. Gaya publik baru diberi awalan `.pub` (pola yang sama dengan `.adm`), dan latar
  `<html>` publik memakai `html:has(.pub)`.
- `index.html` sudah `lang="id"`. `App.css` hanya berisi kelas publik lama.

### Data asli (dibaca lewat API publik, 18 Oktober 2026, tanpa menulis)

| Tabel | Isi | Catatan untuk tampilan |
|---|---|---|
| profiles | nama, `primary_role` Junior Programmer, `secondary_roles` IT Support + IT Administrasi, bio, kota "Kota Kediri", email, GitHub, LinkedIn, Instagram, foto, `is_available` true, 5 hobi, 3 topik pesan | **`cv_file_url` dan `resume_link` kosong** → belum ada CV untuk diunduh. **`hero_keywords` kosong** → kata berganti belum punya isi. |
| projects | 4 tampil: AyamBebek (unggulan, `ayambebek`), Madura Mart (unggulan), Website Portofolio (unggulan), SI-Arsip (tidak unggulan) | Hanya SI-Arsip yang punya sampul dan galeri (5). **Deskripsi singkat Madura Mart dan Website Portofolio kosong.** AyamBebek punya 2 tautan privat tanpa URL. Hasil (`outcome`) semua kosong. |
| experiences | 2 tampil (CV Adisatya, Diskominfo), JF Interior disembunyikan | Belum ada logo. Keduanya terhubung ke proyek. |
| educations | Politeknik Negeri Malang, D3 MI, 2023–2026, IPK 3,54, logo, judul tugas akhir | — |
| certifications | 5 tampil, 3 unggulan | Belum ada gambar, PDF, atau tautan verifikasi. |
| skills | 56 dalam 7 kategori, 12 unggulan | **Belum ada ikon** (`icon_url` kosong). |
| languages | Indonesia (Penutur asli), Inggris (Menengah) | — |
| achievements, organizations | kosong | Section disembunyikan. |
| guestbooks | 1 entri | — |

---

## 2. Urutan section dan sketsa tata letak

**Usulan urutan** (beda dari daftar brief: Pengalaman dinaikkan ke atas Keahlian, supaya proyek nyata langsung
diikuti tempat proyek itu dikerjakan):

1. Navbar · 2. Hero + bar status · 3. Tentang · 4. Proyek · 5. Pengalaman · 6. Keahlian · 7. Pendidikan ·
8. Sertifikat · 9. Prestasi (bila ada) · 10. Organisasi (bila ada) · 11. Kontak · 12. Footer ·
tombol Buku tamu mengambang.

Tema mengikuti perangkat, bisa diganti (terang/gelap). Judul section memakai label mono bergaya tag blueprint
(mis. `[ PROYEK ]`) tanpa nomor urut (menghindari ciri "sidebar bernomor" situs referensi).

### Navbar (sticky)
```
1440 ┌──────────────────────────────────────────────────────────────────────────────┐
     │ [logo] Aldi Dwi Irawan   Tentang Proyek Pengalaman Keahlian Kontak  ◐  ID|US [Unduh CV] │
     └──────────────────────────────────────────────────────────────────────────────┘
375  ┌─────────────────────────────────────┐   ☰ membuka panel: menu, Unduh CV.
     │ [logo] Aldi      ◐  ID|US   ☰       │   Panel: role="dialog", fokus terkunci,
     └─────────────────────────────────────┘   Esc / pilih menu / ketuk luar menutup.
```

### Hero + bar status (BlueprintBackground `busy`)
```
1440 ┌───────────────────────────────────────┬──────────────────────────────────┐
     │ [● SIAP BEKERJA]                      │  ┌ PANGGUNG ─────────────────┐   │
     │ ALDI DWI                              │  │  [React.js]   [Laravel]   │   │
     │ IRAWAN                                │  │      [Flutter]  [Figma]   │   │
     │ Junior Programmer                     │  │  [PostgreSQL]   [</>]     │   │
     │ juga: IT Support · IT Administrasi    │  └───────────────────────────┘   │
     │ Membangun ▸ aplikasi web (berganti)   │  (label statis 3A, jadi label    │
     │ [ Unduh CV ]  [ Lihat proyek ]        │   fisika di 3B; aria-hidden)     │
     │ in LinkedIn   ⌥ GitHub                │                                  │
     ├───────────────────────────────────────┴──────────────────────────────────┤
     │ ● Siap bekerja   ⌖ Kota Kediri, ID   ▦ Sabtu, 18 Oktober 2026            │  ← bar status
     └──────────────────────────────────────────────────────────────────────────┘
375  [● SIAP BEKERJA] / ALDI DWI IRAWAN (2–3 baris) / peran / kata berganti /
     [Unduh CV] penuh lebar, [Lihat proyek] di bawahnya / LinkedIn · GitHub /
     panggung kecil (±160 px, 6 label) / bar status 2 baris.
```

### Tentang
```
1440 ┌──────────────┬───────────────────────────────────────────────┐
     │  foto 4:5    │ [ TENTANG ]  h2 "Tentang saya"                │
     │  (bracket    │ bio (≤ 70 karakter per baris)                 │
     │   sudut)     │ ┌Pendidikan──────┬Bahasa───────────┬Domisili┐ │
     │              │ │D3 MI · Polinema│Indonesia · asli │Kediri  │ │
     │              │ │IPK 3,54        │Inggris · menengah│       │ │
     │              │ └────────────────┴─────────────────┴────────┘ │
     │              │ Hobi: Sepak Bola · Futsal · …                 │
     └──────────────┴───────────────────────────────────────────────┘
375  foto (maks. 240 px) → judul → bio → 3 kotak fakta bertumpuk → hobi
```

### Proyek
```
1440 [ PROYEK ] h2 "Proyek unggulan" + 1 kalimat
     ┌──────────────────────┬──────────────────────────────────────┐
     │ sampul 16:10         │ [PRODUKSI] 2026 · Web · AyamBebek …  │   kartu studi kasus,
     │ (atau placeholder    │ h3 AyamBebek: Sistem Pengemasan …    │   satu per baris,
     │  berlogo + jenis)    │ deskripsi singkat (3 baris)          │   gambar kiri/kanan
     │                      │ [Figma][HTML][Tailwind]…  +4         │   bergantian
     │                      │ [ Lihat detail → ]                   │
     └──────────────────────┴──────────────────────────────────────┘
     Proyek lainnya: baris ringkas  SI-Arsip …  2025 · Web · Selesai  →
375  kartu bertumpuk: sampul di atas, isi di bawah; daftar ringkas jadi baris 2 tingkat
```

### Pengalaman (linimasa)
```
1440  Jan 2026 – Jul 2026 │ ◉ [logo] Programmer Intern            [MAGANG]
      (mono, kolom kiri)   │   CV Adisatya IT Consultant · Kediri
                           │   • poin tugas (maks. 5)
                           │   [Figma][HTML]… tag keahlian
                           │   → Lihat proyek: AyamBebek
375   rel di kiri, periode pindah ke atas judul
```

### Keahlian (baris berjalan, BRIEF §5)
```
1440 [ KEAHLIAN ] h2 "Keahlian"                         [⏸ Hentikan gerak]
     Frontend — Membangun tampilan web yang rapi …            11
     ◀ [◆HTML★] [◆CSS] [◆JavaScript★] [◆React.js★] [◆Vite] … ◀  (pelan, berhenti saat hover/fokus/sentuh)
     Backend — …                                               10
     ▶ [◆Python] [◆FastAPI] … ▶                                  (arah bergantian)
375  sama, satu baris per kategori; tanpa scroll samping halaman (overflow di baris saja)
```
- Unggulan: bingkai aksen + ikon bintang kecil (dengan teks "unggulan" untuk pembaca layar).
- Salinan kedua untuk efek berjalan `aria-hidden`; pembaca layar membaca satu `<ul>` statis per kategori.
- Reduced motion: tanpa salinan, daftar dibungkus (wrap) dan diam. Tab tersembunyi / di luar layar: berhenti.

### Pendidikan, Sertifikat, Prestasi, Organisasi
```
Pendidikan 1440: kartu lebar [logo] D3 Manajemen Informatika · Politeknik Negeri Malang
                 2023 – 2026 · IPK 3,54 · Tugas akhir: "…"
Sertifikat 1440: 3 kolom kartu (375: 1 kolom)
     ┌ gambar 4:3 (klik → lightbox) atau placeholder ikon kategori ┐
     │ [KOMPETENSI]  Sertifikat Kompetensi Pemrograman …           │
     │ LSP Politeknik Negeri Malang · Terbit Okt 2025              │
     │ Berlaku sampai Okt 2028 · Skor —                            │
     │ [Lihat PDF] [Verifikasi]   (hanya bila ada)                 │
     └─────────────────────────────────────────────────────────────┘
     Unggulan dulu; sisanya lewat [Lihat semua (2 lagi)] (aria-expanded, fokus ke kartu pertama yang baru).
Prestasi / Organisasi: daftar kartu sederhana; section tidak dirender bila datanya kosong.
```

### Kontak dan footer
```
1440 ┌──────────────────────────────┬────────────────────────────────┐
     │ [ KONTAK ] h2 "Hubungi saya" │ Nama*   Email*                 │
     │ ajakan 1–2 kalimat           │ Topik* [Pilih topik ▾]         │
     │ ✉ email (mailto)             │ Pesan*                         │
     │ in LinkedIn · ⌥ GitHub       │ [ Kirim pesan ]                │
     │ [ Unduh CV ]                 │ status sukses / gagal di sini  │
     └──────────────────────────────┴────────────────────────────────┘
375  bertumpuk: ajakan → kontak → formulir
Footer: [logo] Aldi Dwi Irawan · © 2026 · ikon GitHub, LinkedIn, Instagram, email · Kembali ke atas
        (ikon gembok admin dihapus; admin tetap lewat /admin/login).
Buku tamu: tombol mengambang kanan bawah "Buku tamu · 1" → panel kanan (HP: penuh), fokus terkunci.
```

### Halaman detail `/projects/:slug` (lazy)
```
1440 ← Kembali ke proyek
     [PRODUKSI]  h1 AyamBebek: Sistem Pengemasan dan Pelacakan Pesanan …
     2026 · Web · Klien: AyamBebek Pakan dan Ternak
     Peran saya: Frontend dan UI/UX konsol web …
     Dikerjakan saat magang di CV Adisatya IT Consultant  (→ #pengalaman)
     ┌ sampul (bila ada) ┐
     Masalah / Solusi / Hasil   (bagian kosong tidak tampil)
     Galeri: grid gambar + keterangan → lightbox (← →, Esc, geser di HP, tombol Tutup)
     Teknologi: tag
     Tautan proyek: [Kode ↗] (publik, tombol)  ·  🔒 Konsol web (seller-integration) · repo privat (label)
375  satu kolom; galeri 2 kolom
```
Judul tab: "{judul proyek} · Aldi Dwi Irawan". Slug tidak ada atau proyek disembunyikan → 404.

---

## 3. Pemetaan data

Semua query publik baru ada di `src/hooks/usePublicPortfolio.js` (beberapa query paralel; satu tabel gagal hanya
menyembunyikan section-nya) dan `usePublicProject(slug)`. Setiap query: kolom eksplisit, `.eq('is_visible', true)`
(bila tabel punya kolom itu), urut `sort_order`, lalu kolom cadangan.

| Section | Tabel → kolom |
|---|---|
| Hero, bar status, navbar CV | **profiles** → `full_name`, `primary_role`, `secondary_roles`, `hero_keywords`, `is_available`, `location`, `cv_file_url`, `resume_link`, `linkedin_url`, `github_url` · **skills** (unggulan) → `name` untuk label panggung |
| Tentang | **profiles** → `avatar_url`, `bio`, `full_name`, `location`, `hobbies` · **educations** (pertama yang tampil) → `degree`, `field_of_study`, `institution`, `gpa` · **languages** → `language_name`, `proficiency_level` |
| Proyek | **projects** → `id`, `slug`, `title`, `description`, `solution` (cadangan deskripsi, lihat K4), `thumbnail_url`, `status`, `year`, `project_type`, `client_name`, `tech_stack`, `is_featured`, `sort_order` |
| Detail proyek | **projects** (by `slug`) → kolom di atas + `my_role`, `problem`, `outcome`, `gallery`, `links`, `content` (lihat K8) · **experiences** → `company`, `experience_type` where `related_project_id = id` dan tampil |
| Pengalaman | **experiences** → `id`, `role`, `company`, `experience_type`, `location`, `start_date`, `end_date`, `is_current`, `responsibilities`, `skill_tags`, `logo_url`, `related_project_id` (+ judul dan slug proyek dari daftar proyek yang tampil; proyek tersembunyi → tanpa tautan) |
| Keahlian | **skills** → `id`, `name`, `category`, `icon_url`, `is_featured`, `sort_order` |
| Pendidikan | **educations** → `institution`, `degree`, `field_of_study`, `start_year`, `end_year`, `is_current`, `gpa`, `thesis_title`, `logo_url` |
| Sertifikat | **certifications** → `name`, `issuer`, `category`, `issue_date`, `expiry_date`, `no_expiry`, `score`, `image_url`, `pdf_url`, `credential_url`, `is_featured`, `sort_order` |
| Prestasi | **achievements** → `title`, `event_name`, `month`, `year`, `description`, `photo_url`, `document_url` |
| Organisasi | **organizations** → `name`, `role`, `start_date`, `end_date`, `description`, `logo_url` |
| Kontak | **profiles** → `email`, `linkedin_url`, `github_url`, `cv_file_url`, `resume_link`, `contact_topics` · insert **messages** → `name`, `email`, `topic`, `message` |
| Buku tamu | `useGuestbook()` yang ada (tidak diubah) |
| Footer | **profiles** → `full_name`, `github_url`, `linkedin_url`, `instagram_url`, `email` |

- **Tidak pernah diambil:** `phone_number`, `full_address`, `user_id`. CV = `cv_file_url`, cadangannya
  `resume_link` (admin menulis nilai yang sama ke `resume_link` dan `resume_url`, jadi `resume_url` tidak perlu).
- **Tautan privat:** `url` dibuang dari objek tautan privat tepat setelah data diterima, jadi tidak pernah masuk
  DOM. (Catatan: kolom `links` tetap bisa dibaca lewat API, seperti tercatat di `pages/admin.md` §11.)
- Kode pilihan diterjemahkan lewat kamus: status, jenis proyek, kategori sertifikat, jenis tautan; label lama
  (jenis pengalaman, kategori keahlian, tingkat bahasa) dipetakan ke teks EN.
- `src/data/portfolioData.js` dan semua logika cadangan dihapus. Profil gagal dimuat → hero menampilkan pesan
  singkat + "Coba lagi", bukan data karangan.

---

## 4. Komponen

**Dipakai ulang:** `Logo` (navbar, footer, placeholder sampul), `ViewfinderCursor`, `BlueprintBackground`
(`busy`, hero), `usePrefersReducedMotion`, `usePageHidden`, `useGuestbook`, klien Supabase.

**Baru** (`src/components/public/`, CSS per komponen berawalan `.pub`):

| Komponen | Isi |
|---|---|
| `PublicRoot` | pembungkus `.pub` + `data-theme`, `ThemeProvider`, `I18nProvider`, kursor, tautan "Lewati ke konten" |
| `ThemeProvider` / `ThemeToggle` | ikut `prefers-color-scheme`, tombol ganti, simpan di `localStorage` (try/catch); skrip kecil di `index.html` memasang tema sebelum render pertama **hanya di luar `/admin`** (mencegah kilatan) |
| `I18nProvider` / `LangToggle` / `useT()` | kamus `src/i18n/id.js` + `en.js`, interpolasi `{nama}`, `Intl.DateTimeFormat` per bahasa, `<html lang>` ikut berubah (dikembalikan ke `id` saat keluar dari halaman publik) |
| `PublicNavbar` | menu section, tema, bahasa, Unduh CV; panel HP dengan fokus terkunci |
| `HeroSection`, `StatusBar`, `KeywordRotator`, `HeroStage` | hero, bar status, kata berganti (diam saat reduced motion, `aria-live="off"` + teks lengkap untuk pembaca layar), ruang 3B |
| `AboutSection` | foto, bio, fakta pendidikan/bahasa/domisili, hobi |
| `ProjectsSection`, `ProjectCaseCard`, `ProjectRow`, `ProjectCover` | kartu studi kasus, daftar ringkas, sampul/placeholder ukuran tetap |
| `SkillsSection`, `SkillMarquee`, `TechLogo` | baris berjalan per kategori, tombol jeda, logo/ikon umum |
| `ExperienceSection`, `EducationSection` | linimasa, kartu pendidikan |
| `CertificatesSection`, `CertificateCard` | unggulan + "Lihat semua", lightbox gambar |
| `AchievementsSection`, `OrganizationsSection` | hanya dirender bila ada data |
| `ContactSection`, `ContactForm` | ajakan, kontak, formulir dengan topik |
| `GuestbookButton`, `GuestbookDrawer` (lazy) | tombol mengambang + panel Blueprint |
| `PublicFooter` | logo, hak cipta, tautan sosial, kembali ke atas |
| `Section`, `Tag`, `Badge`, `Skeleton`, `Lightbox`, `ProjectLinks`, `icons.jsx` | bagian bersama (ikon SVG satu gaya, stroke 1,8) |
| `ProjectDetailPage` (lazy), `NotFoundPage` | halaman detail dan 404 |

**Dihapus setelah diganti:** `CustomCursor`, `Navbar`, `HeroSection`, `AboutSection`, `ProjectsSection`,
`ProjectCard`, `SkillsSection`, `SkillCard`, `TechBadge`, `JourneySection`, `TimelineItem`, `SectionTitle`,
`ContactSection`, `ContactForm`, `GuestbookDrawer` lama, `Footer` lama, CSS-nya (`TimelineContainer.css`,
`CertificationsSection.css`, …), isi publik `App.css`, dan `src/data/portfolioData.js`.

---

## 5. Kunci teks i18n (ID / EN)

Isi konten dari database tetap bahasa Indonesia sampai 3c. Daftar lengkap ada di kamus; ringkasnya:

| Kunci | ID | EN |
|---|---|---|
| `meta.title` | Aldi Dwi Irawan · Portofolio | Aldi Dwi Irawan · Portfolio |
| `common.skip` / `common.loading` / `common.retry` / `common.close` | Lewati ke konten / Memuat… / Coba lagi / Tutup | Skip to content / Loading… / Try again / Close |
| `common.newTab` / `common.backToTop` | (tab baru) / Kembali ke atas | (new tab) / Back to top |
| `common.sectionError` | Bagian ini belum bisa dimuat. | This section could not be loaded. |
| `nav.label` / `nav.open` / `nav.closeMenu` | Navigasi utama / Buka menu / Tutup menu | Main navigation / Open menu / Close menu |
| `nav.about` · `nav.projects` · `nav.experience` · `nav.skills` · `nav.certificates` · `nav.contact` | Tentang · Proyek · Pengalaman · Keahlian · Sertifikat · Kontak | About · Projects · Experience · Skills · Certificates · Contact |
| `theme.toLight` / `theme.toDark` | Ganti ke tema terang / Ganti ke tema gelap | Switch to light theme / Switch to dark theme |
| `lang.switch` | Ganti bahasa ke English | Ganti bahasa ke Indonesia (Switch to Indonesian) |
| `cv.download` / `cv.unavailable` | Unduh CV / (tombol tidak tampil, lihat K2) | Download CV |
| `hero.available` / `hero.also` / `hero.building` | Siap bekerja / Juga: / Membangun | Open to work / Also: / Building |
| `hero.viewProjects` / `hero.contact` | Lihat proyek / Hubungi saya | View projects / Contact me |
| `hero.profileError` | Profil belum bisa dimuat. | The profile could not be loaded. |
| `status.location` / `status.today` | Lokasi / Hari ini | Location / Today |
| `about.title` · `about.education` · `about.languages` · `about.basedIn` · `about.hobbies` · `about.gpa` · `about.photoAlt` | Tentang saya · Pendidikan · Bahasa · Domisili · Hobi · IPK {gpa} · Foto {name} | About me · Education · Languages · Based in · Hobbies · GPA {gpa} · Photo of {name} |
| `projects.title` · `projects.intro` · `projects.others` · `projects.detail` · `projects.moreTech` · `projects.client` | Proyek unggulan · Studi kasus dari pekerjaan nyata. · Proyek lainnya · Lihat detail · +{n} · Klien | Featured projects · Case studies from real work. · Other projects · View details · +{n} · Client |
| `detail.back` · `detail.myRole` · `detail.problem` · `detail.solution` · `detail.outcome` · `detail.gallery` · `detail.tech` · `detail.links` · `detail.technical` | Kembali ke proyek · Peran saya · Masalah · Solusi · Hasil · Galeri · Teknologi · Tautan proyek · Detail teknis | Back to projects · My role · Problem · Solution · Outcome · Gallery · Technologies · Project links · Technical details |
| `detail.repoPrivate` / `detail.private` / `detail.builtDuring` | repo privat / privat / Dikerjakan saat {jenis} di {instansi} | private repo / private / Built during my {type} at {company} |
| `lightbox.label` · `lightbox.counter` · `lightbox.prev` · `lightbox.next` · `lightbox.open` | Penampil gambar · {n} dari {total} · Sebelumnya · Berikutnya · Perbesar gambar | Image viewer · {n} of {total} · Previous · Next · Enlarge image |
| `skills.title` · `skills.intro` · `skills.pause` · `skills.play` · `skills.featured` · `skills.count` | Keahlian · … · Hentikan gerak · Jalankan lagi · unggulan · {n} keahlian | Skills · … · Pause motion · Resume motion · featured · {n} skills |
| `skills.cat.frontend.desc` | Membangun tampilan web yang rapi dan nyaman dipakai di HP maupun komputer. | Building clean web interfaces that work well on phones and computers. |
| `skills.cat.backend.desc` | Menyiapkan server, API, dan logika aplikasi di balik layar. | Building the servers, APIs, and logic behind an app. |
| `skills.cat.mobile.desc` | Membuat aplikasi mobile untuk kebutuhan kerja sehari-hari. | Building mobile apps for everyday work. |
| `skills.cat.database.desc` | Merancang dan mengelola basis data agar data rapi dan cepat dicari. | Designing and managing databases so data stays tidy and easy to find. |
| `skills.cat.network.desc` | Memasang jaringan, merawat perangkat, dan membantu pengguna saat ada kendala. | Setting up networks, maintaining devices, and helping users with problems. |
| `skills.cat.tools.desc` | Perangkat kerja harian untuk desain, kode, dan kerja tim. | Everyday tools for design, code, and teamwork. |
| `skills.cat.soft.desc` | Cara kerja yang membuat kerja sama tim berjalan lancar. | Working habits that keep teamwork running smoothly. |
| `experience.title` · `experience.present` · `experience.viewProject` · `experience.tasks` · `experience.skills` | Pengalaman · sekarang · Lihat proyek: {title} · Tugas · Keahlian yang dipakai | Experience · present · View project: {title} · Responsibilities · Skills used |
| `education.title` · `education.thesis` | Pendidikan · Tugas akhir | Education · Final project |
| `certificates.title` · `.showAll` · `.showLess` · `.issued` · `.validUntil` · `.noExpiry` · `.expired` · `.score` · `.pdf` · `.verify` | Sertifikat · Lihat semua ({n} lagi) · Tampilkan lebih sedikit · Terbit {date} · Berlaku sampai {date} · Tidak kedaluwarsa · Kedaluwarsa {date} · Skor {score} · Lihat PDF · Verifikasi | Certificates · Show all ({n} more) · Show fewer · Issued {date} · Valid until {date} · No expiry · Expired {date} · Score {score} · View PDF · Verify |
| `achievements.title` / `organizations.title` | Prestasi / Organisasi | Achievements / Organizations |
| `contact.title` · `contact.intro` · `contact.email` | Hubungi saya · Terbuka untuk tawaran kerja dan kerja sama proyek. · Email | Get in touch · Open to job offers and project collaboration. · Email |
| `form.name` · `form.email` · `form.topic` · `form.topicPick` · `form.message` · `form.send` · `form.sending` | Nama · Email · Topik · Pilih topik · Pesan · Kirim pesan · Mengirim… | Name · Email · Topic · Choose a topic · Message · Send message · Sending… |
| `form.required` · `form.badEmail` · `form.success` · `form.failed` | {field} wajib diisi. · Format email belum benar, misalnya nama@contoh.com. · Pesan terkirim. Terima kasih, saya akan membalas lewat email. · Pesan belum terkirim. Periksa koneksi internet, lalu coba lagi. | {field} is required. · Please enter a valid email, e.g. name@example.com. · Message sent. Thank you, I will reply by email. · Message not sent. Check your connection and try again. |
| `guestbook.open` · `.count` · `.title` · `.intro` · `.name` · `.message` · `.send` · `.sent` · `.empty` · `.reply` · `.pinned` · `.charsLeft` · `.loadError` | Buku tamu · {n} pesan · Buku tamu · Tinggalkan salam atau kesan singkat. · Nama · Pesan · Kirim · Terkirim, terima kasih! · Belum ada pesan. Jadilah yang pertama! · Balasan Aldi · Disematkan · Sisa {n} karakter · Buku tamu belum bisa dimuat. | Guestbook · {n} messages · Guestbook · Leave a short hello or impression. · Name · Message · Send · Sent, thank you! · No messages yet. Be the first! · Reply from Aldi · Pinned · {n} characters left · The guestbook could not be loaded. |
| `footer.rights` · `footer.social` | © {year} {name}. · Tautan sosial | © {year} {name}. · Social links |
| `notFound.title` · `.text` · `.home` · `.projectTitle` | Halaman tidak ditemukan · Alamat ini tidak ada atau sudah dipindah. · Ke beranda · Proyek tidak ditemukan | Page not found · This address does not exist or has moved. · Go to home · Project not found |
| `code.status.*` | Produksi · Selesai · Tugas akhir · Dalam pengembangan · Konsep | In production · Completed · Final project · In development · Concept |
| `code.type.*` | Web · Mobile · Desktop · Jaringan · Lainnya | Web · Mobile · Desktop · Network · Other |
| `code.cert.*` | Kompetensi · Jaringan · Bahasa · Pelatihan · Magang | Competency · Networking · Language · Training · Internship |
| `code.link.*` | Kode · Demo · Dokumentasi · Video · Lainnya | Code · Demo · Docs · Video · Other |
| `code.exp.*` (Magang, Kerja, Freelance, Organisasi) | Magang · Kerja · Freelance · Organisasi | Internship · Work · Freelance · Organization |
| `code.skillCat.*` (7 kategori) | Frontend · Backend · Mobile · Database · Jaringan & IT Support · Tools · Soft skill | Frontend · Backend · Mobile · Database · Networking & IT Support · Tools · Soft skills |
| `code.langLevel.*` | Penutur asli · Aktif · Menengah · Dasar | Native · Fluent · Intermediate · Basic |

Tanggal: `id-ID` ("Sabtu, 18 Oktober 2026", "Okt 2026") dan `en-US` ("Saturday, October 18, 2026", "Oct 2026").

---

## 6. Keputusan yang butuh jawaban Anda

Setiap butir punya usulan bawaan; cukup jawab "setuju" atau pilih yang lain.

**K1. Sumber logo teknologi (wajib dijawab).** Dicek untuk 56 keahlian Anda:

| Pilihan | Cakupan | Catatan |
|---|---|---|
| **A. Subset Simple Icons disalin ke repo** (usulan) | 40/56 | Lisensi CC0. Sekitar 40 path SVG disimpan sebagai file JS sendiri (±40–60 kB sebelum gzip, dimuat bersama section keahlian). Tanpa library dan tanpa CDN saat situs dibuka. Satu warna (`currentColor`), jadi terbaca di tema terang dan gelap (logo hitam seperti Next.js tidak hilang di tema gelap). Yang tidak ada (UI/UX, Alembic, REST API, SQL, Windows Server, VS Code, Canva, Microsoft Office, 4 keahlian jaringan, 4 soft skill) memakai ikon umum per kategori. Perlu sekali unduh dari npm/GitHub saat pengerjaan. |
| B. Paket npm `simple-icons` | 40/56 | Hasil sama dengan A, tetapi menambah dependency. |
| C. Devicon lewat CDN (jsDelivr) | 35/56 | Logo berwarna asli; setiap pengunjung memuat file dari CDN luar; beberapa logo gelap sulit terlihat di tema gelap. |
| D. Tanpa logo merek | 0/56 | Ikon umum per kategori untuk semua keahlian. |

Apa pun pilihannya, **ikon yang Anda unggah di admin (`icon_url`) selalu dipakai lebih dulu.**

**K2. CV belum ada** (`cv_file_url` dan `resume_link` kosong). Usulan: selama kosong, tombol "Unduh CV" tidak
tampil; tombol utama hero menjadi "Hubungi saya" (ke Kontak). Begitu CV diunggah di Profil, "Unduh CV" muncul
otomatis di hero, navbar, dan Kontak. Mohon unggah CV PDF di admin.

**K3. Kata berganti kosong** (`hero_keywords`). Usulan: baris "Membangun …" tidak tampil sampai diisi di Profil
(contoh isi: aplikasi web, aplikasi mobile, sistem informasi). Tidak memakai kata karangan.

**K4. Deskripsi singkat kosong** (Madura Mart, Website Portofolio). Usulan: kartu memakai potongan teks Solusi
(maks. 3 baris) bila deskripsi kosong. Sebaiknya Anda isi deskripsinya di admin.

**K5. Panggung hero di 3A.** Usulan: berisi label statis dari keahlian unggulan (data asli, maks. 8 di desktop dan
6 di HP) dalam bingkai blueprint; di 3B label ini menjadi label fisika. Alternatif: bingkai kosong, atau foto.

**K6. Tombol "Hentikan gerak" untuk baris keahlian.** Selain berhenti saat hover/fokus/sentuh, WCAG 2.2.2 meminta
cara menghentikan gerak yang berjalan lebih dari 5 detik. Usulan: satu tombol di judul section (pilihan diingat
selama kunjungan).

**K7. Urutan section** seperti §2 (Pengalaman sebelum Keahlian). Setuju, atau ikuti urutan brief?

**K8. "Penjelasan lengkap" (`content`) di halaman detail.** SI-Arsip berisi langkah instalasi panjang. Usulan:
tampil paling bawah sebagai bagian yang bisa dibuka-tutup ("Penjelasan lengkap"), teks biasa dengan baris baru
dipertahankan.

**K9. Formulir kontak tanpa kolom Subjek** (Topik menggantikannya; admin menampilkan topik sebagai badge dan
"(Tanpa subjek)" di judul). Atau tetap ada Subjek opsional?

**K10. Bahasa bawaan Indonesia** (tidak mengikuti bahasa browser); format tanggal EN gaya US. Hobi tetap tampil
kecil di Tentang. Navbar desktop punya tombol "Unduh CV" (bila CV ada).

## 6a. Jawaban pemilik project (18 Oktober 2026)

Semua usulan K1–K10 disetujui, dengan catatan:

- **K1:** pilihan A (subset Simple Icons di repo). Ikon yang diunggah di admin (`icon_url`) tetap dipakai lebih
  dulu daripada logo bawaan.
- **K2:** selain di hero dan navbar, tombol "Unduh CV" juga muncul di section Kontak begitu CV diunggah.
- **K8:** bagian `content` di halaman detail berjudul **"Detail teknis"** (EN "Technical details") dan
  **tertutup secara bawaan**. Kunci `detail.fullStory` diganti `detail.technical`.

---

## 7. Hal teknis yang sudah diputuskan

- **Tema:** token `--ds-*` gelap/terang yang sudah ada. Nama di hero: gradien sky→emerald hanya di tema gelap
  (kontras terpenuhi); di tema terang memakai tinta aksen (`--ds-accent-text`), karena sky di latar terang <3:1.
- **Tanpa kilatan tema:** skrip inline kecil di `index.html` membaca pilihan tersimpan / `prefers-color-scheme`
  dan memasang `data-pub-theme` di `<html>` **hanya bila alamat bukan `/admin`**. Login dan admin tidak tersentuh.
- **CSS publik** berawalan `.pub`; aturan global `h1–h6`, `p`, `a` dinetralkan di dalam `.pub` lewat `:where()`.
- **404:** rute `*` menampilkan `NotFoundPage` (sebelumnya mengalihkan ke `/`). Alamat admin yang tidak dikenal
  ikut melihat 404 dengan tautan ke beranda; rute admin yang ada tidak berubah.
- **Performa:** `ProjectDetailPage`, `GuestbookDrawer`, `Lightbox`, dan data logo di-lazy-load. Gambar
  `loading="lazy"`, `decoding="async"`, dan bingkai `aspect-ratio` tetap (tanpa pergeseran tata letak).
- **Gerak:** hanya `transform`/`opacity`; baris keahlian, kata berganti, dan latar berhenti saat tab tersembunyi
  atau di luar layar, dan diam total saat reduced motion.
- **Aksesibilitas:** satu `h1` per halaman, `h2` per section, landmark `header`/`nav`/`main`/`footer`, fokus 2 px
  di semua kontrol, target ≥44 px, panel (menu HP, buku tamu, lightbox) dengan fokus terkunci dan Esc.

---

## 8. Pengujian

- Supabase tiruan (Chrome headless, data di memori) dengan data asli Anda sebagai contoh, plus variasi: setiap
  tabel kosong, profil gagal dimuat, proyek tersembunyi, slug tidak ada.
- 375 / 768 / 1024 / 1440 × tema terang/gelap × ID/EN: tanpa scroll samping, kontras ≥4,5:1 dari computed style.
- Keyboard penuh (menu HP, toggle, lightbox, drawer, formulir), reduced motion (baris keahlian diam, tanpa salinan),
  pembaca layar untuk daftar keahlian (satu daftar statis terbaca, salinan `aria-hidden`).
- Detail: slug valid, slug tidak ada → 404, tautan privat tanpa `href` dan URL-nya tidak ada di DOM.
- Kontak: topik tersimpan ke `messages.topic`; buku tamu tetap bisa mengirim dan menampilkan balasan.
- Login dan admin dibandingkan dengan `main` (computed style, posisi, teks, query); yang boleh beda hanya catatan
  sementara di blok tampilan.
- `npm run lint` dan `npm run build`. Screenshot sebelum/sesudah di
  `C:\Users\acer\portofolio-screenshots\tahap-3a\` (tidak di-commit).

---

## 9. Urutan commit

- [x] 0. Rencana ini (`plans/tahap-3a-publik.md`)
- [x] 1. Fondasi: lint abaikan `.claude/`, hapus catatan sementara `DisplaySettings`, akar `.pub` + tema
      (provider, tombol, skrip anti-kilatan), i18n (provider, kamus ID/EN, format tanggal), rute
      `/projects/:slug` dan 404 (kerangka)
- [x] 2. Data: `usePublicPortfolio` + `usePublicProject`; hapus `portfolioData.js` dan logika cadangan
- [x] 3. Kerangka: navbar (menu HP, tema, bahasa, CV), footer, `ViewfinderCursor` (hapus `CustomCursor`), skeleton
- [x] 4. Hero + bar status + panggung 3B
- [x] 5. Tentang
- [x] 6. Proyek (kartu studi kasus + daftar ringkas)
- [x] 7. Keahlian (baris berjalan + logo sesuai K1)
- [x] 8. Pengalaman + Pendidikan
- [x] 9. Sertifikat (+ lightbox) + Prestasi + Organisasi
- [x] 10. Kontak (formulir + topik)
- [x] 11. Buku tamu (tombol + panel Blueprint, lazy)
- [ ] 12. Halaman detail proyek + 404
- [ ] 13. Bersihkan komponen dan CSS lama
- [ ] 14. Uji otomatis + perbaikan
- [ ] 15. Dokumentasi (`pages/public.md`, `MASTER.md`, `PRODUCT.md`), uji manual, laporan
