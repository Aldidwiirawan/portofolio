# Rencana Tahap 2B — Navigasi admin dan model konten lengkap

> **Status:** audit disetujui pemilik project, 16 Oktober 2026 · **Branch:** `feat/ui-admin` (lanjutan
> tahap 2). Acuan: `BRIEF.md` (utama), `MASTER.md`, `pages/admin.md`, `plans/tahap-2-admin.md`.

**Cara melanjutkan bila konteks terputus:** baca file ini, cek `git status` dan `git log --oneline -5`,
lalu kerjakan butir pertama yang belum dicentang di "Urutan commit". Setiap butir dicentang di commit yang
sama dengan pekerjaannya. Jangan mengulang pekerjaan yang sudah di-commit.

**Aturan:**
- Jangan ubah daftar path rute di `App.jsx`, `authService`, logika `AdminRoute`, atau RLS tabel yang ada.
- Query Supabase lama harus tetap berfungsi. Boleh menambah kolom ke select/insert/update dan menambah hook
  kecil.
- Perubahan database hanya lewat file migrasi baru yang aman dijalankan ulang. Migrasi **tidak dijalankan**
  oleh asisten; pemilik yang menjalankannya di SQL Editor.
- Halaman publik dan login tidak berubah. React + Vite + CSS biasa, tanpa library baru (kompresi gambar
  memakai canvas bawaan browser). Bahasa Indonesia sederhana. Tanpa skill huashu-design.
- Commit per bagian, jangan push atau merge, screenshot tidak di-commit.

---

## 1. Ringkasan audit

- Skema tabel dasar (profiles, projects, skills, experiences, educations) tidak ada di repo, jadi kolom
  yang ada disimpulkan dari hooks dan form. Migrasi memakai `ADD COLUMN IF NOT EXISTS` dan constraint
  bernama.
- Hooks dipakai bersama oleh publik dan admin. Kolom baru hanya diminta lewat opsi
  `{ includeAdminFields: true }` (pola `useProfile({ includePrivateFields })`), jadi query publik tetap
  sama persis dan tidak rusak walau migrasi belum dijalankan.
- `is_visible` hanya mengatur tampilan, bukan privasi: RLS SELECT tetap terbuka dan file di bucket publik
  tetap bisa dibuka lewat URL-nya.
- Halaman publik baru membaca kolom baru di tahap 3. Sampai saat itu data baru hanya tersimpan.
- Kolom pilihan **baru** disimpan sebagai kode (`production`, `web`, `competency`, …) dengan label
  Indonesia di admin, supaya terjemahan tahap 3 cukup lewat file terjemahan. Kolom pilihan lama
  (`experience_type`, `skills.category`, `languages.proficiency_level`) tetap teks bebas tanpa CHECK, dijaga
  lewat pilihan di form.
- Bulan/tahun di kolom `DATE` yang sudah ada disimpan sebagai tanggal 1 bulan itu.

### Kolom baru

| Tabel | Kolom baru |
|---|---|
| profiles | `cv_file_url`, `primary_role` (≤60), `secondary_roles` text[] (≤2), `hero_keywords` text[] (≤8), `github_username` (format GitHub), `contact_topics` text[] (≤8, default Tawaran kerja / Kerja sama proyek / Pertanyaan umum) |
| projects | `gallery` jsonb `[{url, caption}]` (≤5), `status` (production, completed, final_project, in_development, concept), `year`, `project_type` (web, mobile, desktop, network, other), `client_name`, `my_role`, `problem`, `solution`, `outcome`, `is_repo_private`, `is_visible` |
| experiences | `responsibilities` text[] (≤5), `skill_tags` text[] (≤12), `logo_url`, `photos` jsonb (≤3), `related_project_id` (FK ke projects, `ON DELETE SET NULL`), `is_visible`, `is_featured`; data `PKL` → `Magang` |
| educations | `logo_url`, `gpa` numeric(3,2) 0–4, `thesis_title`, `is_visible` |
| certifications | `category` (competency, network, language, training, internship), `expiry_date`, `no_expiry`, `credential_id`, `score`, `image_url`, `pdf_url`, `is_visible`, `is_featured`, `sort_order` |
| achievements | `month` 1–12, `document_url`, `photo_url`, `is_visible`, `is_featured`, `sort_order` |
| skills | `icon_url`, `is_visible`, `is_featured` |
| languages | `is_visible`, `sort_order` |
| organizations | `logo_url`, `is_visible`, `sort_order` |
| messages | `topic` (teks, boleh kosong, ≤60): topik pilihan pengunjung di form kontak (dipakai mulai tahap 3) |

**Kolom lama yang dipastikan ada** (`ADD COLUMN IF NOT EXISTS`, tidak berubah bila sudah ada): foto profil
`profiles.avatar_url`; kota `profiles.location` dan `experiences.location` (nama kota saja); urutan tampil
`sort_order` di projects, experiences, educations, dan skills.

Seluruh migrasi berjalan dalam satu transaksi (`BEGIN;` di baris pertama, `COMMIT;` di akhir): bila satu
perintah gagal, tidak ada yang berubah. Setelah `COMMIT;` ada query cek dari `information_schema.columns` yang
menampilkan 60 kolom di atas per tabel; kolom yang hilang tertulis **BELUM ADA**.

### Storage (`portfolio-assets`)

- Bucket: MIME `image/png`, `image/jpeg`, `image/webp`, `application/pdf` (tanpa SVG); batas bucket 5 MB.
- Policy lama `projects/` tidak disentuh. Policy admin baru untuk `profile/`, `logos/`, `gallery/` (gambar),
  `cv/`, `documents/` (PDF), dan `certificates/` (gambar dan PDF), dengan cek ekstensi.
- Gambar: file asli ≤10 MB, dikompres di browser ke WebP (sisi terpanjang 1600 px, logo 400 px), hasil
  ≤2 MB. PDF ≤5 MB dengan header `%PDF-`.
- File lama dihapus setelah diganti atau saat datanya dihapus; file baru dihapus lagi bila simpan gagal.

## 2. Keputusan pemilik (16 Oktober 2026)

- **Ukuran foto:** file asli boleh sampai 10 MB, dikompres, dan file yang diunggah maksimal 2 MB.
- **PKL:** diubah menjadi Magang lewat migrasi; jenis pengalaman: Magang, Kerja, Freelance, Organisasi.
- **Proyek terkait:** satu proyek per pengalaman.
- **Galeri:** gambar + keterangan singkat. Bentuk yang sama dipakai untuk foto dokumentasi pengalaman.

## 3. Navigasi

| Menu | Sub-halaman (rute tetap) |
|---|---|
| Beranda | `/admin` |
| Tentang Saya | Profil, Pendidikan, Bahasa |
| Karya & Keahlian | Proyek, Keahlian, Sertifikat |
| Rekam Jejak | Pengalaman, Organisasi, Prestasi |
| Kotak Masuk | Pesan (badge belum dibaca), Buku tamu |

Sub-tab berupa `<nav>` berisi tautan dengan `aria-current="page"`, bisa digeser ke samping di HP, dan ikut
dijaga dialog "Tinggalkan perubahan?".

## 4. Urutan commit

- [x] 0. Rencana ini (`plans/tahap-2b-admin.md`)
- [x] 1. Migrasi (`supabase/migrations/20261016000000_admin_content_model.sql`)
- [x] 2. Navigasi 5 menu + sub-tab
- [x] 3. Komponen bersama, util unggah/kompresi, opsi hooks
- [x] 4. Profil
- [x] 5. Proyek
- [x] 6. Keahlian
- [x] 7. Pengalaman
- [x] 8. Pendidikan, Bahasa, Organisasi
- [x] 9. Sertifikat, Prestasi
- [x] 10. Beranda (kartu per kelompok + pengingat kelengkapan)
- [x] 11. Dokumentasi (MASTER.md, `pages/admin.md`, BRIEF "Strategi konten") dan bagian "Uji manual"

**Koreksi pemilik (17 Oktober 2026)** — migrasi belum pernah dijalankan, jadi file migrasi diubah langsung.
- [x] 12. Migrasi: satu transaksi + query cek, `messages.topic`, kolom foto profil/kota/urutan dipastikan ada
- [ ] 13. Orientasi foto dari HP saat kompresi; petunjuk IPK (koma atau titik) dan kota
- [ ] 14. Uji ulang (lint, uji otomatis, build) dan laporan akhir

## 5. Pengujian

- CRUD otomatis untuk semua kolom baru dengan Supabase tiruan (Chrome headless, data di memori), termasuk
  unggah gambar, galeri, PDF, kompresi, serta validasi tipe dan ukuran. Skrip uji tidak di-commit.
- Navigasi dan sub-tab di 375, 768, 1024, 1440 px; keyboard; dialog perubahan belum disimpan; reduced
  motion; kontras ≥4,5:1; tanpa scroll horizontal.
- Login dan halaman publik dibandingkan dengan `main` (computed style, kotak elemen, URL request Supabase).
- `npm run lint` dan `npm run build`. Screenshot di `C:\Users\acer\portofolio-screenshots\tahap-2b\`.

Hasil lengkap per bagian ada di `pages/admin.md` §10: **864/864** uji otomatis (termasuk migrasi di PGlite),
lint 0 diagnostik, build sukses.

## 6. Keputusan selama pengerjaan

- **Urutan lewat tombol, bukan angka.** Kotak "Urutan tampil" di form diganti tombol Naikkan/Turunkan di
  daftar. Data baru masuk di urutan terakhir dan `sort_order` hanya dikirim saat menambah data. Keahlian
  diurutkan per kategori. Selama kolom cari terisi, tombol urutan dikunci.
- **File diunggah saat simpan.** Memilih gambar/PDF hanya menyiapkan file (kompresi/cek). Bila simpan gagal, file
  yang baru terunggah dihapus lagi; bila berhasil, file lama yang diganti atau dihapus dibersihkan.
- **Status, jenis, dan kategori baru disimpan sebagai kode** (`production`, `web`, `competency`, …) supaya
  terjemahan tahap 3 cukup lewat file terjemahan. Kolom pilihan lama (jenis pengalaman, kategori keahlian,
  tingkat bahasa) tetap teks; nilai lama di luar daftar tetap bisa dipilih dengan label "(lama)".
- **Toast naik di atas bar Batal/Simpan** saat form terbuka. Sebelumnya toast bisa menutupi tombol Simpan, dan
  karena toast berhenti hilang saat disorot, tombolnya sulit diklik.
- **Galeri:** file dibaca sebelum input dikosongkan (daftar file di input ikut kosong saat input direset).
- **Organisasi:** logo atau foto kecil diperlakukan seperti logo (400 px).
- **Beranda:** pengingat hanya menghitung data yang tampil di publik; galat memuat menyebut bila migrasi belum
  dijalankan.

## 7. Uji manual

Pengujian otomatis memakai Supabase tiruan. Langkah berikut dilakukan pemilik dengan akun dan data asli.
Pakai data yang mudah dikenali, misalnya judul berawalan **"UJI – "**, lalu hapus lagi di akhir. Bila ada yang
tidak sesuai, catat halaman, langkah, dan teks pesan yang muncul.

**A. Jalankan migrasi**
1. (Disarankan) Buat cadangan: Supabase → Database → Backups, atau ekspor tabel konten.
2. Buka **SQL Editor** → **New query**, tempel seluruh isi
   `supabase/migrations/20261016000000_admin_content_model.sql` (dari `BEGIN;` sampai query cek paling bawah),
   lalu **Run**. Hasilnya tabel 60 baris (tabel, kolom, tipe, boleh_kosong, nilai_awal, keterangan) dari query
   cek. Tidak boleh ada **BELUM ADA** di kolom tipe. Pastikan ada `profiles.avatar_url`, `profiles.location`,
   `experiences.location`, `messages.topic`, dan `sort_order` di projects, experiences, educations, skills.
   - Bila muncul pesan galat: tidak ada yang berubah karena semua perintah ada dalam satu transaksi. Jalankan
     `ROLLBACK;` di query baru, catat pesannya, dan jangan lanjut ke langkah berikutnya.
3. Jalankan sekali lagi. Hasilnya tetap tabel 60 baris yang sama (migrasi aman dijalankan ulang).
4. Cek hasilnya di SQL Editor:
   - `select column_name, data_type from information_schema.columns where table_name = 'experiences' and column_name = 'related_project_id';`
     → tipenya sama dengan kolom `id` di tabel `projects` (biasanya `uuid`).
   - `select experience_type, count(*) from experiences group by 1;` → tidak ada lagi `PKL`.
   - `select id, file_size_limit, allowed_mime_types from storage.buckets where id = 'portfolio-assets';`
     → 5242880 dan empat tipe (png, jpeg, webp, pdf).
   - `select policyname from pg_policies where tablename = 'objects';` → empat policy lama "… on
     portfolio-assets" dan empat policy baru "… content folders on portfolio-assets".
5. Buka halaman publik: masih tampil seperti biasa (halaman publik belum memakai kolom baru).

**B. Navigasi**
6. Jalankan `npm run dev`, masuk ke admin. Sidebar berisi 5 menu. Buka Karya & Keahlian → sub-tab Proyek,
   Keahlian, Sertifikat; menu tetap aktif saat pindah sub-tab.
7. Ketik sesuatu di form, lalu klik sub-tab lain: muncul "Tinggalkan perubahan?".
8. Di ponsel (atau lebar 375 px): buka ☰, pilih Rekam Jejak, geser sub-tab bila perlu; halaman tidak bergeser ke
   samping.

**C. Unggahan setiap jenis** (cek setiap file di Storage → `portfolio-assets` → folder yang disebut)
9. **Profil:** pilih foto dari HP (3–8 MB). Ukuran "asli … MB" dan ukuran baru tampil; simpan → file `.webp` di
   `profile/`, di bawah 2 MB. Ganti foto dan simpan → file lama hilang dari `profile/`.
10. **Profil, CV:** pilih PDF CV, klik "Pratinjau" (tab baru), simpan → file di `cv/`. Klik "Hapus PDF", simpan →
    file hilang.
11. **Proyek "UJI – …":** gambar sampul + 3 screenshot dengan keterangan, ubah urutan screenshot, simpan → file di
    `projects/` dan `gallery/`. Ubah proyek, hapus satu screenshot, simpan → file itu hilang. Hapus proyek → semua
    filenya hilang.
12. **Keahlian:** ikon PNG berlatar transparan → file `.webp` 400 px di `logos/`, latar tetap transparan di daftar.
13. **Pengalaman:** logo + 2 foto + proyek terkait; simpan → `logos/` dan `gallery/`.
14. **Pendidikan** dan **Organisasi:** logo → `logos/`.
15. **Sertifikat:** gambar + PDF asli, isi "Berlaku sampai" → keduanya di `certificates/`; badge "Berlaku sampai
    …" tampil di daftar. Coba "Tidak kedaluwarsa".
16. **Prestasi:** dokumen PDF → `documents/`, foto → `gallery/`.

**D. File yang harus ditolak** (pesan muncul di bawah kolom, tidak ada yang terunggah)
17. File SVG atau GIF sebagai gambar.
18. Gambar di atas 10 MB.
19. File teks yang namanya diubah menjadi `.pdf`, dan PDF di atas 5 MB.

**E. Urutan, tampil, dan Beranda**
20. Di Proyek, klik "Turunkan" pada proyek pertama, lalu muat ulang halaman: urutan baru tetap.
21. Matikan "Tampil di halaman publik" pada satu data: badge "Disembunyikan" muncul di daftar.
22. Buka Beranda: pengingat "Perlu dilengkapi" sesuai data (mis. foto profil, CV, proyek unggulan, gambar
    sertifikat). Lengkapi satu, kembali ke Beranda, pengingat itu hilang.

**F. Bersihkan**
23. Hapus semua data "UJI – …" lewat admin, lalu pastikan folder di Storage tidak lagi berisi file uji.
