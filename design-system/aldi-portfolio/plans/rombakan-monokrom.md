# Rencana rombakan monokrom: tampilan publik

> **Status:** Fase 7 selesai (rombakan lengkap), menunggu uji manual, merge, dan deploy oleh pemilik · **Branch:** `feat/redesign-monokrom` (dari
> `main` a57cf05) · **Tanggal:** 30 Oktober 2026. Acuan: `docs/redesign/PROMPT-rombakan-monokrom.md` (utama untuk
> rombakan ini), `docs/redesign/referensi-beranda.html`, `docs/redesign/referensi-detail-proyek.html`, `MASTER.md`,
> `PRODUCT.md`.

**Cara melanjutkan bila konteks terputus:** baca file ini, cek `git status` dan `git log --oneline -5`, lalu kerjakan
butir pertama yang belum dicentang di §6. Setiap butir dicentang di commit yang sama dengan pekerjaannya. Jangan
mengulang pekerjaan yang sudah di-commit. Commit per fase; jangan push, merge, atau deploy sebelum pemilik mengecek.

**Aturan dari prompt:**
- Panel admin tetap seperti sekarang (Inter, focus rail). Token monokrom hanya berlaku di dalam `.pub`.
- Tidak ada dependency baru kecuali `@fontsource-variable/space-grotesk`. Fisika, suara, dan animasi ditulis sendiri;
  `matter-js` dilepas. Tidak ada font atau script dari CDN (CSP ketat).
- Database hanya lewat file SQL baru yang dijalankan pemilik. Tidak ada service role key, env var tidak dicetak.
- Jangan pernah mengarang data. Tidak ada angka metrik buatan.

---

## 1. Keputusan

### Pemilik (30 Oktober 2026)
- **Foto perjalanan:** pakai `experiences.photos` yang sudah ada (maks. 3, sudah bisa diunggah di admin) + kolom yang
  sama di `educations`. Alt ID/EN = `caption`/`caption_en`. Tidak ada tabel atau RLS baru.
- **PKL BM Multimedia:** Okt 2021 – Mar 2022 (`2021-10-01` sampai `2022-03-01`).
- **JF Interior:** baris tersembunyi yang sudah ada diperbarui; lokasi tetap Sidoarjo.
- **Hasil proyek:** `outcome` tampil sebagai catatan "Hasil" di bawah empat poin; `content` tidak tampil di publik.
- **Chip hero:** dari "Label panggung hero" di admin (`profiles.hero_labels`), dengan SQL opsional untuk mengisinya.
  Catatan Fase 3 (pemilik, saat menyetujui Fase 2): label admin hanya teks, jadi bintang empat sudut ✦ setelah
  "Aldi" dan dua chip lingkaran (hitam berisi `</>`, putih berisi bintang) tetap dibuat kode sesuai referensi.
- **Laporan tiap fase:** sertakan screenshot 1440 dan 390, tema terang dan gelap. Berhenti setelah tiap fase.
- **Suara (Fase 3):** menyala sejak awal, bunyi hanya setelah pengunjung berinteraksi.
- **Catatan Fase 3:** warna bar browser login/admin kembali seperti sebelumnya; Space Grotesk hanya dimuat di
  halaman publik; nama hero satu baris di desktop dengan huruf yang tidak menempel; screenshot halaman penuh
  diambil setelah menggulir sampai bawah (gambar lazy-load ikut tampil).

### Asisten (bisa dikoreksi pemilik)
- Kalimat pembuka di header detail = `description` (sudah dipakai sebagai deskripsi singkat).
- Sampul tetap `thumbnail_url`; galeri tidak menyimpan jenis `cover`. Batas galeri 5 → 12 gambar.
- Suara default tetap mati, bunyi hanya setelah interaksi.
- Tombol "Unduh CV" tetap di navbar (ukuran sukses PRODUCT.md), walau referensi tidak punya.
- Skor TOEIC tidak tampil. Chip mata kuliah di kartu pendidikan tidak dibuat (datanya tidak ada).
- Anchor lama tetap jalan: `#pengalaman`, `#pendidikan` → Perjalanan; `#keahlian` → kartu tech stack.
- Prestasi dan Organisasi tetap ada dengan gaya baru (tersembunyi selama kosong).

## 2. Ringkasan audit (30 Oktober 2026)

1. Data hampir cukup. Yang belum ada: latar belakang dan fitur utama proyek, jenis/perangkat/label galeri, foto
   pendidikan.
2. Foto pengalaman sudah bisa diunggah di admin, tetapi belum pernah tampil di publik; caption EN-nya belum ada di form.
3. `normalizeGallery` dan `prepareUploads` (`admin/ui/useAssetFields.js`) hanya menyimpan `url/caption/caption_en`,
   jadi admin harus diperbarui sebelum jenis media diisi.
4. JF Interior ada tetapi tersembunyi (jabatan "Interior", Feb–Mei 2023, poin kosong); BM Multimedia belum ada.
5. `EducationForm.jsx`: `uploads.rollback()` dipanggil saat `uploads` belum ada (form macet di "menyimpan"), dan file
   tidak dihapus saat simpan gagal. Diperbaiki di Fase 5.
6. Belum ada: navigasi proyek sebelumnya/berikutnya, endpoint repo GitHub, animasi scroll-driven, prerender (SEO =
   sitemap saat build + meta runtime, dipertahankan).
7. CSP: hash script tema di `vercel.json` harus diganti bila default tema diubah; `style-src 'self'` (prop `style`
   React aman); Space Grotesk dari npm sesuai `font-src 'self'`.
8. Kontras referensi: `--faint` #a1a1aa di putih ±2.6:1 (baris kode, tombol bahasa nonaktif) dan #c4c4c8 terlalu
   pucat → diganti `--mute`/`--fg`.
9. Dipakai bersama admin, jadi filenya tetap: `ViewfinderCursor`, `BlueprintBackground`, `RobotMascot`, token
   `index.css`, `useFocusTrap`, `useScrollLock`.
10. Build lokal `main` (production, port 5191) sama dengan situs live: tinggi halaman 9673 px (1440) dan 13882 px
    (390). Panggung hero live memakai keahlian unggulan, artinya `hero_labels` masih kosong.

## 3. File SQL (pemilik yang menjalankan, urut)

1. `supabase/migrations/20261030000000_redesign_monokrom.sql`
   - `projects.background`, `background_en` (TEXT); `features`, `features_en` (TEXT[], maks. 8).
   - `projects_gallery_shape`: maks. 12; `kind` gallery|diagram, `device` web|mobile, `label`/`label_en` ≤ 24.
   - `experiences_photos_shape`: maks. 3, `caption`/`caption_en` null atau teks.
   - `educations.photos` (JSONB, maks. 3, aturan yang sama).
2. `supabase/seed/pengalaman-tambahan.sql`: BM Multimedia (baru) dan JF Interior (diperbarui, ditampilkan).
3. `supabase/seed/label-hero-monokrom.sql` (opsional): 6 chip hero ID/EN.

Setiap file: blok bagian 0 dan jalankan dulu (cek sebelum), lalu jalankan seluruh file (cek sesudah tampil terakhir).

## 4. Rencana per fase

### Fase 2: fondasi
Font Space Grotesk (main.jsx, preload di vite.config.js); tema default terang (index.html, hash CSP di vercel.json,
ThemeProvider); token monokrom + komponen dasar di `public.css` (`index.css` tidak diubah); navbar baru (6 menu,
suara, tema, ID/EN, CV; dialog HP dipakai ulang); PublicLayout tanpa IntroScreen dan ViewfinderCursor; nada baru di
`tokSynth.js`; MASTER.md bagian "Halaman publik: monokrom", lalu DESIGN.md dan PRODUCT.md.

### Fase 3: hero
`HeroChips.jsx` + `chipPhysics.js` (AABB, disimulasikan sebelum frame pertama, lempar, Enter/klik melompat, bunyi);
h1 satu node dengan kata naik; `CodeLine.jsx`; `StatusStrip.jsx`; nama memudar lewat scroll-driven animation.
Dihapus: HeroStage, usePhysicsStage, physicsStage (matter-js), KeywordRotator, CharacterLaneSlot, `characters/`,
`intro/`.

### Fase 4: Tentang, pita, Proyek
Bento Tentang (perkenalan + CV, foto + "Rekrut saya", pendidikan, tech stack `id="keahlian"`, Fokus);
`TechRibbon.jsx`; Proyek hitam yang melebar, kartu sticky menumpuk ≥ 1060px, "Proyek lainnya", grafik GitHub (label
bulan dirapikan). Dihapus: SkillsSection/SkillMarquee, ProjectsCameo.

### Fase 5: Perjalanan, Sertifikat, Kontak, Buku tamu, Kucing
`JourneySection.jsx` + `JourneyFolder.jsx` (pengalaman + pendidikan, terbaru dulu, garis mengikuti scroll, tirai,
folder bila ada foto); `photos` di data publik dengan fallback kolom opsional; Sertifikat 3 unggulan + Lightbox;
Kontak hitam (logika ContactForm tetap) + footer; FAB buku tamu berbentuk pil; kucing `pets/CatPets.jsx` + `catSim.js`.
Admin: caption EN foto pengalaman, foto pendidikan + perbaikan bug rollback, kolom `photos` di useEducations.

### Fase 6: detail proyek dan GitHub
Halaman detail baru (bar atas, header hitam, `MediaViewer.jsx`, panel info, `RepoPanel.jsx`, empat poin + Hasil,
sebelumnya/berikutnya); `api/github-repo.js` (slug → tautan kode github.com publik, REST repo + languages +
composer.json/package.json, `s-maxage=3600`, 503 bila gagal); kolom detail + fallback; admin ProjectForm (latar
belakang, fitur utama, jenis/perangkat/label galeri, batas 12).

### Fase 7: validasi
Build, oxlint, Playwright 1440/1024/899/768/390 × terang/gelap + reduced-motion (data dan `/api/github-repo` dimock,
termasuk gagal), regresi admin terhadap `main`, console, keyboard, kontras, Lighthouse bila bisa, review diff,
laporan akhir.

## 5. Risiko

- Admin ikut berubah → token di `.pub`, uji regresi admin.
- Deploy sebelum migrasi → fallback kolom opsional di publik, pemberitahuan di admin.
- Kunci galeri hilang lewat admin lama → jenis media diisi setelah Fase 6.
- Kucing menutupi tombol di HP → kecil, menyingkir saat formulir aktif, di bawah FAB; dicek di 390px.
- Fitur lama dihapus (intro, kursor, ayam/bebek, robot, marquee, kata berganti) → tetap ada di riwayat git.
- Browser tanpa `animation-timeline` → semua dibungkus `@supports`, konten tampil dalam keadaan akhir.

## 6. Urutan commit

- [x] Fase 1. Rencana ini, tiga file SQL (§3), referensi `docs/redesign/`, uji PGlite (76 cek: 2× jalan, aturan
      menerima dan menolak, data lama utuh, guard), build lokal + screenshot → **berhenti**, tunggu persetujuan
- [x] Fase 2. Fondasi visual: palet monokrom + jembatan `--ds-*` di `.pub`, Space Grotesk (+ preload), tema bawaan
      terang (skrip, hash CSP, `theme-color`), kartu/tombol/chip/fokus 3 px/grid 46 px, navbar baru (AD, 6 menu,
      suara, tema, ID/EN, CV, dialog HP), IntroScreen dihapus, ViewfinderCursor dan BlueprintBackground dilepas
      dari publik, `playCue` di modul suara, MASTER §16 + DESIGN.md + PRODUCT.md. Uji: build, lint, screenshot
      1440/390 × terang/gelap tanpa scroll horizontal dan tanpa error console, login identik dengan `main`
- [x] Fase 3. Hero: `HeroChips` + `chipPhysics` (label admin, 6 chip bawaan, ✦ setelah "Aldi", lingkaran `</>` dan
      bintang), nama satu baris ≥ 768 px (jarak huruf -0,03em, judul section -0,04em), `CodeLine`, `StatusStrip`,
      nama memudar saat digulir; matter-js, panggung label, kata berganti, ayam/bebek, cameo dihapus. Catatan
      pemilik: warna bar login/admin kembali, font dimuat per halaman (meta + skrip, hash CSP baru), suara bawaan
      menyala. Uji: lint, build, cek hero 6 lebar, uji chip (seret, Enter, reduced motion, suara setelah gestur),
      screenshot 1440/390 × terang/gelap dengan semua gambar termuat
- [x] Fase 4. Tentang (bento), pita teknologi, Proyek (bagian hitam, kartu menumpuk dengan `timeline-scope`,
      Peran/Tahun/Klien sesuai data, "Kunjungi" hanya untuk demo publik), Proyek lainnya, grafik GitHub (label
      bulan); `my_role` dan `links` masuk query daftar proyek; Keahlian berjalan dihapus (`#keahlian` = kartu tech
      stack); kelas kartu dasar `.pub-tile`. Uji: lint, build, cek proyek (tumpukan 1440, daftar 390 dan reduced
      motion, fakta dan Kunjungi vs data live, label bulan dengan data tiruan), uji hero/chip ulang, login identik
      dengan `main`, screenshot 1440/390 × terang/gelap + saat menumpuk
- Catatan Fase 7 (pemilik): uji juga seret chip dengan sentuhan (emulasi touch Playwright) di 390.
- [x] Fase 5. Perjalanan (folder hanya bila ada foto), Sertifikat (3 unggulan, lightbox), Kontak + footer hitam,
      buku tamu pil yang menyingkir dari bar status dan formulir, kucing Kopi & Susu (4 perilaku, kecil di HP,
      diam saat reduced motion, tidak menutupi tombol/formulir), bento: Fokus di bawah pendidikan; admin: foto
      pendidikan + keterangan EN + perbaikan rollback, keterangan EN foto pengalaman. Robot, ayam/bebek sisa,
      `interactionBus`, `characterLines`, `SocialLinks` dihapus. Uji: lint, build, uji Fase 5 (40 cek; tulis
      ke Supabase dicegat), uji hero/chip/proyek ulang, login identik, screenshot termasuk folder, lightbox,
      kucing diseret. Form admin belum diuji di browser (perlu harness admin tiruan; masuk Fase 7)
- [x] Fase 6. Detail proyek (bar atas + nomor, header hitam, MediaViewer Sampul/Galeri/Diagram, panel info, empat
      poin yang kosong disembunyikan, catatan Hasil, sebelumnya/berikutnya), `api/github-repo.js` + RepoPanel
      (hanya repo publik, keadaan gagal dengan tautan), admin proyek (Latar belakang, Fitur utama, galeri 12 dengan
      Jenis/Perangkat/Nama diagram + EN). Perbaikan Fase 5: lightbox menunggu gambar termuat dan tampil utuh,
      folder tidak menutupi tahun, kucing merunduk saat digulir di HP. Uji: lint, build, uji fungsi API (15 cek,
      fetch tiruan), uji Fase 6 (38 cek; data diagram dan GitHub tiruan, termasuk gagal), uji hero/chip/proyek/
      Fase 5 ulang, login identik dengan `main`, screenshot detail Madura Mart 1440/390 × terang/gelap. Form admin
      proyek belum diuji di browser (Fase 7)
- [x] Fase 7. Validasi dan laporan akhir. Perbaikan: nama aksesibel tanda "AD" diawali teks yang terlihat (WCAG
      2.5.3, temuan axe), kunci i18n `social.email`/`social.instagram` dan kelas `.pub-display` yang tidak terpakai
      dihapus. Uji (build `dist-fase7b`): lint; 1440/1280/1024/899/768/390 × terang/gelap + reduced motion, beranda
      dan detail (36 kunjungan: scroll horizontal 0, error console 0, gambar termuat semua, sampul 1,60, sertifikat
      `contain`, kontras < 4,5:1 = 0 dari ±300 teks per halaman); seret chip dan kucing dengan sentuhan CDP di 390
      (21 cek); form admin proyek/pengalaman/pendidikan dengan Supabase tiruan (47 cek: simpan, galeri bertipe,
      unggah gagal, simpan gagal + rollback, hapus + file storage, keadaan sebelum migrasi; tidak ada request ke
      live); keyboard (30 cek); axe-core WCAG A/AA 0 pelanggaran; Lighthouse lokal (tanpa kompresi) setara `main`;
      bundle tanpa token/kunci rahasia, hash CSP cocok; uji Fase 3–6 dan login identik diulang. Catatan: smooth
      scroll `index.css` + Tab yang ditahan (MASTER §16 Validasi)
