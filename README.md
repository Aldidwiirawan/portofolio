# Portofolio Aldi Dwi Irawan

Situs portofolio pribadi dengan panel admin untuk mengelola seluruh isinya.

- **Halaman publik** (`/`, `/projects/:slug`): profil, proyek sebagai studi kasus, keahlian, rekam jejak, kontak, dan
  buku tamu. Dua bahasa (Indonesia/Inggris) dan dua tema (gelap/terang).
- **Panel admin** (`/admin`, masuk lewat `/admin/login`): satu akun admin, semua isi diatur tanpa mengubah kode.

Design system "Blueprint" dan semua keputusan desain ada di `design-system/aldi-portfolio/` (`BRIEF.md`, `MASTER.md`,
`pages/*.md`, rencana per tahap di `plans/`).

## Teknologi

React 19, Vite 8, react-router-dom 7, CSS biasa dengan CSS variables (tanpa Tailwind/framework UI), Supabase
(database, Auth, Storage), matter-js (label fisika di hero, dimuat terpisah), font Inter dan JetBrains Mono
self-hosted (Fontsource). Online di Vercel dengan satu fungsi (`api/github-contributions.js`).

## Menjalankan di komputer sendiri

1. Pasang Node.js 20.19+ atau 22.12+ (syarat Vite 8), lalu `npm install`.
2. Buat file `.env.local` di folder proyek:

   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=kunci-publishable-dari-dashboard-supabase
   ```

   `VITE_SITE_URL` (alamat situs online) tidak wajib di lokal; tanpanya build tidak membuat `sitemap.xml` dan alamat
   kanonis. Jangan pernah memakai kunci `service_role`/secret di sini.
3. Perintah:

   | Perintah | Fungsi |
   | --- | --- |
   | `npm run dev` | server pengembangan di `http://localhost:5173` |
   | `npm run build` | build produksi ke `dist/` (juga membuat `robots.txt`, `sitemap.xml`, dan memeriksa hash CSP) |
   | `npm run preview` | menjalankan hasil build |
   | `npm run lint` | pemeriksaan kode (oxlint) |

Grafik kontribusi GitHub hanya muncul setelah online di Vercel dengan `GITHUB_TOKEN`; di `npm run dev` grafik itu
memang tidak tampil.

## Struktur

```
api/github-contributions.js   fungsi Vercel: kalender kontribusi GitHub (token hanya di server)
public/                       logo, ikon, og-image.png (pratinjau tautan)
src/
  main.jsx, App.jsx           titik masuk dan rute (admin dimuat terpisah: AdminShell, AdminPage)
  components/public/          halaman publik (hero, section, buku tamu, karakter, robot, SEO)
  components/admin/           kerangka dan komponen admin
  components/brand, effects/  logo, robot a+, kursor viewfinder, latar blueprint, transisi jepret
  pages/                      halaman publik (beranda, detail proyek, 404) dan pages/admin/*
  hooks/                      usePublicPortfolio, usePublicGuestbook (publik); use* lain untuk admin
  lib/                        publicApi.js (REST untuk publik), supabaseClient.js + authService.js (admin),
                              kompresi gambar, cek PDF, dll.
  i18n/                       kamus Indonesia/Inggris dan kalimat karakter
supabase/migrations/          perubahan database (dijalankan manual, berurutan)
supabase/seed/                isi awal dari CV dan draf terjemahan Inggris
design-system/aldi-portfolio/ brief, design system, override per halaman, rencana per tahap, sumber og-image
vercel.json, DEPLOY.md        pengaturan dan panduan online di Vercel
```

## Database

File di `supabase/migrations/` mencatat perubahan database sejak 28 September 2026. Jalankan **berurutan** lewat
Supabase → SQL Editor. File sejak tahap 2B (16 Oktober) dibungkus `BEGIN … COMMIT`, aman dijalankan ulang, dan
diakhiri query cek.

| File | Isi |
| --- | --- |
| `20260928000000_storage_portfolio_assets.sql` | bucket `portfolio-assets` dan aturannya |
| `20261008000000_cv_builder_extensions.sql` | kolom tambahan isi portofolio |
| `20261008010000_guestbook_schema.sql` | tabel buku tamu |
| `20261016000000_admin_content_model.sql` | model isi admin (tampil/unggulan, urutan, dll.) |
| `20261018000000_project_links.sql` | `projects.links` (beberapa tautan per proyek) |
| `20261019000000_english_content.sql` | kolom versi Inggris (`*_en`) dan `profiles.hero_labels` |

`supabase/seed/` bukan migrasi: `isi-awal-dari-cv.sql` menambah isi dari CV (baris yang namanya sudah ada
dilewati), `terjemahan-en.sql` mengisi kolom `_en` (baris yang teks Indonesianya sudah berubah dilewati).

Halaman publik hanya membaca baris `is_visible = true` dengan kolom yang disebut satu per satu; nomor HP dan alamat
lengkap tidak pernah diambil. `is_visible` mengatur tampilan, bukan privasi.

## Online (Vercel)

Langkah lengkap dalam bahasa Indonesia sederhana ada di **[DEPLOY.md](DEPLOY.md)**: impor repo, variabel lingkungan,
token GitHub, Supabase Auth, daftar periksa setelah online, redeploy untuk sitemap, domain sendiri, dan catatan CSP.
