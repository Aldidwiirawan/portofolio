# Override Halaman: Login Admin (`/admin/login`)

> **PROJECT:** Aldi Portfolio · **Diperbarui:** 15 Oktober 2026 (tahap 1 lanjutan sesuai BRIEF)
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
| < 768px | Bar brand gelap ringkas (`<Logo>` 32 px + nama). Di area form: robot 104 px di tengah **di atas** kartu (tidak menutupi form), lalu kartu selebar layar dengan gutter 16 px, padding 24 px |
| 768–1023px | Sama, kartu maks 440 px di tengah, padding 40 px, `shadow-md` |
| ≥ 1024px | Grid 2 kolom `5fr / 7fr`. Kiri: panel brand gelap (grid titik, glow sky/emerald, `<Logo assemble>` 64 px + nama 30 px di atas, robot 240 px di tengah sisa tinggi). Kanan: kartu di tengah vertikal |

- Robot dirender di satu tempat saja sesuai `useMediaQuery('(min-width: 1024px)')`.
- Area form memakai `<BlueprintBackground variant="busy" />` (menggantikan grid statis lama).
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
| Motion | Kartu masuk (opacity + translateY 8 px); getar error 400 ms (animasi masuk tetap di daftar `animation` supaya tidak diputar ulang). Reduced motion: semua mati |

## Catatan kompatibilitas

- Aturan `.admin-back-link` **dipertahankan** di bagian akhir `AdminLoginPage.css`. Login tidak memakainya,
  tetapi 4 halaman admin (Achievements, Certifications, Languages, Organizations) bergantung padanya.
  Pindahkan ke stylesheet admin bersama di tahap 2.
- `<ShutterProvider>` di `App.jsx` hanya pembungkus; daftar rute tidak berubah. Ia menambah satu `<p
  role="status">` tersembunyi (kosong) di semua halaman.
- Fallback `Suspense` dan loading `AdminRoute` (`.admin-auth-loading`, gelap) belum diubah. Saat login sukses
  keduanya tertutup tirai transisi. Di tahap 2 keduanya ikut tema admin.

## Verifikasi (15 Okt 2026)

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
