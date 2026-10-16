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
- [ ] 6. Keahlian
- [ ] 7. Pengalaman
- [ ] 8. Pendidikan, Bahasa, Organisasi
- [ ] 9. Sertifikat, Prestasi
- [ ] 10. Beranda (kartu per kelompok + pengingat kelengkapan)
- [ ] 11. Dokumentasi (MASTER.md, `pages/admin.md`, BRIEF "Strategi konten") dan bagian "Uji manual"

## 5. Pengujian

- CRUD otomatis untuk semua kolom baru dengan Supabase tiruan (Chrome headless, data di memori), termasuk
  unggah gambar, galeri, PDF, kompresi, serta validasi tipe dan ukuran. Skrip uji tidak di-commit.
- Navigasi dan sub-tab di 375, 768, 1024, 1440 px; keyboard; dialog perubahan belum disimpan; reduced
  motion; kontras ≥4,5:1; tanpa scroll horizontal.
- Login dan halaman publik dibandingkan dengan `main` (computed style, kotak elemen, URL request Supabase).
- `npm run lint` dan `npm run build`. Screenshot di `C:\Users\acer\portofolio-screenshots\tahap-2b\`.
