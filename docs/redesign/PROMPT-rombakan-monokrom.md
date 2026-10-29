# Rombakan UI/UX portofolio: gaya monokrom

Effort: High. Kerjakan di branch baru `feat/redesign-monokrom`. Commit per fase. Jangan push, jangan merge, jangan deploy sebelum saya cek.

Peranmu: Senior Creative Developer, UI/UX Engineer, dan mentor. Ubah tampilan publik portofolio (React + Vite + Supabase, live di https://aldidwiirawan.vercel.app) dari gaya Blueprint (dark slate, biru, cyan) menjadi gaya monokrom yang saya setujui. Panel admin tetap berfungsi seperti sekarang.

Prinsip: rapikan yang sudah ada, perbaiki yang lemah, pertahankan yang sudah berjalan, dan jangan pernah mengarang data.

---

## 0. Referensi wajib

Saya menaruh dua file desain di `docs/redesign/`:

- `referensi-beranda.html`: beranda lengkap (hero, tentang, proyek, perjalanan, sertifikat, kontak, kucing, buku tamu).
- `referensi-detail-proyek.html`: halaman detail proyek (contoh Madura Mart).

Keduanya prototipe dari alat desain (format `.dc.html`: markup, CSS di `<helmet><style>`, dan logika di `class Component`). Baca CSS, struktur, dan logika interaksinya sebagai spesifikasi. Jangan disalin mentah. Bangun ulang sebagai komponen React yang rapi dengan data asli dari Supabase.

Abaikan URL gambar `/_blob/...` dan teks dalam kurung siku `[...]`. Itu tempat kosong. Gambar dan teks asli diambil dari database.

Kalau skill `scroll-craft` terpasang, pakai hanya standar desainnya (tipografi, spacing, refuse list, cek kontras). Jangan pakai engine scroll, video scrub, kie.ai, atau membuat halaman HTML terpisah.

---

## 1. Fase 1: audit dan rencana (BERHENTI setelah fase ini)

1. Pelajari struktur repo, komponen publik, stylesheet, token desain (`DESIGN.md`, `PRODUCT.md`, `MASTER.md`, CSS variables), konfigurasi Vite, header CSP di `vercel.json`, integrasi Supabase, serverless function GitHub yang sudah ada, dan skema database dari folder migrasi.
2. Jalankan aplikasi lokal dan bandingkan dengan referensi.
3. Buat rencana singkat: komponen yang dibuat atau diubah, file yang disentuh, dan risiko.
4. Buat file SQL migrasi untuk data baru di bagian 6. Jangan dijalankan. Saya yang menjalankannya di Supabase SQL Editor.
5. Laporkan temuan dan rencana, lalu **tunggu persetujuan saya** sebelum menulis kode fase 2.

---

## 2. Fondasi visual (fase 2)

### Token

| Token | Terang (default) | Gelap |
|---|---|---|
| `--bg` | `#ffffff` | `#0a0a0a` |
| `--fg` | `#0a0a0a` | `#fafafa` |
| `--soft` | `#f3f3f1` | `#18181b` |
| `--mute` | `#55555e` | `#a1a1aa` |
| garis grid | `rgba(10,10,10,.07)` | `rgba(250,250,250,.06)` |

- Bagian "terbalik" (Proyek, Kontak, header detail proyek) memakai `--fg` sebagai latar dan `--bg` sebagai teks.
- Warna lain hanya untuk status: titik hijau `#22c55e` (terbuka untuk kerja, Live API, pesan terkirim).
- Latar putih memakai grid tipis 46px seperti di referensi.

### Tipografi

- Font utama **Space Grotesk** (400–700), font kedua **JetBrains Mono** (sudah ada).
- Pasang Space Grotesk lewat paket npm `@fontsource-variable/space-grotesk` atau `@fontsource/space-grotesk`, sama seperti Inter sekarang. **Jangan memuat font dari Google Fonts atau CDN**, karena CSP situs ketat.
- Judul besar: huruf kapital, tebal 700, `letter-spacing` sekitar `-0.05em`, `line-height` sekitar 0.88.
- Inter boleh tetap dipakai di panel admin. Jangan ubah tampilan admin.

### Komponen dasar

- **Kartu:** garis 2–2.5px warna `--fg`, sudut membulat 24–32px. Sebagian kartu memakai bayangan kotak `6px 6px 0 var(--fg)`.
- **Tombol:** berbentuk pil, huruf kapital, bayangan kotak, bergeser saat hover atau ditekan. Tombol isi pakai latar `--fg`.
- Fokus keyboard selalu terlihat (`outline` 3px).

### Global

- **Navigasi sticky:** logo kiri; menu tengah Beranda, Tentang, Proyek, Perjalanan, Sertifikat, Kontak; di kanan tombol suara, tombol tema, dan pilihan bahasa ID/EN. Di HP menu jadi menu buka-tutup yang mudah ditutup dan tidak menghalangi konten.
- **Pengaturan suara:**
  - Satu modul suara bersama (Web Audio API, bunyi disintesis, tanpa file audio).
  - Bunyi hanya setelah ada interaksi pengguna.
  - Tombol speaker untuk menyalakan atau mematikan suara, disimpan di `localStorage` dalam `try/catch`.
- **Tema terang/gelap dan dua bahasa ID/EN** tetap berfungsi. Tema default: terang.
- Perbarui `DESIGN.md`, `PRODUCT.md`, atau `MASTER.md` supaya token baru tercatat.

---

## 3. Beranda (fase 3–5)

### Hero
- **Chip yang bisa diseret** di atas nama, berfisika (gravitasi, saling menumpuk, bisa dilempar, memantul di lantai), dengan bunyi saat dipegang, dilepas, dan membentur lantai:
  - `UI/UX`, `KOTA KEDIRI`, `ALDI` + ikon bintang empat sudut (lihat SVG di referensi), `JUNIOR PROGRAMMER`, `MANAJEMEN INFORMATIKA`, `WEB & MOBILE`.
  - Satu lingkaran hitam berisi ikon `</>` dan satu lingkaran putih berisi ikon bintang.
  - Siapkan versi EN untuk teksnya.
  - Fisika ringan dan buatan sendiri, **tanpa library fisika baru**. Simulasikan posisi awal sebelum frame pertama, jadi tidak ada animasi jatuh otomatis saat halaman dibuka.
  - Klik atau tekan Enter pada chip membuatnya melompat.
- **Nama** `ALDI DWI IRAWAN` dalam satu baris besar, muncul naik per kata saat halaman dibuka.
- **Baris kode yang mengetik sendiri sekali:** `const INIT_PORTOFOLIO = async () => { const developer = { nama: "ALDI_DWI_IRAWAN", asal: "Kediri_Indonesia", peran: "Junior_Programmer", fokus: "Web_Mobile_dan_IT_Support" }; await developer.siapBekerja(); }`
- **Bar status di bawah** (4 kolom bergaris): ● Terbuka untuk kerja / Berbasis di Kediri, ID / Hari ini: tanggal dinamis sesuai bahasa / Gulir ke bawah.
- Saat di-scroll, nama sedikit naik dan memudar (CSS scroll-driven animation).

### Kucing Kopi dan Susu
Dua maskot di bagian bawah layar (posisi `fixed`): Kopi hitam dan Susu putih. Gunakan SVG yang ada di referensi. Di tema gelap warnanya otomatis terbalik.

Perilaku:
1. **Mengintip:** saat diam, keduanya mengintip dari bawah. Mata mengikuti kursor, berkedip, dan ekor bergoyang.
2. **Jalan mondar-mandir:** sesekali berjalan ke titik acak, lalu berhenti dan menoleh ke kursor.
3. **Mengejar kursor:** kalau kursor berada di sekitar 280px bagian bawah layar, keduanya mengejar posisi kursor dengan jarak satu sama lain.
4. **Diseret dan dilempar:**
   - Dipegang lalu diseret, kucing bergelantungan dan mengeong pelan.
   - Dilepas, kucing jatuh berfisika dan memantul. Bunyi mendarat, dan kalau jatuhnya keras dia mengeong.
   - Klik biasa: melompat dan menampilkan balon "Meong! Lihat proyekku" (Kopi) atau "Miaw! Salam kenal" (Susu), plus versi EN.
5. **Aksesibilitas dan HP:**
   - Dengan `prefers-reduced-motion`, kucing tidak berjalan atau mengejar, hanya diam.
   - Di HP ukurannya lebih kecil dan tidak menutupi tombol atau konten penting.
   - Ganti logika "mengejar kursor" dengan sentuhan.

### Tentang saya (bento)
- Kartu perkenalan dengan tombol Unduh CV.
- Kartu foto profil (foto asli dari admin) dengan label nama dan tombol "Rekrut saya".
- Kartu pendidikan: Polinema, D3 Manajemen Informatika, lulus 2026, IPK besar 3,54.
- Kartu tech stack: dari tabel keahlian (`is_visible = true`), dikelompokkan per kategori.
- Kartu hitam "Fokus saya".
- Kartu muncul naik saat di-scroll.

### Pita teknologi
Dua baris teks besar (satu bergaris tepi, satu isi) yang bergeser berlawanan arah **mengikuti scroll**, bukan bergerak terus-menerus.

### Proyek pilihan (bagian hitam)
- Bagian ini melebar dari kartu bersudut membulat menjadi layar penuh saat masuk viewport.
- Proyek unggulan dari database, urut `sort_order`. Kartu **sticky dan menumpuk**: kartu lama mengecil dan meredup saat kartu baru datang. Di layar di bawah 1060px tumpukan dimatikan dan kartu tampil berurutan biasa.
- Isi kartu:
  - label status dan jenis,
  - judul,
  - deskripsi singkat,
  - tiga fakta (Peran / Tahun / Klien),
  - chip teknologi,
  - tombol "Baca studi kasus" dan "Kunjungi" (hanya kalau ada tautan demo publik),
  - sampul 16:10.
- **Tidak ada angka metrik buatan.**
- Setelah tumpukan: "Proyek lainnya" (non-unggulan) sebagai daftar ringkas, dan grafik kontribusi GitHub yang sudah ada, disesuaikan gayanya.

### Perjalanan saya
- Garis waktu dari tabel **pengalaman dan pendidikan** (sertifikat tidak masuk sini), urut terbaru.
- Garis tengah: garis abu-abu, dengan garis hitam yang **turun mengikuti scroll** dan titik di ujungnya.
- Kartu terbuka seperti **tirai dari atas ke bawah** saat masuk viewport.
- Tiap baris menampilkan:
  - angka tahun besar bergaris tepi,
  - folder hitam: klik untuk membuka, 3 foto keluar berkipas dengan bunyi, klik lagi untuk menutup,
  - label "Arsip [tahun]",
  - kartu berisi jenis, posisi, tempat, periode, deskripsi, dan tag.
- Folder hanya muncul kalau entri itu punya foto (lihat bagian 6). Kalau tidak ada, cukup tampilkan periodenya.

### Sertifikat
- Bagian sendiri. Tampilkan 3 sertifikat unggulan.
- Gambar sertifikat utuh (`object-fit: contain`) di atas latar lembut.
- Isi kartu: label kategori, judul, penerbit, terbit, berlaku sampai, dan tombol "Lihat PDF".
- Kartu terangkat saat di-hover. Klik gambar untuk membuka lightbox yang bisa ditutup dengan Esc dan tombol Tutup.
- Tombol "Lihat semua (n lagi)" membuka sertifikat lainnya.
- Skor TOEIC tidak ditampilkan.

### Kontak dan footer
- Bagian hitam.
- Formulir kontak yang **sudah ada** tetap dipakai, termasuk logika kirim, validasi, loading, dan pesan sukses/gagal.
- Email, LinkedIn, GitHub, Unduh CV.
- Footer sederhana.

### Buku tamu
Fitur buku tamu yang sudah ada tetap dipakai. Tombolnya berupa pil mengambang di kanan bawah dengan jumlah pesan asli, dan tidak boleh tertimpa kucing.

---

## 4. Halaman detail proyek (fase 6)

Ikuti `referensi-detail-proyek.html`.

- **Bar atas:** "Kembali ke proyek", nomor proyek (mis. 03 / 05), tombol GitHub hanya kalau repo publik.
- **Header hitam:** label (jenis kegiatan, status, jenis aplikasi), judul besar, kalimat pembuka singkat, dan 4 info (waktu, tempat, mitra, status).
- **Penampil media:**
  - Tab Sampul / Galeri / Diagram.
  - Panah dan thumbnail di Galeri.
  - Sub-pilihan diagram (mis. Use case, DFD, ERD).
  - Tombol Perbesar membuka lightbox.
  - Pilihan "Layar Web / Layar HP" hanya muncul untuk proyek yang punya tangkapan layar HP.
- **Panel "Info proyek":** jenis, bagian yang saya kerjakan, teknologi.
- **Panel "Repositori GitHub" dengan label Live API:**
  - Data diambil lewat serverless function yang memakai `GITHUB_TOKEN` yang sudah ada. **Token tidak boleh masuk bundle frontend.**
  - Isi: nama repo, tanggal pembaruan terakhir (`pushed_at`), bahasa utama, bar komposisi bahasa (`/languages`, warna bertingkat monokrom), legenda persentase, dan "Framework dan library terdeteksi" dari `composer.json` dan `package.json`.
  - Respons di-cache (mis. `s-maxage=3600`).
  - Panel disembunyikan kalau proyek tidak punya repo publik atau tautannya `is_private`.
  - Kalau API gagal, tampilkan pesan yang jelas, tanpa layar kosong.
- **"Tentang proyek", empat poin bernomor:**
  - 01 Latar belakang
  - 02 Permasalahan
  - 03 Solusi
  - 04 Fitur utama (berupa daftar)

  Diambil dari database dalam versi ID dan EN. Pakai bahasa yang sederhana dan apa adanya, tidak melebih-lebihkan.
- **Navigasi** ke proyek sebelumnya dan berikutnya.

---

## 5. Gerak dan aksesibilitas

- Animasi scroll memakai CSS scroll-driven (`animation-timeline: view()/scroll()`), dibungkus `@supports`. Browser yang tidak mendukung harus tetap menampilkan konten dalam keadaan akhir yang normal, tanpa konten yang memudar atau tersembunyi.
- `prefers-reduced-motion`:
  - matikan semua animasi otomatis,
  - ketik kode langsung tampil,
  - tumpukan kartu jadi daftar biasa,
  - kucing diam.
- Semua kontrol berupa elemen semantik (`button`, `a`) dengan nama yang jelas untuk pembaca layar. Chip dan kucing bisa dioperasikan dengan keyboard (Enter untuk melompat).
- Kontras teks minimal 4.5:1 di tema terang dan gelap.
- Tidak ada scroll horizontal di lebar mana pun.

---

## 6. Data baru (buat file SQL, jangan jalankan)

Cek dulu kolom yang sudah ada dan pakai ulang kalau bisa. Contohnya kolom studi kasus masalah, solusi, dan peran. Semua migrasi dalam `BEGIN … COMMIT`, idempoten, dengan query cek sebelum dan sesudah, RLS dan policy mengikuti pola tabel lain, dan admin dilengkapi form untuk mengisinya.

1. **Proyek:**
   - Kolom yang belum ada untuk latar belakang, permasalahan, solusi, dan fitur utama (daftar), masing-masing dengan versi `_en`.
   - Kolom kalimat pembuka singkat, kalau belum ada.
2. **Media proyek:** penanda jenis (`cover` / `gallery` / `diagram`), perangkat (`web` / `mobile`), dan label (mis. "Use case", "DFD", "ERD").
3. **Foto perjalanan:** tabel foto untuk entri pengalaman dan pendidikan (pemilik, path gambar di bucket `portfolio-assets`, alt ID/EN, urutan, `is_visible`), plus unggah foto per entri di admin.
4. **Seed pengalaman tambahan** (file terpisah, `pengalaman-tambahan.sql`):

   **a. Siswa PKL, Teknisi CCTV, BM Multimedia Kediri**
   - Periode: 2021, 6 bulan, PKL dari SMK PGRI 1 Kota Kediri, jurusan TKJ.
   - ID:
     - Memasang CCTV baru serta membongkar dan memasang ulang perangkat CCTV di lokasi pelanggan.
     - Mengatur koneksi CCTV online agar bisa dipantau langsung lewat HP Android.
     - Memeriksa dan memperbaiki kamera CCTV yang bermasalah.
     - Membantu pembuatan dan pemasangan papan running text.
     - Melayani pelanggan dan menjaga toko, termasuk penjualan kamera dan suku cadang CCTV.
   - EN:
     - Installed new CCTV systems and dismantled and reinstalled CCTV equipment at customer sites.
     - Configured online CCTV connections for live monitoring from Android phones.
     - Diagnosed and repaired faulty CCTV cameras.
     - Helped build and install running-text LED message boards.
     - Served customers and ran the store, including sales of cameras and CCTV parts.
   - Tag: CCTV, Jaringan, Instalasi, Troubleshooting.

   **b. Admin, JF Interior**
   - Periode: April – Juni 2023, sebelum kuliah.
   - ID:
     - Mencatat dan merekap pesanan pelanggan di komputer.
     - Mencatat stok bahan seperti kayu, HPL, dan aksesoris.
     - Merekap pemasukan dan pengeluaran usaha.
     - Mengelola media sosial dan foto hasil kerja untuk promosi.
   - EN:
     - Recorded and compiled customer orders on the computer.
     - Tracked stock of materials such as wood, HPL laminate, and hardware.
     - Compiled business income and expense records.
     - Managed social media and project photos for promotion.
   - Tag: Administrasi, Excel, Media Sosial.

   Kalau tanggal persis bulan PKL 2021 tidak diketahui, pakai format yang didukung skema dan beri tahu saya.

---

## 7. Batasan teknis

- Pertahankan React, Vite, routing, anchor, integrasi Supabase, autentikasi admin, sitemap, dan prerender/SEO yang ada.
- Jangan ubah alur login atau RLS selain yang dibutuhkan migrasi di atas. Jangan pakai service role key di frontend, dan jangan mencetak env var.
- Patuhi CSP: tidak ada font atau script dari CDN baru, tidak ada `style` inline mentah di HTML. Gaya dinamis lewat CSSOM atau prop `style` React.
- **Tidak ada dependency baru** kecuali paket font Space Grotesk. Fisika, suara, dan animasi ditulis sendiri dengan ringan.
- Gambar lazy-load dengan `width`/`height` atau `aspect-ratio`, supaya tidak ada layout shift. Sampul proyek tetap 16:10.
- Komponen kecil dengan tanggung jawab jelas. CSS per komponen, tidak menggandakan aturan.

---

## 8. Validasi (fase 7)

1. Jalankan build produksi, lint, dan test yang tersedia. Perbaiki error atau warning baru.
2. Uji dengan Playwright di lebar 1440, 1024, 899, 768, dan 390, tema terang dan gelap, plus mode reduced-motion:
   - tidak ada scroll horizontal,
   - sampul proyek berasio 1,60,
   - sertifikat tampil utuh,
   - chip dan kucing bisa diseret,
   - folder dan lightbox membuka dan menutup,
   - menu HP berfungsi,
   - formulir kontak dan buku tamu tetap bekerja,
   - halaman detail proyek dan panel GitHub benar (termasuk saat API gagal).
3. Cek console tanpa error, navigasi keyboard, dan kontras. Kalau memungkinkan, jalankan Lighthouse dan laporkan angkanya apa adanya.
4. Periksa `git diff` dari perubahan yang tidak perlu.

## 9. Laporan akhir (mode mentoring, ringkas)

- Kondisi awal dan masalah utama yang ditemukan.
- Perubahan per fase beserta file pentingnya.
- Konsep yang dipakai, singkat: fisika sederhana, Web Audio, CSS scroll-driven animation, sticky stacking.
- Hasil build, lint, test, dan pengujian sebenarnya. Jangan mengklaim yang tidak dijalankan.
- File SQL yang harus saya jalankan, beserta urutannya.
- Hal yang belum selesai dan langkah manual untuk saya.
