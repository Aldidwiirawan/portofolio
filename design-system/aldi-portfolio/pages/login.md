# Override Halaman: Login Admin (`/admin/login`)

> **PROJECT:** Aldi Portfolio · **Diperbarui:** 15 Oktober 2026 (tahap 1 selesai)
> ⚠️ Aturan di file ini **menimpa** `design-system/aldi-portfolio/MASTER.md`. Hal yang tidak disebut di sini
> mengikuti Master.

Implementasi: `src/pages/admin/AdminLoginPage.jsx` + `AdminLoginPage.css`.

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
| < 768px | Bar brand gelap ringkas di atas (monogram 36px + nama), kartu form selebar layar dengan gutter 16px, padding kartu 24px, `shadow-sm` |
| 768–1023px | Bar brand sama, kartu maks 440px di tengah, padding 40px, `shadow-md` |
| ≥ 1024px | Grid 2 kolom `5fr / 7fr`. Kiri: panel brand gelap setinggi layar (grid titik, glow sky/emerald, monogram 56px, nama 30px, garis gradien). Kanan: kartu di tengah vertikal |

- Latar area form memakai grid garis 32px yang memudar ke tepi (`mask-image`), sebagai nuansa "blueprint".
- Tampilan cek sesi ("Memeriksa status login...") memakai kerangka yang sama (`AdminLoginShell`), sehingga
  tidak ada kilasan tema gelap atau lompatan layout ketika form muncul.

## Komponen di halaman ini

| Elemen | Spesifikasi |
|---|---|
| Badge | "Portal CMS Portfolio", mono 12px uppercase, `accent-subtle` / `accent-text` |
| Judul | `h1` "Admin Login", `clamp(26px → 30px)`, 700, tracking -0.02em |
| Subtitle | 16px, `text-muted`, line-height 1.65 |
| Field email | `type=email`, `name=email`, `autocomplete=email`, `inputmode=email`, `autocapitalize=none`, `spellcheck=false` |
| Field password | `autocomplete=current-password`; paste dan password manager diizinkan; toggle show/hide 44×44 di dalam field (`aria-pressed`, `aria-controls`, label tetap "Tampilkan password") |
| Tombol submit | 48px, lebar penuh; saat proses: spinner + "Memverifikasi...", `aria-disabled="true"`, form `aria-busy="true"`; submit ganda diblok guard |
| Pesan error | Region `#admin-login-error` `role="alert"` selalu ada di DOM; kotak danger dengan ikon + teks; kedua field `aria-describedby` ke region saat ada pesan; fokus tidak dipindah |
| Akun non-admin | Teks penjelasan + tombol utama "Keluar dari Akun Ini" (logika tidak berubah) |
| Tautan kembali | "Kembali ke Halaman Utama" dengan ikon panah SVG, target 44px |
| Motion | Kartu masuk (opacity + translateY 8px, 320ms). Reduced motion: tanpa animasi, spinner diam |

### Pemetaan pesan error (saat render, logika auth tidak diubah)

| Pesan mentah Supabase | Ditampilkan |
|---|---|
| `Invalid login credentials` | Email atau password salah. Periksa kembali, lalu coba lagi. |
| `Email not confirmed` | Email ini belum dikonfirmasi. Buka tautan konfirmasi di kotak masuk email Anda terlebih dahulu. |
| `Failed to fetch` / `NetworkError` / `Load failed` | Tidak dapat terhubung ke server. Periksa koneksi internet Anda, lalu coba lagi. |
| `rate limit` / `Too many requests` / `For security purposes…` | Terlalu banyak percobaan masuk. Tunggu beberapa menit, lalu coba lagi. |
| Pesan lain (termasuk pesan bahasa Indonesia yang sudah ada) | Ditampilkan apa adanya |

## Catatan kompatibilitas

- Aturan `.admin-back-link` **dipertahankan** di bagian akhir `AdminLoginPage.css`. Login tidak memakainya,
  tetapi 4 halaman admin (Achievements, Certifications, Languages, Organizations) bergantung padanya.
  Pindahkan ke stylesheet admin bersama di tahap 2.
- Fallback `Suspense` di `App.jsx` dan loading di `AdminRoute` (`.admin-auth-loading`, tema gelap) tidak
  diubah. Saat pertama kali membuka `/admin/login`, fallback gelap "Memuat halaman..." bisa tampil sekilas
  sebelum chunk login dimuat. Selesaikan bersama tema terang admin di tahap 2.

## Saran perbaikan teks (BELUM diterapkan, menunggu persetujuan)

| Sekarang | Saran | Alasan |
|---|---|---|
| "Admin Login" | "Masuk Admin" | Konsisten berbahasa Indonesia |
| "Email Admin" | "Email" | Konteks admin sudah jelas dari judul |
| Placeholder password "••••••••" | (kosongkan) | Titik-titik bisa dikira field sudah terisi |
| "Masuk ke Dashboard" | "Masuk" | Lebih singkat; tujuan setelah login tidak selalu dashboard (bisa halaman asal) |
| "Akses ditolak: Akun terotentikasi ini …" | "Akses ditolak: akun ini tidak terdaftar sebagai administrator portfolio." | Ejaan baku "terautentikasi", dan kalimat lebih ringkas |
| "Sedang login sebagai: … (Non-Admin)" | "Anda masuk sebagai … Akun ini bukan administrator." | Lebih natural |
| `<title>` sama untuk semua halaman | "Masuk Admin · Aldi Dwi Irawan" | Judul tab per halaman (WCAG 2.4.2) |
| — | Petunjuk "Caps Lock aktif" di field password | Mencegah salah ketik |

## Verifikasi tahap 1 (15 Okt 2026)

Chrome headless via DevTools Protocol, di dev server `localhost:5173`. Hasilnya **31/31 lolos**:
- urutan Tab email → password → toggle → submit → kembali, dan semua punya outline fokus 2px;
- Space pada toggle mengganti `type` dan `aria-pressed`;
- kontras dari computed style: judul/label/input 17.85, subtitle 7.58, badge 6.16, tombol 5.17,
  placeholder 5.44, border input 3.40, ikon toggle 7.58;
- kedua font variable termuat dan `lang="id"`;
- login salah lewat Enter: status proses tampil, pesan ramah diumumkan di `role="alert"`, fokus tetap di
  password, tombol kembali normal;
- reduced motion: animasi kartu mati dan durasi token 0;
- `/admin` tanpa sesi tetap redirect ke login; tidak ada scroll horizontal di 375–1440.

**Login dengan akun yang benar** diuji manual oleh pemilik project. Screenshot ada di `../screenshots/login/`:
`before-*.webp`, `after-*.webp` (375/768/1024/1440), dan `after-error-*.webp`.
