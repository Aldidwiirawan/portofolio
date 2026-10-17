# Override Halaman: Panel Admin (`/admin/*`)

> **PROJECT:** Aldi Portfolio · **Diperbarui:** 18 Oktober 2026 (tautan proyek; tahap 2B: 16 Oktober)
> ⚠️ Aturan di file ini **menimpa** `design-system/aldi-portfolio/MASTER.md`. Bila bertentangan dengan
> `BRIEF.md`, brief yang dipakai.
> **Status:** diterapkan di tahap 2 dan 2B (branch `feat/ui-admin`). Rencana dan urutan kerjanya:
> `plans/tahap-2-admin.md` dan `plans/tahap-2b-admin.md`. Strategi isi publik: `BRIEF.md` §9.

Login punya aturannya sendiri di `pages/login.md` dan tidak diubah di tahap 2 maupun 2B.

---

## 1. Tema dan token

- **Area kerja terang** (`.adm` dengan `data-theme="light"`). **Sidebar dan bar atas HP gelap**
  (`data-theme="dark"`), menyambung panel brand login. Dialog dan toast dirender di portal
  `.adm-portal` dengan `data-theme="light"`.
- **Token komponen** `--adm-*` (didefinisikan pada `.adm, .adm-portal` di `admin-ui.css`):

  | Token | Nilai | Dipakai untuk |
  |---|---|---|
  | `--adm-sidebar-w` | 16.5rem | lebar sidebar ≥1024 px (juga lajur gelap di layar loading) |
  | `--adm-topbar-h` | 3.5rem | bar atas < 1024 px |
  | `--adm-content-max` | 72rem | lebar maksimum isi halaman |
  | `--adm-gutter` | 16 / 24 / 32 / 40 px | jarak tepi isi di 375 / 768 / 1024 / 1440 |
  | `--adm-radius` / `-control` / `-tag` | 6 / 4 / 2 px | kartu dan dialog / input dan tombol / badge |
  | `--adm-line`, `--adm-line-soft` | text-strong 14 % / `--ds-border` | garis struktur kartu |
  | `--adm-offset` | accent 12 % | bayangan offset kartu bertanda bracket |
  | `--adm-corner-*` | accent, 12 px, 2 px | bracket sudut |
  | `--adm-nav-item-h` | 40 px; 36 px di desktop; 44 px di layar sentuh | tinggi item menu |

- **Pengecualian primitive yang terdokumentasi** (elemen di luar sub-pohon bertema):
  - latar `<html>` saat admin tampil (`html:has(.adm)`) dan layar loading `AdminRoute.css`;
  - scrim laci HP dan backdrop dialog (`navy-950` 55 %);
  - lajur gelap di bawah sidebar desktop (`.adm-shell`);
  - tinta huruf avatar buku tamu (`navy-950`, karena warna avatar datang dari data dan selalu terang).
- **Pencegahan bocor:** semua aturan admin diawali `.adm`, `.adm-portal`, atau `html:has(.adm)`. Aturan
  elemen global lama (`h1–h6`, `p`, `a` di `index.css`) dinetralkan di dalam admin lewat `:where(...)`.
  Di admin, `body` dan `#root` memakai `overflow-x: clip` (bukan `hidden`) supaya `position: sticky` bekerja.

## 2. Kerangka dan navigasi

```
≥1024 px                                      <1024 px
┌────────────┬──────────────────────────┐     ┌───────────────────────────┐
│ [logo]│Aldi │ Judul           [aksi]   │     │ ☰  [logo]│Aldi Dwi Irawan │
│  KELOLA…   │ deskripsi                 │     ├───────────────────────────┤
│ Beranda    │ Proyek  Keahlian  Sertif. │     │ Judul halaman   [aksi]    │
│ ISI PORTO… │ ═════── (sub-tab)          │     │ Tab │ Tab │ Tab  → geser  │
│  Tentang   │                           │     │ isi (daftar jadi kartu)   │
│  Karya ◀   │  isi (grid calm samar)    │     └───────────────────────────┘
│  Rekam     │                           │      ☰ → laci: 5 menu, fokus terkunci,
│ INTERAKSI  │                           │      Esc / scrim / pilih menu menutup
│  Kotak (2) │                           │
│ Masuk sbg  │                           │
│ Keluar     │                           │
└────────────┴──────────────────────────┘
```

- **`AdminRoot`** (`ui/AdminLayout.jsx`) membungkus setiap halaman: tema terang, toast, penjaga perubahan,
  pemantau sesi dan tombol Keluar, serta daftar pesan untuk badge "belum dibaca" (`useAdminShell()`).
- **`AdminLayout`** adalah kerangka yang terlihat: tautan "Lewati ke konten", `ViewfinderCursor`,
  sidebar, `BlueprintBackground variant="calm"`, `<main id="adm-main">`, `PageHeader`, lalu `SubNav`.
- **Menu (`adminNav.js`)**: 5 bagian, rute `App.jsx` tidak berubah.

  | Menu | Sub-halaman | Kelompok di sidebar |
  |---|---|---|
  | Beranda | `/admin` | – |
  | Tentang Saya | Profil, Pendidikan, Bahasa | Isi portofolio |
  | Karya & Keahlian | Proyek, Keahlian, Sertifikat | Isi portofolio |
  | Rekam Jejak | Pengalaman, Organisasi, Prestasi | Isi portofolio |
  | Kotak Masuk | Pesan, Buku tamu | Interaksi |

- **Sidebar:** lockup brand, 5 menu, kaki ("Masuk sebagai", "Lihat situs", "Keluar"; menempel di dasar pada
  desktop). Menu tetap aktif di semua sub-halamannya: `aria-current="page"` bila tautannya adalah halaman
  yang terbuka (menu menuju sub-halaman pertama), `aria-current="true"` di sub-halaman lain. Badge belum
  dibaca ada di **Kotak Masuk**.
- **Sub-tab (`SubNav`)** di bawah header halaman: `<nav aria-label="{nama menu}">` berisi tautan dengan
  `aria-current="page"` (bukan `role="tablist"`, karena setiap tab adalah rute). Garis aktif 2 px
  `--ds-accent-text`. Bila tidak muat, hanya baris tab yang digeser ke samping (`overflow-x: auto`,
  `overscroll-behavior-x: contain`); tab yang terbuka digulir ke layar dan tepi yang masih menyimpan tab
  memudar. Badge belum dibaca juga ada di sub-tab Pesan. Beranda tidak punya sub-tab.
- **Penjaga perubahan:** sidebar dan sub-tab memakai `useGuardedNav` (klik biasa → "Tinggalkan
  perubahan?" bila form belum disimpan; klik tab baru/jendela baru dibiarkan).
- **Laci HP (< 1024 px):** `role="dialog"` + `aria-modal`, `inert` saat tertutup, scroll halaman dikunci saat
  terbuka. Titik penanda di tombol ☰ bila ada pesan belum dibaca (jumlahnya dibacakan).
- **`PageHeader`:** jejak opsional (mis. "Proyek / Tambah proyek"), satu-satunya `h1`, deskripsi, aksi
  halaman, dan slot `leading` (robot kecil di Beranda).
- **Fokus dan judul tab:** pindah halaman (juga lewat sub-tab) → gulir ke atas dan fokus ke `h1` baru;
  daftar ↔ form → fokus ke `h1` baru; judul tab `{Halaman} · Kelola isi · Aldi Dwi Irawan`.

## 3. Komponen bersama (`src/components/admin/ui/`)

| Komponen | Isi dan perilaku |
|---|---|
| `Button`, `ButtonLink`, `IconButton` | varian `primary`, `secondary`, `danger`, `ghost`. `loading` memakai `aria-disabled` + guard. `status="success"`: bracket mengunci tombol lalu centang "Tersimpan". |
| `Field`, `Input`, `Textarea`, `Select` | label terlihat, `*` atau "(opsional)", petunjuk dan galat tepat di bawah kolom; `id`, `aria-describedby`, `aria-invalid` otomatis. |
| `Checkbox`, `ChoiceGroup`, `QuickPicks` | kotak centang; grup radio berbentuk chip (jenis pengalaman, kategori keahlian); pilihan cepat `aria-pressed`. Nilai lama di luar daftar tetap bisa dipilih dengan label "(lama)". |
| `Switch`, `DisplaySettings` | sakelar `role="switch"` (tombol asli, Space/Enter) dengan deskripsi yang mengikuti keadaan; blok "Tampilan di halaman publik" berisi "Tampil di halaman publik" dan (bila ada) "Unggulan". |
| `ListInput` | daftar isian pendek (poin tugas, teknologi, tag, kata berganti, topik pesan, peran pendukung): tambah, hapus, Naikkan/Turunkan dengan tombol berlabel unik; Enter di satu baris menambah baris berikutnya; batas jumlah ("Sudah 5 dari 5"); fokus mengikuti baris yang dipindah dan posisinya diumumkan. Isian kosong dibuang saat simpan (`cleanList`). |
| `LinkListInput` | daftar tautan proyek (maks. 6) dengan pola `ListInput`: setiap baris berisi nama tautan (≤60 karakter), jenis (Kode, Demo, Dokumentasi, Video, Lainnya), alamat, dan sakelar "Privat"; "Tambah tautan", hapus, Naikkan/Turunkan dengan label unik ("Hapus tautan 2"); fokus mengikuti baris dan perubahan diumumkan. Alamat wajib dan diawali `https://`, kecuali tautan privat (boleh kosong). Baris kosong dibuang saat simpan (`prepareLinks` di `projectLinks.js`). |
| `MonthYearSelect` | `fieldset` + dua `select` berlabel "Bulan" dan "Tahun" seperti formulir lowongan kerja; `monthOptional` untuk prestasi. Dicek dengan `checkMonthYear` (setengah terisi → "Pilih tahunnya juga."). Disimpan sebagai tanggal 1 bulan itu. |
| `ImageUpload`, `ImageField` | pratinjau, seret-lepas, "Pilih/Ganti gambar", "Batalkan pilihan", "Hapus gambar" untuk gambar tersimpan (+ "Batalkan hapus"), status "Mengecilkan gambar...", bentuk `wide` atau `square` (logo, ikon, foto profil). |
| `PdfUpload` | nama file dan ukuran, "Pratinjau" (tab baru; file yang baru dipilih memakai object URL), "Ganti PDF", "Batalkan pilihan" / "Hapus PDF". |
| `GalleryUpload` | gambar berurutan dengan keterangan (juga teks alternatif; bila kosong "Gambar 2 dari {judul}"), tambah beberapa sekaligus sampai batas, hapus, Naikkan/Turunkan; posisi baru diumumkan. |
| `useAssetField`, `useGalleryField`, `prepareUploads`, `assetUrlsOf` | file disiapkan saat dipilih (gambar dikompres, PDF dicek) dan **baru diunggah saat simpan**. Gagal simpan → file baru dihapus lagi; berhasil → file lama yang diganti/dihapus dibersihkan. |
| `ReorderButtons`, `useReorder`, `ReorderStatus` | Naikkan/Turunkan di baris daftar: urutan baru langsung tampil, baris yang berubah diberi `sort_order` 0..n-1, lalu data dimuat ulang. `aria-disabled` di ujung daftar dan saat pencarian aktif; fokus tetap di tombol; posisi diumumkan. |
| `Thumb`, `DisplayBadges` | thumbnail daftar (logo memakai `contain`) atau ikon pengganti; badge "Unggulan" dan "Disembunyikan" (garis putus-putus, ikon mata dicoret). |
| `Card`, `Badge`, `StatCard` | kartu modul, badge mono (netral, aksen, sukses, bahaya), kartu ringkasan berupa tautan. |
| `DataList`, `DataListItem` | daftar yang menjadi baris di layar lebar dan kartu di HP. |
| `SectionScreen`, `RowActions`, `SearchBox`, `NoMatches` | layar daftar ↔ form, skeleton, galat dengan "Coba lagi", empty state, dialog hapus; Ubah/Hapus berlabel unik; kolom cari. |
| `Dialog`, `ConfirmDialog`, `ToastProvider`, `Alert`, `EmptyState`, `Skeleton` | seperti tahap 2. Toast naik di atas bar Batal/Simpan saat form terbuka (tidak menutupi tombol Simpan). |
| `UnsavedChangesProvider`, `useUnsavedChanges`, `useFormScreen`, `useGuardedNav` | penjaga perubahan. `useFormScreen({ extraDirty })` ikut menghitung file yang dipilih; daftar dan objek dibandingkan isinya. |
| `contentLabels.js`, `formValues.js`, `format.js`, `friendlyError.js`, `projectLinks.js` | daftar pilihan (status proyek, jenis proyek, jenis tautan, kategori sertifikat, jenis pengalaman, kategori keahlian, tingkat bahasa) dan `certificateValidity`; `nextSortOrder`, `bySortOrder`; `formatFileSize`, `formatMonthYear`, `formatPeriod`; pesan ramah untuk migrasi yang belum dijalankan, format dan ukuran file; tautan proyek: cek alamat, kolom lama, "Repo privat" otomatis, ringkasan daftar. |

Utilitas di `src/lib/`: `imageCompression.js` (`compressImage`, `checkImageFile`), `pdfFile.js`
(`checkPdfFile`), `storageUtils.js` (`extractStoragePath` untuk 7 folder, `uploadAsset`, `removeAssets`).

**Dipakai ulang tanpa versi baru:** `Logo`, `RobotMascot`, `ViewfinderCursor`, `BlueprintBackground`
(`calm`), `ShutterTransition`.

## 4. Pola halaman

- **Daftar:** header (judul, deskripsi, "Muat ulang", tombol tambah) → sub-tab → ringkasan mono
  ("4 proyek · 2 unggulan · 1 disembunyikan") → penyaring/cari bila ada → daftar.
- **Baris daftar:** thumbnail (gambar, logo, atau ikon), judul `h3`, badge status (mis. "Produksi",
  "Berlaku sampai 2028", "Kedaluwarsa dalam 2 bulan") + "Unggulan" + "Disembunyikan", subjudul, meta mono,
  lalu Naikkan/Turunkan, Ubah, Hapus.
- **Urutan:** ditentukan tombol Naikkan/Turunkan, tidak lagi lewat kotak angka "Urutan tampil" di form. Data
  baru masuk di urutan terakhir; mengubah data tidak mengubah urutannya. Keahlian diurutkan per kategori.
- **Form:** panel penuh, kelompok kolom bertajuk mono, blok "Tampilan di halaman publik" di akhir, bar aksi
  menempel. Simpan: "Menyimpan..." → "Tersimpan" → kembali ke daftar + toast.
- **Hapus:** `ConfirmDialog` menyebut nama data dan file yang ikut terhapus ("… beserta gambar sampul dan
  screenshot-nya"). Semua file data itu dihapus dari Storage setelah barisnya terhapus.
- **Data:** hooks dipanggil dengan `{ includeAdminFields: true }` (Profil: `includePrivateFields`), jadi query
  halaman publik tetap sama persis. Admin mengurutkan daftar sendiri berdasarkan `sort_order`.

## 5. Aturan unggah

| Isi | Folder | Kompresi | Batas |
|---|---|---|---|
| Foto profil | `profile/` | WebP, sisi terpanjang 1.600 px | file asli ≤10 MB, hasil ≤2 MB |
| Gambar sampul proyek | `projects/` | WebP, 1.600 px | sama |
| Galeri proyek (5), foto pengalaman (3), foto prestasi | `gallery/` | WebP, 1.600 px | sama |
| Logo pengalaman/pendidikan/organisasi, ikon keahlian | `logos/` | WebP, 400 px, transparansi terjaga | sama |
| Gambar sertifikat | `certificates/` | WebP, 1.600 px | sama |
| CV | `cv/` | – | PDF ≤5 MB, header `%PDF-` |
| PDF sertifikat | `certificates/` | – | sama |
| Dokumen prestasi | `documents/` | – | sama |

- Hanya PNG, JPG, dan WebP untuk gambar (SVG dan GIF ditolak); gambar selalu digambar ulang di canvas, jadi
  data lokasi foto ikut hilang. Browser yang tidak bisa membuat WebP memakai JPEG (foto) atau PNG (logo).
- **Orientasi foto HP tetap:** kamera HP menyimpan foto potret dalam posisi miring dan menambah tag EXIF
  Orientation. Tag itu dibaca dari file JPEG; bila browser belum memutar foto saat membukanya (dicek sekali
  dengan JPEG 2×1 bertag "putar 90°"), canvas yang memutar/membalik foto (semua nilai 1–8).
- Nama file acak (`{folder}/{uuid}.webp`), `contentType` dikirim eksplisit karena bucket membatasi MIME.
- Bucket `portfolio-assets` menerima PNG, JPEG, WebP, dan PDF sampai 5 MB; policy admin per folder
  memeriksa ekstensi (migrasi `20261016000000_admin_content_model.sql`). Batas 2 MB untuk gambar dijaga di
  browser.

## 6. Halaman

- **Beranda — "Selamat datang, Aldi":** robot a+ kecil. Kartu **Perlu dilengkapi** berisi pengingat yang
  dihitung dari data (hanya data yang tampil): foto profil, CV PDF, peran utama, kata berganti, LinkedIn,
  username GitHub; proyek unggulan belum dipilih atau lebih dari 4, proyek tanpa sampul atau status;
  sertifikat tanpa gambar, akan kedaluwarsa dalam 3 bulan (merah), sudah kedaluwarsa, belum ada yang
  unggulan; pengalaman tanpa poin tugas atau belum ada yang unggulan. Setiap pengingat adalah tautan.
  Lalu kartu ringkasan per kelompok menu (Tentang Saya, Karya & Keahlian, Rekam Jejak, Kotak Masuk) dan
  5 pesan serta 5 entri buku tamu terbaru.
- **Profil:** data utama; Foto dan CV (foto profil, CV PDF, tautan CV cadangan); Peran dan kata berganti
  (peran utama ≤60 karakter, maks. 2 peran pendukung, maks. 8 kata berganti); status ketersediaan; tautan
  (username GitHub otomatis dari tautan GitHub); pilihan topik pesan untuk formulir kontak.
- **Proyek:** informasi utama; detail (status, jenis, tahun, klien, peran saya); studi kasus (masalah,
  solusi, hasil; angka hanya dari data asli); teknologi sebagai daftar berurutan; **tautan proyek** dan
  "Repo privat"; gambar sampul dan galeri 5 screenshot berketerangan; tampil/unggulan.
  - **Tautan proyek** (sejak 18 Oktober 2026, migrasi `20261018000000_project_links.sql`, kolom
    `projects.links`): maks. 6 tautan lewat `LinkListInput`, mis. repo konsol web dan repo aplikasi mobile.
    Menggantikan kolom tunggal "Tautan demo" dan "Tautan kode".
  - **Kolom lama tetap diisi:** saat simpan, tautan pertama berjenis Kode yang tidak privat ditulis ke
    `github_url`, dan tautan pertama berjenis Demo yang tidak privat ke `demo_url`; bila tidak ada, kolom itu
    dikosongkan. Halaman publik sekarang masih membaca kedua kolom itu (sampai tahap 3).
  - **"Repo privat"** tetap ada. Bila proyek punya tautan kode dan semuanya privat, kotak itu tercentang
    otomatis dan terkunci ("Nyala otomatis karena semua tautan kode bersifat privat."); selain itu diatur
    manual.
  - Proyek yang belum punya `links` tetapi masih punya `github_url`/`demo_url` (mis. alamat `http://` yang
    tidak disalin migrasi) dibuka dengan baris "Kode"/"Demo" dari kolom lama, jadi alamatnya tidak hilang
    diam-diam; simpan meminta alamat `https://`.
  - Daftar proyek menampilkan ringkasan "2 tautan · 2 privat" (menggantikan tautan Demo/Kode di meta).
- **Keahlian:** 7 kategori tetap sebagai chip, tingkat dalam kata (angka dan persen ditolak), ikon 400 px,
  tampil/unggulan; daftar dikelompokkan per kategori dengan judul `h2`.
- **Pengalaman:** jenis Magang/Kerja/Freelance/Organisasi; periode bulan/tahun + "Masih berjalan"; maks. 5 poin
  tugas, maks. 12 tag; logo; maks. 3 foto; satu proyek terkait; tampil/unggulan.
- **Pendidikan:** logo, IPK (0–4, koma atau titik), judul tugas akhir, tampil.
- **Sertifikat:** kategori, terbit dan "Berlaku sampai" (bulan/tahun) atau "Tidak kedaluwarsa", nomor
  kredensial, tautan verifikasi, skor, gambar dan PDF asli, tampil/unggulan.
- **Prestasi:** nama pencapaian, penerbit/penyelenggara, bulan (opsional) dan tahun, keterangan, dokumen PDF,
  foto, tampil/unggulan.
- **Bahasa:** tingkat kemampuan berupa teks dengan pilihan cepat (Penutur asli, Aktif, Menengah, Dasar),
  tampil.
- **Organisasi:** periode bulan/tahun (selesai kosong = masih aktif), logo atau foto kecil, tampil.
- **Pesan, Buku tamu:** seperti tahap 2; kini sub-halaman Kotak Masuk.

## 7. Teks

- Bahasa Indonesia sederhana; nama tabel, "database", dan istilah teknis tidak tampil di layar.
- Contoh penggantian: Projects → Proyek, Edit → Ubah, Logout → Keluar, Featured → Unggulan, Slug → Alamat
  singkat, Thumbnail → Gambar sampul, sort order → tombol Naikkan/Turunkan, is_visible → "Tampil di halaman
  publik", expiry → "Berlaku sampai".
- Petunjuk kolom memberi contoh nyata, mis. "Tulis pencapaian yang paling mewakili usaha atau prestasimu."
- Pesan galat ramah (`toFriendlyError`), tambahan tahap 2B:
  - kolom belum ada (migrasi belum dijalankan) → "Pembaruan database untuk panel admin belum dijalankan.
    Jalankan file migrasi terbaru di Supabase, lalu muat ulang halaman.";
  - format/ukuran file ditolak Storage → "Format file tidak didukung…", "Ukuran file terlalu besar…";
  - data terhubung sudah hilang (23503) → "Data yang dihubungkan sudah tidak ada…".
- Pesan galat tautan proyek (di bawah kolomnya): "Tulis nama tautan, misalnya Kode konsol web."; "Isi alamat
  tautan, atau nyalakan Privat bila tautan ini tidak boleh dibuka publik."; "Pakai alamat yang diawali https://
  (bukan http://)."; "Alamat tautan harus diawali https://, misalnya https://github.com/nama/proyek.";
  "Alamat tautan tidak boleh berisi spasi."; "Alamat tautan belum lengkap. Contoh: https://github.com/nama/proyek."

## 8. Motion

- Sedikit dan bermakna: laci, dialog/toast masuk, rel fokus input, kunci bracket + centang di tombol simpan,
  kedip robot Beranda, garis pindai calm. Sub-tab, sakelar, dan daftar hanya transisi warna/posisi singkat.
- `prefers-reduced-motion`: semua animasi dan transisi admin dimatikan, form langsung tertutup setelah simpan.

## 9. Aksesibilitas

- Satu `h1` per halaman; `h2` untuk bagian, judul kartu, dan kelompok (mis. kategori keahlian); `h3` untuk
  item daftar.
- Landmark: `main#adm-main`, `nav` "Menu admin", `nav` sub-tab bernama menu, `nav` "Jejak halaman".
- Keyboard penuh: fokus 2 px di semua kontrol (di sub-tab dan pengingat Beranda outline digambar di dalam,
  `-2px`); tombol Naikkan/Turunkan memakai `aria-disabled` sehingga fokus tidak hilang di ujung daftar.
- Status: toast sukses `role="status"`, galat `role="alert"`; pemindahan urutan dan perubahan galeri/daftar
  diumumkan lewat region `aria-live`.
- Warna tidak pernah satu-satunya penanda: "Disembunyikan" punya ikon dan garis putus-putus; masa berlaku
  ditulis sebagai teks.

## 10. Hasil uji (16 Oktober 2026)

Diuji otomatis di Chrome headless dengan Supabase tiruan (data dan Storage di memori, dengan kolom, CHECK
constraint, FK, batas MIME/ukuran bucket, dan policy folder yang sama dengan migrasi). Database asli tidak
tersentuh. Migrasi diuji terpisah di PGlite (Postgres WASM) dengan tiruan skema Supabase.

| Uji | Hasil |
|---|---|
| Migrasi: dijalankan 2×, PKL → Magang, tipe FK mengikuti `projects.id` (uuid dan bigint), 20 CHECK/FK menolak data salah, policy Storage (folder + ekstensi, non-admin ditolak) | 96/96 |
| Navigasi: 5 menu dan sub-tab di 12 rute, klik sub-tab/sidebar, keyboard, penjaga perubahan, 375/768/1024/1440, baris sub-tab di 300 px, laci HP, reduced motion, kontras | 235/235 |
| Profil: validasi gambar (SVG, GIF, teks, > 10 MB) dan PDF (palsu, > 5 MB, bukan PDF), kompresi 2400×1600 → 1600×1067 WebP, pratinjau PDF, daftar isian, username GitHub, simpan, ganti/hapus file lama, rollback saat unggah/simpan gagal, migrasi belum jalan | 110/110 |
| Proyek: badge dan meta, Naik/Turun (layar, keyboard, gagal simpan), semua kolom baru, sampul + galeri (urutan, keterangan, batas 5), edit menghapus file yang diganti, slug kembar + rollback, hapus beserta file, FK proyek terkait | 99/99 |
| Keahlian: kategori tetap + "(lama)", tingkat tanpa angka, ikon 400 px, urutan per kategori, pindah kategori | 49/49 |
| Pengalaman: jenis, bulan/tahun + validasi, poin tugas/tag, logo, foto, proyek terkait (termasuk yang sudah dihapus), PKL lama | 52/52 |
| Pendidikan, Bahasa, Organisasi: IPK, logo, sembunyikan, tingkat teks, urutan terkunci saat mencari, periode bulan/tahun | 80/80 |
| Sertifikat, Prestasi: kategori, masa berlaku dan badge, PDF palsu ditolak, gambar + PDF, bulan opsional, hapus beserta file | 69/69 |
| Beranda: kartu per kelompok, 10 pengingat dari data contoh, semua lengkap, unggulan terlalu banyak, kedaluwarsa, data kosong, migrasi belum jalan | 39/39 |
| Regresi: login dan publik vs `main`, publik setelah membuka admin vs akhir tahap 2 | 35/35 |
| **Total** | **864/864** |

- **Lebar 375 / 768 / 1024 / 1440:** tanpa scroll horizontal di semua daftar dan form yang diuji.
- **Kontras** dihitung dari computed style di setiap daftar dan form pada empat lebar: tidak ada teks di bawah
  4,5:1.
- **Login dan halaman publik tidak berubah:** build `main` dan build branch ini dibandingkan di 4 lebar (computed
  style dan kotak setiap elemen, tinggi halaman, latar `<html>`; animasi dibekukan) → identik. Query Supabase
  halaman publik sama persis. Setelah membuka admin lebih dulu di tab yang sama, halaman publik identik dengan
  akhir tahap 2 (`main` masih berbeda karena stylesheet admin lama di `main` membocorkan `.form-label` ke
  formulir kontak; bocoran itu sudah hilang sejak tahap 2).
- **Query:** semua select publik/bawaan sama dengan `main`; admin hanya menambah kolom. Payload lama tetap
  dikirim, ditambah kolom baru. `sort_order` kini hanya dikirim saat menambah data (urutan diubah lewat
  Naikkan/Turunkan). Unggah/hapus file Proyek pindah ke `uploadAsset`/`removeAssets` (bucket sama,
  ditambah `contentType`).
- **`npm run lint`** 0 diagnostik; **`npm run build`** sukses (peringatan ukuran chunk utama > 500 kB sudah ada
  di `main`).

### Uji ulang setelah koreksi (17 Oktober 2026)

| Uji | Hasil |
|---|---|
| Migrasi di PGlite: `BEGIN;` di baris pertama dan hanya query cek setelah `COMMIT;`; dijalankan 2× (uuid dan bigint); query cek 60 baris per tabel tanpa "BELUM ADA"; `messages.topic` teks boleh kosong, bisa diisi pengunjung (anon), > 60 karakter ditolak; tabel tanpa `sort_order` mendapat kolom itu; satu perintah gagal → tidak ada kolom, data, atau policy yang berubah | 106/106 |
| Orientasi foto: EXIF 1–8 (dua bentuk EXIF), JPEG tanpa EXIF, PNG, foto 4032×3024 6 MB → 1200×1600 tegak, foto persegi, EXIF rusak; di Chrome biasa, Chrome yang dibuat mengabaikan EXIF, dan jalur `<img>` | 63/63 |
| Parser IPK: `3,54`, `3.54`, `4,00` diterima; `4,01`, `3,541`, `abc` ditolak | 13/13 |
| Uji UI admin diulang (Navigasi, Profil, Proyek, Keahlian, Pengalaman, Pendidikan/Bahasa/Organisasi, Sertifikat/Prestasi, Beranda) | 733/733 |

Uji orientasi juga dijalankan pada kode sebelum koreksi: 16 kasus gagal di Chrome yang mengabaikan EXIF (foto
tersimpan miring), jadi uji ini memang menangkap masalahnya. Regresi login/publik tidak diulang karena koreksi
hanya menyentuh admin dan migrasi. `npm run lint` 0 diagnostik, `npm run build` sukses.

### Uji tautan proyek (18 Oktober 2026)

| Uji | Hasil |
|---|---|
| Migrasi `20261018000000_project_links.sql` di PGlite: `BEGIN;` di baris pertama, hanya query cek setelah `COMMIT;`, tanpa RLS/policy, kolom lama tidak dihapus; salin `github_url`/`demo_url` (Kode lalu Demo, spasi dipangkas, alamat `http://` atau berspasi tidak disalin dan muncul di "catatan", proyek "Repo privat" → tautan kode privat); dijalankan 2× tanpa menyalin ulang atau menimpa tautan yang sudah diubah; 11 bentuk tautan diterima dan 24 ditolak (mis. 7 tautan, nama kosong/61 karakter, jenis lain, `http://`, tautan publik tanpa alamat); satu perintah gagal → tidak ada kolom atau constraint; tanpa migrasi 2B gagal tanpa perubahan | 61/61 |
| Tautan proyek di admin (Supabase tiruan dengan aturan yang sama): ringkasan daftar, isi form dari data tersimpan, tambah (fokus ke nama, diumumkan), 6 alamat salah + nama kosong dengan pesan masing-masing dan fokus ke kolomnya, tautan privat tanpa alamat, sakelar dengan Space, urutkan (klik dan Enter, fokus tetap), hapus, baris kosong dibuang, sinkron `github_url`/`demo_url`, "Repo privat" otomatis lalu lepas lagi, hapus semua, batas 6, alamat lama dari kolom lama, proyek baru, gagal simpan, 4 lebar tanpa scroll samping, kontras, migrasi belum dijalankan | 97/97 |
| Suite admin lama diulang (Navigasi, Profil, Proyek, Keahlian, Pengalaman, Pendidikan/Bahasa/Organisasi, Sertifikat/Prestasi, Beranda); suite Proyek kini mengisi tautan demo lewat daftar tautan | 734/734 |
| Login dan publik vs `main` di 375/768/1024/1440 (publik juga setelah membuka admin): setiap elemen (computed style, teks, atribut, posisi, ukuran), teks halaman, tinggi, dan query Supabase identik | 61/61 |

`npm run lint`: 0 diagnostik di `src/` (112 peringatan berasal dari skrip skill di `.claude/skills/impeccable/scripts`,
sudah ada di `main`). `npm run build` sukses (peringatan ukuran chunk utama sudah ada di `main`).

## 11. Batasan yang diketahui

- **Halaman publik belum membaca kolom baru** (tahap 3). Sakelar tampil/unggulan, CV PDF, galeri, dan lainnya
  sudah tersimpan tetapi belum terlihat di situs.
- **Tautan proyek di situs:** sampai tahap 3 situs hanya menampilkan tautan kode dan demo publik pertama
  (lewat `github_url`/`demo_url`). Tautan lain dan label tautan privat baru tampil setelah halaman publik
  membaca `links`.
- **Tautan privat bukan rahasia:** alamat tautan privat (bila diisi) tetap tersimpan di `links`, yang bisa
  dibaca lewat API publik seperti kolom konten lain. Jangan isi alamat yang benar-benar rahasia.
- **"Repo privat" manual** masih bisa dinyalakan walau ada tautan kode yang publik (tidak dicegah).
- **`is_visible` bukan privasi:** RLS SELECT tabel konten tetap terbuka dan bucket publik, jadi data/file yang
  disembunyikan masih bisa dibaca lewat API atau URL-nya.
- **Mengubah urutan tidak atomik:** satu langkah bisa memperbarui dua baris. Bila salah satu gagal, daftar
  menampilkan urutan yang tersimpan (bisa campuran) dan langkah berikutnya menomori ulang semuanya.
- **Tanggal lama dibulatkan ke tanggal 1** saat data disimpan ulang (form memakai bulan/tahun).
- **Batas 2 MB gambar dijaga di browser**; batas bucket 5 MB (satu angka untuk semua file).
- Tombol Back browser tidak memicu dialog "Tinggalkan perubahan?" (butuh data router, berarti mengubah
  routing). Menu, sub-tab, jejak, Batal, Keluar, "Muat ulang", dan tutup/muat ulang tab sudah dijaga.
- Badge pesan memakai `useMessages` di kerangka, jadi ada satu permintaan tambahan per halaman admin; halaman
  Pengalaman juga memuat daftar proyek untuk pilihan "Proyek terkait".
- Belum dikerjakan (tahap 3c): kolom versi bahasa Inggris, label fisika, angka studi kasus.
