# Override Halaman: Login Admin (`/admin/login`)

> **PROJECT:** Aldi Portfolio · **Diperbarui:** 15 Oktober 2026 (polish tahap 1, ronde 2)
> ⚠️ Aturan di file ini **menimpa** `design-system/aldi-portfolio/MASTER.md`. Hal yang tidak disebut di sini
> mengikuti Master. `BRIEF.md` tetap acuan utama.

Implementasi: `src/pages/admin/AdminLoginPage.jsx` + `AdminLoginPage.css`. Komponen brand/efek yang dipakai
dijelaskan di Master §13.

---

## Tema

- **Selalu terang.** Root halaman memakai `data-theme="light"` dan tidak mengikuti mode gelap OS (keputusan
  pemilik project, 15 Okt 2026).
- Panel brand memakai `data-theme="dark"` (tema bersarang) sebagai jembatan visual ke halaman publik.
- Selama halaman ini tampil, `<html>` diberi `color-scheme: light` dan latar `--palette-slate-75` lewat
  `html:has(.admin-login-page)`. Ini satu-satunya pemakaian primitive langsung, karena `<html>` berada di luar
  sub-pohon bertema.

## Layout

| Lebar | Susunan |
|---|---|
| < 768px | Bar brand gelap ringkas dengan lockup horizontal kecil (logo 32 px dalam bingkai 40 px). Area form dengan padding atas 16 px: robot 88 px di **docking pod** yang menempel di tepi atas kartu (tidak menutupi form), lalu kartu selebar layar dengan gutter 16 px, padding 24 px. Di 375×812 tombol "Masuk" terlihat tanpa scroll (bawah tombol 678 px; 766 px saat ada pesan error) |
| 768–1023px | Sama, kartu maks 440 px di tengah, padding 40 px |
| ≥ 1024px | Grid 2 kolom `5fr / 7fr`. Kiri: panel brand gelap (grid teknis 64/16 px, glow sky/emerald, bracket di 4 sudut, lockup horizontal di atas, lalu panggung robot dengan HUD di tengah sisa tinggi). Batas kolom: **Technical Divider Rail**. Kanan: kartu di tengah vertikal |

- Robot dirender di satu tempat saja sesuai `useMediaQuery('(min-width: 1024px)')`.
- Area form memakai latar `--ds-inset` (sedikit lebih gelap dari kartu) dengan
  `<BlueprintBackground variant="busy" />`. `<html>` ikut `--palette-slate-100` saat halaman ini tampil.
- **Lockup brand:** [logo dalam bingkai tipis dengan tanda sudut] | garis vertikal tipis | dua baris yang
  sejajar tengah dengan logo: "Aldi Dwi Irawan" (Inter 800, -0.02em) dan "PORTOFOLIO // 2026" (mono kecil,
  `aria-hidden`). Logo 64 px (bingkai 80) di ≥1024 px, 32 px (bingkai 40, viewBox digeser) di layar kecil,
  selalu di posisi piksel bulat.
- **Technical Divider Rail (≥1024 px):** elemen 48 px yang diposisikan absolut di batas kolom 5/12 (tidak
  menambah lebar). Isinya garis sambungan, tanda skala tiap 16 px (besar tiap 64 px, sejajar grid panel),
  pita cahaya tipis di sisi gelap dan bayangan lembut di sisi terang, serta node bersudut di tengah dengan
  konektor ke kedua panel dan LED yang mengikuti mood.
- **Panggung robot (≥1024 px):** robot 240 px berdiri di pijakan skematik "DOK-01" (SVG dekoratif), dengan
  pendar radial di belakangnya. Pendar terdiri dari tiga lapisan (biru `--ds-focus-ring` untuk
  idle/watching/hiding/peeking, merah `--ds-danger-border` untuk error, hijau `--ds-brand-to` untuk success)
  yang berganti lewat opacity 400 ms. Di bawahnya badge status monospace (`aria-hidden`): SIAP, MEMBACA
  EMAIL, MATA DITUTUP, MENGINTIP SEDIKIT, COBA LAGI, BERHASIL MASUK.
- **HUD di belakang robot:** satu SVG 460 px yang berpusat di robot: tiga cincin skematik (titik, putus-putus
  dengan busur aksen, tanda skala) yang berputar 90/75/60 dtk per putaran dengan arah berselang-seling; tiga
  chip grafis tanpa angka/teks (gelombang denyut, titik indikator dengan satu yang aktif, garis data) yang
  mengambang ±3 unit; dua titik data yang mengalir di jalur grid menuju pijakan. Aksen memakai warna mood.
  Semua animasi transform/opacity, berhenti saat tab tidak aktif (`data-paused` dari `usePageHidden`), dan
  diam saat reduced motion (titik data disembunyikan).
- `<ViewfinderCursor />` aktif di seluruh halaman (hanya untuk pointer halus).
- Tampilan cek sesi ("Memeriksa status masuk...") memakai kerangka yang sama (`AdminLoginShell`), termasuk
  robot, sehingga tidak ada lompatan layout ketika form muncul.

## Robot dan form

| Kejadian | `mood` robot | Lainnya |
|---|---|---|
| Halaman tampil / fokus di luar field | `idle` | — |
| Fokus atau mengetik di Email | `watching` | `lookAt` dari lebar teks (canvas `measureText`) dibagi lebar isi field, -1..1 |
| Fokus di Kata sandi (field atau tombol tampilkan) | `hiding` | — |
| Sama, dengan "Tampilkan kata sandi" aktif | `peeking` | — |
| Submit selesai dengan pesan error | `error` selama 2 dtk | kartu bergetar 400 ms, fokus dipindah ke Kata sandi |
| Login berhasil (form, listener auth, atau sesi admin yang sudah ada) | `success` | 450 ms kemudian transisi jepret ke tujuan |

- Semua state di atas murni tampilan. Blok logika auth (`useEffect` cek sesi + listener, `handleSubmit`,
  `handleNonAdminSignOut`) identik dengan versi sebelumnya (diverifikasi dengan diff).
- Satu-satunya perubahan alur: `navigate` diganti `useLoginExitNavigate()`. Panggilan pertama memulai urutan
  keluar (robot sukses → `runShutter` → navigasi di balik tirai). Panggilan berikutnya diabaikan, karena cek
  sesi, listener auth, dan form bisa sama-sama memanggil `navigate` saat sukses.
- Tirai membuka bila path tujuan aktif, `h1` tujuan ada (bukan `h1` login), dan tidak ada
  `.admin-auth-loading`. Fokus lalu dipindah ke `h1` tujuan.

## Teks (bahasa sederhana)

| Elemen | Teks |
|---|---|
| `document.title` | "Masuk · Aldi Dwi Irawan" (judul lama dipulihkan saat keluar halaman) |
| Badge | "Kelola isi portofolio" |
| Judul `h1` | "Masuk" |
| Subtitle | "Masuk dengan akun pemilik untuk mengelola isi portofolio dan pesan masuk." |
| Label | "Email" (placeholder "nama@email.com") dan "Kata sandi" (tanpa placeholder) |
| Tombol tampilkan | `aria-label` "Tampilkan kata sandi" + `aria-pressed` |
| Petunjuk | "Caps Lock aktif" (region `aria-live="polite"`, ditautkan lewat `aria-describedby`) |
| Tombol | "Masuk"; saat proses "Sedang masuk..." |
| Tautan | "Kembali ke beranda" |
| Cek sesi | "Memeriksa status masuk..." |
| Akun non-admin | "Anda masuk sebagai {email}. Keluar dulu, lalu masuk dengan akun pemilik." + tombol "Keluar dari akun ini" |
| Status transisi | "Berhasil masuk. Membuka beranda…" (`role="status"`) |

### Pemetaan pesan error (saat render; string di logika tidak diubah)

| Pesan asli | Ditampilkan |
|---|---|
| `Invalid login credentials` | Email atau kata sandi salah. Periksa lagi, lalu coba sekali lagi. |
| `Email not confirmed` | Email ini belum dikonfirmasi. Buka tautan konfirmasi di email Anda dulu. |
| `Failed to fetch` / `NetworkError` / `Load failed` | Tidak bisa terhubung ke server. Periksa koneksi internet, lalu coba lagi. |
| `rate limit` / `Too many requests` / `For security purposes…` | Terlalu banyak percobaan masuk. Tunggu beberapa menit, lalu coba lagi. |
| "… tidak terdaftar sebagai administrator …" (form, cek sesi, dan `AdminRoute`) | Akun ini tidak punya akses untuk mengelola situs. |
| "Gagal masuk. …" | Gagal masuk. Periksa email dan kata sandi, lalu coba lagi. |
| "Terjadi kesalahan sistem …" | Terjadi kesalahan. Coba lagi sebentar lagi. |
| Pesan lain | Ditampilkan apa adanya |

## Komponen di halaman ini

| Elemen | Spesifikasi |
|---|---|
| Field email | `type=email`, `name=email`, `autocomplete=email`, `inputmode=email`, `autocapitalize=none`, `spellcheck=false` |
| Field kata sandi | `autocomplete=current-password`; paste dan password manager diizinkan; tombol tampilkan 44×44 di dalam field |
| Tombol submit | 48 px, lebar penuh; saat proses spinner + teks, `aria-disabled="true"`, form `aria-busy="true"`; submit ganda diblok guard |
| Pesan error | Region `#admin-login-error` `role="alert"` selalu ada di DOM; kotak danger dengan ikon + teks; field `aria-describedby` ke region saat ada pesan |
| Kartu "Blueprint Module" | Radius 6 px, border 1 px (`text-strong` 16 %), bayangan offset 6/8 px berwarna aksen 14 % + bayangan lembut, bracket aksen di 4 sudut (satu pseudo-element), bar header 32 px (titik indikator hijau + "AREA PRIBADI" monospace, `aria-hidden`). Cek sesi memakai kartu yang sama |
| Badge | Tag sudut 2 px dengan titik indikator persegi, monospace uppercase |
| Input | Radius 4 px. Saat `:focus-within`, garis kiri 3 px `--ds-accent` tumbuh (`scaleY`, 180 ms), sebagai **tambahan** outline 2 px |
| Tombol "Masuk" | Radius 4 px + ikon panah. Hover/fokus: naik 1 px, bayangan offset 3 px, panah bergeser 4 px. Aktif: turun 1 px, bayangan dalam. Saat proses: spinner + "Sedang masuk...", tanpa panah |
| Tipografi | Judul "Masuk" dan nama: Inter 800, tracking -0.02em. Label 14 px/600 `text-strong`, deskripsi 16 px/400 `text-muted`, placeholder 16 px/400 `text-subtle`. Elemen teknis (badge, bar kartu, status robot, label pijakan, baris "PORTOFOLIO // 2026") memakai `--ds-font-mono` |
| Motion | Masuk kartu total 400 ms: bingkai 0–200, bracket 0–260, garis bar 60–300, isi 120–400 bertahap; hanya opacity/transform dengan fill `backwards`, jadi form bisa langsung diklik dan diketik. Getar error 400 ms (animasi bingkai tetap di daftar `animation` supaya tidak diputar ulang). Reduced motion: semua mati |

## Catatan kompatibilitas

- Aturan `.admin-back-link` **dipertahankan** di bagian akhir `AdminLoginPage.css`. Login tidak memakainya,
  tetapi 4 halaman admin (Achievements, Certifications, Languages, Organizations) bergantung padanya.
  Pindahkan ke stylesheet admin bersama di tahap 2.
- `<ShutterProvider>` di `App.jsx` hanya pembungkus; daftar rute tidak berubah. Ia menambah satu `<p
  role="status">` tersembunyi (kosong) di semua halaman.
- Fallback `Suspense` dan loading `AdminRoute` (`.admin-auth-loading`, gelap) belum diubah. Saat login sukses
  keduanya tertutup tirai transisi. Di tahap 2 keduanya ikut tema admin.

## Verifikasi ronde 2 (15 Okt 2026)

**105/105 lolos**, termasuk 20 pemeriksaan baru:
- Kursor: tanpa koordinat, reticle 19 px + titik 3 px; saat mengunci hanya titik yang tersisa.
- Lockup di 1024/1440: bingkai | garis | dua baris sejajar tengah (selisih < 1.5 px), logo 64 px di piksel
  bulat, meta `aria-hidden` dan monospace.
- Rail tepat di batas panel (selisih 0 px), `aria-hidden`, tidak menangkap klik, node di tengah tinggi layar,
  tanpa scroll horizontal; LED mengikuti mood.
- HUD: satu SVG `aria-hidden`, 3 cincin 90/75/60 dtk berlawanan arah, 3 chip tanpa teks, 2 titik data.
- Background: tanpa garis ukur; jalur sirkuit, 2 lapisan cahaya, 2 set titik.
- Semua animasi di halaman hanya `transform`/`opacity` (24 animasi diperiksa dari keyframe-nya).
- Tab disembunyikan: tidak ada animasi yang berjalan (HUD, robot, background); berjalan lagi saat terlihat.
- Kelancaran (Chrome headless tanpa GPU, 5 dtk): median frame 16.7 ms (60 fps), biaya main thread
  ±0.8 ms/frame. Robot tidak lagi memicu layout SVG tiap frame (lihat Master §6).
- 375×812: tombol "Masuk" terlihat tanpa scroll, juga saat pesan error tampil; robot bereaksi error.
- Reduced motion: tidak ada gerakan; HUD dan rail tetap tampil rapi; cahaya/titik data disembunyikan.
- Kontras tambahan: "PORTOFOLIO // 2026" 7.58. Halaman publik tetap identik.

## Verifikasi polish (15 Okt 2026)

**85/85 lolos** (61 pemeriksaan sebelumnya, disesuaikan dengan struktur baru, ditambah 24 pemeriksaan polish):
- Area form `rgb(241,245,249)` vs kartu putih; grid 64/16 px + mask tanda crosshair; bracket panel, pijakan.
- Kartu: radius 6 px, border 1 px, bayangan offset, bracket; bar "Area pribadi" `aria-hidden` dan monospace;
  badge tag 2 px + titik; input & tombol 4 px; judul & nama 800 dengan tracking -0.02em.
- Animasi masuk ≤ 400 ms, dan email bisa diklik dan diketik 146 ms setelah halaman dimuat, saat animasi masih
  berjalan.
- Robot: idle bernapas (`robot-breathe` + bayangan); watching menggeser dan memiringkan kepala; hiding
  menaikkan lengan, telapak tepat di depan kedua mata; peeking menurunkan lengan kanan. Status panel dan warna
  pendar benar untuk keenam mood (error merah dari login salah asli, success hijau dari login tiruan).
- Fokus email: garis kiri menyala dan outline 2 px tetap ada. Hover tombol: naik 1 px, panah bergeser 4 px,
  teks tetap "Masuk".
- Pod 375/768: menempel di kartu (selisih -1 px), robot tidak menutupi form.
- Reduced motion: tidak ada animasi atau transisi yang berjalan, pose tetap rapi.
- Kontras tambahan: bar kartu 6.92, badge status 7.03.
- Halaman publik tidak berubah (computed style, font, dan tinggi section setelah data stabil). Halaman admin
  tidak memakai file yang diubah.

### Verifikasi tahap 1 sebelumnya

Chrome headless via DevTools Protocol, di dev server `localhost:5173`. **61/61 lolos**, ditambah:
- 375/768/1024/1440: tanpa scroll horizontal; robot tidak berpotongan dengan kartu.
- Robot: idle → watching (pandangan -1 → -0.84 → 0.51 mengikuti panjang email) → hiding (bracket
  menyempit) → peeking; petunjuk Caps Lock muncul dan hilang.
- Kursor: crosshair + koordinat mengikuti pointer; bracket mengunci tombol tepat (±6 px); kolom teks memakai
  kursor teks; tidak menangkap klik; nonaktif di 375/768 (layar sentuh); kelas `html` dilepas setelah keluar.
- Background: grid bergeser; berhenti saat `visibilityState` disimulasikan `hidden`, lanjut saat `visible`.
- Login salah (Supabase asli): "Sedang masuk...", pesan ramah di `role="alert"`, robot error + lampu merah,
  kartu bergetar, fokus di Kata sandi, kembali `hiding` setelah 2 dtk.
- Login benar (respons Supabase tiruan lewat `Fetch.enable`): success 450 ms → tirai menutup → URL `/admin`
  berganti di balik tirai → tirai membuka setelah `h1` "Admin Portfolio CMS" tampil → fokus di `h1`.
  Sesi admin yang sudah ada juga memicu transisi. Escape dan klik melewati transisi.
- Keyboard penuh: Email → Kata sandi → Tampilkan → Masuk → Kembali; semua outline 2 px dan mendapat bracket.
- Reduced motion: tanpa crosshair, logo tidak merakit, background diam, robot tidak melirik, transisi
  dilewati tetapi navigasi dan fokus `h1` tetap.
- Kontras: judul/label 17.85, subtitle & petunjuk 7.58, badge 6.16, placeholder 5.44, tombol 5.17.
- Halaman publik: computed style dan tinggi section (setelah data Supabase stabil) identik dengan versi
  sebelumnya.

**Login dengan akun yang benar ke Supabase asli** diuji manual oleh pemilik project. Screenshot sebelum/
sesudah tidak di-commit (keputusan pemilik); pemeriksaan logo ada di `../screenshots/logo-check/`.
