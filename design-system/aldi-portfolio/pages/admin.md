# Override Halaman: Panel Admin (`/admin/*`)

> **PROJECT:** Aldi Portfolio · **Diperbarui:** 16 Oktober 2026
> ⚠️ Aturan di file ini **menimpa** `design-system/aldi-portfolio/MASTER.md`. Bila bertentangan dengan
> `BRIEF.md`, brief yang dipakai.
> **Status:** diterapkan di tahap 2 (branch `feat/ui-admin`). Rencana dan urutan kerjanya:
> `plans/tahap-2-admin.md`.

Login punya aturannya sendiri di `pages/login.md` dan tidak diubah di tahap 2.

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

## 2. Kerangka

```
≥1024 px                                   <1024 px
┌───────────┬─────────────────────────┐    ┌──────────────────────────┐
│ [logo]│Aldi│ Judul        [aksi]     │    │ ☰  [logo]│Aldi Dwi Irawan│
│  KELOLA…  │ deskripsi                │    ├──────────────────────────┤
│ Beranda   │                          │    │ Judul halaman  [aksi]    │
│ ISI …     │  isi (grid calm samar)   │    │ isi (daftar jadi kartu)  │
│ INTERAKSI │                          │    └──────────────────────────┘
│ Masuk sbg │                          │     ☰ → laci: fokus terkunci,
│ Lihat situs│                         │     Esc / scrim / pilih menu
│ Keluar    │                          │     menutup, fokus kembali ke ☰
└───────────┴─────────────────────────┘
```

- **`AdminRoot`** (`ui/AdminLayout.jsx`) membungkus setiap halaman: tema terang, toast, penjaga perubahan,
  pemantau sesi dan tombol Keluar (logika dipindahkan apa adanya dari Beranda lama), serta daftar pesan
  untuk badge "belum dibaca" (bisa dibaca halaman lewat `useAdminShell()`).
- **`AdminLayout`** adalah kerangka yang terlihat: tautan "Lewati ke konten", `ViewfinderCursor`,
  sidebar, `BlueprintBackground variant="calm"`, `<main id="adm-main">`, dan `PageHeader`.
- **Sidebar:**
  - lockup brand (`BrandLockup`: logo 29 px trim | garis | "Aldi Dwi Irawan" + "KELOLA ISI // 2026");
  - 12 menu dalam 3 kelompok (Beranda; Isi portofolio; Interaksi), dengan `aria-current="page"`;
  - badge jumlah pesan belum dibaca di menu Pesan;
  - kaki: "Masuk sebagai {email}", "Lihat situs" (tab baru), "Keluar". Di desktop kaki menempel di dasar
    (dengan pudar tipis di atasnya) supaya "Keluar" selalu terlihat di layar laptop pendek. Seluruh sidebar
    digulir sebagai satu kesatuan (tanpa gulir bersarang).
- **Laci HP (< 1024 px):** `role="dialog"` + `aria-modal`, `inert` saat tertutup, scroll halaman dikunci saat
  terbuka. Titik penanda di tombol ☰ bila ada pesan belum dibaca (jumlahnya dibacakan).
- **`PageHeader`:** jejak opsional (mis. "Proyek / Tambah proyek"), satu-satunya `h1` (Inter 800, -0.02em,
  `tabIndex=-1`), deskripsi singkat, aksi halaman, dan slot `leading` (robot kecil di Beranda).
- **Fokus dan judul tab:**
  - pindah halaman di dalam admin → gulir ke atas dan fokus ke `h1` baru;
  - ganti tampilan di halaman yang sama (daftar ↔ form) → fokus ke `h1` baru;
  - setelah login, transisi jepret mendarat di `h1` "Selamat datang, Aldi";
  - judul tab: `{Halaman} · Kelola isi · Aldi Dwi Irawan`.
- **Loading antarhalaman:** layar terang `AdminRoute.css` (lajur gelap di posisi sidebar/bar atas); spinner
  dan teks baru muncul setelah 0,3 detik.

## 3. Komponen bersama (`src/components/admin/ui/`)

| Komponen | Isi dan perilaku |
|---|---|
| `Button`, `ButtonLink`, `IconButton` | varian `primary`, `secondary`, `danger`, `ghost` (+ `adm-btn--danger-text` untuk Hapus di daftar). `loading` memakai `aria-disabled` + guard dan teks "Menyimpan..." / "Memuat...". `status="success"`: bracket mengunci tombol lalu centang dan "Tersimpan". |
| `Field`, `Input`, `Textarea`, `Select` | label terlihat, tanda `*` atau "(opsional)", petunjuk, dan pesan galat tepat di bawah kolom. `id`, `aria-describedby`, `aria-invalid` dipasang otomatis. Rel kiri aksen saat fokus (merah saat galat) di samping outline 2 px. |
| `Checkbox`, `ChoiceGroup`, `QuickPicks` | kotak centang dengan deskripsi; grup radio berbentuk chip (mis. Kerja/Magang/PKL); tombol pilihan cepat `aria-pressed` (preset kategori, juga penyaring daftar). |
| `FormSection`, `FormPanel` | `fieldset` + judul mono; kartu form berbracket dengan galat server di atas (digulir ke tengah layar), catatan kolom wajib, dan bar Batal / Simpan yang menempel di bawah. |
| `ImageUpload` | pratinjau, seret-lepas (teks seret disembunyikan di layar sentuh), "Pilih/Ganti gambar", "Batalkan pilihan". Batas 2 MB dan validasi tetap di form pemiliknya. |
| `Card`, `Badge`, `StatCard` | Blueprint Module Card (bar mono, bisa berisi `h2` asli); badge mono nada netral/aksen/sukses/bahaya; kartu ringkasan berupa tautan ("Proyek: 6, 2 unggulan" untuk pembaca layar). |
| `DataList`, `DataListItem` | daftar `ul` yang menjadi baris di layar lebar dan kartu di HP: media, judul `h3`, badge, subjudul, meta mono (dipisah titik tengah), aksi. |
| `SectionScreen`, `RowActions`, `SearchBox`, `NoMatches` | layar bagian isi: daftar ↔ form panel penuh, skeleton saat muat pertama (muat ulang tidak mengosongkan daftar), galat dengan "Coba lagi", empty state, dialog hapus; tombol Ubah/Hapus dengan nama unik; kolom cari berlabel; pesan "tidak ada yang cocok". |
| `Dialog`, `ConfirmDialog` | portal terang, fokus terkunci (bertumpuk dengan benar di atas laci atau dialog lain), Esc dan backdrop menutup (kecuali sedang proses), fokus awal di "Batal", galat di dalam dialog, `returnFocusRef` untuk mengembalikan fokus ke `h1` bila baris yang dihapus sudah hilang. |
| `ToastProvider` / `useToast` | sukses dan info (`role="status"`, hilang setelah 4 detik, berhenti saat disorot/difokus); galat (`role="alert"`, tetap sampai ditutup); maksimal 4. |
| `Alert`, `EmptyState`, `Skeleton` | alert nada bahaya/sukses/info; empty state dengan robot a+ kecil dan ajakan; skeleton daftar/ringkasan/form. |
| `UnsavedChangesProvider`, `useUnsavedChanges`, `useFormScreen` | penjaga perubahan: peringatan browser saat tab ditutup atau dimuat ulang, dialog "Tinggalkan perubahan?" untuk menu sidebar, jejak, Batal, Keluar, dan "Muat ulang". |
| `useFormFeedback` | fokus ke kolom galat pertama setelah submit, gulir galat server ke layar, jeda singkat "Tersimpan" sebelum form tertutup. |
| `toFriendlyError` | memetakan pesan mentah (Supabase, istilah teknis) ke kalimat sederhana saat ditampilkan. |
| `format.js` | tanggal relatif ("2 jam yang lalu", "kemarin", lalu "5 Okt 2026") dan tanggal lengkap untuk `title`. |

**Dipakai ulang tanpa versi baru:** `Logo`, `RobotMascot`, `ViewfinderCursor`, `BlueprintBackground`
(`calm`), `ShutterTransition`.

## 4. Pola halaman

- **Daftar:** header (judul, deskripsi, "Muat ulang", tombol tambah) → ringkasan mono ("4 proyek · 2
  unggulan") → penyaring/cari bila ada → daftar.
- **Form:** panel penuh menggantikan daftar, jejak kembali ke daftar, kelompok kolom dengan judul mono, bar
  aksi menempel. Simpan: "Menyimpan..." → "Tersimpan" (±0,7 detik, langsung saat reduced motion) → kembali ke
  daftar + toast.
- **Hapus:** `ConfirmDialog` dengan nama data: `Proyek "X" akan dihapus permanen. Tindakan ini tidak bisa
  dibatalkan.` Fokus ke "Batal"; setelah berhasil, fokus ke `h1`.
- **Logika data tidak berubah.** Hooks, query Supabase, payload, dan handler tetap; yang berubah hanya tampilan,
  teks di layar, dan alur di layar. Rantai `supabase.…` setiap halaman dan form dibandingkan otomatis dengan
  `main` dan identik.

## 5. Halaman

- **Beranda — "Selamat datang, Aldi":** robot a+ kecil (idle, berkedip sesekali). Kelompok Interaksi
  (Pesan: "3 baru dari 12 pesan", Buku tamu: jumlah belum dibalas) dan Isi portofolio (9 kartu, mis. Profil
  "6/7 data utama terisi", Proyek "2 unggulan"). Lalu 5 pesan dan 5 entri buku tamu terbaru. Semua lewat
  hooks yang ada; daftar pesan dibagi dengan badge sidebar.
- **Proyek:** gambar sampul, badge Unggulan/Urutan, tag teknologi, alamat, tautan demo/kode. Form: alamat
  singkat otomatis dari judul, `ImageUpload` (2 MB).
- **Keahlian:** penyaring kategori, pilihan cepat kategori dan tingkat.
- **Pengalaman / Pendidikan:** Kerja/Magang/PKL sebagai grup radio; "Masih berjalan" / "Masih belajar di sini"
  mengosongkan dan mengunci tanggal/tahun selesai.
- **Sertifikat / Prestasi / Bahasa / Organisasi:** kolom cari berlabel; tingkat bahasa sebagai grup radio.
- **Pesan:** penyaring Semua / Belum dibaca / Sudah dibaca, detail di dialog (otomatis ditandai dibaca),
  "Tandai sudah/belum dibaca", "Balas lewat email", hapus (juga dari dialog detail). Badge sidebar ikut
  diperbarui.
- **Buku tamu:** balasan berlabel per entri (simpan hanya aktif bila teks berubah), penyaring dibalas/belum,
  hapus lewat dialog (menggantikan `window.confirm`).
- **Profil:** satu form tiga bagian dengan pratinjau langsung, sakelar ketersediaan (`role="switch"`) yang
  menyebut teks publiknya, "Batalkan perubahan" bila ada perubahan.

## 6. Teks

- Bahasa Indonesia sederhana; nama tabel, "database", dan istilah teknis tidak tampil di layar.
- Contoh penggantian: Projects → Proyek, Edit → Ubah, Logout → Keluar, Situs Publik → Lihat situs,
  Featured → Unggulan, Slug → Alamat singkat, Demo/GitHub URL → Tautan demo/kode, Tech stack → Teknologi
  yang dipakai, Thumbnail → Gambar sampul, Segarkan Data → Muat ulang, "[DEV ALDI]" → tanda pemilik situs.
- Pesan galat ramah (`toFriendlyError`):
  - jaringan → "Tidak bisa terhubung ke server. Periksa koneksi internet, lalu coba lagi.";
  - data kembar (23505) → "Sudah ada data dengan isian yang sama …"; untuk proyek: "Alamat singkat ini sudah
    dipakai proyek lain.";
  - izin RLS (42501) → "Anda tidak punya izin untuk menyimpan perubahan ini.";
  - sesi berakhir → "Sesi Anda sudah berakhir. Silakan keluar, lalu masuk lagi.";
  - teks teknis lain → kalimat cadangan per konteks, mis. "Proyek belum tersimpan. Periksa koneksi
    internet, lalu coba lagi."

## 7. Motion

- Sedikit dan bermakna: laci (buka 260 ms, tutup 180 ms), dialog/toast masuk, rel fokus input, kunci bracket
  + centang di tombol simpan, kedip robot Beranda, garis pindai calm di latar.
- `prefers-reduced-motion`: semua animasi dan transisi admin dimatikan, form langsung tertutup setelah simpan,
  robot tidak berkedip.

## 8. Aksesibilitas

- Satu `h1` per halaman; `h2` untuk bagian dan judul kartu; `h3` untuk item daftar.
- Landmark: `main#adm-main`, `nav` "Menu admin", `nav` "Jejak halaman"; tautan "Lewati ke konten".
- Keyboard penuh, fokus 2 px di semua kontrol (jaring pengaman `:focus-visible`), fokus terkunci di
  dialog/laci, target ≥44 px di layar sentuh (36–40 px di desktop, di atas batas 24 px WCAG 2.2).
- Status: toast sukses `role="status"`, galat `role="alert"`, ringkasan daftar `aria-live="polite"`.
- Warna tidak pernah satu-satunya penanda (badge "Baru", "Belum dibalas", "Masih berjalan" + rel kiri).
- `forced-colors`: border dan outline pengganti untuk kartu, tombol, sakelar, dan menu aktif.

## 9. Hasil uji (16 Oktober 2026)

Diuji otomatis di Chrome headless dengan Supabase tiruan (data di memori; database asli tidak tersentuh).

| Uji | Hasil |
|---|---|
| Kerangka: sidebar, laci HP (fokus terkunci, Esc, scrim, pilih menu), tautan lewati, sticky, Keluar, transisi jepret ke "Selamat datang, Aldi" | 36/36 |
| Beranda: kartu ringkasan, urutan terbaru, robot berkedip (diam saat reduced motion), galat + "Muat ulang", kosong | 22/22 |
| Proyek: tambah/ubah/hapus, validasi + fokus, unggah (> 2 MB ditolak, pratinjau), penjaga perubahan (jejak, Batal, sidebar, tutup tab), alamat kembar, galat hapus, kosong, reduced motion | 40/40 |
| Keahlian, Pengalaman, Pendidikan (CRUD lengkap + aturan khusus tiap form) | 68/68 |
| Sertifikat, Prestasi, Bahasa, Organisasi (CRUD lengkap + cari) | 91/91 |
| Pesan dan Buku tamu (detail, tandai, badge, hapus bertumpuk, balasan, dialog pengganti `window.confirm`) | 32/32 |
| Profil (pratinjau, sakelar, batalkan perubahan, simpan, galat) | 16/16 |
| **Total** | **305/305** |

- **Query:** semua rantai `supabase.…` di 12 halaman dan 8 form identik dengan `main`.
- **Lebar 375 / 768 / 1024 / 1440:** tanpa scroll horizontal di semua halaman (daftar dan form).
- **Kontras** (dihitung dari computed style, termasuk dialog dan laci): 531 elemen teks, tidak ada yang di bawah
  ambang; terendah 4,83:1 (teks putih di tombol "Ya, hapus").
- **Login dan halaman publik tidak berubah:** build `main` dan build branch ini dibandingkan di 4 lebar
  (computed style dan kotak setiap elemen, tinggi halaman; animasi dibekukan di kedua sisi) → identik. Juga
  identik setelah membuka admin lebih dulu di tab yang sama (stylesheet admin sudah termuat).
- **`npm run lint`** 0 diagnostik; **`npm run build`** sukses (peringatan ukuran chunk utama > 500 kB sudah ada
  di `main`).

## 10. Batasan yang diketahui

- Tombol Back browser tidak memicu dialog "Tinggalkan perubahan?" (butuh data router, berarti mengubah
  routing). Tutup/muat ulang tab, menu sidebar, jejak, Batal, Keluar, dan "Muat ulang" sudah dijaga.
- Badge pesan memakai hook `useMessages` di kerangka, jadi ada satu permintaan tambahan per halaman admin
  (Beranda memakai data yang sama, tanpa permintaan kedua).
- Profil tidak punya kolom foto (`avatar_url`) sejak sebelum tahap 2; nilainya tetap disimpan apa adanya.
- Belum dikerjakan (tahap 3c): kolom versi bahasa Inggris, label fisika, angka studi kasus.
