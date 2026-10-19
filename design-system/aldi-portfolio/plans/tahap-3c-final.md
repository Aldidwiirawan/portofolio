# Rencana Tahap 3C — Penyempurnaan dan persiapan online

> **Status:** rencana, menunggu persetujuan pemilik · **Branch:** `feat/public-3c` (dari `main` 90e9387, sudah berisi
> 3B) · **Tanggal:** 19 Oktober 2026. Acuan: `BRIEF.md` (utama), `MASTER.md`, `pages/public.md`, `pages/admin.md`,
> `DESIGN.md`, `PRODUCT.md`, `plans/tahap-3a-publik.md`, `plans/tahap-3b-publik.md`.

**Cara melanjutkan bila konteks terputus:** baca file ini, cek `git status` dan `git log --oneline -5`, lalu
kerjakan butir pertama yang belum dicentang di §9. Setiap butir dicentang di commit yang sama dengan pekerjaannya.
Jangan mengulang pekerjaan yang sudah di-commit. **Setelah bagian A (butir A1–A7): berhenti**, laporkan isi migrasi
dan tabel draf terjemahan, tunggu pemilik menjalankan migrasi dan file terjemahan.

**Keputusan pemilik (sudah):** hosting Vercel dengan alamat gratis `*.vercel.app` dulu; draf terjemahan Inggris
dibuat asisten lalu dicek pemilik sebelum disimpan; grafik kontribusi GitHub tampil di halaman publik.

**Aturan:**
- React + Vite + CSS biasa (Blueprint), tanpa Tailwind. **Tanya dulu** sebelum menambah library, CDN, layanan pihak
  ketiga, atau API eksternal (keputusan K5, K8 di §8).
- Database hanya lewat file migrasi **baru** (aman dijalankan ulang, `BEGIN … COMMIT`, query cek setelah `COMMIT`).
  Asisten tidak menjalankan SQL apa pun; pemilik yang menjalankan.
- RLS dan `authService` tidak diubah. Nomor HP dan alamat lengkap tetap tidak pernah diambil halaman publik.
- Commit per bagian, jangan push atau merge. Tanpa skill huashu-design.

---

## 1. Ringkasan audit (19 Oktober 2026)

### Isi saat ini (dibaca lewat API publik, hanya GET, tanpa nomor HP/alamat)

| Tabel | Isi yang tampil | Catatan untuk versi Inggris |
|---|---|---|
| profiles | tagline "Junior Programmer · Web & Mobile", bio 3 kalimat, peran utama + 2 peran pendukung, 3 kata berganti, 3 topik pesan, 5 hobi, CV PDF sudah ada, `github_username` = Aldidwiirawan | `tagline` belum dipakai di halaman publik |
| projects | 4 tampil (3 unggulan) | AyamBebek: tim disebut di peran dan solusi; SI-Arsip: "Detail teknis" panjang (panduan instalasi, ada emoji); 5 keterangan galeri; 3 label tautan; semua `outcome` kosong |
| experiences | 2 tampil (Adisatya, Diskominfo), JF Interior disembunyikan | 3 poin tugas masing-masing; `description` ("Ringkasan" di admin) kosong dan belum tampil di publik |
| educations | 1 (Politeknik Negeri Malang, D3 Manajemen Informatika, judul tugas akhir) | — |
| certifications | 5 tampil | 4 nama sudah berbahasa Inggris; "Sertifikat Kompetensi Pemrograman Software Komputer" perlu versi Inggris |
| languages | Bahasa Indonesia (Penutur asli), Bahasa Inggris (Menengah) | nama bahasa masih bahasa Indonesia di mode US; tingkat sudah diterjemahkan kamus |
| skills | 56 | nama teknologi tidak perlu diterjemahkan, tetapi ±8 nama Indonesia ("Komunikasi", "Kerja Tim", "Kedisiplinan", "Dokumentasi", "Jaringan Komputer", "Instalasi Sistem Operasi", "Integrasi Scanner Barcode", "Google Sheets / Apps Script") tampil apa adanya di mode US |
| achievements, organizations | kosong | kolom tetap disiapkan |

### Bundle dan performa (build produksi `main`)

- **Bundle awal 180,2 kB gzip** (JS 566,7 kB mentah). Diurai dari sourcemap: `react-dom` 203 kB, **pustaka Supabase
  ±210 kB** (auth 97, realtime + phoenix 55, storage 22, postgrest 16, lainnya), kode publik 60 kB, router 37 kB,
  kamus ID/EN 16 kB. **Kode admin/auth di bundle awal hanya 5,8 kB** (`ShutterTransition`, `AdminRoute`,
  `authService`); halaman admin sendiri sudah lazy.
- Peringatan Vite "chunk > 500 kB" berasal dari bundle awal itu (575 kB).
- Halaman publik hanya memakai `select` dan `insert` (tanpa realtime, tanpa auth), tetapi ikut mengunduh seluruh
  pustaka Supabase. Di sinilah penghematan terbesar (K6).
- Gambar publik sudah `loading="lazy"`, `decoding="async"`, `width`/`height`, dan bingkai rasio tetap. Font Inter dan
  JetBrains Mono self-hosted (Fontsource), belum di-preload. Nama hero menunggu data profil (skeleton dulu), jadi LCP
  bergantung pada permintaan ke Supabase.
- Seret label di CPU 4× lebih lambat: 18–29 fps (3B); ±2 hitung ulang style per frame.
- Lighthouse belum pernah diukur (alatnya belum ada di proyek, lihat K8).

### SEO saat ini

`index.html` hanya punya judul dan deskripsi bahasa Indonesia, favicon, dan manifest. Belum ada Open Graph, Twitter
card, JSON-LD, robots.txt, sitemap, maupun noindex di admin. Judul tab per halaman sudah berganti lewat
`useDocumentTitle` (ID/EN).

---

## 2. A1 — Kolom versi Inggris

### Bentuk (K1, usulan)

**Kolom pendamping `_en` dengan tipe yang sama** (`bio` → `bio_en`, `responsibilities` TEXT[] → `responsibilities_en`
TEXT[]), semuanya boleh kosong. Untuk isi yang ada di dalam JSON (keterangan galeri, label tautan), kunci Inggris
disimpan **di objek yang sama** (`{ url, caption, caption_en }`, `{ label, label_en, … }`), jadi ikut berpindah saat
urutan diubah. Alasan: query dan form tetap sederhana, publik cukup memilih `x_en || x`, dan tidak ada struktur baru
yang harus dipahami. Alternatif (satu kolom JSONB `i18n` per tabel) lebih sedikit kolom tetapi lebih sulit divalidasi
dan diisi.

Daftar (kolom pendamping bertipe sama; daftar teks bertipe TEXT[] dengan batas jumlah yang sama seperti kolom
Indonesianya):

| Tabel | Kolom versi Inggris | Catatan |
|---|---|---|
| profiles | `tagline_en`, `bio_en`, `primary_role_en`, `secondary_roles_en`, `hero_keywords_en`, `contact_topics_en`, `hobbies_en`* | Daftar sejajar dengan versi Indonesia (baris ke-n = terjemahan baris ke-n). Formulir kontak di mode US menampilkan topik Inggris, tetapi **menyimpan topik Indonesia** di `messages.topic` (dicocokkan lewat urutan). |
| projects | `title_en`, `description_en`, `my_role_en`, `problem_en`, `solution_en`, `outcome_en`, `content_en`, `client_name_en`*; `links[].label_en`, `gallery[].caption_en` | Aturan `projects_links_shape` diperluas: `label_en` (bila ada) teks ≤60 karakter. |
| experiences | `role_en`, `description_en`, `responsibilities_en`, `company_en`* | Nama instansi resmi boleh tetap Indonesia (kosongkan `company_en`). |
| educations | `degree_en`, `field_of_study_en`, `thesis_title_en` | Nama kampus tetap. |
| certifications | `name_en`*, `issuer_en`* | |
| achievements | `title_en`, `event_name_en`, `description_en` | |
| organizations | `role_en`, `description_en` | Nama organisasi tetap. |
| languages | `language_name_en`*, `proficiency_level_en` | Tingkat standar (Penutur asli, Aktif, Menengah, Dasar) sudah diterjemahkan kamus; kolom ini untuk tingkat yang ditulis bebas. |
| skills | `name_en`* | Hanya untuk nama berbahasa Indonesia (soft skill, "Jaringan Komputer"); nama teknologi biarkan kosong. |

\* = di luar daftar permintaan, diusulkan karena teksnya tampil di publik dan saat ini tetap berbahasa Indonesia di
mode US (K2).

**Kolom yang ada tetapi belum tampil di publik (K3):** `profiles.tagline` (usulan: dipakai untuk deskripsi SEO,
Open Graph, dan `jobTitle` JSON-LD, tidak ditambahkan ke hero yang sudah memuat peran) dan `experiences.description`
"Ringkasan" (usulan: tampil di linimasa di atas poin tugas bila diisi).

### Admin

```
┌ Form Proyek ──────────────────────────────────────────────┐
│ INFORMASI UTAMA   Judul* [……]   Deskripsi singkat* [……]   │
│ STUDI KASUS       Masalah [……]  Solusi [……]  Hasil [……]   │
│ …                                                          │
│ ▸ Versi Inggris (opsional) · 3 dari 8 terisi               │  ← tertutup bawaan (<details>)
│   Kosongkan bila belum ada; situs memakai versi Indonesia. │
│   Judul (Inggris) [……]   (Indonesia: "AyamBebek: Sistem…") │  ← teks Indonesia sebagai rujukan
│   Poin tugas (Inggris)  1. [……] (Indonesia: "Merancang…") │  ← satu baris per baris Indonesia
│ TAMPILAN DI HALAMAN PUBLIK …                               │
└────────────────────────────────────────────────────────────┘
```

- Satu bagian lipat **"Versi Inggris (opsional)"** per form, tepat di bawah kolom isi Indonesia (sebelum blok
  "Tampilan di halaman publik"), dengan hitungan "n dari m terisi". Setiap kolom Inggris menampilkan teks
  Indonesianya sebagai rujukan.
- Daftar (poin tugas, kata berganti, topik, peran pendukung, hobi): satu kolom Inggris per baris Indonesia, ikut
  pindah saat baris Indonesia dinaik/turunkan atau dihapus.
- Keterangan galeri dan label tautan Inggris: di bagian lipat yang sama, satu kolom per gambar/tautan.
- Bila migrasi belum dijalankan: form tetap bisa menyimpan isi Indonesia; bagian Inggris menampilkan pesan
  "Pembaruan database untuk versi Inggris belum dijalankan" (pola `toFriendlyError` yang sudah ada).

### Publik

- Di mode US: setiap teks memakai versi Inggris bila terisi, kalau kosong versi Indonesia (per kolom, juga per baris
  daftar). Teks cadangan Indonesia di halaman Inggris diberi `lang="id"` supaya pembaca layar melafalkannya benar.
- Query publik menambah kolom `_en` (kolom eksplisit, tetap tanpa nomor HP/alamat).

---

## 3. A2 — Draf terjemahan

- File `supabase/seed/terjemahan-en.sql`: `UPDATE` per baris (dicocokkan lewat `id`/`slug`) yang hanya mengisi kolom
  `_en`, di dalam `BEGIN … COMMIT`, aman dijalankan ulang, dengan query cek setelah `COMMIT`. Dijalankan setelah
  migrasi. Baris yang isinya sudah diubah sejak draf dibuat dilewati (dicocokkan juga dengan teks Indonesianya),
  supaya terjemahan tidak dipasang ke teks yang berbeda.
- Gaya: Inggris yang alami dan profesional, tidak dilebih-lebihkan, jujur sesuai isi (mis. AyamBebek tetap
  "built with the CV Adisatya IT Consultant team"; magang tetap "internship"; tanpa angka atau klaim baru). Nama
  produk, nama instansi resmi, dan nama teknologi tidak diterjemahkan.
- "Detail teknis" SI-Arsip diterjemahkan utuh (langkah instalasi, perintah tetap sama).
- Laporan akhir bagian A berisi **semua** draf dalam tabel Indonesia | Inggris untuk dicek.

---

## 4. A3 — Label fisika hero dari admin

- **Penyimpanan (K4, usulan):** kolom `profiles.hero_labels` JSONB, isinya daftar `{ text, text_en, shape }`,
  `shape` = `tag` atau `circle`, maks. 10, teks ≤24 karakter (lingkaran ≤3). CHECK di database seperti `links`. Tidak
  perlu tabel baru, jadi RLS tidak tersentuh.
- **Admin:** di Profil, grup "Peran dan kata berganti" mendapat **"Label panggung hero"**: daftar berurutan (pola
  `ListInput`: tambah, hapus, Naikkan/Turunkan), tiap baris berisi teks, bentuk (Tag/Lingkaran), dan teks Inggris
  opsional; pratinjau kecil panggung. Petunjuk: "Kosongkan untuk memakai keahlian unggulan."
- **Publik:** bila daftar terisi, panggung memakai label itu sesuai urutan (HP: 8 pertama); bila kosong, tetap
  keahlian unggulan + `</>` dan `*` seperti sekarang. Fisika, suara, reduced motion tidak berubah.

---

## 5. A4 — Grafik kontribusi GitHub

### Pilihan sumber data (K5)

| Pilihan | Cara | Kelebihan | Kekurangan |
|---|---|---|---|
| **A. Fungsi Vercel + GitHub GraphQL API (usulan)** | File `api/github-contributions.js` di repo memanggil API resmi GitHub dengan token (tanpa izin apa pun, hanya data publik) yang disimpan di variabel lingkungan Vercel; hasil di-cache di CDN Vercel 12 jam | Data resmi GitHub; token tidak pernah sampai ke browser; tanpa pihak ketiga lain; cepat (cache); tampilan dan warna sepenuhnya Blueprint | Perlu membuat token GitHub sekali (dipandu di DEPLOY.md); fungsi hanya berjalan di Vercel, jadi di `npm run dev` grafik tersembunyi (atau pakai `vercel dev`) |
| B. API JSON pihak ketiga (mis. github-contributions-api.jogruber.de) | Browser langsung mengambil JSON kontribusi | Paling sederhana, tanpa token dan tanpa fungsi | Layanan pihak ketiga tanpa jaminan; IP pengunjung terkirim ke pihak ketiga; bisa berhenti kapan saja |
| C. Gambar jadi dari pihak ketiga (mis. ghchart) | `<img>` berisi grafik | Nol kode | Gaya dan tema tidak bisa ikut Blueprint terang/gelap; pihak ketiga; aksesibilitas terbatas |
| D. Salinan terjadwal (GitHub Actions harian → JSON di repo) | Workflow mengambil data tiap hari lalu commit file | Situs hanya membaca file statis | Paling banyak bagian bergerak (workflow, token di GitHub, commit otomatis); data sampai 1 hari terlambat |

### Tampilan (usulan)

```
1440 ┌ [ GITHUB ] Aktivitas di GitHub ───────────────── Lihat profil ↗ ┐
     │ 312 kontribusi dalam 12 bulan terakhir                          │
     │ Okt  Nov  Des  Jan  Feb  Mar  Apr  Mei  Jun  Jul  Agu  Sep      │
     │ ▪▪▫▪▪▪▫▪▪▪▪▫▪▪▪▪▪▫▪▪▪▪▪▪▫▪▪▪▪▪▪▪▫▪▪▪▪▪▪▪▫▪▪▪▪▪▪▪▫▪▪▪▪▪▪▪  (53 × 7) │
     │ Lebih sedikit ▫▪▪▪▪ Lebih banyak                                 │
     └──────────────────────────────────────────────────────────────────┘
375  kotak yang sama, 26 minggu terakhir (tanpa scroll samping), total tetap 12 bulan
```

- Di bagian akhir section **Proyek** (setelah "Proyek lainnya"): bukti kerja yang sedang berjalan langsung setelah
  studi kasus. Kotak bersudut bracket, sel 5 tingkat dari token aksen (`--ds-accent-subtle` → `--ds-accent`), ikut tema
  terang/gelap, label bulan ID/EN.
- Dimuat lazy saat mendekati layar; skeleton setinggi grafik (tanpa pergeseran tata letak); **bila gagal atau total
  0, section kecil ini tidak dirender sama sekali**.
- Aksesibilitas: ringkasan teks ("312 kontribusi dalam 12 bulan terakhir") sebagai isi yang dibaca; kotak-kotak
  `aria-hidden`; tautan "Lihat profil GitHub" (tab baru).

---

## 6. Bagian B — SEO, performa, audit, Vercel

### B1. SEO
- `index.html`: judul dan deskripsi (ID, bahasa bawaan), Open Graph (`og:title`, `og:description`, `og:image`
  1200×630, `og:url`, `og:locale` id_ID + alternatif en_US), Twitter card `summary_large_image`, `theme-color`,
  `<link rel="canonical">`. URL absolut diambil dari variabel `VITE_SITE_URL` saat build (diisi di Vercel).
- Saat bahasa/halaman berganti: judul (sudah), `meta description`, `og:*`, `canonical` diperbarui (untuk Google yang
  menjalankan JavaScript). Pratinjau tautan di WhatsApp/LinkedIn **tidak menjalankan JavaScript**, jadi semua halaman
  memakai teks dan gambar OG situs (K11).
- `public/og-image.png` 1200×630 bergaya Blueprint (logo, nama, peran, grid), dibuat dari HTML lokal dan dirender
  Chrome headless, file statis.
- JSON-LD `Person` (nama, `jobTitle` dari tagline/peran, `url`, `sameAs` LinkedIn/GitHub, `alumniOf`, `address`
  hanya kota), dimasukkan saat profil dimuat.
- `robots.txt` (`Disallow: /admin`, alamat sitemap) dan `sitemap.xml` (beranda + `/projects/:slug` yang tampil) (K7).
- Admin dan login: `<meta name="robots" content="noindex, nofollow">` + header `X-Robots-Tag` di `vercel.json`.

### B2. Performa
1. **Data publik tanpa pustaka Supabase (K6, usulan):** modul kecil `publicApi.js` memakai `fetch` ke REST Supabase
   (endpoint, kunci publik, dan RLS yang sama; hanya GET dan POST insert pesan/buku tamu). Halaman publik tidak lagi
   mengunduh pustaka Supabase (±210 kB mentah, ±55 kB gzip dari bundle awal); admin tetap memakai `supabase-js` dan
   hook lamanya tanpa perubahan. `useGuestbook` dipakai juga oleh admin, jadi publik mendapat versinya sendiri.
2. **Kode admin keluar dari bundle awal:** `AdminRoute`, `authService`, `ShutterProvider` dipindah ke satu potongan
   lazy untuk semua rute `/admin*` (alamat rute tidak berubah, transisi jepret tetap bekerja).
3. Peringatan chunk > 500 kB hilang (bundle awal diperkirakan ±350 kB mentah setelah 1–2); bila masih ada, vendor
   dipisah lewat opsi chunk Vite (tanpa library).
4. Font: preload satu file Inter (latin) yang dipakai hero; nama hero tampil langsung dengan nama situs selama profil
   dimuat (bukan skeleton), supaya LCP tidak menunggu Supabase (nama situs = nama pemilik, bukan data karangan).
5. Gambar: cek ukuran file yang diunggah, `width`/`height`, `fetchpriority`; cek potongan bundle.
6. Seret label di CPU lambat: simpan posisi panggung/jalur (tidak dibaca ulang tiap gerakan), `contain` pada panggung
   untuk memperkecil hitung ulang style; ukur ulang dengan trace.
7. **Lighthouse mobile** (beranda dan detail proyek, build produksi lewat `vite preview` di port terpisah, data asli
   hanya dibaca) **sebelum** (di awal bagian B, kode sebelum perubahan B2) dan **sesudah**. Target: Performance ≥90,
   Accessibility/Best Practices/SEO 100 (K8).

### B3. Audit akhir
Skill `impeccable` mode audit untuk halaman publik; perbaiki temuan P1 dan P2 yang tidak bertentangan dengan BRIEF
atau MASTER; sisanya dilaporkan.

### B4. Persiapan Vercel
- `vercel.json`: semua rute ke `index.html` (kecuali `/api/*` dan file statis), cache 1 tahun untuk `/assets/*`
  (nama file ber-hash), header keamanan dasar (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`,
  `Permissions-Policy`) dan Content-Security-Policy (K9), `X-Robots-Tag: noindex` untuk `/admin*`.
- `DEPLOY.md` (bahasa Indonesia sederhana): impor repo private ke Vercel, variabel lingkungan
  (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SITE_URL`, dan `GITHUB_TOKEN` bila K5 = A), Site URL dan
  Redirect URLs di Supabase Auth untuk alamat vercel.app, cara membuat token GitHub, cek setelah online (daftar
  periksa), dan cara menambah domain sendiri nanti (Vercel + DNS + Supabase + `VITE_SITE_URL`).

### B5. Dokumentasi
`pages/public.md`, `pages/admin.md`, `MASTER.md`, `README.md` (cara menjalankan, struktur, migrasi, deploy).

---

## 7. Pengujian

- Supabase tiruan diperbarui dengan kolom `_en` dan `hero_labels`; migrasi diuji di PGlite (dijalankan 2×, data lama
  utuh, CHECK menolak data salah, gagal di tengah = tidak ada perubahan, query cek). File terjemahan diuji di PGlite
  dengan salinan data asli (dijalankan 2×, baris yang sudah berubah dilewati).
- Semua suite 3A dan 3B diulang; sapuan 4 lebar × 2 tema × 2 bahasa dengan isi Inggris lengkap **dan** sebagian
  (cadangan ke Indonesia per kolom/baris, `lang="id"`); grafik GitHub (berhasil, gagal, kosong, lazy, tema).
- Admin: bagian "Versi Inggris" di setiap form (simpan, kosong, daftar sejajar saat diurutkan/dihapus, migrasi belum
  jalan), label hero (tambah, urutkan, batas 10, bentuk, kosong → keahlian unggulan); suite admin lama; regresi login.
- Kontak: mode US menampilkan topik Inggris, menyimpan topik Indonesia.
- Performa: ukuran bundle sebelum/sesudah, isi bundle awal (tanpa kode admin, tanpa Supabase bila K6), trace seret,
  Lighthouse sebelum/sesudah.
- `npm run lint`, `npm run build`, `vite preview`.

---

## 8. Keputusan yang butuh jawaban Anda

Setiap butir punya usulan; cukup jawab "setuju semua" atau sebut nomor yang ingin diubah.

**K1. Bentuk kolom Inggris.** Usulan: kolom pendamping `_en` bertipe sama + kunci `caption_en`/`label_en` di dalam
galeri dan tautan (§2). Alternatif: satu kolom JSONB per tabel.

**K2. Kolom tambahan** di luar daftar Anda (bertanda * di §2): `hobbies_en`, `client_name_en`, `company_en`,
`certifications.name_en`/`issuer_en`, `languages.language_name_en`, `skills.name_en`. Usulan: semua ditambahkan
(opsional, boleh dibiarkan kosong).

**K3. Kolom yang ada tetapi belum tampil.** Usulan: `tagline` dipakai untuk SEO/OG/JSON-LD (tidak di hero);
"Ringkasan" pengalaman tampil di linimasa bila diisi. Alternatif: tetap tidak ditampilkan.

**K4. Label hero** disimpan di `profiles.hero_labels` dan diatur di Profil → "Label panggung hero" (usulan). Alternatif:
sub-tab baru "Label hero" di Karya & Keahlian (menambah rute admin).

**K5. Sumber data grafik GitHub (wajib dijawab, API eksternal).** Usulan: **A** (fungsi Vercel + API resmi GitHub +
token di Vercel). Lihat tabel §5. Juga: letak grafik di akhir section Proyek, HP menampilkan 26 minggu terakhir.

**K6. Data publik tanpa pustaka Supabase** (`fetch` ke REST Supabase yang sama) untuk memangkas ±55 kB gzip dari
bundle awal. Usulan: ya. Ini mengubah cara halaman publik mengambil data (endpoint, kolom, RLS sama; admin tidak
berubah). Tanpa ini, target Lighthouse Performance 90 di HP kemungkinan sulit tercapai.

**K7. Sitemap.** Usulan: dibuat saat build dari daftar proyek yang tampil (dibaca dari Supabase saat build), jadi
proyek baru masuk sitemap pada deploy berikutnya. Alternatif (bila K5 = A): fungsi Vercel `/sitemap.xml` yang selalu
terbaru.

**K8. Alat Lighthouse.** Usulan: dijalankan dengan `npx lighthouse` terhadap Chrome yang sudah terpasang, tidak
ditambahkan ke `package.json`. Alternatif: Anda menjalankan Lighthouse di Chrome DevTools sendiri dan saya membuat
panduannya.

**K9. Content-Security-Policy.** Usulan: CSP ketat (hanya domain sendiri, Supabase, dan GitHub bila K5) selain header
keamanan dasar; diuji di `vite preview`. Alternatif: header dasar saja (lebih kecil risiko salah blokir).

**K10. Alamat vercel.app.** Nama proyek Vercel menentukan alamat (mis. `aldidwiirawan.vercel.app`). Ingin nama apa?
Bisa diubah kapan saja lewat `VITE_SITE_URL`.

**K11. Pratinjau tautan per proyek.** Tanpa server rendering, WhatsApp/LinkedIn melihat judul dan gambar OG situs untuk
semua alamat (termasuk `/projects/:slug`). Usulan: diterima untuk sekarang.

## 8a. Jawaban pemilik project (19 Oktober 2026)

Semua usulan K1–K11 disetujui, dengan catatan:

- **K5:** fungsi Vercel + API resmi GitHub. Token **fine-grained**, hanya membaca data publik (tanpa izin repo), masa
  berlaku 1 tahun. `DEPLOY.md` menjelaskan cara membuat dan memperbarui token. Saat dev lokal tanpa token, atau saat
  fungsi gagal, grafik disembunyikan dengan rapi.
- **K9:** CSP ketat, tetapi semua fitur diuji di build produksi: login, unggah gambar dan PDF di admin, pratinjau PDF,
  lightbox, buku tamu, formulir kontak, label fisika, dan suara. Bila ada yang berisiko rusak, pakai
  `Content-Security-Policy-Report-Only` dulu dan laporkan.
- **K10:** `aldidwiirawan.vercel.app`; cadangan bila sudah dipakai: `aldidwiirawan-portfolio.vercel.app`.
- **K7:** `DEPLOY.md` juga menjelaskan cara redeploy manual supaya proyek baru masuk sitemap.

---

## 9. Urutan commit

**Bagian A**
- [x] 0. Rencana ini (`plans/tahap-3c-final.md`)
- [x] A1. Migrasi `supabase/migrations/20261019000000_english_content.sql` (kolom `_en`, `profiles.hero_labels`,
      CHECK `label_en`) + uji PGlite (56 cek lulus: 2× jalan, data lama utuh, CHECK, gagal di tengah, tanpa migrasi
      tautan)
- [x] A2. Publik: pilih versi Inggris dengan cadangan Indonesia (semua section, detail, kontak, `lang="id"`), tampilkan
      Ringkasan pengalaman (K3). Sebelum migrasi dijalankan, query mengulang tanpa kolom `_en` (halaman tetap
      Indonesia). Uji: `test-en` 60/60, suite 3A + 3B lulus.
- [x] A3. Admin: bagian "Versi Inggris (opsional)" di semua form (+ daftar sejajar, galeri, tautan). Sebelum migrasi:
      pesan "belum dijalankan", isi Indonesia tetap tersimpan tanpa kolom `_en`. Uji: `admin-en` 61/61, suite admin lama
      lulus.
- [x] A4. Label hero: editor di Profil + panggung publik (urutan, bentuk, teks Inggris, HP 8 pertama; kosong =
      keahlian unggulan; tumpukan kosong selama profil dimuat). Uji: `herolabels` 24/24, `herolabels-public` 15/15.
- [x] A5. Grafik kontribusi GitHub (sesuai K5): `api/github-contributions.js` (token `GITHUB_TOKEN` di Vercel,
      username dari profil, cache CDN 12 jam) + `GithubActivity` lazy di akhir section Proyek; gagal/0/dev lokal =
      tidak dirender. Uji: `gh-fn` 14/14, `github` 33/33. (Di-commit sebelum A4.)
- [x] A6. Draf terjemahan `supabase/seed/terjemahan-en.sql` + uji PGlite (34 cek: 2× jalan, isi Indonesia utuh,
      teks yang sudah berubah dilewati, isi Inggris dari admin tidak ditimpa, file CRLF, tanpa migrasi gagal rapi).
      Nama diri (keahlian, penerbit, instansi, klien) tidak ditandai `lang="id"` (commit a69b06f).
- [x] A7. Uji bagian A + laporan (isi migrasi, tabel draf terjemahan) → **berhenti** (hasil di §10)

**Bagian B** (setelah pemilik menjalankan migrasi dan terjemahan)
- [x] B0. Lighthouse "sebelum" (build `main` + bagian A, data asli hanya dibaca, mobile, median 3 kali): beranda
      Performance 44 (FCP 2,6 s, LCP 4,6 s, TBT 953 ms, CLS 0,20), detail proyek 44 (LCP 5,9 s, CLS 0,26);
      Accessibility 100, Best Practices 100, SEO 92 (robots.txt belum ada) di keduanya.
- [x] B1. Performa: data publik lewat `lib/publicApi.js` (fetch REST, kunci sebagai parameter `apikey` sehingga tanpa
      preflight CORS; tanpa supabase-js), diminta setelah gambar pertama tampil; semua kode admin/auth dalam potongan
      lazy (`AdminShell`, `AdminPage`); section di bawah hero jadi potongan sendiri + `content-visibility`; satu `h1`
      tetap (nama situs → nama profil) dan placeholder tak terlihat (CLS 0); preload font Inter + preconnect Supabase;
      cover detail `fetchpriority=high` dan baris proyek diminta sebelum potongan halaman; format tanggal/angka tanpa
      `Intl`; baris keahlian diukur hanya dekat layar; posisi panggung label disimpan + `contain`. Bundle awal 105 kB
      gzip (dari 168), peringatan 500 kB hilang. Uji: `perf3c` 38/38 (+5/5 pada build asli), semua suite publik dan
      admin lulus.
- [x] B2. SEO: `index.html` berisi deskripsi, Open Graph, Twitter card `summary_large_image`, `theme-color`
      terang/gelap; gambar `public/og-image.png` 1200×630 (sumber `og/og-image.html`). Build (`vite.config.js`)
      menjadikan alamat gambar absolut dari `VITE_SITE_URL` (cadangan: alamat produksi Vercel) dan membuat
      `robots.txt` (`/admin`, `/api/` ditutup) serta `sitemap.xml` (beranda + proyek tampil, dibaca lewat API publik;
      gagal baca = beranda saja, build tetap jalan). Aplikasi memperbarui deskripsi, `og:*`, `twitter:*`, canonical,
      `og:locale` per halaman/bahasa; 404 `noindex`; admin `noindex, nofollow`; JSON-LD `Person` (nama, peran, kota,
      sekolah yang sudah lulus, tautan profil; tanpa HP/alamat/email). Uji: `seo3c` 54/54 (+21/21 build asli).
- [ ] B3. Audit impeccable + perbaikan P1/P2
- [ ] B4. `vercel.json` + `DEPLOY.md`
- [ ] B5. Uji ulang semua + Lighthouse "sesudah"
- [ ] B6. Dokumentasi (`pages/public.md`, `pages/admin.md`, `MASTER.md`, `README.md`) + laporan dan uji manual

---

## 10. Hasil bagian A (19 Oktober 2026)

**Commit:** 46aea8b A1 migrasi · c31e2aa A2 publik Inggris · 5654ca5 A3 admin "Versi Inggris" · f2bad3c A5 grafik GitHub ·
5a17817 A4 label hero · a69b06f perbaikan: nama diri tidak ditandai `lang="id"` · 7f75901 A6 draf terjemahan.

**Uji otomatis (semua lulus):**
- PGlite: migrasi 56/56 (2× jalan, data lama utuh, CHECK, gagal di tengah, tanpa migrasi tautan); file terjemahan
  34/34 (2× jalan, isi Indonesia utuh, teks yang berubah dilewati, isi Inggris dari admin tidak ditimpa, file CRLF,
  tanpa migrasi gagal rapi).
- Publik (Supabase tiruan): semua suite 3A dan 3B; `en` 61/61, `github` 33/33, `gh-fn` 14/14 (fungsi Vercel),
  `herolabels-public` 15/15, `sweep-en` 560/560 (4 lebar × 2 tema × 2 bahasa × 4 halaman dengan isi draf).
- Admin: nav 235, profil 110, proyek 100, keahlian 49, pengalaman 52, pendidikan/bahasa/organisasi 80,
  sertifikat/prestasi 69, dasbor 39, tautan 97, `admin-en` 61/61, `herolabels` 24/24.
- `test-regression` (pembanding admin dengan `main`) berbeda hanya di bagian yang memang diubah: query admin
  menambah kolom `_en`/`hero_labels`, form bertambah bilah "Versi Inggris" (+46–70 px), Profil bertambah editor label
  dan bagian Inggris. Halaman login tidak berubah.
- `npm run lint` bersih; `npm run build` berhasil (peringatan chunk > 500 kB masih ada, ditangani di B1).

**Uji manual setelah migrasi dan file terjemahan dijalankan:**
1. Supabase SQL Editor: jalankan `supabase/migrations/20261019000000_english_content.sql`; tabel cek tidak berisi
   "BELUM ADA". Lalu `supabase/seed/terjemahan-en.sql`; semua baris cek `terisi = true`.
2. Halaman publik, tombol US: hero, Tentang saya, Pengalaman, Pendidikan, Sertifikat, Keahlian, Kontak berbahasa
   Inggris. Ganti ke ID: kembali Indonesia.
3. Detail proyek (US): SI-Arsip (keterangan galeri, "Detail teknis" Inggris), AyamBebek (label tautan privat).
4. Formulir kontak (US): pilih "Project collaboration", kirim; di admin Kotak Masuk topiknya "Kerja sama proyek".
5. Admin → Proyek → ubah satu proyek → buka "Versi Inggris (opsional)": isi tampil, ubah satu kalimat, simpan, cek di
   halaman publik (US).
6. Admin → Pengalaman: naikkan/turunkan satu poin tugas Indonesia; poin Inggrisnya ikut pindah.
7. Admin → Profil → "Label panggung hero": tambah 3 label (satu lingkaran `</>`), simpan; hero publik memakai label
   itu (HP: 8 pertama). Hapus semua, simpan: kembali ke keahlian unggulan.
8. Grafik GitHub hanya muncul setelah online di Vercel dengan `GITHUB_TOKEN` (bagian B4); di `npm run dev` tidak
   tampil, dan itu memang disengaja.
