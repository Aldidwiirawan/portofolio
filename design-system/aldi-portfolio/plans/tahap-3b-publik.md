# Rencana Tahap 3B — Halaman publik: interaksi

> **Status:** selesai 19 Oktober 2026 (butir 1–9, hasil di §14), menunggu uji manual dan merge oleh pemilik ·
> **Branch:** `feat/public-3b` (dari `main` c3897dc) · **Tanggal:** 18–19 Oktober 2026. Acuan: `BRIEF.md` (utama: §1, §5 label fisika dan robot a+, §6 ayam dan bebek,
> §7), `MASTER.md` (§6 motion, §13 komponen brand), `pages/public.md`, `DESIGN.md` (ringkasan), `PRODUCT.md`,
> `plans/tahap-3a-publik.md`.

**Cara melanjutkan bila konteks terputus:** baca file ini, cek `git status` dan `git log --oneline -5`, lalu
kerjakan butir pertama yang belum dicentang di §13 "Urutan commit". Setiap butir dicentang di commit yang sama
dengan pekerjaannya. Jangan mengulang pekerjaan yang sudah di-commit.

**Aturan tahap ini:**
- React + Vite + CSS biasa (token Blueprint `--ds-*`, token komponen `--pub-*`). Tanpa Tailwind.
- Library baru hanya **matter-js** (label fisika), dimuat lazy lewat `import()` saat panggung hero terlihat. Library
  lain: tanya dulu.
- Interaksi adalah bumbu: tidak menutupi teks penting atau tombol Unduh CV, tidak memperlambat tampilnya hero, semua
  elemen dekoratif `aria-hidden`, tidak mengambil fokus.
- Animasi berhenti saat tab tidak aktif (`usePageHidden`) dan saat bagiannya di luar layar. Hanya `transform` dan
  `opacity`. Reduced motion: label diam seperti 3A, karakter diam, tanpa layar pembuka, tanpa suara otomatis.
- Login dan admin tidak berubah, kecuali perbaikan kursor viewfinder (butir 6) yang hanya mengubah keadaan "bracket
  tertinggal". RLS, rute, query data, `RobotMascot` tidak diubah.
- Commit per bagian, jangan push atau merge, screenshot tidak di-commit. Tanpa skill huashu-design.

---

## 1. Keadaan sekarang (dicek 18 Oktober 2026 di `main`)

- **Panggung hero** (`HeroStage`, `data-stage="labels"`): tumpukan statis keahlian unggulan (maks. 8, HP 6) plus
  `</>` dan `*`, `aria-hidden`. Di 1440×900 panggung berada di x 866–1320, y 246–662; di 375×812 di y 573–809
  (lebar penuh).
- **Bar status** (`StatusBar`, `data-stage="characters"`): di 1440×900 garis atasnya di y 843 (tepat di bawah layar
  pertama); di 375×812 di y 849 (sedikit di bawah layar pertama). Teksnya di bawah garis; di atas garis ada ruang
  kosong hero (padding bawah 64 px desktop, 40 px di bawah 1024 px).
- **Tombol Buku tamu** `position: fixed` kanan bawah (1440: x 1254–1416; 375: x 281–359). **Temuan:** saat halaman
  digulir sampai bawah, tombol ini **menutupi tombol "Kembali ke atas"** di footer (1440 dan 375, lihat
  `sebelum-footer-*.png`). Robot footer butuh pojok yang sama, jadi ini ikut dibereskan (K5).
- **Kursor viewfinder:** bracket dikunci ke elemen yang terakhir disentuh `pointermove`. Setelah tombol Buku tamu
  diklik, panel menutupi tombol tetapi mouse belum bergerak, jadi bracket tetap mengunci tombol yang sudah tertutup
  sampai mouse digerakkan. Hal yang sama terjadi saat halaman digulir dengan roda mouse atau saat dialog admin muncul
  di bawah mouse yang diam.
- **`RobotMascot`** sudah punya mood `idle`, `watching` (+ `lookAt`), `error`, `success` (+ `cue`), berhenti saat tab
  tidak aktif, dan dimuat sebagai potongan terpisah (dipakai login, Beranda admin, keadaan kosong admin).
- **`Logo assemble`** sudah ada (±0,75 dtk, mati saat reduced motion).
- Navbar 1024 px dengan CV dalam bahasa Inggris masih punya ruang ±59 px (cukup untuk satu tombol 44 px). Bar HP
  375 px sudah penuh (logo + nama, ID|US, tema, menu).

Screenshot acuan (tidak di-commit): `C:\Users\acer\portofolio-screenshots\tahap-3b\` →
`sebelum-hero-1440.png`, `sebelum-hero-375.png`, `sebelum-footer-1440.png`, `sebelum-footer-375.png`,
`rencana-sketsa-ayam-bebek.png`.

---

## 2. Penempatan ayam, bebek, dan robot (375 dan 1440 px)

### 2a. Ayam dan bebek: "jalur" di atas garis bar status

Garis atas bar status menjadi **tanah** tempat ayam dan bebek berdiri. Badan mereka naik ke ruang kosong di bagian
bawah hero; teks bar status ada di bawah garis, jadi tidak pernah tertutup.

```
1440 ┌─────────────────────────────────────────────────────────────────────────────┐
     │ ALDI DWI IRAWAN …            (teks hero)        ┌ panggung label ───────┐   │
     │ [Unduh CV] [Lihat proyek]                       │  …label fisika…        │   │ ← bawah panggung y 662
     │ in LinkedIn  GitHub                             └────────────────────────┘   │
     │                                                                             │
     │            ┌ Petok! Selamat datang! ┐                                       │ ← ruang gelembung
     │                 🐔   🦆  →                                                   │ ← jalur 96 px
     ├──────────────────────────────────────────────────────────────── [Buku tamu]─┤ ← garis = tanah (y 843)
     │ ● Siap bekerja   ⌖ Kota Kediri, ID   ▦ Minggu, 18 Oktober 2026              │
     └─────────────────────────────────────────────────────────────────────────────┘
       jalur x 120 → 1230 (berhenti 24 px sebelum kolom tombol Buku tamu)

375  … panggung label (y 573–809) …
     ┌ Kwek, halo... ┐
        🐔  🦆                      [Buku tamu]   ← jalur x 16 → 269 (kolom tombol Buku tamu dihindari)
     ──────────────────────────────────────────  ← garis = tanah
     ● Siap bekerja  ⌖ Kota Kediri, ID
     ▦ Minggu, 18 Oktober 2026
```

- **Ruang khusus, bukan menumpuk:** padding bawah grid hero dinaikkan supaya karakter + gelembung muat tanpa
  menyentuh panggung atau teks: desktop (≥1024) 64 → **96 px**, di bawah 1024 px 40 → **84 px**. Di 1440×900 hero
  tetap setinggi layar (isi hero bergeser naik ±16 px). Di 375 hero bertambah 44 px; ayam dan bebek baru terlihat
  setelah sedikit menggulir, jadi layar pertama HR di HP tetap bersih (sapaan baru muncul saat jalur terlihat).
- **Batas kiri-kanan:** tepi kontainer (1440: x 120; 375: x 16). Batas kanan dihitung saat berjalan: tepi kiri tombol
  Buku tamu dikurangi 24 px bila tombol itu sejajar dengan jalur (1440: x 1230; 375: x 269). Karakter tidak pernah
  lewat di bawah tombol itu.
- **Gelembung kata** muncul di atas pembicara, digeser supaya tetap di dalam jalur (tidak keluar layar, tanpa scroll
  samping), maks. 200 px (HP 160 px), satu gelembung pada satu waktu.
- **Lapisan:** jalur di atas latar blueprint, di bawah tombol Buku tamu (90) dan navbar (100). Wadah jalur
  `pointer-events: none`; hanya badan karakter yang bisa diklik.
- **Reduced motion:** keduanya berdiri diam berdampingan di ±60% lebar jalur, saling berhadapan.
- **Reaksi "gulir ke proyek"** (lihat K4): usulannya ayam muncul sekali di samping judul section Proyek (≥768 px),
  di ruang kosong sebelah kanan judul, lalu pergi. Di HP tidak ada (ruang sempit).

### 2b. Robot a+ di footer (tombol kembali ke atas)

```
1440 ├─────────────────────────────────────────────────────────────────────────────┤
     │ [logo] Aldi Dwi Irawan                                  [in][gh][ig][✉]     │
     │        Junior Programmer                                                    │
     │ ─────────────────────────────────────────────────────── ┌Kembali ke atas?┐ ─ │ ← gelembung saat didekati
     │ © 2026 Aldi Dwi Irawan.                    [↑ Kembali ke atas]   [■_■]      │
     └──────────────────────────────────────────────────────────────────┴┴────────┘ ← robot naik dari tepi bawah
375  © 2026 Aldi Dwi Irawan.
                                   [↑ Kembali ke atas] [■_■]   (baris sendiri, rata kanan)
```

- Satu `<button>` berisi teks "Kembali ke atas" (tetap terlihat, jadi nama tombol jelas untuk HR dan pembaca layar)
  dan robot (`aria-hidden`) di pojok kanan bawah footer. Robot bersembunyi di bawah tepi bawah halaman dan
  **sesekali mengintip** (kepala dan mata naik 1,5 dtk, setiap 7–12 dtk selama footer terlihat).
- **Desktop:** pointer dalam ±120 px atau fokus keyboard → robot naik penuh (52 px lebar, ±62 px tinggi), mood
  `watching` melirik ke arah pointer, gelembung "Kembali ke atas?". Klik → mood `success` (lompat) lalu halaman
  bergulir ke atas dan fokus pindah ke awal konten (perilaku tombol yang sekarang).
- **HP:** robot naik penuh sekali saat footer masuk layar dan gelembung tampil 3 dtk; ketuk → ke atas.
- **Tombol Buku tamu berhenti di atas footer** (K5) supaya tidak lagi menutupi pojok ini.
- Reduced motion: robot berdiri penuh, tanpa mengintip, gelembung tampil saat hover/fokus tanpa animasi.

### 2c. Robot a+ di panel buku tamu

```
┌──────────────────────────────────────────┐  panel 480 px (HP: lebar penuh)
│ ~/BUKU-TAMU                          [✕] │
│ Buku tamu                                │
├──────────────────────────────────────────┤
│ Tinggalkan salam atau kesan singkat. …   │
│                                          │
│        ┌ Tulis yang baik, ya! ┐  [■_■]   │  ← jalur robot ±60 px (ruang khusus)
│ ┌───────────────────────────────┴┴─────┐ │  ← robot duduk di tepi atas kotak formulir
│ │ Nama  [……………]                        │ │     (kakinya tersembunyi di balik tepi)
│ │ Pesan [……………]          Sisa 240 kar. │ │
│ │ [ Kirim ]                             │ │
│ └───────────────────────────────────────┘ │
│ Pesan pengunjung · 1 pesan …             │
```

- Robot 56 px di kanan, duduk di tepi atas kotak formulir; gelembung di kirinya, di ruang khusus antara teks
  pengantar dan formulir, jadi tidak menutupi label, isian, atau pesan galat (lebar gelembung maks. ±250 px, muat di
  375 px).
- Mood: `idle` → mengetik nama/pesan: `watching`, mata melirik mengikuti panjang tulisan, gelembung "Tulis yang baik,
  ya!" sekali per buka panel → kirim dengan nama/pesan kosong: `error` (menggeleng) + gelembung pengingat →
  terkirim: `success` (lompat) + "Terkirim, makasih!" → gagal: `error` + gelembung "coba lagi".
- Pesan status dan galat formulir yang sudah ada tetap menjadi sumber informasi (terbaca pembaca layar); gelembung
  robot hanya hiasan (`aria-hidden`).

---

## 3. Gaya visual ayam dan bebek

Sketsa (SVG asli, dirender di tema gelap dan terang, ukuran desktop, HP, dan 3×):
`C:\Users\acer\portofolio-screenshots\tahap-3b\rencana-sketsa-ayam-bebek.png`.

- **Gaya:** satu keluarga dengan robot a+: bentuk geometris sederhana (lingkaran, elips, kurva), garis tegas ±1,6 px
  di ukuran tampil, isi rata, tanpa gradien. Desain orisinal, menghadap kanan (dibalik saat berjalan ke kiri).
  Bukan gumpalan hitam dan bukan stiker.
- **Bentuk:**
  - **Ayam** (lebih tinggi, tegak, dada membusung): badan elips, kepala bulat, jengger 3 lekuk + gelambir, paruh
    segitiga, ekor 2 bulu, sayap bulan sabit dengan 2 garis bulu, kaki garis dengan 2 jari.
  - **Bebek** (lebih lebar dan rendah, polos): badan seperti perahu, kepala bulat, jambul sehelai, paruh pipih
    membulat, sayap, kaki berselaput.
- **Warna (token):** garis `--ds-text-strong`, badan `--ds-surface`, mata `--ds-text-strong`, jengger dan gelambir
  `--ds-danger-border`, paruh dan kaki → **K1** (usulan `--ds-screen-ink` sky, warna wajah robot a+, sehingga ketiga
  karakter satu keluarga). Di tema gelap karakter tampak seperti gambar kapur di kertas biru; di tema terang seperti
  gambar tinta.
- **Ukuran:** desktop ayam 44 px tinggi, bebek 41 px; HP (<768) ayam 36 px, bebek 33 px. Area klik minimal 44×44 px
  (diperluas dengan padding transparan).
- **Gelembung kata:** gaya tag blueprint: latar `--ds-surface`, garis `--ds-border-control`, bracket sudut
  `--ds-accent-text`, teks JetBrains Mono 12 px tebal 600 `--ds-text-strong`, ekor kecil ke pembicara.

**Daftar animasi** (semua `transform`/`opacity`, berhenti saat tab tidak aktif atau jalur di luar layar):

| Animasi | Ayam | Bebek |
|---|---|---|
| Jalan | 34 px/dtk, kepala maju-mundur, kaki bergantian | 22 px/dtk, badan bergoyang ±4° (waddle) |
| Berhenti / menoleh | berbalik arah, kadang mematuk tanah | diam agak lama, menoleh terlambat |
| Bicara | badan memantul kecil 1× saat gelembung muncul | sama, ±0,4 dtk lebih lambat bereaksi (agak lemot) |
| Kabur (desktop) | condong 12°, lari 160 px/dtk, gelembung "!" atau kalimat | sama |
| Lompat (klik/ketuk) | naik 14 px dalam 480 ms, kaki terlipat, bayangan mengecil, bunyi "tok" bila suara aktif | sama |
| Ngobrol | berjalan mendekat, berhenti berhadapan ±40 px | sama |
| Mengantuk / tidur | mata menjadi garis, napas pelan, "Zzz" naik dan memudar | sama |
| Pingsan (easter egg) | jatuh terbalik (kaki ke atas, mata X) 3 dtk, lalu bangun | sama, dengan kalimat sendiri |
| Muncul di judul Proyek (K4) | mengintip dari kanan, bicara, keluar | — |

**Reduced motion:** tidak berjalan, tidak kabur, tidak melompat, tanpa "Zzz" bergerak. Gelembung tetap boleh muncul
tanpa animasi, tetapi hanya untuk sapaan pertama dan saat karakter diklik (tanpa obrolan otomatis berkala).

---

## 4. Label fisika (matter-js)

- **Isi:** label yang sama dengan 3A (keahlian unggulan, maks. 8 di ≥768 px dan 6 di HP) plus lingkaran `</>` dan
  `*`. Gaya tetap tag blueprint 3A (bukan stiker pil miring). Label tetap elemen HTML; matter-js hanya menghitung
  posisi, lalu setiap label digeser dengan `transform` (teks tajam, ikut tema, tanpa canvas).
- **Mulai:** tumpukan statis 3A tampil lebih dulu (tanpa pergeseran tata letak). Saat panggung terlihat dan halaman
  sudah tampil, matter-js dimuat; label lalu **dijatuhkan dari atas panggung** satu per satu (jeda 70 ms), memantul,
  dan bertabrakan. Dinding: lantai, kiri, kanan, dan langit-langit di tepi panggung, jadi label tidak keluar bingkai.
- **Desktop:** tarik label dengan mouse (pegas ke pointer), lepas untuk melempar sesuai kecepatan tarikan; klik tanpa
  menarik = label dilempar ke atas. Kursor viewfinder mengunci label yang di-hover dan mengikutinya saat diseret.
  Roda mouse di atas panggung tetap menggulir halaman.
- **HP** (lihat K2, usulan A): **ketuk label = label terlempar ke atas lalu jatuh lagi**, tanpa menyeret. Label
  memakai `touch-action: manipulation`, jadi geser jari di mana pun (termasuk di atas label) tetap menggulir halaman.
  Jumlah label lebih sedikit (6 + 2).
- **Suara:** "tok" saat bertabrakan bila suara aktif, keras pelan sesuai kecepatan tabrakan (lihat §5).
- **Reaksi karakter:** label yang menghantam lantai dengan keras di dekat posisi bebek (±120 px mendatar) memicu
  "Aduh, kepalaku!".
- **Reduced motion:** matter-js tidak pernah dimuat; tumpukan statis 3A. Bila matter-js gagal dimuat (mis. offline),
  tumpukan statis tetap.
- **Ukuran berubah:** dinding dipindah mengikuti ukuran panggung (ResizeObserver); bila ukuran label berubah
  (melewati 768/1024 px) tumpukan dibangun ulang.

---

## 5. Suara

- **Tombol suara** (ikon speaker, mati secara bawaan, nama tombol menyebut aksi berikutnya seperti tombol tema:
  "Nyalakan suara" / "Matikan suara"). **≥1024 px:** di navbar setelah tombol tema. **<1024 px:** di dalam menu,
  sebaris dengan ID|US dan tema (bar HP sudah penuh). Pilihan diingat di `localStorage` `aldi-portfolio-sound`
  (dibungkus try/catch).
- **Bunyi "tok"** dibuat dengan Web Audio API, tanpa file: nada sinus pendek yang turun cepat (±900 → 500 Hz, 90 ms)
  ditambah ketukan noise singkat (dibuat di memori) lewat filter bandpass, mirip balok kayu. Nada sedikit diacak (±8%)
  dan lebih rendah untuk label yang lebih besar. Karakter melompat: "tik" yang lebih tinggi.
- **Batas supaya tidak berisik:** jeda minimal 45 ms antar bunyi, maks. 12 bunyi per detik, maks. 1 bunyi per label
  per 120 ms, tabrakan pelan (di bawah ambang kecepatan) tidak berbunyi, volume maks. 0,35.
- **Kebijakan autoplay browser:** `AudioContext` hanya dibuat setelah aksi pengunjung. Bila pilihan tersimpan "nyala",
  bunyi baru aktif setelah klik/ketuk/tombol pertama di halaman. Saat tab tidak aktif `AudioContext` di-suspend.
- **Reduced motion:** tidak ada bunyi otomatis (label diam, karakter tidak melompat). Tombol tetap ada; saat
  dinyalakan berbunyi satu "tok" sebagai tanda (K10).

---

## 6. Layar pembuka

- Logo 128 px (`Logo assemble`) merakit diri di tengah layar di atas latar `--ds-canvas` (0–760 ms), lalu **terbang
  mengecil ke logo navbar** sambil lapisan memudar (760–1.000 ms). Total ±1 dtk.
- Hanya pada halaman publik pertama per sesi browser (`sessionStorage` `aldi-portfolio-intro`, dibungkus try/catch);
  lihat K7. Dilewati saat reduced motion, dan bila halaman dibuka di tab latar belakang (tab tidak terlihat saat
  dimuat).
- **Tidak menunda hero:** halaman dan data dimuat serentak di bawah lapisan; lapisan hanya menutupi. Klik, ketuk,
  tombol apa pun, atau roda mouse langsung menutup lapisan (Tab tetap berjalan normal).
- Lapisan `aria-hidden`, tidak mengambil fokus, pembaca layar langsung membaca halaman di bawahnya. Dirender sejak
  render pertama React, jadi tidak ada kilatan hero → lapisan.

---

## 7. Robot a+ (ringkas)

Memakai ulang `RobotMascot` **tanpa mengubahnya** (login dan admin tetap sama). Penempatan dan perilaku ada di §2b
dan §2c. Robot footer dimuat lazy saat footer mendekati layar; robot panel ikut potongan panel buku tamu (sudah lazy).
Gelembung robot memakai gaya gelembung yang sama dengan ayam dan bebek.

---

## 8. Perbaikan kursor viewfinder

- **Sebab:** target hover hanya diperbarui oleh `pointermove`. Bila isi di bawah mouse yang diam berubah (panel
  terbuka setelah klik, halaman digulir dengan roda, dialog muncul), bracket tetap pada elemen lama.
- **Perbaikan:** saat dirender dalam mode pointer, target dicek ulang dengan `document.elementFromPoint` di posisi
  mouse terakhir: (1) setiap frame selama bracket mengunci (loop yang sudah ada), (2) saat menggulir, (3) beberapa
  frame setelah klik (menangkap panel lazy yang muncul sedikit terlambat). Bila tidak ada elemen interaktif di bawah
  mouse, bracket kembali ke mode bebas.
- **Login dan admin:** hover, fokus keyboard, kolom teks, dan reduced motion tetap identik (diuji dengan perbandingan
  ke `main`). Yang berubah hanya keadaan "bracket tertinggal", yang juga terjadi di dialog konfirmasi admin (K8).

---

## 9. Performa dan pemuatan

| Bagian | Cara dimuat | Perkiraan |
|---|---|---|
| matter-js 0.20.0 (MIT) + kode panggung fisika | `import()` saat panggung terlihat (IntersectionObserver) **dan** setelah halaman tampil (`requestIdleCallback`, cadangan 1,2 dtk); tidak pernah saat reduced motion | ±80 kB (±26 kB gzip), potongan sendiri |
| Ayam, bebek, kalimat (`characterLines.js`), cameo | lazy saat bar status mendekati layar (±200 px) | ±10 kB (±4 kB gzip) |
| Robot footer | lazy saat footer mendekati layar (±600 px) | memakai potongan `RobotMascot` yang sudah ada |
| Robot panel buku tamu | di dalam potongan panel (sudah lazy) | — |
| Konteks suara + tombol, layar pembuka, pemicu lazy | bundle utama (harus ada sejak awal) | target ≤ +3 kB gzip |

- **Loop fisika:** satu `requestAnimationFrame`, langkah tetap 1/60 dtk (maks. 3 langkah per frame), 8–10 benda.
  Matter "sleeping" aktif: begitu semua label diam, loop **berhenti total** (0 kerja per frame) sampai label disentuh
  lagi. Loop juga berhenti saat panggung di luar layar atau tab tidak aktif.
- **Karakter:** satu loop rAF untuk keduanya, hanya selama ada yang bergerak; jeda bicara memakai timer yang ditunda
  saat jalur di luar layar atau tab tidak aktif. Listener `pointermove` (pasif, untuk kabur) hanya dipasang selama
  jalur terlihat dan pointer halus.
- **Robot:** sudah berhenti saat tab tidak aktif; animasi mengintip hanya selama footer terlihat.
- **Ukuran yang dilaporkan:** bundle utama `main` vs branch (mentah dan gzip), potongan matter-js terpisah; waktu
  sampai hero tampil (FCP dan LCP, median 5 kali, CPU 4× lebih lambat) sebelum/sesudah, dengan dan tanpa layar
  pembuka; frame time saat label jatuh dan diseret di laptop (1×) dan HP kelas menengah (CPU 4×), target rata-rata
  ≤16,7 ms dan tanpa frame panjang yang berulang.

---

## 10. Kalimat karakter (ID / EN) untuk diperiksa

Disimpan di `src/i18n/characterLines.js`, ikut bahasa yang dipilih. `{name}` = nama depan dari profil ("Aldi").
Kolom **Sumber**: BRIEF = dari BRIEF §6; **baru** = usulan saya, mohon disetujui atau diubah (K9).

**Aturan bicara:** satu gelembung pada satu waktu; jeda acak 10–15 dtk (keputusan pemilik 19 Okt, §11a); gelembung tampil 2–3 dtk (sesuai panjang
kalimat); kalimat yang sama tidak muncul dua kali berturut-turut; ayam bicara ±2× lebih sering daripada bebek.

| Situasi | Siapa | Indonesia | English | Sumber |
|---|---|---|---|---|
| Menyapa (pertama terlihat) | Ayam | Petok! Selamat datang! | Bawk! Welcome! | BRIEF |
| | Bebek | Kwek, halo... | Quack, hi... | BRIEF |
| | Ayam | Makasih sudah mampir! | Thanks for stopping by! | BRIEF |
| Sesuai jam — pagi 04.00–10.59 | Ayam | Kukuruyuk! Selamat pagi! | Cock-a-doodle-doo! Morning! | BRIEF |
| siang 11.00–14.59 | Ayam | Selamat siang! Jangan lupa makan. | Good afternoon! Don't skip lunch. | baru |
| sore 15.00–17.59 | Bebek | Sore-sore begini enaknya santai... | Afternoons are for chilling... | baru |
| malam 18.00–21.59 | Ayam | Selamat malam! Masih semangat? | Good evening! Still going strong? | baru |
| larut 22.00–03.59 | Bebek | Begadang, ya? Aku juga. | Up late? Me too. | BRIEF |
| Iseng | Ayam | Sudah lihat proyeknya? Keren, lho. | Seen the projects? They're cool. | BRIEF |
| | Bebek | Aku lupa mau ke mana. | I forgot where I was going. | BRIEF |
| | Ayam | Jangan lupa isi buku tamu! | Don't forget the guestbook! | BRIEF |
| | Bebek | Kwek. | Quack. | BRIEF |
| | Ayam (hanya bila ada CV) | CV-nya bisa diunduh, lho! | Psst, the CV is ready to download! | baru |
| | Bebek | Aku bebek. Itu saja. | I'm a duck. That's all. | baru |
| Kabur dari kursor (desktop) | Ayam | Petok! Kaget! | Bawk! You scared me! | BRIEF |
| | Bebek | Kweeek! Lari! | Quaaack! Run! | BRIEF |
| | Ayam | Kursornya galak! | That cursor's fierce! | BRIEF |
| | keduanya | ! | ! | BRIEF ("gelembung !") |
| Didekati pelan (tidak kabur, K3) | Bebek | Halo, kursor. | Hi, cursor. | baru |
| Disentuh / diklik (melompat) | Ayam | Hup! | Hop! | BRIEF |
| | Bebek | Wiii! | Wheee! | BRIEF |
| | Ayam | Lagi, lagi! | Again! | BRIEF |
| Saling mengobrol 1 | Ayam → Bebek | Siapa yang bikin web ini? | Who built this site? | BRIEF |
| | Bebek → Ayam | {name}, dong. | {name}, of course. | BRIEF |
| Saling mengobrol 2 | Bebek → Ayam | Kenapa kita di sini? | Why are we here? | BRIEF |
| | Ayam → Bebek | Jaga portofolio {name}, dong. | Guarding {name}'s portfolio, of course. | BRIEF |
| Saling mengobrol 3 | Ayam → Bebek | Kamu sudah baca proyeknya? | Did you read the projects? | baru |
| | Bebek → Ayam | Sudah... yang mana, ya? | I did... which one was it? | baru |
| Mode gelap dinyalakan | Ayam | Eh, sudah malam? | Wait, is it night already? | BRIEF |
| Mode terang dinyalakan | Bebek | Silau... | So bright... | baru |
| Bahasa diganti ke English | Bebek | — | Quack! Switching to English! | BRIEF |
| Bahasa diganti ke Indonesia | Bebek | Kwek! Ganti ke bahasa Indonesia! | — | BRIEF |
| Gulir ke proyek (K4) | Ayam | Nah, ini proyek-proyek {name}! | Here are {name}'s projects! | BRIEF (diubah) |
| Label jatuh di dekat | Bebek | Aduh, kepalaku! | Ouch, my head! | BRIEF |
| | Ayam | Hei, hati-hati! | Hey, watch it! | baru |
| Pengunjung diam ±40 dtk | Bebek | Masih di situ? | Still there? | BRIEF |
| … 20 dtk kemudian (tidur) | keduanya | Zzz | Zzz | BRIEF |
| Bangun lagi | Ayam | Eh! Aku nggak tidur, kok. | Huh! I wasn't sleeping. | baru |
| Easter egg (10 klik) | Ayam | Oke, oke, aku menyerah! | Okay, okay, I give up! | BRIEF |
| | Bebek | Kwek... pusing... | Quack... dizzy... | baru |
| Bangun dari pingsan | Ayam | ...Aku cuma pura-pura. | ...I was only pretending. | baru |

Catatan bahasa: kalimat ganti bahasa diucapkan dalam bahasa **baru** (ke English → kalimat Inggris; ke Indonesia →
kalimat Indonesia), sesuai isi tabel BRIEF.

**Robot a+** (juga di `characterLines.js`, bagian `robot`):

| Situasi | Indonesia | English | Sumber |
|---|---|---|---|
| Footer, didekati / fokus | Kembali ke atas? | Back to top? | BRIEF |
| Buku tamu, mulai mengetik | Tulis yang baik, ya! | Keep it kind, okay? | BRIEF |
| Buku tamu, terkirim | Terkirim, makasih! | Sent, thanks! | BRIEF |
| Buku tamu, pesan kosong | Pesannya masih kosong, nih. | Your message is still empty. | baru (BRIEF: "ikut mengingatkan") |
| Buku tamu, nama kosong | Namanya diisi dulu, ya. | Your name first, please. | baru |
| Buku tamu, gagal kirim | Yah, belum terkirim. Coba lagi, ya. | Oops, not sent. Try again? | baru |

---

## 11. Keputusan yang butuh jawaban Anda

Setiap butir punya usulan; cukup jawab "setuju" atau pilih yang lain.

**K1. Warna paruh dan kaki** (lihat sketsa). **A (usulan):** `--ds-screen-ink` (sky, warna mata robot a+), hanya
token yang sudah ada, satu keluarga dengan robot. **B:** warna amber alami (`#FBBF24`/`#F59E0B`) sebagai primitive
baru `--palette-amber-*` + token komponen `--pub-char-beak`; lebih "seperti ayam", tetapi menambah warna di luar
palet Blueprint.

**K2. Label fisika di HP.** **A (usulan):** ketuk = lempar; tidak bisa diseret; menggulir halaman tidak pernah
terganggu. **B:** ketuk = lempar, tahan ±0,3 dtk lalu tarik = seret (geser cepat tetap menggulir). **C:** sentuh dan
tarik langsung bila sentuhan dimulai di label (BRIEF §7); geser yang kebetulan dimulai di label tidak menggulir
halaman. Panggung ada di bagian bawah layar pertama HP, tempat ibu jari biasa menggulir, jadi C paling berisiko.

**K3. Kabur dari kursor.** **Usulan:** kabur bila kursor mendekat (≤95 px) **dengan cepat**; bila didekati pelan,
karakter diam dan menatap kursor ("Halo, kursor."), sehingga bisa diklik (lompat dan easter egg 10 klik tetap bisa
dicapai). Bila terpojok, berhenti gemetar dengan "!". Alternatif: selalu kabur (karakter hampir mustahil diklik di
desktop).

**K4. Reaksi "gulir ke proyek".** Saat section Proyek terlihat, hero (dan jalur karakter) sudah di luar layar.
**A (usulan):** ayam muncul sekali per kunjungan di ruang kosong sebelah kanan judul Proyek (≥768 px), berkata "Ini
proyek favoritku!", lalu pergi (±3 dtk, tidak menutupi teks, `aria-hidden`). **B:** reaksi ditunda: saat pengunjung
kembali ke hero setelah melihat proyek, ayam berkata kalimat itu. **C:** reaksi ini dihapus.

**K5. Perubahan kecil tata letak 3A.** (a) Tombol Buku tamu **berhenti di atas footer** saat halaman sampai bawah
(CSS `position: sticky` di akhir konten, tanpa JS) sehingga tidak lagi menutupi "Kembali ke atas" dan pojok robot.
Selama menggulir, posisinya sama seperti sekarang. (b) Padding bawah hero bertambah untuk jalur karakter (§2a).
Setuju?

**K6. Tombol kembali ke atas di footer.** **Usulan:** satu tombol berisi teks "Kembali ke atas" yang tetap terlihat +
robot di sebelah kanannya. Alternatif: robot saja, teks hanya muncul di gelembung (lebih bersih, tetapi kurang jelas
di HP).

**K7. Layar pembuka** muncul pada halaman publik **pertama** per sesi, apa pun alamatnya (beranda, detail proyek,
404), dan diakhiri logo yang terbang ke navbar (**usulan**). Alternatif: hanya bila halaman pertama adalah beranda.

**K8. Perbaikan kursor berlaku juga di login dan admin** (**usulan**: komponennya satu; bracket yang tertinggal juga
terjadi di dialog konfirmasi admin; hover/fokus normal tetap identik). Alternatif: hanya aktif di halaman publik
(lewat prop), login dan admin 100% seperti `main`.

**K9. Kalimat baru** bertanda "baru" di §10: setuju, ubah, atau hapus?

**K10. Tombol suara** di navbar ≥1024 px dan di menu <1024 px; saat reduced motion tetap tampil dan menyalakannya
berbunyi satu "tok" sebagai tanda. Setuju?

## 11a. Jawaban pemilik project (18 Oktober 2026)

- **K1:** paruh dan kaki memakai **sky** (`--ds-screen-ink`, pilihan A). (Pemilik juga menyebut amber khusus paruh
  dan kaki sebagai alternatif; yang dipakai sky. Mengganti ke amber nanti cukup mengubah satu token komponen.)
- **K2–K8 dan K10:** disetujui sesuai usulan.
- **K9:** kalimat di §10 sedang dicek pemilik dan akan dikirim balik. Sampai saat itu hanya butir yang tidak memakai
  kalimat karakter yang dikerjakan: 1 (kursor), 2 (suara), 3 (label fisika), 7 (layar pembuka). Butir 4 (ayam dan
  bebek), 5 (robot footer), dan 6 (robot buku tamu) menunggu kalimat final.

**Kalimat final (19 Oktober 2026).** Semua kalimat §10 disetujui (termasuk yang bertanda "baru" dan kalimat robot),
dengan perubahan berikut (tabel §10 sudah diperbarui):

- EN obrolan 1: "{name}, duh." → **"{name}, of course."**
- EN obrolan 2: "Guarding {name}'s portfolio, duh." → **"Guarding {name}'s portfolio, of course."**
- EN iseng CV: "You can download the CV, you know!" → **"Psst, the CV is ready to download!"**
- Gulir ke proyek (K4): ID "Ini proyek favoritku!" → **"Nah, ini proyek-proyek {name}!"**; EN "This one's my
  favorite!" → **"Here are {name}'s projects!"**
- Ganti bahasa ke Indonesia: "Kwek! Ganti ke Indonesia!" → **"Kwek! Ganti ke bahasa Indonesia!"**
- EN malam: "Good evening! Still going?" → **"Good evening! Still going strong?"**
- **Jeda acak antar kalimat 10–15 detik** (bukan 6–10 detik seperti BRIEF §6; BRIEF diperbarui di butir 9).

Butir 4, 5, dan 6 dilanjutkan.

---

## 12. Pengujian (langkah 2)

Supabase tiruan berisi salinan data asli + Chrome headless (skrip di scratchpad, tidak di-commit), seperti 3A.

- **Sapuan** 375 / 768 / 1024 / 1440 × terang/gelap × ID/EN: tanpa scroll samping, kontras ≥4,5:1, satu h1, gelembung
  dan karakter tidak menimpa teks atau tombol (kotak dibandingkan dengan semua teks, tombol Unduh CV/Hubungi saya,
  Lihat proyek, tombol Buku tamu), tidak ada galat.
- **Label fisika:** matter-js tidak ada di bundle utama dan tidak dimuat sebelum panggung terlihat; label jatuh dan
  diam di dalam bingkai; seret dan lempar (desktop), ketuk = lempar (HP) dan geser jari di atas label tetap
  menggulir; ukuran jendela berubah; reduced motion = tumpukan statis tanpa permintaan matter-js.
- **Suara:** mati bawaan, pilihan tersimpan, `AudioContext` tidak dibuat sebelum aksi pengunjung, batas frekuensi
  bunyi (hitung bunyi per detik saat 10 label jatuh bersamaan).
- **Karakter:** sapaan, obrolan, kalimat sesuai bahasa (ganti ID/EN saat berjalan), tidak ada kalimat sama berturut-
  turut, kabur (pointer cepat) dan didekati pelan, klik = lompat, 10 klik = pingsan, diam lama = "Masih di
  situ?" lalu "Zzz", reaksi tema/bahasa/label jatuh, karakter tidak pernah keluar batas jalur atau lewat di bawah
  tombol Buku tamu, klik karakter tidak memindah fokus.
- **Layar pembuka:** hanya kunjungan pertama per sesi, dilewati dengan klik/tombol, tidak ada saat reduced motion
  atau tab latar belakang.
- **Robot:** footer (mengintip, naik saat didekati/fokus, klik ke atas + fokus ke konten), panel buku tamu (mood saat
  mengetik, kosong, terkirim, gagal).
- **Kursor:** klik Buku tamu → bracket langsung lepas dari tombol yang tertutup tanpa menggerakkan mouse; gulir roda
  → bracket ikut elemen di bawah mouse.
- **Keyboard:** semua kontrol (termasuk tombol suara di navbar dan menu, tombol robot footer) bisa dipakai; urutan Tab
  tidak berubah selain tombol baru; karakter dan label tidak pernah menerima fokus.
- **Reduced motion** dan **tab tidak aktif** (loop rAF fisika/karakter berhenti, dihitung dengan pembungkus
  `requestAnimationFrame` di skrip uji).
- **Performa:** ukuran bundle dan potongan, FCP/LCP hero sebelum/sesudah, frame time (§9).
- **Regresi login + admin** dibandingkan dengan `main` (computed style, posisi, teks, query) + uji khusus kursor.
- Suite 3A diulang (data, sertifikat, kontak, buku tamu, detail, interaksi, baris keahlian).
- `npm run lint`, `npm run build`. Screenshot sebelum/sesudah di `C:\Users\acer\portofolio-screenshots\tahap-3b\`.

---

## 13. Urutan commit

- [x] 0. Rencana ini (`plans/tahap-3b-publik.md`)
- [x] 1. Kursor viewfinder: cek ulang target di bawah mouse yang diam (+ uji login/admin)
- [x] 2. Suara: konteks + tombol (navbar ≥1024, menu <1024) + bunyi "tok" Web Audio dengan batas frekuensi
- [x] 3. Label fisika: pasang matter-js, panggung fisika lazy (jatuh, seret/lempar, ketuk di HP, bunyi tabrakan,
      berhenti saat diam/di luar layar/tab tidak aktif, reduced motion statis)
- [x] 4. Ayam dan bebek: SVG, `characterLines.js`, jalur di bar status, perilaku (jalan, sapa, obrol, kabur, lompat,
      easter egg, diam/tidur, sesuai jam, reaksi) + reaksi proyek sesuai K4
- [x] 5. Footer: tombol Buku tamu berhenti di atas footer (K5) + robot kembali ke atas
- [x] 6. Robot di panel buku tamu
- [x] 7. Layar pembuka
- [x] 8. Uji otomatis + perbaikan
- [x] 9. Dokumentasi (`pages/public.md`, `MASTER.md` §13/§15, `PRODUCT.md`, `BRIEF.md` bila ada keputusan baru),
      laporan dan uji manual

---

## 14. Hasil (19 Oktober 2026)

### Uji otomatis

Supabase tiruan berisi salinan data asli + Chrome headless (skrip di scratchpad, tidak di-commit). Komputer uji
sedang ±50% sibuk oleh aplikasi lain, jadi semua uji yang bergantung waktu menunggu keadaannya (bukan jeda tetap).

| Suite | Hasil | Isi |
|---|---|---|
| Kursor | lulus | Di `main` bracket tertinggal setelah klik Buku tamu, setelah gulir roda, dan di dialog Hapus admin; di branch tidak. Hover, area kosong, kolom teks, dan Tab di login identik dengan `main`. |
| Suara | 25/25 + 11/11 | Mati bawaan, tombol navbar/menu, pilihan diingat, `AudioContext` baru dibuat setelah aksi pengunjung, satu "tok" saat dinyalakan, di-suspend saat tab tidak aktif; batas 45 ms / 12 per detik / 120 ms per sumber (uji unit). |
| Label fisika | 40/40 | matter-js tidak di bundle utama dan tidak dimuat sebelum panggung terlihat, 10 label (HP 8) di dalam bingkai, seret dan lempar, klik/ketuk = lempar, geser jari di atas label tetap menggulir, loop berhenti saat diam / tab tidak aktif / di luar layar, ubah ukuran 1440 ↔ 375, reduced motion tanpa matter-js, bunyi tabrakan dalam batas. |
| Layar pembuka | 24/24 | Tampil di render pertama (tanpa kilatan), hanya sekali per sesi, juga di detail/404, logo mendarat di logo navbar (±1,5 px), klik/Tab melewati, tidak ada saat reduced motion / tab latar / login, fokus tidak pindah. |
| Ayam dan bebek | 59/59 | Dimuat lazy, sapaan berurutan, berdiri di garis, tidak lewat di bawah tombol Buku tamu, tidak menutupi teks/tombol, kabur / diam, lompat tanpa memindah fokus, easter egg, bunyi lompat, reaksi tema/bahasa/label jatuh, berhenti di luar layar dan saat tab tidak aktif, ketuk di HP, reduced motion, bahasa Inggris, jeda 10–15 dtk tanpa kalimat berulang, "Masih di situ?" → tidur → bangun (dengan jam dipercepat 10×), cameo sekali per sesi (tidak di 768 px / reduced motion). |
| Footer dan robot | 59/59 | Tombol Buku tamu sama posisinya saat menggulir, berhenti 16/24 px di atas footer, tidak menutupi "Kembali ke atas"/robot/"Kirim pesan", tanpa ruang gulir tambahan, robot mengintip, berdiri saat didekati / fokus keyboard / layar sentuh, klik robot = ke atas + fokus ke konten, reduced motion. |
| Robot buku tamu | 43/43 | Duduk di tepi formulir, tidak menutupi label/isian/tombol/pesan, melirik mengikuti tulisan, kalimat mengetik sekali, pengingat nama/pesan kosong + menggeleng, terkirim + lompat, gagal, Esc dan urutan Tab tetap seperti 3A. |
| Sapuan 3B | 160/160 | 375/768/1024/1440 × terang/gelap × ID/EN: karakter dan gelembung tidak menutupi teks hero, tombol, teks bar status, label, atau tombol Buku tamu; gelembung di dalam layar dengan kontras ≥4,5:1; label di dalam bingkai; robot footer dan gelembungnya di dalam layar; tanpa scroll samping; tanpa galat. |
| Potongan gagal dimuat | 3/3 | Potongan karakter/robot/cameo/fisika diblokir: halaman tetap utuh, tumpukan statis tampil, "Kembali ke atas" tetap bekerja. |
| Suite 3A | semua lulus | Data 41/41, sertifikat 20/20, kontak 21/21, buku tamu 30/30, detail 33/33, interaksi 57/57, keahlian 91/91, kotak masuk 18/18, sapuan 496/496. |
| Regresi login + admin | 145/145 | Identik dengan `main` per elemen; satu-satunya beda adalah lapisan kursor setelah klik "Ubah" (bracket langsung mengunci kolom di bawah mouse; perbaikan K8). |

`npm run lint` 0 diagnostik, `npm run build` berhasil.

### Performa

- **Bundle awal** (build produksi, JS + CSS yang dimuat `index.html`): 176,4 → 180,2 kB gzip (**+3,8 kB**, sedikit di
  atas target +3 kB di §9). Isinya bagian yang harus ada sejak awal: modul bunyi (wajib untuk iPhone), layar
  pembuka (render pertama), pemuat lazy, perbaikan kursor, dan CSS jalur/footer.
- **Potongan terpisah:** `physicsStage` (matter-js + fisika) 27,9 kB gzip, `CharacterLane` 4,9 kB, kalimat + gelembung
  2,1 kB, gaya karakter 2,5 kB, robot footer 1,2 kB, cameo 0,8 kB; `RobotMascot` memakai potongan yang sudah ada.
  Semuanya dimuat saat bagiannya mendekati layar dan browser idle; potongan yang gagal dimuat tidak merusak halaman.
- **Waktu sampai hero tampil:** trace CPU (×4 lebih lambat) menunjukkan tidak ada kode 3B yang berjalan sebelum nama
  hero tampil, dan kerja skrip sampai saat itu tidak bertambah. Waktu-dinding di CPU normal (11 putaran bergantian):
  median h1 3.274 ms (`main`) vs 3.414 ms (branch), terendah 2.756 vs 2.767 ms, jadi setara dalam derau. Di CPU 4×
  waktu-dinding terlalu berisik di komputer ini (h1 branch yang sama 2,8–13 dtk antar putaran) untuk disimpulkan.
- **Layar pembuka:** di CPU normal hilang ±1 dtk setelah mulai; di perangkat sibuk timeline CSS tetap tepat waktu;
  halaman yang baru siap >1,5 dtk melewatinya.
- **Frame (Chrome dengan GPU):** CPU 1× (laptop): label jatuh dan diseret 60 fps, ≤5 ms kerja per frame. CPU 4× (HP
  kelas menengah): jatuh/ketuk 49 fps (±7 ms per frame); menyeret (hanya desktop) 18–29 fps. Trace: ±2 hitung ulang
  style per frame, masing-masing 22–31 elemen, tanpa hitung ulang paksa; ayam dan bebek menambah ±7%. Saat semua diam:
  0 frame dari fisika, karakter berhenti di luar layar.
- Tanpa GPU (headless biasa) hero 3A sendiri hanya dirender 2–13 fps (raster perangkat lunak), jadi angka fps di atas
  diukur dengan GPU.

### Ditemukan dan diperbaiki saat uji

- Label bisa tembus dinding saat diseret jauh ke luar panggung → titik tarik dijaga di dalam bingkai + label yang lolos
  dikembalikan.
- Layar pembuka menahan hero ±0,5 dtk di perangkat sibuk → timeline dipindah ke animasi CSS, dilewati bila halaman
  baru siap >1,5 dtk; label fisika menunggu layar pembuka selesai.
- Ketukan di HP yang sibuk tidak terbaca (durasi diukur saat handler berjalan) → memakai `event.timeStamp`.
- Reaksi karakter ("!" kabur, "Halo, kursor.", "Aduh, kepalaku!") terblokir selama 4–20 dtk pertama kunjungan →
  hitungan jeda dimulai terbuka.
- Jeda obrolan kadang <10 dtk (dihitung dari awal giliran) → 10–15 dtk sejak akhir giliran; reaksi menggeser obrolan.
- Reaksi "label jatuh" hanya dari lantai → juga pendaratan keras di tumpukan; yang dihitung benda yang lebih cepat.
- Potongan dekoratif yang gagal dimuat bisa membuat halaman publik kosong (React.lazy tanpa penangkap) → `lazyDecor`.
- Gelembung pengingat dan wajah "error" robot buku tamu bisa tidak serempak → keduanya diturunkan dari event yang sama.

### Berbeda dari rencana

- Cameo ayam di judul Proyek hanya ≥1024 px (rencana: ≥768). Di 768 px kepala section (maks. 44rem) memakai hampir
  seluruh lebar, tidak ada ruang di sampingnya.
- Tinggi jalur karakter 90 px (100 px ≥1024), bukan 84/96 px: gelembung dua baris terpanjang ("Guarding Aldi's
  portfolio, of course.") butuh ruang itu supaya tidak menyentuh panggung.
- Layar pembuka dilewati bila halaman baru siap >1,5 dtk (keputusan saya, demi aturan "tidak memperlambat hero").
- Di HP baris bawah footer kini dua baris (+30 px) untuk ruang robot.
- Bundle awal +3,8 kB gzip (target +3 kB).

Screenshot sebelum/sesudah (tidak di-commit): `C:\Users\acer\portofolio-screenshots\tahap-3b\`.

### Uji manual untuk pemilik project

Jalankan server Anda seperti biasa (`npm run dev`, port 5173), lalu:

1. Buka `/` di **tab baru** di komputer: logo merakit diri lalu terbang ke logo navbar (±1 dtk). Muat ulang: tidak muncul
   lagi. Tab baru: muncul lagi.
2. Hero: label jatuh satu per satu. Seret label dan lepaskan (terlempar), klik label (melompat). Di HP: ketuk label
   (terlempar); geser jari yang dimulai di atas label tetap menggulir halaman.
3. Tombol speaker (navbar; di HP di menu ☰): nyalakan → satu "tok". Lempar label → "tok" pelan. Muat ulang: tetap
   menyala (bunyi aktif setelah klik pertama di halaman).
4. Ayam dan bebek di garis bar status: sapaan, lalu obrolan tiap 10–15 dtk. Arahkan mouse cepat ke ayam → kabur;
   dekati bebek pelan-pelan → diam menatap ("Halo, kursor."). Klik → melompat; klik 10× cepat → pingsan lalu bangun.
   Diamkan ±1 menit → "Masih di situ?" lalu tidur ("Zzz"); gerakkan mouse → bangun.
5. Ganti tema dan bahasa → ayam/bebek bereaksi. Di HP, ketuk label di atas bebek → kadang "Aduh, kepalaku!".
6. Gulir ke Proyek di layar lebar (≥1024 px) → ayam muncul sekali di samping judul.
7. Footer: robot mengintip dari pojok kanan bawah; dekati → "Kembali ke atas?"; klik robot → kembali ke atas. Tombol
   Buku tamu berhenti di atas footer dan tidak lagi menutupi "Kembali ke atas".
8. Buka Buku tamu: robot duduk di atas formulir. Ketik pesan → "Tulis yang baik, ya!"; kirim dengan nama kosong →
   pengingat; kirim lengkap → "Terkirim, makasih!".
9. Klik "Buku tamu" tanpa menggerakkan mouse: bracket kursor tidak tertinggal di tombol. Di admin, klik "Hapus":
   bracket tidak tertinggal di belakang dialog.
10. Nyalakan "Kurangi gerakan" di perangkat: label diam (tumpukan seperti 3A), ayam dan bebek diam, tanpa layar
    pembuka.
11. Login dan admin: tampilan dan perilaku seperti biasa.
