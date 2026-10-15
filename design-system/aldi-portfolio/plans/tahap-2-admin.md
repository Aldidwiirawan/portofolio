# Rencana Tahap 2 — Panel Admin

> **Status:** disetujui pemilik project, 15 Oktober 2026 · **Branch:** `feat/ui-admin` (dari `main`)
> Acuan: `BRIEF.md` (utama), `MASTER.md`, `pages/admin.md`, `pages/login.md`, `PROJECT_ANALYSIS.md`.

**Cara melanjutkan bila konteks terputus:** baca file ini, lalu kerjakan butir pertama yang belum dicentang
di bagian "Urutan commit". Setiap butir dicentang di commit yang sama dengan pekerjaannya.

**Aturan:** jangan ubah logika auth (`authService`, `AdminRoute`), hooks data, query Supabase, RLS, atau
routing. React + Vite + CSS biasa; tanyakan dulu sebelum menambah library atau font. Halaman login dan
publik tidak boleh berubah. Commit per bagian, jangan push atau merge, screenshot tidak di-commit.

---

## 1. Ringkasan audit

- Ada 12 halaman (Beranda dan 11 bagian) plus 8 form, sekitar 10 ribu baris.
- Setiap halaman membuat navbar sendiri. Judul "Admin Portfolio CMS" berulang, dan tombol "← Dashboard"
  muncul dua kali.
- Tampilan 100% gelap dengan token lama (sekitar 350 pemakaian `--color-*`) plus hex mentah (`#fca5a5` 12×,
  `#ffffff` 8×, `#6ee7b7` 4×). CSS admin tidak punya `focus-visible` maupun `prefers-reduced-motion`.
- Teks campur bahasa Inggris dan istilah teknis: "Featured", "Edit", "Logout", "Projects", "Database Target
  `public.projects`".
- Beranda masih berupa daftar modul yang menampilkan nama tabel database.
- Buku tamu memakai `window.confirm` untuk konfirmasi hapus.
- Halaman Proyek memakai `TechBadge` milik halaman publik.

**Batasan penting:** perintah tambah, ubah, dan hapus ke Supabase ditulis langsung di dalam halaman dan form,
bukan di hooks. Semua kode itu dibiarkan persis sama; yang berubah hanya tampilan dan alur di layar. Bukti:
semua rantai `supabase.…` sebelum dan sesudah dibandingkan otomatis dan harus identik.

### Lima masalah tercatat dan penyelesaiannya

| Masalah | Penyelesaian |
|---|---|
| `.admin-back-link` hanya ada di CSS login (dipakai 4 halaman) | Navigasi pindah ke sidebar, jadi class ini tidak dipakai lagi. Rule-nya dihapus dari CSS login (login sendiri tidak memakainya). |
| Class alert tanpa style (`admin-alert*` di 4 file, ditambah `admin-guestbook-alert` dan `admin-modal-error-alert`) | Semuanya diganti komponen Toast dan Alert yang baru. |
| `--color-bg-base` dan `--color-bg-elevated` tidak terdefinisi | Ikut hilang bersama CSS lama; diganti token `--ds-*`. |
| Tombol utama lama hanya 3,68:1 | Admin memakai tombol baru dengan warna `--ds-accent` (5,17:1). Class `.btn` global tidak disentuh karena dipakai halaman publik. |
| Kilatan gelap "Memuat halaman..." | Layar loading diubah jadi terang lewat CSS saja. Loader baru tampil setelah sekitar 0,3 detik, jadi cek akses yang cepat tidak sempat berkedip. |

## 2. Tata letak

```
≥1024 px                                   <1024 px
┌───────────┬─────────────────────────┐    ┌──────────────────────────┐
│ [logo]│Aldi│ Proyek        [+ Tambah]│    │ ☰  [logo]│Aldi Dwi Irawan│
│  KELOLA…  │ deskripsi singkat        │    ├──────────────────────────┤
│───────────│─────────────────────────│    │ Judul halaman  [+ Tambah]│
│ Beranda   │                         │    │ isi (tabel jadi kartu)   │
│ ISI       │  isi halaman            │    └──────────────────────────┘
│  Profil … │  (grid calm samar)      │     ☰ → laci sidebar: tertutup
│ INTERAKSI │                         │     saat menu dipilih / Escape /
│  Pesan (3)│                         │     klik di luar; fokus terkunci
│ Lihat situs│                        │     di laci, lalu kembali ke ☰
│ Keluar    │                         │
└───────────┴─────────────────────────┘
```

- **Sidebar** gelap, seperti panel brand di login.
  - Di atas: lockup yang sama dengan login (logo transparan, garis pemisah, "Aldi Dwi Irawan", sub-label).
  - Menu berikon dalam 3 kelompok, dengan penanda halaman aktif (`aria-current`).
  - Badge jumlah pesan belum dibaca di menu Pesan.
  - Di bawah: "Masuk sebagai {email}", tautan "Lihat situs", dan tombol "Keluar".
- **Area kerja** terang, dengan background `calm` dan kursor viewfinder.
- **Header halaman** berisi satu h1 (Inter 800, -0.02em), deskripsi singkat, dan tombol aksi utama.
- **Tautan cepat** "Lewati ke konten" untuk pengguna keyboard.
- **Routing tidak berubah.** Setiap halaman membungkus isinya dengan `<AdminLayout>`. Logika keluar dipindahkan
  apa adanya dari Beranda ke layout: `signOut`, lalu ke `/admin/login`, dan pemantauan sesi yang sama.
- **Form** tampil sebagai panel penuh di halaman yang sama, menggantikan daftar, dengan jejak seperti
  "Proyek / Tambah proyek".
- **Loading antarhalaman** memakai tema terang yang sama (tanpa kilatan gelap).

## 3. Komponen bersama

Letaknya di `src/components/admin/ui/`, dengan satu stylesheet admin. Semuanya memakai bahasa visual login:
sudut 4–6 px, border 1 px, bracket di elemen penting, dan bar header monospace.

- **Kerangka:** `AdminLayout`, `AdminSidebar` (beserta laci HP), `PageHeader`, `BrandLockup`
- **Tombol:** `Button` dengan varian utama, kedua, bahaya, dan polos.
  - Status loading: "Menyimpan...".
  - Animasi sukses: bracket mengunci tombol lalu muncul centang. Durasinya di bawah 1 detik, dan mati saat
    reduced motion.
- **Kolom isian:** `Field` (label, kontrol, petunjuk, dan pesan galat tepat di bawah kolom), lalu `Input`,
  `Select`, `Textarea`, `Checkbox`, dan `ImageUpload`.
  - `ImageUpload`: pratinjau gambar, batas 2 MB, dan pesan galat yang jelas.
  - Input memakai garis kiri menyala saat fokus, di samping outline fokus 2 px yang tetap ada.
- **Tampilan data:** `Card` (Blueprint Module), `Badge`, dan `DataList` (berbaris di layar lebar, berubah jadi
  kartu di HP).
- **Umpan balik:**
  - `ConfirmDialog`: fokus terkunci di dalam dialog, Esc menutup, tombol bahaya terpisah.
  - `Toast`: `role="status"`; pesan sukses hilang sendiri setelah 4 detik, pesan gagal tetap sampai ditutup.
  - `Alert`, `EmptyState` (robot a+ kecil dengan ajakan seperti "Tambah proyek pertama"), dan `Skeleton`.
- **Penjaga perubahan:** `useUnsavedChanges` memberi peringatan saat menutup atau memuat ulang tab, saat klik
  menu sidebar, dan saat menekan "Batal".
- **Pesan galat yang ramah:** pesan mentah dari Supabase dipetakan ke kalimat sederhana saat ditampilkan, seperti
  di login. String di dalam logika tidak diubah.

**Dipakai ulang tanpa versi baru:** Logo, RobotMascot, ViewfinderCursor, BlueprintBackground (`calm`), dan
ShutterTransition.

## 4. Halaman

- **Beranda: "Selamat datang, Aldi".**
  - Robot a+ kecil di samping judul, mood idle dengan kedip sesekali.
  - Kartu ringkasan per bagian yang bisa diklik, misalnya "Proyek 6" atau "Pesan 3 baru dari 12".
  - Daftar 5 pesan terbaru dan 5 entri buku tamu terbaru.
  - Semua data diambil lewat hooks yang sudah ada; tidak ada query baru.
  - Transisi jepret dari login mendarat di h1 ini (halaman hanya punya satu h1, class loading tetap sama).
- **Proyek, Keahlian, Pengalaman, Pendidikan, Sertifikat, Prestasi, Bahasa, Organisasi:** daftar dengan aksi Ubah
  dan Hapus (lewat dialog), form sebagai panel penuh, pesan sukses lewat toast, dan empty state.
- **Pesan:** filter Semua / Belum dibaca / Sudah dibaca, detail pesan di dialog, tombol tandai dibaca, "Balas
  lewat email", dan konfirmasi hapus.
- **Buku tamu:** balasan langsung di daftar, dan konfirmasi hapus pakai dialog (menggantikan `window.confirm`).
- **Profil:** form tunggal yang dibagi per bagian, dengan peringatan perubahan belum disimpan.

## 5. Penggantian teks utama

| Lama | Baru |
|---|---|
| Admin Portfolio CMS / Dashboard | (judul dihapus) / Beranda |
| Projects, Skills, Experiences, Educations | Proyek, Keahlian, Pengalaman, Pendidikan |
| Certifications, Achievements, Languages, Organizations | Sertifikat, Prestasi, Bahasa, Organisasi |
| Messages / Inbox, Guestbook, Profile CMS | Pesan, Buku tamu, Profil |
| Logout / Situs Publik | Keluar / Lihat situs |
| + Tambah Project / Edit / Segarkan Data | Tambah proyek / Ubah / Muat ulang |
| Featured | Unggulan |
| Slug | Alamat singkat (dengan petunjuk "huruf kecil dan tanda hubung") |
| Demo URL / GitHub URL | Tautan demo / Tautan kode |
| Tech stack / Thumbnail | Teknologi yang dipakai / Gambar sampul |
| Ya, Hapus Project | Ya, hapus |
| Tindakan ini permanen… `public.projects` | Proyek "X" akan dihapus permanen. Tindakan ini tidak bisa dibatalkan. |
| Gagal Mengambil Data Projects | Proyek belum bisa dimuat. Coba lagi. |
| Tandai Sudah Dibaca | Tandai sudah dibaca |
| Memverifikasi hak akses administrator... (`AdminRoute`) | Memeriksa akses... (hanya teks; logika tetap) |

### Pemetaan pesan galat yang ramah

- **Gagal koneksi:** "Tidak bisa terhubung…"
- **Data kembar:** "Sudah ada data dengan alamat yang sama."
- **Izin RLS:** "Anda tidak punya izin menyimpan data ini."
- **Sesi berakhir:** "Sesi berakhir, silakan masuk lagi."

Semua istilah nama tabel dan "database" dihilangkan dari layar. Daftar lengkap per halaman dicatat di
`pages/admin.md`.

**Tidak dikerjakan di tahap ini** (milik tahap 3c): kolom versi Inggris, pengaturan label fisika, dan angka studi
kasus.

## 6. Pengujian

- **CRUD otomatis di 12 bagian** memakai Supabase tiruan yang menyimpan data di memori lewat Chrome headless,
  termasuk upload gambar. Database asli tidak tersentuh. Yang diuji: tambah, ubah, hapus, validasi, batas 2 MB,
  dan peringatan form belum disimpan. CRUD dengan data asli diuji manual oleh pemilik (lihat "Uji manual").
- **Layar dan aksesibilitas:** lebar 375, 768, 1024, dan 1440 px tanpa scroll horizontal; laci sidebar di HP;
  keyboard penuh; reduced motion; kontras teks ≥4,5:1.
- **Regresi:** 107 tes login yang sudah ada (termasuk transisi jepret ke judul baru), dan perbandingan computed
  style serta tinggi section halaman publik.
- **Lint dan build** di setiap tahap. Screenshot sebelum/sesudah di keempat ukuran (tidak di-commit).

## 7. Urutan commit

- [x] 0. Rencana ini (`plans/tahap-2-admin.md`)
- [x] 1. Fondasi: token admin, layar loading terang, teks loading `AdminRoute`
- [x] 2. Komponen bersama
- [x] 3. Layout dan sidebar
- [x] 4. Beranda
- [x] 5. Proyek
- [x] 6. Keahlian, Pengalaman, Pendidikan
- [x] 7. Sertifikat, Prestasi, Bahasa, Organisasi
- [x] 8. Pesan dan Buku tamu
- [ ] 9. Profil
- [ ] 10. Pembersihan CSS lama
- [ ] 11. Dokumentasi (MASTER.md, `pages/admin.md`) dan bagian "Uji manual" di file ini

## 8. Keputusan yang diambil

- **Sidebar:** gelap, menyambung panel brand login. Area kerja terang.
- **Sub-label sidebar:** "KELOLA ISI // 2026".
- **"Lihat situs":** dibuka di tab baru, supaya form yang sedang diisi tidak hilang.
- **`AdminRoute.jsx`:** hanya teks loading yang diganti menjadi "Memeriksa akses..." (permintaan pemilik);
  logikanya tetap persis sama dan dibuktikan lewat diff. Teks itu hanya terlihat bila pengecekan lebih dari
  0,3 detik.
- **Badge pesan belum dibaca:** memakai hook `useMessages` yang sudah ada. Akibatnya ada satu permintaan tambahan
  setiap membuka halaman admin.
- **Peringatan form belum disimpan:** mencakup tutup/muat ulang tab, klik menu sidebar, dan tombol "Batal". Tombol
  Back browser tidak bisa dicegat tanpa mengganti router ke data router (mengubah routing), jadi tidak dikerjakan.
- **Lockup di sidebar:** memakai komponen `BrandLockup` baru. Kode login tidak disentuh agar tidak berisiko
  berubah; kalau nanti ingin disatukan, login bisa ikut memakai komponen ini.

## 9. Uji manual

_Diisi di akhir pekerjaan (butir 11): langkah yang perlu dilakukan pemilik sendiri dengan akun dan data asli._
