# Override Halaman: Portofolio Publik (`/`, `/projects/:slug`, 404)

> **PROJECT:** Aldi Portfolio · **Diperbarui:** 18 Oktober 2026 (tahap 3A)
> ⚠️ Aturan di file ini **menimpa** `design-system/aldi-portfolio/MASTER.md`. Acuan utama tetap `BRIEF.md`.
> **Status: diterapkan (tahap 3A).** Rencana dan keputusan pemilik: `plans/tahap-3a-publik.md` (K1–K10, §6a).
> Tahap 3B (label fisika, suara, ayam dan bebek, layar pembuka, robot a+) dan 3C (kolom versi Inggris,
> pengaturan label dari admin) belum dikerjakan; ruangnya sudah disiapkan.

---

## 1. Tema dan karakter

- **Tema mengikuti perangkat** (`prefers-color-scheme`) sampai pengunjung memilih lewat tombol tema di navbar;
  pilihan disimpan di `localStorage` (`aldi-portfolio-theme`, dibungkus try/catch). Keduanya memakai token
  `--ds-*` yang sama dengan login/admin (`data-theme` di akar `.pub`).
- **Tanpa kilatan tema:** skrip kecil di `index.html` memasang `data-pub-theme` di `<html>` sebelum render
  pertama, **hanya bila alamat bukan `/admin…`**. `ThemeProvider` memperbarui atribut itu dan melepasnya saat
  halaman publik ditinggalkan, jadi login dan admin tidak pernah melihatnya.
- **Identitas yang dipertahankan:** nama raksasa uppercase dengan gradien (gelap: `--ds-brand-from` →
  `--ds-brand-to`; terang: `--ds-accent-text` → `--ds-success-text`, keduanya ≥4,5:1), grid blueprint `busy`
  dengan jalur sirkuit di hero/404/detail, aksen monospace (`~/buku-tamu`), label bergaya tag blueprint
  (bracket di 4 sudut, `.pub-tag`), logo monogram, kursor viewfinder.
- **Dibuang dari tampilan lama:** kartu ID 3D, spotlight mouse, `CustomCursor`, emoji sebagai ikon, angka hero
  yang ditulis di kode, ikon gembok admin di footer (admin tetap di `/admin/login`).

## 2. Bahasa (ID / US)

- Bahasa bawaan **Indonesia** (tidak mengikuti browser); tombol `ID | US` di navbar berganti sekali klik dan
  diingat (`aldi-portfolio-lang`). `<html lang>` ikut berubah dan kembali `id` saat keluar dari halaman publik.
- Teks tampilan ada di `src/i18n/id.js` dan `en.js` (kunci sama, `{nama}` diisi `t()`); konteks di
  `src/i18n/i18nContext.js`, penyedia `I18nProvider.jsx`, helper di `translate.js` (`formatDate` `id-ID` /
  `en-US`, `formatGpa`, `code()` untuk kode pilihan, `storedLabel()` untuk label lama seperti "Magang").
- **Isi dari database tetap bahasa Indonesia** sampai tahap 3C (kolom versi Inggris).

## 3. Struktur halaman

Urutan (K7): Navbar · Hero + bar status · Tentang · Proyek · Pengalaman · Keahlian · Pendidikan · Sertifikat ·
Prestasi (bila ada) · Organisasi (bila ada) · Kontak · Footer · tombol Buku tamu mengambang.

| Bagian | Komponen (`src/components/public/…`) | Catatan |
|---|---|---|
| Kerangka | `PublicLayout`, `ThemeProvider`, `PublicNavbar`, `PublicFooter`, `Toggles`, `CvButton`, `SocialLinks` | Rute `/`, `/projects/:slug`, `*` memakai satu kerangka (tema, bahasa, data dimuat sekali). Menu HP < 1024 px: dialog layar penuh, fokus terkunci. |
| Hero | `hero/HeroSection`, `HeroStage`, `KeywordRotator`, `StatusBar` | "Unduh CV" bila ada CV, kalau tidak "Hubungi saya" (K2). Kata berganti hanya bila `hero_keywords` terisi (K3). Panggung: keahlian unggulan bergiliran per kategori, maks. 8 (HP 6), plus `</>` dan `*` (K5), `aria-hidden`, `data-stage="labels"` untuk 3B. Bar status `data-stage="characters"` untuk ayam dan bebek. |
| Tentang | `sections/AboutSection` | Foto 4:5 berbingkai, bio, fakta pendidikan/bahasa/domisili, hobi. |
| Proyek | `sections/ProjectsSection`, `ProjectCover`, `TechList` | Unggulan = kartu studi kasus (sampul atau placeholder logo), deskripsi kosong → potongan Solusi (K4); sisanya daftar ringkas. Satu tautan per kartu (judul diperluas). |
| Pengalaman, Pendidikan | `sections/ExperienceSection`, `EducationSection` | Linimasa; "Lihat proyek: …" hanya untuk proyek yang tampil dan punya slug. |
| Keahlian | `skills/SkillsSection`, `SkillMarquee`, `TechLogo` | Lihat §4. |
| Sertifikat, Prestasi, Organisasi | `sections/CertificatesSection`, `AchievementsSection`, `OrganizationsSection` | Unggulan dulu, sisanya "Lihat semua (n lagi)"; fokus pindah ke sertifikat pertama yang muncul. Prestasi/Organisasi tidak dirender bila kosong. |
| Kontak | `contact/ContactSection`, `ContactForm` | Email, LinkedIn, GitHub, "Unduh CV" (K2); formulir nama/email/topik/pesan tanpa Subjek (K9) → `messages.topic`. |
| Buku tamu | `guestbook/GuestbookButton`, `GuestbookDrawer` (lazy) | Tombol dengan jumlah pesan; panel kanan (HP penuh), memakai `useGuestbook` lama tanpa perubahan. |
| Detail proyek | `src/pages/ProjectDetailPage` (lazy), `ProjectLinks`, `Lightbox` (lazy) | Lihat §5. |
| 404 | `src/pages/NotFoundPage` | Alamat tidak dikenal (termasuk `/admin/…` yang tidak ada) dan proyek yang tidak ada/disembunyikan. |

## 4. Keahlian (baris berjalan)

- Satu baris per kategori dengan urutan tetap (Frontend, Backend, Mobile, Database, Jaringan & IT Support, Tools,
  Soft skill; kategori lain sesudahnya), judul, satu kalimat (kamus), dan jumlah keahlian.
- **Ikon (K1):** ikon unggahan admin (`icon_url`) lebih dulu → logo merek dari subset **Simple Icons 16.35.0**
  (`techLogoPaths.js`, 38 path satu warna, CC0, dimuat terpisah ±23 kB gzip; nama keahlian dicocokkan lewat
  `techLogoKeys.js`) → ikon umum per kategori (UI/UX, REST API, soft skill, dll.). Untuk menambah logo: salin
  path dari paket `simple-icons` lalu tambahkan alias namanya.
- Unggulan: bingkai dan logo beraksen + bintang, dengan teks "(unggulan)" untuk pembaca layar.
- Daftar asli dibaca sekali; salinan untuk efek berjalan `aria-hidden` dan jumlahnya menyesuaikan lebar. Gerak
  36 px/detik, hanya `transform`. Berhenti saat hover, disentuh (lanjut 2,5 dtk setelah dilepas), di luar layar,
  tab tersembunyi, dan dengan tombol **"Hentikan gerak"** (K6, diingat selama kunjungan di `sessionStorage`).
- Reduced motion: tanpa salinan, daftar dibungkus dan diam, tombol jeda tidak tampil.

## 5. Halaman detail proyek

- `usePublicProject(slug)`: hanya proyek `is_visible = true`; slug tidak ada atau disembunyikan → 404 proyek.
- Isi: status, judul (h1, menerima fokus), deskripsi, tahun/jenis/klien, "Dikerjakan saat magang di …" (dari
  pengalaman yang terhubung), sampul, Peran saya, Masalah/Solusi/Hasil (bagian kosong tidak tampil), galeri →
  lightbox, Teknologi, Tautan proyek, lalu **"Detail teknis"** (`content`) yang **tertutup secara bawaan** (K8).
- **Tautan privat:** `url` dibuang di `publicLinks()` tepat setelah data diterima, jadi tidak pernah masuk DOM;
  tampil sebagai label "… · repo privat". Tautan publik wajib `https://`. (Kolom `links` tetap terbaca lewat API.)
- Lightbox: selalu gelap, "n dari total", ← → Home End dan geser di HP, Escape/Tutup/klik di luar gambar, fokus
  terkunci lalu kembali ke pembuka.

## 6. Data

- Semua query publik di `src/hooks/usePublicPortfolio.js`: kolom eksplisit, `is_visible = true`, urut
  `sort_order`. Satu tabel gagal hanya memengaruhi section-nya (pesan + "Coba lagi"); profil gagal → hero
  menampilkan nama situs dan pesan, bukan data karangan. **`src/data/portfolioData.js` dan semua data cadangan
  sudah dihapus.**
- Tidak pernah diambil: `phone_number`, `full_address`, `user_id`. CV = `cv_file_url`, cadangannya `resume_link`.
- URL dari database hanya dirender bila `http(s)://` (`javascript:` dan skema lain dibuang).
- Hook admin lama tidak berubah (admin tetap memakai query yang sama).

## 7. CSS dan token

- Gaya dasar `src/components/public/public.css` dimuat di `main.jsx` tepat setelah `index.css`; semua aturan
  diawali `.pub-*`, `:where(.pub)`, `html[data-pub-theme]`, atau `html:has(.pub)`. Reset lokal menetralkan aturan
  global `h1–h6`, `p`, `a` lama; setiap `<a>` publik memakai kelas yang menetapkan warna dasar dan `:hover`-nya.
- Token komponen: `--pub-max` 1200 px, `--pub-gutter`, `--pub-nav-h` 64 px, `--pub-section-y`, `--pub-radius`
  4 px, `--pub-brackets` (bracket sudut), `--pub-name-from/to`, `--pub-logo-plate`.
- **Pengecualian primitive yang terdokumentasi:** latar `<html>` per tema (`--palette-navy-950` /
  `--palette-slate-75`, seperti login) dan `--pub-logo-plate` (`--palette-white`, pelat di balik logo instansi).
- Kolom isian publik memakai rel fokus kiri yang sama dengan admin (`.pub-control::before`).

## 8. Aksesibilitas dan gerak

- Satu `h1` per halaman, `h2` per section, landmark `header`/`nav`/`main#konten`/`footer`, tautan "Lewati ke
  konten", fokus 2 px di semua kontrol, target ≥44 px, menu HP / buku tamu / lightbox sebagai dialog dengan fokus
  terkunci (`useFocusTrap` + `useScrollLock` dari admin, dipakai ulang tanpa diubah).
- Navigasi ke section (`/#proyek` dsb.) menggulir dan memindah fokus ke section (`useHashScroll`).
- Reduced motion: baris keahlian, kata berganti, titik status, kursor, dan transisi diam; grid blueprint diam.

## 9. Diuji (18 Oktober 2026)

Supabase tiruan dengan salinan data asli + Chrome headless (skrip di scratchpad, tidak di-commit): data, sertifikat,
kontak, buku tamu, detail, interaksi, sapuan 375/768/1024/1440 × terang/gelap × ID/EN (tanpa scroll samping,
kontras ≥4,5:1, sampul dan teks tidak bertumpuk), dan login + admin identik dengan `main` kecuali catatan sementara
di blok tampilan yang memang dihapus. Rincian di `plans/tahap-3a-publik.md` §10.
