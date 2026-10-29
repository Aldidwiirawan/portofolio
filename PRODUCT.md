# Product

<!-- impeccable:product-schema 1 -->

> Sumber utama: `design-system/aldi-portfolio/BRIEF.md` (menang bila ada yang bertentangan), lalu
> `design-system/aldi-portfolio/MASTER.md` dan override per halaman di `design-system/aldi-portfolio/pages/`.
> File ini hanya mencatat fakta produk. Keputusan visual tetap di dokumen design system tersebut.
> Dicatat 17 Oktober 2026.

## Platform

web

## Users

- **Pengunjung utama: HR / rekruter.** Membuka tautan dari CV, LinkedIn, atau lamaran, sering lewat HP. Menilai
  dengan cepat apakah Aldi layak dipanggil wawancara, dan tidak selalu paham istilah teknis.
- **Pengunjung kedua: user / lead teknis.** Programmer senior atau calon atasan yang membuka studi kasus proyek
  dan GitHub untuk menilai cara kerja dan kode.
- **Pengelola: Aldi sendiri** (satu akun admin). Memakai panel `/admin` untuk menjaga isi portofolio tetap
  lengkap dan terbaru tanpa mengubah kode.

## Product Purpose

Portofolio pribadi **Aldi Dwi Irawan**, lulusan D3 Manajemen Informatika Politeknik Negeri Malang (IPK 3,54),
yang mencari kerja dengan **peran utama Junior Programmer (Web & Mobile)** dan **peran pendukung IT Support**.

- **Halaman publik (`/`)** memperkenalkan Aldi, peran yang dicari, proyek terpilih sebagai studi kasus, keahlian,
  rekam jejak, dan cara menghubungi.
- **Panel admin (`/admin/*`, masuk lewat `/admin/login`)** menyimpan data selengkap mungkin dan memilih apa yang
  tampil di publik.
- **Ukuran keberhasilan:** pengunjung **membuka atau mengunduh CV** (PDF yang diunggah di Profil). Setelah itu
  baru LinkedIn, GitHub, dan pesan lewat formulir kontak.

## Positioning

Yang tidak bisa diklaim begitu saja oleh lulusan lain:

1. **Programmer sekaligus IT Support.** Bisa membuat aplikasi web/mobile dan juga paham jaringan serta perangkat
   (tersertifikasi MikroTik MTCNA).
2. **Proyek nyata untuk klien.** Sistem yang benar-benar dipakai: Sistem Informasi Pengelolaan Data Produk Madura
   Mart untuk Dinas Kominfo Kab. Kediri, dan Sistem Monitoring Pengiriman Barang berbasis pemindaian barcode
   untuk klien CV. Adisatya IT Consultant (AyamBebek Pakan dan Ternak).
3. **Situs ini sebagai bukti.** Portofolio dan panel admin ini dibangun sendiri, jadi situsnya adalah contoh kerja
   langsung.
4. **Identitas yang khas dan punya kepribadian:** logo sendiri, robot a+, ayam dan bebek, dan nuansa blueprint.

## Operating Context

- **Cara pengunjung datang:** dari tautan di CV, LinkedIn, atau lamaran. Rekruter memindai cepat di HP; lead
  teknis membaca lebih dalam di studi kasus dan GitHub.
- **Bahasa:** halaman publik dua bahasa (Indonesia dan Inggris) dengan toggle US / ID sekali klik di navbar,
  pilihan diingat di browser. Login dan admin hanya bahasa Indonesia.
- **Strategi isi (BRIEF §9):** admin menyimpan data lengkap; publik hanya menampilkan ringkasan pilihan lewat
  sakelar `is_visible` (tampil di halaman publik), `is_featured` (unggulan), dan urutan Naik/Turun
  (`sort_order`):
  - 3–4 proyek unggulan, masing-masing sebagai studi kasus (masalah, solusi, hasil);
  - 2–4 pengalaman;
  - pendidikan perguruan tinggi saja (SMK/SMA disembunyikan);
  - 3–6 sertifikat terpilih;
  - keahlian dikelompokkan per kategori.
  Riwayat dan sertifikat lengkap diarahkan ke LinkedIn.
- **Tautan LinkedIn, GitHub, dan CV ditonjolkan** di hero dan di bagian kontak. CV memakai PDF di Profil; tautan
  CV lama hanya cadangan.
- **Interaksi publik:** formulir kontak (pesan masuk ke Kotak Masuk admin, dengan topik pesan yang diatur di
  Profil) dan buku tamu (tombol mengambang dengan jumlah pesan).
- **Kerja admin:** 5 menu (Beranda; Tentang Saya; Karya & Keahlian; Rekam Jejak; Kotak Masuk) dengan sub-tab.
  Beranda memberi pengingat bila sesuatu yang dibutuhkan strategi isi belum ada.
- **Status tahapan (30 Okt 2026):** tahap 1 (login), 2/2B (admin), dan 3A–3C (halaman publik Blueprint, isi
  Inggris, SEO, Vercel) sudah di `main` dan online. **Rombakan monokrom** halaman publik berjalan di branch
  `feat/redesign-monokrom` per fase (`design-system/aldi-portfolio/plans/rombakan-monokrom.md`, MASTER §16): fase 1
  (rencana dan SQL), fase 2 (fondasi visual: palet, Space Grotesk, navbar, tema bawaan terang), dan fase 3 (hero:
  chip berfisika, nama besar, baris kode, bar status), fase 4 (bento Tentang, pita teknologi, Proyek yang
  menumpuk), dan fase 5 (Perjalanan, Sertifikat, Kontak, buku tamu, kucing Kopi & Susu, foto pendidikan di
  admin) selesai.

## Capabilities and Constraints

- **Stack yang ada:** React 19 + Vite + react-router-dom, JavaScript (tanpa TypeScript, tanpa test runner), CSS
  biasa dengan CSS variables, Supabase (database, Auth, Storage bucket `portfolio-assets`). Font dimuat
  self-hosted lewat Fontsource.
- **Batasan dari pemilik:**
  - tanpa Tailwind atau framework UI; **tanyakan dulu** sebelum menambah library atau font (matter-js 0.20.0
    untuk label fisika disetujui pemilik untuk tahap 3B; rombakan monokrom hanya boleh menambah
    `@fontsource-variable/space-grotesk`, dan matter-js sudah dilepas di fase 3 karena chip hero memakai fisika
    buatan sendiri);
  - jangan mengubah logika auth, hooks data, query Supabase, RLS, atau routing tanpa izin;
  - perubahan database hanya sebagai file migrasi baru di `supabase/migrations/`, dijalankan pemilik;
  - kerjakan di branch terpisah per tahap, commit per bagian, jangan push atau merge;
  - jangan menjalankan `npm run dev` kedua (server pemilik di port 5173);
  - screenshot halaman tidak di-commit.
- **Performa:** library berat hanya dimuat di publik setelah halaman tampil. Animasi berhenti saat bagiannya tidak
  terlihat atau tab tidak aktif. Di layar sentuh chip hero bisa diseret ke samping dan diketuk, tetapi geser
  vertikal tetap menggulir halaman (`touch-action: pan-y`), jadi menggulir tidak terganggu.
- **Layar uji wajib:** 375, 768, 1024, dan 1440 px tanpa scroll horizontal (rombakan monokrom: 1440, 1024, 899,
  768, dan 390 px, tema terang dan gelap, plus reduced motion).
- **Privasi:** alamat lengkap dan nomor HP tidak ditampilkan di publik, cukup kota (Kediri). `is_visible` hanya
  mengatur tampilan, **bukan privasi**: data dan file tetap terbaca lewat API dan URL publik.
- **Tanpa data cadangan (sejak 3A):** halaman publik hanya menampilkan data asli dari admin; bagian yang datanya
  kosong disembunyikan, dan tabel yang gagal dimuat menampilkan pesan dengan "Coba lagi".
- **Istilah:** bahasa sederhana tanpa istilah teknis. Contoh: Masuk (bukan Admin Login), Beranda (bukan
  Dashboard), Kelola isi (bukan CMS), Buku tamu (bukan Guestbook), Kata sandi (bukan Password), Ubah, Keluar,
  Unggulan, Gambar sampul.
- **Keputusan yang masih terbuka:**
  - background `calm` untuk admin masih bisa berubah;
  - transisi jepret setelah login masih bisa diganti;
  - robot a+ sudah dihapus dari halaman publik di rombakan monokrom (masih dipakai di login dan admin).

## Brand Commitments

- **Nama:** Aldi Dwi Irawan. Design system login dan admin bernama **"Blueprint"**; halaman publik memakai
  **gaya monokrom** sejak rombakan Oktober 2026 (MASTER §16, desain referensi pemilik di `docs/redesign/`).
- **Aset identitas** (rincian di BRIEF §1, §3, §5, §6 dan MASTER §13): logo monogram stensil `public/logo.svg`
  yang merakit diri; maskot robot **a+**; karakter **ayam** (berani, cerewet, suka pamer) dan **bebek** (santai,
  polos, agak lemot) beserta kalimatnya; kursor viewfinder; background blueprint; transisi jepret; label bergaya
  tag blueprint. Di halaman publik monokrom aset ini diganti per fase: chip yang bisa diseret dan kucing **Kopi**
  (hitam) dan **Susu** (putih) dari referensi pemilik; kursor viewfinder dan layar pembuka sudah tidak dipakai.
- **Keputusan desain yang disengaja, jangan diganti (pemilik, 17 Okt 2026):**
  - **font Inter** di login dan admin (halaman publik memakai Space Grotesk sejak brief rombakan, 30 Okt 2026);
  - **garis kiri yang menyala saat fokus** pada kolom isian (`.adm-control::before` di
    `src/components/admin/ui/admin-ui.css`).
- **Suara:** bahasa Indonesia sederhana yang mudah dipahami. Karakter boleh jenaka sesuai kepribadiannya. Semua
  bunyi disintesis dengan Web Audio (tanpa file audio): "tok" dan nada pendek untuk chip, folder, dan kucing.
  Suara bawaan menyala (keputusan pemilik, 30 Okt 2026), tetapi bunyi hanya keluar setelah pengunjung
  berinteraksi, dan bisa dimatikan dengan tombol speaker.
- **Orisinalitas:** irfansabrian.vercel.app dan styfensagala.vercel.app hanya sumber inspirasi. Jangan menyalin
  tata letak khasnya: sidebar bernomor dan garis kontur (Irfan); karakter gumpalan hitam (Styfen). Chip pil dengan
  bayangan kotak di hero monokrom berasal dari desain referensi pemilik sendiri (`docs/redesign/`), bukan salinan.

## Evidence on Hand

- **Profil:** D3 Manajemen Informatika Politeknik Negeri Malang 2023–2026, IPK 3,54 / 4,00; berdomisili di Kediri.
- **Proyek nyata (3):** monitoring pengiriman barang berbasis barcode (CV. Adisatya IT Consultant, untuk
  AyamBebek Pakan dan Ternak); pengelolaan data produk Madura Mart (Dinas Kominfo Kab. Kediri); portofolio dan
  panel admin ini.
- **Pengalaman:** Programmer / IT Intern di CV. Adisatya IT Consultant (Jan–Jul 2026); Web Developer Intern di
  Dinas Kominfo Kab. Kediri (Jun–Agu 2025); Interior Project Staff / Intern di JF Interior (Feb–Mei 2023).
- **Sertifikat:** TOEIC (berlaku Mei 2026–Mei 2028); Kompetensi Pemrograman Software Komputer, LSP Politeknik
  Negeri Malang (Okt 2025–Okt 2028); MikroTik MTCNA (Okt 2024–Okt 2027). **Pelatihan:** Cisco Networking Academy
  (Python Essentials, Operating Systems Basics, 2024).
- **Sumber data:** Supabase (isi dari admin). Data cadangan statis sudah dihapus di tahap 3A.
- **Aset file:** `public/logo.svg`, `public/favicon.svg`, `apple-touch-icon.png`, `icon-512.png`,
  `design-system/aldi-portfolio/source/logo.jpeg`, pemeriksaan logo di
  `design-system/aldi-portfolio/screenshots/logo-check/`.
- **Yang belum ada, jangan dikarang:**
  - angka hasil studi kasus: hanya dari data asli yang diisi pemilik; bila kosong, bagian angka tidak tampil;
  - per 18 Okt 2026 belum diisi di admin: file CV, kata berganti hero, deskripsi singkat Madura Mart dan Website
    Portofolio, gambar sampul (hanya SI-Arsip), ikon keahlian, gambar sertifikat, dan logo pengalaman;
  - testimoni, klien tambahan, atau metrik pengunjung.

## Product Principles

1. **Paham dalam beberapa detik.** Rekruter di HP harus langsung tahu siapa Aldi, peran apa yang dicari, dan di
   mana CV-nya, tanpa perlu memahami istilah teknis.
2. **Bukti nyata, bukan klaim.** Proyek, sertifikat, dan angka hanya dari data asli. Bagian yang kosong lebih baik
   disembunyikan daripada diisi karangan.
3. **Situs ini adalah contoh kerja.** Kerapian, aksesibilitas, performa, dan bahasa yang jelas ikut dinilai
   sebagai bukti kemampuan.
4. **Kepribadian yang tidak menghalangi.** Robot, ayam dan bebek, serta efek blueprint boleh hidup, tetapi tidak
   boleh menghalangi jalan ke CV dan isi, keyboard, atau pengguna reduced motion.
5. **Ringkas di publik, lengkap di admin.** Publik menampilkan pilihan terkurasi; riwayat lengkap ada di admin dan
   LinkedIn.

## Accessibility & Inclusion

- Minimal **WCAG 2.2 AA**: kontras teks ≥4.5:1, elemen UI dan focus ring ≥3:1, fokus terlihat dengan outline asli
  (bukan hanya box-shadow), semua fungsi bisa dipakai dengan keyboard, target sentuh ≥44 px.
- **`prefers-reduced-motion` dihormati:** label fisika tersusun diam, karakter tidak berjalan, transisi dilewati,
  kursor viewfinder kembali ke kursor biasa.
- Elemen dekoratif `aria-hidden`, tidak menangkap klik atau fokus. Status dinamis diumumkan (`role="alert"` /
  `role="status"`).
- Kursor viewfinder (sekarang hanya di login dan admin) hanya untuk pointer halus (`(hover: hover) and
  (pointer: fine)`) dan tidak aktif di `forced-colors`.
- Bahasa sederhana untuk pengunjung yang tidak teknis; versi Inggris opsional untuk isi konten dan kembali ke versi
  Indonesia bila kosong.
