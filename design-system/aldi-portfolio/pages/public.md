# Override Halaman: Portofolio Publik (`/`, `/projects/:slug`, 404)

> **PROJECT:** Aldi Portfolio · **Diperbarui:** 19 Oktober 2026 (tahap 3B)
> ⚠️ Aturan di file ini **menimpa** `design-system/aldi-portfolio/MASTER.md`. Acuan utama tetap `BRIEF.md`.
> **Status: diterapkan (tahap 3A dan 3B).** Rencana dan keputusan pemilik: `plans/tahap-3a-publik.md` (K1–K10, §6a)
> dan `plans/tahap-3b-publik.md` (K1–K10, §11a). Interaksi 3B (label fisika, suara, ayam dan bebek, layar
> pembuka, robot a+) dijelaskan di §9. Tahap 3C (kolom versi Inggris, pengaturan label dari admin) belum
> dikerjakan.

---

## 1. Tema dan karakter

- **Tema mengikuti perangkat** (`prefers-color-scheme`) sampai pengunjung memilih lewat tombol tema di navbar;
  pilihan disimpan di `localStorage` (`aldi-portfolio-theme`, dibungkus try/catch). Keduanya memakai token
  `--ds-*` yang sama dengan login/admin (`data-theme` di akar `.pub`).
- **Tanpa kilatan tema:** skrip kecil di `index.html` memasang `data-pub-theme` di `<html>` sebelum render
  pertama, **hanya bila alamat bukan `/admin…`**. `ThemeProvider` memperbarui atribut itu dan melepasnya saat
  halaman publik ditinggalkan, jadi login dan admin tidak pernah melihatnya.
- **Identitas yang dipertahankan:** nama raksasa uppercase **satu warna** `--ds-text-strong` (keputusan pemilik
  18 Oktober 2026, menggantikan gradien; 18,57:1 gelap / 16,78:1 terang), grid blueprint `busy`
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
| Kerangka | `PublicLayout`, `ThemeProvider`, `sound/SoundProvider`, `intro/IntroScreen`, `PublicNavbar`, `PublicFooter`, `Toggles`, `CvButton`, `SocialLinks` | Rute `/`, `/projects/:slug`, `*` memakai satu kerangka (tema, bahasa, suara, data dimuat sekali). Menu HP < 1024 px: dialog layar penuh, fokus terkunci. Footer: robot a+ di samping "Kembali ke atas" (§9). |
| Hero | `hero/HeroSection`, `HeroStage`, `KeywordRotator`, `StatusBar`, `CharacterLaneSlot` | "Unduh CV" bila ada CV, kalau tidak "Hubungi saya" (K2). Kata berganti hanya bila `hero_keywords` terisi (K3). Panggung: keahlian unggulan bergiliran per kategori, maks. 8 (HP 6), plus `</>` dan `*` (K5), `aria-hidden`, menjadi label fisika (§9). Ayam dan bebek berjalan di garis atas bar status (§9). |
| Tentang | `sections/AboutSection` | Foto 4:5 berbingkai, bio, fakta pendidikan/bahasa/domisili, hobi. |
| Proyek | `sections/ProjectsSection`, `ProjectCover`, `TechList` | Unggulan = kartu studi kasus (sampul atau placeholder logo), deskripsi kosong → potongan Solusi (K4); sisanya daftar ringkas. Satu tautan per kartu (judul diperluas). |
| Pengalaman, Pendidikan | `sections/ExperienceSection`, `EducationSection` | Linimasa; "Lihat proyek: …" hanya untuk proyek yang tampil dan punya slug. |
| Keahlian | `skills/SkillsSection`, `SkillMarquee`, `TechLogo` | Lihat §4. |
| Sertifikat, Prestasi, Organisasi | `sections/CertificatesSection`, `AchievementsSection`, `OrganizationsSection` | Unggulan dulu, sisanya "Lihat semua (n lagi)"; fokus pindah ke sertifikat pertama yang muncul. Prestasi/Organisasi tidak dirender bila kosong. |
| Kontak | `contact/ContactSection`, `ContactForm` | Email, LinkedIn, GitHub, "Unduh CV" (K2); formulir nama/email/topik/pesan tanpa Subjek (K9) → `messages.topic`. |
| Buku tamu | `guestbook/GuestbookButton`, `GuestbookDrawer` (lazy), `robot/GuestbookRobot` | Tombol dengan jumlah pesan, menempel di bawah layar lalu berhenti di atas footer (3B, K5); panel kanan (HP penuh) dengan robot a+ di tepi formulir, memakai `useGuestbook` lama tanpa perubahan. |
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
- **Baris hanya bergerak bila isinya lebih lebar dari wadahnya** (`data-moving`). Baris yang muat (mis. Mobile
  dengan 4 keahlian di layar lebar) tampil diam tanpa salinan. Diukur ulang setiap kali ukuran baris atau daftar
  berubah (ResizeObserver: jendela diubah, logo selesai dimuat).
- Baris yang bergerak memudar di tepi kiri dan kanan (`mask-image`, 2,5rem), juga saat dijeda.
- Daftar asli dibaca sekali; salinan untuk efek berjalan `aria-hidden`. Gerak 36 px/detik, hanya `transform`.
  Berhenti saat hover, disentuh (lanjut 2,5 dtk setelah dilepas), di luar layar, tab tersembunyi, dan dengan
  tombol **"Hentikan gerak"** (K6, diingat selama kunjungan di `sessionStorage`).
- Reduced motion: semua baris diam, dibungkus, tanpa salinan dan tanpa tepi memudar; tombol jeda tidak tampil.

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
  4 px, `--pub-brackets` (bracket sudut), `--pub-logo-plate`.
- **Pengecualian primitive yang terdokumentasi:** latar `<html>` per tema (`--palette-navy-950` /
  `--palette-slate-75`, seperti login) dan `--pub-logo-plate` (`--palette-white`, pelat di balik logo instansi).
- Kolom isian publik memakai rel fokus kiri yang sama dengan admin (`.pub-control::before`).

## 8. Aksesibilitas dan gerak

- Satu `h1` per halaman, `h2` per section, landmark `header`/`nav`/`main#konten`/`footer`, tautan "Lewati ke
  konten", fokus 2 px di semua kontrol, target ≥44 px, menu HP / buku tamu / lightbox sebagai dialog dengan fokus
  terkunci (`useFocusTrap` + `useScrollLock` dari admin, dipakai ulang tanpa diubah).
- Navigasi ke section (`/#proyek` dsb.) menggulir dan memindah fokus ke section (`useHashScroll`).
- Reduced motion: baris keahlian, kata berganti, titik status, kursor, dan transisi diam; grid blueprint diam.
  Sejak 3B juga: label tetap tumpukan statis (matter-js tidak dimuat), ayam dan bebek berdiri diam (hanya sapaan
  dan kalimat saat diklik), tanpa layar pembuka, robot hanya berganti pose, tanpa bunyi otomatis.
- Semua elemen interaksi 3B dekoratif: `aria-hidden`, tidak bisa difokus, klik pada karakter tidak memindah fokus.
  Satu-satunya kontrol baru adalah tombol suara.

## 9. Interaksi (tahap 3B, 19 Oktober 2026)

Rencana, keputusan pemilik dan hasil uji: `plans/tahap-3b-publik.md`. Tidak ada yang menutupi teks atau tombol
(diuji di 4 lebar × 2 tema × 2 bahasa). Semua yang bergerak memakai `transform`/`opacity` dan berhenti di luar
layar dan saat tab tidak aktif (`usePageHidden`).

### Label fisika — `hero/HeroStage`, `usePhysicsStage`, `physicsStage.js`
- **matter-js 0.20.0** (MIT; satu-satunya library baru 3B) dan kode fisika adalah satu potongan terpisah
  (`physicsStage`, ±28 kB gzip), dimuat lewat `import()` saat panggung terlihat dan browser idle, setelah layar
  pembuka selesai.
- Tumpukan statis 3A tetap ada (tidak terlihat) sebagai penjaga tinggi panggung; salinan labelnya di
  `.pub-stage-world` digeser dengan `transform`. Label jatuh satu per satu (70 ms); dinding 6 px di dalam bingkai.
- **Desktop:** seret dan lempar (pegas ke pointer; titik tarik dijaga di dalam bingkai, label yang lolos
  dikembalikan), klik = lempar ke atas; kursor viewfinder mengunci label (`data-cursor-lock`). **Sentuh:** ketuk =
  lempar, tanpa seret (K2); label `touch-action: manipulation`, jadi geser jari selalu menggulir halaman. Durasi
  ketuk diukur dari waktu event (`event.timeStamp`), jadi HP yang sibuk tetap mengenali ketukan.
- Loop rAF dengan langkah tetap 1/60 dtk; **berhenti total** saat semua label tidur (tumpukan yang hanya bergetar
  ditidurkan 6 dtk setelah sentuhan terakhir), panggung di luar layar, atau tab tidak aktif.
- Tabrakan → "tok" bila suara nyala; pendaratan keras (lantai atau tumpukan) → peristiwa `label-impact` di
  `interactionBus.js` untuk reaksi karakter.
- Reduced motion: matter-js tidak pernah dimuat; tumpukan statis seperti 3A.

### Suara — `sound/SoundProvider`, `soundContext.js`, `tokSynth.js`, `SoundToggle` (`Toggles.jsx`)
- Tombol ikon speaker: di navbar ≥1024 px (`.pub-nav-sound`), di menu <1024 px karena bar HP sudah penuh (K10).
  Nama tombol menyebut aksi berikutnya ("Nyalakan suara" / "Matikan suara"). Mati secara bawaan; pilihan disimpan
  di `aldi-portfolio-sound`.
- "Tok" dibuat dengan Web Audio API: sinus yang turun cepat (±900 → 500 Hz, 90 ms) dan ketukan noise bandpass,
  nada sedikit diacak, lebih tinggi untuk lompatan karakter. Batas: 45 ms antar bunyi, 12 bunyi per detik, 120 ms per
  sumber, volume maks. 0,35, kompresor.
- `AudioContext` hanya dibuat di dalam aksi pengunjung. Karena Safari iPhone mewajibkan itu, modul bunyi sengaja ada
  di bundle utama (bukan lazy). Pilihan "nyala" dari kunjungan lalu baru aktif setelah klik/ketuk/tombol pertama;
  di-suspend saat tab tidak aktif. Menyalakan suara berbunyi satu "tok" sebagai tanda (juga saat reduced motion).

### Ayam dan bebek — `hero/CharacterLaneSlot`, `characters/*`, `src/i18n/characterLines.js`
- **Jalur** `.pub-lane` berdiri di garis atas bar status, setinggi `--pub-lane-h` (90 px; 100 px ≥1024), yang juga
  padding bawah hero, jadi karakter dan gelembung tidak pernah menimpa isi hero. Batas kanan: 24 px sebelum tombol
  Buku tamu.
- **Gambar** (`CharacterArt.jsx`): SVG orisinal satu keluarga dengan robot a+; garis `--ds-text-strong`, badan
  `--ds-surface`, paruh dan kaki `--ds-screen-ink` (sky, K1), jengger `--ds-danger-border`. Ayam 44 px, bebek 41 px
  (HP 36/33 px); area sentuh 48 px (HP 44 px). Pose lewat `data-pose`: stand, walk, run, peck, jump, shake, faint,
  sleep.
- **Perilaku** (`characterDirector.js`, JS biasa dengan jam yang bisa dijeda): sapaan pertama, jeda **10–15 dtk**
  setelah setiap giliran bicara (keputusan pemilik), kalimat sesuai jam (sekali), obrolan berdua (berjalan
  mendekat), kabur dari mouse yang mendekat cepat ≤95 px dan diam menatap bila didekati pelan (K3), klik/ketuk =
  lompat (+tok) tanpa memindah fokus, 10 klik = pingsan 3 dtk, diam 40 dtk = "Masih di situ?", 20 dtk kemudian tidur
  ("Zzz") sampai ada gerakan, reaksi pada tema, bahasa, dan label yang jatuh keras ±120 px. Bebek bereaksi ±0,4 dtk
  lebih lambat. Kalimat yang sama tidak muncul dua kali berturut-turut; satu gelembung pada satu waktu.
- **Cameo** (K4): ayam muncul sekali per sesi (`aldi-portfolio-cameo`) di kanan judul Proyek dan berkata "Nah, ini
  proyek-proyek {name}!". Hanya ≥1024 px (di 768 px kepala section memakai hampir seluruh lebar), bukan saat reduced
  motion.
- **Kalimat:** `src/i18n/characterLines.js` (ID dan EN, disetujui pemilik 19 Oktober 2026), ikut bahasa halaman;
  `{name}` = nama depan dari profil. Kalimat robot a+ juga di sana.
- Dimuat lazy saat bar status ±200 px dari layar; jeda saat jalur di luar layar, tab tidak aktif, dan selama layar
  pembuka. Reduced motion: berdiri diam berhadapan, hanya sapaan dan kalimat saat diklik.

### Layar pembuka — `intro/IntroScreen`, `introState.js`
- Logo 116 px (`trim`, `assemble`) merakit diri sambil bracket menyempit dari sudut layar (0–720 ms), lalu terbang
  ke logo navbar (skala tepat ¼) sambil layar memudar (720–980 ms). Animasi CSS `transform`/`opacity`, jadi tetap
  tepat waktu walau perangkat sedang sibuk merender halaman; target diukur sekali sebelum paint pertama.
- Hanya pada halaman publik pertama per sesi (`aldi-portfolio-intro` di sessionStorage), alamat apa pun (K7).
  Dilewati saat reduced motion, di tab latar belakang, dan bila halaman baru siap >1,5 dtk sejak dimuat (perangkat
  atau jaringan lambat). Klik, ketuk, tombol, atau roda menutupnya; Tab tetap memindah fokus. `aria-hidden`.

### Robot a+ — `robot/FooterRobot`, `robot/GuestbookRobot` (memakai `RobotMascot` tanpa diubah)
- **Footer** (K6): robot di pojok kanan bawah, di samping tombol teks "Kembali ke atas" yang tetap menjadi kontrol
  aksesibel. Robot bersembunyi di bawah tepi halaman (footer `overflow: clip`), mengintip tiap 7–12 dtk, berdiri dan
  bertanya "Kembali ke atas?" saat mouse ±120 px atau tombol difokus keyboard; di layar sentuh berdiri 3 dtk setiap
  footer terlihat. Mengklik robot sama dengan menekan tombol (robot melompat, halaman ke atas, fokus ke konten). Di
  HP baris bawah footer kini dua baris untuk memberi ruang robot.
- **Tombol Buku tamu** (K5): `position: sticky` di akhir `<main>` dengan margin yang membuat tingginya nol di alur;
  posisinya sama selama menggulir, tetapi berhenti 16/24 px di atas footer, jadi tidak lagi menutupi "Kembali ke
  atas".
- **Panel buku tamu:** robot duduk di tepi atas formulir (jalur 52 px di antara pengantar dan formulir; kakinya di
  balik tepi kotak). Matanya melirik mengikuti panjang tulisan, "Tulis yang baik, ya!" sekali per buka panel,
  pengingat nama/pesan kosong sambil menggeleng, "Terkirim, makasih!" sambil melompat, dan kalimat saat gagal.
  Pesan status dan galat formulir tetap yang dibacakan pembaca layar; urutan Tab tidak berubah.

### Kursor viewfinder (dipakai bersama login dan admin)
- Target hover kini dicek ulang dengan `document.elementFromPoint` di posisi mouse terakhir pada setiap render yang
  tidak berasal dari `pointermove` (gulir, frame saat bracket mengunci, ±450 ms setelah klik). Bracket tidak lagi
  tertinggal di elemen yang tertutup panel/dialog atau yang tergulir pergi. Hover dan fokus keyboard tetap identik
  (K8).

## 10. Diuji (18 dan 19 Oktober 2026)

Tahap 3B (19 Oktober 2026): suite kursor, suara, label fisika, layar pembuka, ayam dan bebek, footer dan robot, robot
buku tamu, sapuan 3B (4 lebar × 2 tema × 2 bahasa: tidak ada yang menutupi teks/tombol, kontras gelembung ≥4,5:1),
potongan yang gagal dimuat, semua suite 3A, dan regresi login + admin; hasil, angka performa, dan uji manual di
`plans/tahap-3b-publik.md` §14.

Tahap 3A (18 Oktober 2026):

Supabase tiruan dengan salinan data asli + Chrome headless (skrip di scratchpad, tidak di-commit): data, sertifikat,
kontak, buku tamu, detail, interaksi, sapuan 375/768/1024/1440 × terang/gelap × ID/EN (tanpa scroll samping,
kontras ≥4,5:1, sampul dan teks tidak bertumpuk), dan login + admin identik dengan `main` kecuali catatan sementara
di blok tampilan yang memang dihapus. Rincian di `plans/tahap-3a-publik.md` §10.
