# Brief Redesign Portofolio Aldi

Acuan utama untuk semua tahap redesign (login → admin → publik). Baca file ini bersama
`design-system/MASTER.md` sebelum mengerjakan tahap mana pun. Kalau ada yang bertentangan,
brief ini yang dipakai, kecuali pemilik project berkata lain.

## 1. Identitas

- **Design system:** "Blueprint" (token di `src/index.css`, dokumentasi di `design-system/`).
- **Logo:** `public/logo.svg`. Monogram geometris bergaya stensil. Setiap potongan logo
  harus menjadi `<path>` terpisah supaya bisa dianimasikan (merakit diri).
- **Kursor viewfinder:** crosshair minimalis dengan titik tengah, **tanpa koordinat**,
  berubah menjadi bracket yang mengunci elemen interaktif saat hover. Dipakai **penuh di semua
  halaman**.
  - Hanya aktif bila `(hover: hover) and (pointer: fine)`; di HP memakai perilaku bawaan.
  - Di kolom teks kembali ke kursor teks biasa.
  - Elemen yang difokus lewat keyboard juga mendapat bracket.
  - Bila `prefers-reduced-motion`: kursor biasa, bracket tanpa animasi.
- **Background blueprint:**
  - `busy` untuk login dan publik: grid bergeser pelan, jalur sirkuit tipis bersudut siku
    dengan cahaya yang mengalir pelan, titik persimpangan grid yang berpendar bergantian, dan
    tanda crosshair kecil. Tidak ada lagi garis ukur berangka.
  - `calm` untuk admin: grid tipis diam dan satu garis pindai yang turun perlahan.
  - Pilihan `calm` untuk admin masih bisa berubah nanti.
- **Orisinalitas:** dua situs referensi (irfansabrian.vercel.app dan styfensagala.vercel.app)
  hanya sumber inspirasi. Jangan menyalin tata letak khasnya: sidebar bernomor dan garis
  kontur (Irfan), stiker pil miring dengan bayangan tegas dan karakter gumpalan hitam
  (Styfen). Ciri khas kita: logo yang merakit diri, transisi jepret, maskot sendiri, jalur
  sirkuit blueprint, label bergaya tag blueprint.

## 2. Bahasa dan teks

- Semua teks memakai bahasa sederhana yang mudah dipahami. Hindari istilah teknis.
  Contoh penggantian:
  - "Admin Login" → "Masuk"
  - "Dashboard" → "Beranda"
  - "CMS" → "Kelola isi"
  - "Guestbook" → "Buku tamu"
  - "Password" → "Kata sandi"
- **Login dan admin:** bahasa Indonesia saja.
- **Halaman publik:** dua bahasa, Indonesia dan Inggris, dengan toggle **US / ID** sekali
  klik di navbar. Pilihan bahasa diingat di browser pengunjung.
  - Semua teks tampilan diterjemahkan lewat file terjemahan.
  - Isi konten (bio, deskripsi project, pengalaman, dan lainnya) mendapat kolom versi
    Inggris yang **opsional** di admin. Kalau kolom Inggris kosong, tampilkan versi
    Indonesia.

## 3. Halaman login (tahap 1)

- **Maskot: robot a+.** Kepala kotak dengan layar wajah (mata dan mulut), antena berupa
  bracket kecil 4 sudut dengan lampu di tengah, badan kecil dengan logo di dada, lengan dan
  kaki pendek. Garis tegas, desain orisinal.
- Suasana hati robot (`mood`):
  - `idle`: berkedip sesekali
  - `watching` (fokus/mengetik email): mata mengikuti panjang teks yang diketik
  - `hiding` (fokus kata sandi): mata menutup, bracket antena menyempit; kalau
    "Tampilkan kata sandi" aktif, robot mengintip dengan satu mata
  - `error` (login gagal): menggeleng, mata X, lampu merah, mulut sedih; form bergetar
    singkat
  - `success` (login berhasil): lompat kecil, mata senang, lampu hijau, bracket melebar
- **Transisi jepret** setelah login berhasil, sekitar 1 detik: bracket menyempit ke tengah →
  logo merakit → dua tirai menutup seperti rana kamera dengan kilatan halus → tirai membuka di
  halaman beranda admin. Bisa dilewati dengan klik atau Escape; dilewati otomatis bila
  reduced motion. Transisi ini masih bisa diganti nanti.

## 4. Panel admin (tahap 2)

- Background `calm`, kursor viewfinder penuh.
- Tata letak konsisten (sidebar yang bisa dibuka-tutup di HP, judul halaman), komponen
  bersama: tombol, input, card, tabel, badge, modal konfirmasi hapus, alert, empty state,
  loading.
- Nama menu dengan bahasa sederhana: Beranda, Profil, Proyek, Keahlian, Pengalaman,
  Pendidikan, Sertifikat, Prestasi, Bahasa, Organisasi, Pesan, Buku tamu.
- Sejak tahap 2B menu dikelompokkan menjadi 5: Beranda; Tentang Saya (Profil, Pendidikan,
  Bahasa); Karya & Keahlian (Proyek, Keahlian, Sertifikat); Rekam Jejak (Pengalaman,
  Organisasi, Prestasi); Kotak Masuk (Pesan, Buku tamu). Halaman dalam satu menu tampil
  sebagai sub-tab. Admin menyimpan data lengkap; lihat bagian 9 untuk yang ditampilkan publik.
- Tambahan untuk fitur publik (lihat bagian 5):
  - Halaman untuk mengatur **label fisika** (isi label, urutan, tampil/sembunyi).
  - Kolom versi Inggris yang opsional di form konten.
  - Angka studi kasus di form proyek (opsional).

## 5. Halaman publik (tahap 3)

### Fitur
1. **Bar status** di bawah hero: "Siap bekerja" (titik hijau), "Kediri, ID", tanggal hari ini.
2. **Karakter ayam dan bebek** yang berjalan-jalan (detail di bagian 6).
3. **Toggle mode gelap/terang.**
4. **Tombol suara**, bawaan mati. Suara hanya bunyi "tok" saat label bertabrakan dan saat
   karakter melompat. **Tidak ada suara ayam atau bebek.**
5. **Tombol buku tamu mengambang** di pojok, dengan jumlah pesan.
6. **Kata berganti** di hero, misalnya "aplikasi web", "aplikasi mobile", "sistem informasi".
7. **Studi kasus** proyek dengan angka hasil. Angka hanya dari data asli yang diisi pemilik;
   kalau tidak ada angka, bagian angka tidak ditampilkan. Jangan mengarang angka.
8. **Layar pembuka**: logo merakit diri sekitar 1 detik saat situs pertama kali dibuka.

### Label fisika di hero
- Label bisa diseret, dilempar, jatuh, memantul, dan saling bertabrakan (mesin fisika
  Matter.js 0.20.0, disetujui pemilik untuk tahap 3B, dimuat lazy). Di HP label dilempar dengan
  ketukan, tanpa seret (keputusan pemilik tahap 3B, `plans/tahap-3b-publik.md` K2).
- Isi label: React, Laravel, Full-stack, Supabase, UI/UX, Junior Web Dev, lingkaran `</>`,
  dan lingkaran `*`. Isi label bisa diatur dari admin.
- Gaya label: tag blueprint (sudut bracket kecil, huruf monospace), bukan stiker pil miring.
- Suara "tok" saat bertabrakan (Web Audio API), kerasnya sesuai kecepatan tabrakan, hanya
  bila tombol suara dinyalakan.

### Robot a+ muncul di halaman publik (dicoba dulu, bisa dihapus nanti)
- **Footer:** robot sesekali mengintip dari pojok kanan bawah. Saat didekati muncul penuh
  dan bertanya "Kembali ke atas?"; kalau diklik, halaman bergulir ke atas.
- **Panel buku tamu:** robot duduk di atas panel. Saat pengunjung mengetik: "Tulis yang
  baik, ya!" dan matanya melirik ke tulisan. Saat pesan terkirim: melompat senang dan
  berkata "Terkirim, makasih!". Kalau pesan kosong, ikut mengingatkan.

### Tampilan keahlian
- **Gaya:** baris berjalan per kategori (seperti referensi irfansabrian.vercel.app/skills).
  Setiap kategori punya judul dan satu kalimat penjelasan. Item memakai logo teknologi;
  keahlian tanpa logo (misalnya soft skill, Troubleshooting) memakai ikon umum.
- **Keahlian unggulan** (`is_featured`) ditonjolkan.
- **Pengaman:**
  - gerak pelan, berhenti saat hover, fokus, atau disentuh;
  - diam total saat `prefers-reduced-motion`;
  - salinan duplikat untuk efek berjalan diberi `aria-hidden`, sehingga pembaca layar hanya
    membaca satu daftar statis;
  - tanpa scroll horizontal di halaman.
- **Sumber logo** (diputuskan pemilik 18 Oktober 2026, tahap 3A): ikon yang diunggah di admin lebih dulu,
  lalu subset Simple Icons (CC0) yang disalin ke repo, lalu ikon umum per kategori. Tanpa library dan tanpa CDN.
  Tanyakan dulu sebelum menambah library atau CDN baru.

### Tautan proyek
- Satu proyek bisa punya beberapa tautan (maks. 6, kolom `projects.links`), misalnya repo konsol web
  dan repo aplikasi mobile. Jenisnya: Kode, Demo, Dokumentasi, Video, Lainnya. Urutannya mengikuti
  admin.
- Tautan publik bisa diklik.
- **Tautan privat tampil sebagai label yang tidak bisa diklik**, misalnya "Konsol web · repo privat".
- Sejak tahap 3A halaman publik membaca `links`. Kolom lama `github_url` dan `demo_url` masih diisi admin,
  tetapi tidak lagi dibaca halaman publik.

## 6. Ayam dan bebek

### Kepribadian
- **Ayam:** berani, cerewet, suka pamer.
- **Bebek:** santai, polos, agak lemot.

### Perilaku
- Berjalan-jalan sendiri di area bar status, berhenti untuk menyapa.
- **Desktop:** kalau kursor mendekat (sekitar 95 px), kabur ke arah berlawanan dengan
  gelembung "!" atau kalimat kabur. Kembali berjalan santai saat kursor menjauh.
- **HP / layar sentuh:** tidak kabur. Disentuh → melompat.
- Klik di desktop juga membuat karakter melompat.
- Sesekali berhenti berdampingan dan saling mengobrol.
- Sapaan sesuai jam (pagi, siang, sore, malam).
- Bereaksi pada aksi pengunjung: mode gelap dinyalakan, bahasa diganti, label jatuh di
  dekatnya, pengunjung menggulir ke bagian proyek.
- Pengunjung diam lama: "Masih di situ?", lalu tertidur ("Zzz") sampai ada gerakan lagi.
- Easter egg: diklik 10 kali berturut-turut → "Oke, oke, aku menyerah!", lalu pura-pura
  pingsan sebentar.
- Jeda bicara acak 10 sampai 15 detik setelah setiap giliran (keputusan pemilik 19 Oktober 2026,
  semula 6 sampai 10 detik), gelembung tampil 2 sampai 3 detik, kalimat yang sama tidak muncul
  dua kali berturut-turut.
- Semua kalimat disimpan di `src/i18n/characterLines.js` supaya mudah ditambah atau diubah. Daftar
  final (tabel di bawah ditambah kalimat yang disetujui di tahap 3B) ada di file itu dan di
  `plans/tahap-3b-publik.md` §10.

### Kalimat (Indonesia / English)

| Situasi | Siapa | Indonesia | English |
|---|---|---|---|
| Menyapa | Ayam | Petok! Selamat datang! | Bawk! Welcome! |
| | Bebek | Kwek, halo... | Quack, hi... |
| | Ayam | Makasih sudah mampir! | Thanks for stopping by! |
| Iseng | Ayam | Sudah lihat proyeknya? Keren, lho. | Seen the projects? They're cool. |
| | Bebek | Aku lupa mau ke mana. | I forgot where I was going. |
| | Ayam | Jangan lupa isi buku tamu! | Don't forget the guestbook! |
| | Bebek | Kwek. | Quack. |
| Kabur dari kursor | Ayam | Petok! Kaget! | Bawk! You scared me! |
| | Bebek | Kweeek! Lari! | Quaaack! Run! |
| | Ayam | Kursornya galak! | That cursor's fierce! |
| Disentuh (melompat) | Ayam | Hup! | Hop! |
| | Bebek | Wiii! | Wheee! |
| | Ayam | Lagi, lagi! | Again! |
| Saling mengobrol | Ayam → Bebek | Siapa yang bikin web ini? | Who built this site? |
| | Bebek → Ayam | Aldi, dong. | Aldi, of course. |
| | Bebek → Ayam | Kenapa kita di sini? | Why are we here? |
| | Ayam → Bebek | Jaga portofolio Aldi, dong. | Guarding Aldi's portfolio, of course. |
| Sesuai jam | Ayam (pagi) | Kukuruyuk! Selamat pagi! | Cock-a-doodle-doo! Morning! |
| | Bebek (malam) | Begadang, ya? Aku juga. | Up late? Me too. |
| Reaksi aksi | Ayam (mode gelap) | Eh, sudah malam? | Wait, is it night already? |
| | Bebek (ganti bahasa) | Quack! Switching to English! | Kwek! Ganti ke bahasa Indonesia! |
| | Ayam (gulir ke proyek) | Nah, ini proyek-proyek Aldi! | Here are Aldi's projects! |
| | Bebek (label jatuh dekat) | Aduh, kepalaku! | Ouch, my head! |
| Pengunjung diam | Bebek | Masih di situ? ... Zzz | Still there? ... Zzz |
| Easter egg (10 klik) | Ayam | Oke, oke, aku menyerah! | Okay, okay, I give up! |

Catatan: reaksi "pesan buku tamu terkirim" dipegang robot a+ (bagian 5), bukan ayam atau
bebek, supaya tidak tiga karakter bicara bersamaan.

## 7. Aturan teknis untuk semua tahap

- Tetap React + Vite + CSS biasa dengan CSS variables. Tanpa Tailwind.
- **Tanyakan dulu** sebelum menambah library baru.
- Jangan mengubah logika auth, hooks data, query Supabase, RLS, atau routing tanpa izin.
  Perubahan database (misalnya kolom versi Inggris, tabel label) dibuat sebagai file migrasi
  baru di `supabase/migrations/`; pemilik project yang menjalankannya.
- **Performa:** library berat (misalnya Matter.js) hanya dimuat di halaman publik setelah
  halaman tampil (lazy-load). Animasi berhenti saat bagiannya tidak terlihat atau tab tidak
  aktif. Di HP, jumlah label fisika lebih sedikit dan label hanya dilempar dengan ketukan (tanpa
  seret, keputusan pemilik tahap 3B), supaya scroll halaman tidak terganggu.
- **Aksesibilitas:** hormati `prefers-reduced-motion` (label tersusun diam, karakter tidak
  berjalan, transisi dilewati). Elemen dekoratif diberi `aria-hidden`. Kontras teks minimal
  4.5:1, fokus terlihat, semua bisa dipakai dengan keyboard.
- Uji di lebar 375, 768, 1024, dan 1440 px tanpa scroll horizontal.
- Kerjakan di branch terpisah per tahap, commit per bagian, jangan push atau merge.

## 8. Urutan tahap

1. **Login:** komponen bersama (Logo, RobotMascot, ViewfinderCursor, BlueprintBackground,
   ShutterTransition) dan halaman `/admin/login`.
2. **Admin:** tata letak dan komponen admin, background `calm`, bahasa sederhana.
3. **Publik**, dipecah tiga:
   - **3a.** Struktur, toggle US/ID, mode gelap, bar status, kata berganti, tombol buku tamu
     mengambang.
   - **3b.** Interaksi: label fisika dan suara, ayam dan bebek, layar pembuka, robot a+ di
     footer dan buku tamu.
   - **3c.** Studi kasus, section lainnya, kolom versi Inggris di admin, pengaturan label
     dari admin.

## 9. Strategi konten (tahap 2B, berlaku untuk halaman publik tahap 3)

Admin menyimpan data selengkap mungkin, tetapi halaman publik hanya menampilkan **ringkasan
pilihan**. Pemilihannya lewat sakelar di setiap form admin: **Tampil di halaman publik**
(`is_visible`), **Unggulan** (`is_featured`), dan urutan dengan tombol Naik/Turun (`sort_order`).

- **Yang ditampilkan publik:**
  - 3–4 proyek unggulan, masing-masing sebagai studi kasus (masalah, solusi, hasil);
  - 2–4 pengalaman;
  - pendidikan perguruan tinggi saja (SMK/SMA disembunyikan);
  - 3–6 sertifikat terpilih;
  - keahlian yang dikelompokkan per kategori.
- **Peran:** peran utama **Junior Programmer (Web & Mobile)**, dengan peran pendukung
  **IT Support**. Keduanya diisi di Profil dan dipakai di hero.
- **Riwayat dan sertifikat lengkap diarahkan ke LinkedIn.** Halaman publik tidak mencoba
  memuat semuanya.
- **Tautan LinkedIn, GitHub, dan CV ditonjolkan** di hero dan di bagian kontak. CV memakai file
  PDF yang diunggah di Profil; tautan CV lama hanya cadangan.
- **Alamat lengkap dan nomor HP tidak ditampilkan** di halaman publik. Cukup kota.
- Beranda admin memberi pengingat bila sesuatu yang dibutuhkan strategi ini belum ada (mis. foto
  profil, CV, proyek unggulan, gambar sertifikat, sertifikat yang akan kedaluwarsa).
- `is_visible` hanya mengatur tampilan, **bukan privasi**: data dan file tetap bisa dibaca lewat
  API dan URL publik. Jangan simpan data rahasia di kolom konten.
