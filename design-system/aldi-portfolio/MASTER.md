# Design System "Blueprint" — Master

> **LOGIKA:** Saat membangun sebuah halaman, cek dulu `design-system/aldi-portfolio/pages/[nama-halaman].md`.
> Jika file itu ada, aturannya **menimpa** file Master ini. Jika tidak ada, ikuti aturan di bawah.
> **Acuan utama:** `design-system/aldi-portfolio/BRIEF.md`. Bila ada yang bertentangan, brief yang dipakai.

---

**Project:** Aldi Portfolio (React + Vite + CSS biasa + Supabase)
**Versi:** v1.4 · 30 Oktober 2026
**Status penerapan:** token, font, dan komponen brand/efek (§13) sudah ada di kode. Dipakai oleh
`/admin/login` (tahap 1), seluruh panel admin `/admin/*` (tahap 2 dan 2B, lihat §14 dan
`pages/admin.md`), dan halaman publik sejak tahap 3A (18 Oktober 2026), 3B (interaksi, 19 Oktober 2026), dan 3C
(isi Inggris, performa, SEO, persiapan Vercel, 20 Oktober 2026), lihat §15 dan `pages/public.md`.
**Halaman publik sejak rombakan monokrom (30 Oktober 2026, branch `feat/redesign-monokrom`):** warna, huruf, dan
komponen dasar publik mengikuti **§16**, bukan Blueprint. Login dan admin tetap Blueprint (§1–§14).
**Sumber token di kode:** `src/index.css` (blok "DESIGN SYSTEM BLUEPRINT v1"), font di `src/main.jsx`; palet
monokrom publik di `src/components/public/public.css`.

### Asal-usul & kurasi

File ini dibuat dengan `ui-ux-pro-max --design-system --persist` (kueri: "personal developer portfolio
admin CMS"), lalu **dikurasi manual**. Rekomendasi mentah generator ditolak karena tidak cocok:
- gaya Brutalism + "Scroll-Triggered Storytelling": tidak cocok untuk CMS;
- font Caveat + Quicksand (tulisan tangan): bertolak belakang dengan identitas "tech" situs;
- palet monokrom: menghapus identitas biru/sky/emerald.

Masukan yang dipakai dari pencarian lanjutan:
- kueri admin: Fira Sans/Code ("dashboard, technical, precise");
- kueri publik: aksen `#3B82F6` di latar gelap;
- domain typography: Inter + JetBrains Mono ("developer, precision");
- domain ux: accessible authentication, password toggle, error announcement, focus states.

Dua arah ditawarkan: A "Blueprint" dan B "Studio" (teal + Space Grotesk/DM Sans). User memilih **A**.

---

## 1. Prinsip

1. **Satu identitas, dua tema.** Halaman publik berkarakter (navy, nama raksasa satu warna, grid blueprint, aksen
   monospace) dan sejak tahap 3A mengikuti tema perangkat dengan tombol gelap/terang. Login dan admin memakai
   tema **terang** untuk kerja yang tenang. Semuanya memakai token yang sama.
2. **Token dulu.** Komponen hanya memakai token semantic `--ds-*`. Hex mentah dan `--palette-*` tidak dipakai
   langsung di komponen. Pengecualian yang terdokumentasi: warna latar `<html>` di halaman login.
3. **Presisi, bukan dekorasi.** Grid titik/garis "blueprint" dan glow hanya di latar. Konten tetap bersih:
   hierarki jelas, satu aksi utama per layar.
4. **Aksesibel secara default.** Minimal WCAG 2.2 AA: kontras, fokus terlihat, keyboard penuh, label terlihat,
   pesan error diumumkan.
5. **Motion bermakna.** Gerak hanya untuk umpan balik dan kontinuitas, dan selalu menghormati
   `prefers-reduced-motion`.

## 2. Arsitektur token

```
Primitive  --palette-*     nilai mentah (hex)                → hanya dirujuk oleh token semantic
Semantic   --ds-*          peran: canvas, text, accent, ...   → dipakai komponen; berubah per tema
Component  --login-*, --adm-*  khusus komponen/halaman        → didefinisikan di CSS halaman/komponen itu
```

- **Tema** ditentukan oleh atribut `data-theme` pada elemen pembungkus:
  - `:root` dan `[data-theme="dark"]` → nilai gelap (default dokumen, sesuai halaman publik);
  - `[data-theme="light"]` → nilai terang.
- **Tema boleh bersarang.** Contoh: panel brand gelap (`data-theme="dark"`) di dalam halaman login terang.
  Token semantic dideklarasikan ulang pada elemen ber-`data-theme`, jadi nilainya benar di setiap sub-pohon.
- `color-scheme` hanya di-set pada `[data-theme]`, bukan di `:root`. Halaman publik mengatur latar dan
  `color-scheme` `<html>` lewat `html[data-pub-theme]` (lihat `pages/public.md` §1).
- **Token lama tetap hidup.** `--color-*`, `--shadow-*`, `--transition-*`, `--font-*` sejak tahap 3A hanya
  dipakai gaya dasar global di `src/index.css` (`html`, `body`, `h1–h6`, `p`, `a`, `.btn`, `.badge`,
  `.container`), yang masih menjadi dasar login/admin. **Jangan hapus atau ganti namanya** sebelum gaya dasar itu
  dirapikan (lihat §9; belum dikerjakan sampai tahap 3C).

## 3. Warna

### Token semantic

Rasio kontras dihitung terhadap latar tempat token itu dipakai (WCAG 2.x). Teks minimal 4.5:1; elemen UI
(border kontrol, ikon bermakna, focus ring) minimal 3:1.

| Token | Terang | Gelap | Kegunaan | Kontras (terang / gelap) |
|---|---|---|---|---|
| `--ds-canvas` | `#F6F8FB` | `#0A0D14` | latar halaman | — |
| `--ds-surface` | `#FFFFFF` | `#111625` | kartu, input | — |
| `--ds-surface-raised` | `#FFFFFF` | `#171F33` | elemen terangkat (menu, popover) | — |
| `--ds-inset` | `#F1F5F9` | `#0A0D14` | area tenggelam, hover tombol ikon | — |
| `--ds-border` | `#E2E8F0` | `#1F293D` | garis pemisah, border kartu (dekoratif) | — |
| `--ds-border-control` | `#808C9F` | `#5B6B85` | border input/kontrol | 3.40 di putih, 3.20 di canvas / 3.34 di surface |
| `--ds-text-strong` | `#0F172A` | `#F8FAFC` | judul, label, isi input | 17.85 / 18.57 |
| `--ds-text` | `#334155` | `#CBD5E1` | teks isi | 10.35 / 12.14 |
| `--ds-text-muted` | `#475569` | `#94A3B8` | teks sekunder, subtitle | 7.58 / 7.58 |
| `--ds-text-subtle` | `#5B6B80` | `#7C8BA1` | placeholder, hint | 5.44 / 5.20 |
| `--ds-accent` | `#2563EB` | `#2563EB` | latar tombol utama | teks putih 5.17 |
| `--ds-accent-hover` | `#1D4ED8` | `#1D4ED8` | hover/aktif tombol utama | teks putih 6.70 |
| `--ds-accent-subtle` | `#EFF6FF` | `#172554` | latar badge/sorotan | — |
| `--ds-on-accent` | `#FFFFFF` | `#FFFFFF` | teks di atas aksen | — |
| `--ds-accent-text` | `#1D4ED8` | `#60A5FA` | teks/tautan beraksen | 6.16 di subtle / 7.64 |
| `--ds-focus-ring` | `#2563EB` | `#60A5FA` | outline fokus | 5.17 / 7.09 |
| `--ds-danger-text` | `#B91C1C` | `#FCA5A5` | teks error | 5.91 di danger-bg / 9.10 |
| `--ds-danger-bg` | `#FEF2F2` | `#2B1418` | latar pesan error | — |
| `--ds-danger-border` | `#DC2626` | `#F87171` | border pesan/field error | 4.83 / 6.51 |
| `--ds-success-text` | `#047857` | `#6EE7B7` | teks sukses | 5.21 / 10.02 |
| `--ds-success-bg` | `#ECFDF5` | `#0F2A22` | latar pesan sukses | — |
| `--ds-brand-from` → `--ds-brand-to` | `#38BDF8` → `#34D399` | sama | gradien identitas (dekoratif) | — |

**Aturan warna**
- Gradien brand hanya untuk aksen dekoratif (monogram, garis tipis, glow), **bukan** untuk teks isi atau tombol.
- Status (error/sukses) tidak boleh hanya mengandalkan warna. Wajib ada ikon dan/atau teks.
- Tombol utama di tema gelap juga memakai `#2563EB`, bukan `#3B82F6` lama, karena teks putih di `#3B82F6`
  hanya 3.68:1.

### Primitive yang tersedia

`--palette-white`; `--palette-slate-50/75/100/200/300/400/600/700/900`; `--palette-steel-300/400/500`
(abu kustom yang lolos kontras); `--palette-navy-500/800/850/900/950`; `--palette-blue-50/300/400/600/700/950`;
`--palette-sky-400`; `--palette-emerald-50/300/400/700/950`; `--palette-red-50/300/400/600/700/950`.

## 4. Tipografi

| Peran | Font | Token |
|---|---|---|
| UI, isi, judul | **Inter** (variable, 100–900) | `--ds-font-sans` |
| Label teknis, badge, kode | **JetBrains Mono** (variable) | `--ds-font-mono` |

- **Dimuat lewat Fontsource:** `@fontsource-variable/inter` dan `@fontsource-variable/jetbrains-mono`
  (self-hosted, tanpa request ke Google), di-import di `src/main.jsx`.
- Nama family `'Inter Variable'` / `'JetBrains Mono Variable'` sengaja berbeda dari deklarasi lama
  `'Inter'`. Akibatnya halaman yang masih memakai `--font-sans` lama tidak berubah sampai dimigrasikan.
  File woff2 hanya diunduh di halaman yang benar-benar memakai font tersebut.

| Token | Ukuran | Pemakaian umum |
|---|---|---|
| `--ds-fs-xs` | 12px | badge, caption (minimum mutlak) |
| `--ds-fs-sm` | 14px | label, teks pendukung, pesan |
| `--ds-fs-md` | 16px | isi, **input (wajib ≥16px agar iOS tidak zoom)**, tombol |
| `--ds-fs-lg` | 18px | lead paragraph |
| `--ds-fs-xl` | 20px | judul kecil |
| `--ds-fs-2xl` | 24px | judul section admin |
| `--ds-fs-3xl` | 30px | judul halaman |
| `--ds-fs-4xl` | 36px | judul besar admin; hero publik memakai `clamp()` sendiri |

- Line-height: `--ds-lh-tight` 1.2 (judul), `--ds-lh-snug` 1.35 (label), `--ds-lh-normal` 1.5 (UI),
  `--ds-lh-relaxed` 1.65 (paragraf).
- Weight: 400 isi, 500 tautan/teks penegas, 600 label & tombol, 700 judul, 800 hanya untuk display.
- Tracking: `--ds-tracking-tight` (-0.02em) untuk judul; `--ds-tracking-wide` (0.08em) **hanya** untuk label
  uppercase kecil (badge). Jangan ubah tracking teks isi.
- Panjang baris paragraf 60–75 karakter. Judul pendek memakai `text-wrap: balance`.

## 5. Spacing, radius, shadow, ukuran

- **Spacing:** pakai skala lama `--space-1..24` (kelipatan 4px: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96).
  Ritme vertikal: 8 (dalam grup) → 16–24 (antar field/blok) → 32–48 (antar section).
- **Radius:** `--radius-sm` 6px (tombol ikon), `--radius-md` 10px (input, tombol, alert),
  `--radius-lg` 16px (kartu), `--radius-xl` 24px (panel besar), `--radius-full` (badge, pill).
- **Shadow (per tema):** `--ds-shadow-sm` (tombol, kartu di mobile), `--ds-shadow-md` (kartu ≥768px),
  `--ds-shadow-lg` (dialog, popover). Token `--shadow-*` lama hanya cocok untuk tema gelap.
- **Ukuran kontrol:** `--ds-control-height` 48px (input, tombol utama); `--ds-target-min` 44px (semua
  target sentuh, termasuk tombol ikon dan tautan penting).
- **Breakpoint:** desain mobile-first. Uji wajib di 375, 768, 1024, 1440; layout berganti di 768 dan 1024.

## 6. Motion

| Token | Nilai | Untuk |
|---|---|---|
| `--ds-duration-fast` | 120ms | hover, warna, tekan |
| `--ds-duration-base` | 200ms | buka/tutup elemen kecil |
| `--ds-duration-slow` | 320ms | elemen masuk (kartu, panel) |
| `--ds-ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | elemen masuk / umpan balik |
| `--ds-ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | perpindahan posisi |

- Animasikan hanya `transform` dan `opacity`. Jangan animasikan `width`, `height`, `top`, atau `left`.
- Maksimal 1–2 elemen bergerak per layar. Animasi keluar lebih cepat dari animasi masuk.
- Saat `prefers-reduced-motion: reduce`, durasi `--ds-*` otomatis menjadi 0. Animasi tak hingga (spinner)
  wajib dimatikan eksplisit di CSS komponen, dengan teks status tetap tampil.
- **Pengecualian dari BRIEF:** komponen identitas (§13) boleh bergerak terus-menerus (grid bergeser,
  cahaya di jalur sirkuit, cincin HUD, napas robot), dengan syarat: hanya `transform`/`opacity`, berhenti
  saat tab tersembunyi atau elemen di luar layar, dan diam total saat reduced motion.
- Transform pada elemen **di dalam** SVG (`<g>`, `<path>`) tidak bisa dijalankan compositor dan dihitung di
  main thread setiap frame. Pakai seperlunya dan ukur: login saat ini ±0.8 ms/frame (style + layout + script).
  Hindari `vector-effect: non-scaling-stroke` pada elemen yang ikut bergerak, karena memaksa layout SVG
  setiap frame.

## 7. Komponen dasar (spesifikasi state)

Implementasi acuan: login di `src/pages/admin/AdminLoginPage.css`; untuk panel admin, versi bersamanya ada di
`src/components/admin/ui/admin-ui.css` (tombol tajam 4 px, input 44 px dengan rel fokus, dsb.; lihat
`pages/admin.md` §3). Tabel di bawah berlaku untuk keduanya; admin memakai radius kontrol 4 px.

| Komponen | Default | Hover | Fokus (keyboard) | Aktif / Busy | Nonaktif |
|---|---|---|---|---|---|
| Tombol utama | bg `accent`, teks `on-accent`, 48px, radius md, `shadow-sm` | bg `accent-hover` | outline 2px `focus-ring`, offset 2px | `translateY(1px)`; busy: spinner + teks proses, `aria-disabled="true"`, `cursor: progress` | `disabled` + opacity 0.5, `cursor: not-allowed` |
| Input teks | bg `surface`, border `border-control`, teks `text-strong`, 48px, 16px | border `text-muted` | border `accent` + outline 2px `focus-ring` offset 1px | — | bg `inset`, teks `text-subtle` |
| Tombol ikon (mis. toggle password) | transparan, ikon `text-muted`, target 44×44 | bg `inset`, ikon `text-strong` | outline 2px, offset -2px | — | — |
| Alert error | bg `danger-bg`, border `danger-border`, teks `danger-text`, ikon + teks | — | (bisa difokuskan bila perlu) | — | — |
| Badge | mono 12px uppercase, bg `accent-subtle`, teks `accent-text`, pill | — | — | — | — |
| Tautan sekunder | teks `text-muted` 14px/500, min-height 44px | teks `text-strong` + underline | outline 2px | — | — |
| Spinner | border `currentColor` dengan satu sisi transparan, 0.8s linear | — | — | — | reduced motion: diam (opacity 0.6) |

**Aturan form**
- Label selalu terlihat (`<label for>`). Placeholder hanya contoh format, bukan pengganti label.
- Gunakan `type`, `name`, `autocomplete`, dan `inputmode` yang benar. Jangan pernah memblokir paste atau
  password manager (WCAG 2.2 *Accessible Authentication*).
- Field password wajib punya tombol show/hide: `type="button"`, label tetap, `aria-pressed`, `aria-controls`.
- Pesan error memakai region `role="alert"` yang **selalu ada di DOM**, dengan kotak yang baru muncul saat ada
  pesan. Field terkait diberi `aria-describedby` ke region itu. Error autentikasi tidak menunjuk field
  tertentu, supaya tidak membocorkan field mana yang salah.
- Saat submit berjalan, pakai `aria-disabled` + guard (bukan `disabled`) agar fokus keyboard tidak hilang.
  Setelah submit gagal, fokus diarahkan ke field yang paling mungkin diperbaiki (di login: Kata sandi).
- Pesan mentah dari Supabase (bahasa Inggris) dipetakan ke kalimat Indonesia yang menjelaskan sebab dan
  langkah berikutnya.

## 8. Aksesibilitas (wajib)

- [ ] Kontras teks ≥4.5:1, elemen UI dan focus ring ≥3:1 (cek kedua tema bila keduanya dipakai).
- [ ] Setiap kontrol interaktif punya outline `:focus-visible` (outline asli, bukan hanya box-shadow, supaya
      terlihat di Windows High Contrast / forced-colors).
- [ ] Urutan Tab mengikuti urutan visual, dan semua fungsi bisa dipakai dengan keyboard (Enter submit, Space
      toggle).
- [ ] Target sentuh ≥44×44px.
- [ ] Ikon dekoratif `aria-hidden="true"`; tombol ikon punya nama aksesibel.
- [ ] Landmark jelas (`header`, `main`) dan hierarki heading berurutan (satu `h1` per halaman).
- [ ] Status dinamis diumumkan (`role="alert"` untuk error, `role="status"` untuk proses).
- [ ] `prefers-reduced-motion` dihormati; tidak ada scroll horizontal di 375px.
- [ ] `<html lang="id">` (sudah di-set di `index.html`).

## 9. Pemetaan token lama → baru (untuk tahap 2–3)

| Token lama | Pengganti | Catatan |
|---|---|---|
| `--color-bg-primary` | `--ds-canvas` | |
| `--color-bg-surface` | `--ds-surface` | |
| `--color-bg-surface-hover` / `--color-bg-subtle` | `--ds-surface-raised` / `--ds-inset` | sesuaikan per konteks |
| `--color-bg-card` | `--ds-surface` (+ transparansi lokal bila perlu efek kaca) | |
| `--color-border` | `--ds-border` | kontrol form → `--ds-border-control` |
| `--color-border-hover` | `--ds-border-control` | |
| `--color-text-primary` | `--ds-text-strong` | |
| `--color-text-secondary` | `--ds-text-muted` | |
| `--color-text-muted` | `--ds-text-subtle` | **memperbaiki kontras** (4.08 → 5.61:1 di gelap) |
| `--color-primary` | `--ds-accent` (latar) / `--ds-accent-text` (teks) | latar tombol `#3B82F6` → `#2563EB` (3.68 → 5.17:1) |
| `--color-primary-hover` | `--ds-accent-hover` | |
| `--color-primary-light` | `--ds-accent-subtle` | |
| `--color-accent` (cyan) | `--ds-brand-from` / `--ds-brand-to` | hanya dekoratif |
| `--color-success` / `--color-danger` | `--ds-success-*` / `--ds-danger-*` | |
| `--font-sans` / `--font-mono` | `--ds-font-sans` / `--ds-font-mono` | migrasi ini mengubah font publik secara visual |
| `--shadow-sm/md/lg` | `--ds-shadow-sm/md/lg` | |
| `--transition-fast/normal/slow` | `--ds-duration-*` + `--ds-ease-*` | |
| `--color-bg-base`, `--color-bg-elevated` | `--ds-canvas`, `--ds-surface-raised` | **saat ini tidak terdefinisi** (lihat §10) |

Setelah sebuah halaman selesai dimigrasi, token lama yang tidak lagi dipakai boleh dijadikan alias
(`--color-x: var(--ds-y)` di dalam `:root, [data-theme]`), lalu dihapus di akhir tahap 3.

## 10. Temuan audit (15 Oktober 2026)

1. Font Inter/JetBrains Mono dideklarasikan tetapi **tidak pernah dimuat**, jadi halaman lama tampil dengan
   font sistem. `.btn` tidak mewarisi `font-family`, sehingga teks tombol tampil dengan font default browser.
2. Kontras gagal di tema lama: teks putih di `.btn-primary` (`#3B82F6`) = 3.68:1; `--color-text-muted`
   `#64748B` di `#0A0D14` = 4.08:1 (dipakai 51×).
3. Tidak ada `prefers-reduced-motion` di mana pun sebelum tahap 1. `:focus-visible` hanya ada di `.btn`
   dan Navbar.
4. Variabel dipakai tapi tidak didefinisikan: `--color-bg-base` (AdminGuestbookPage.css ×2),
   `--color-bg-elevated` (AdminProjectsPage.css). **Selesai di tahap 2:** stylesheet lama itu dihapus.
5. Class alert admin (`admin-alert*`, `alert-banner-*`) tidak punya CSS sama sekali. **Selesai di tahap 2:**
   diganti `Toast` dan `Alert`.
6. `.admin-back-link` dipakai 4 halaman admin tetapi hanya didefinisikan di `AdminLoginPage.css`. Style-nya
   hanya ada jika halaman login pernah dimuat dalam sesi itu. **Selesai di tahap 2:** navigasi pindah ke
   sidebar; aturan itu dihapus dari CSS login (login tidak memakainya, tampilannya tetap sama).
7. Banyak warna hex mentah di CSS komponen publik (`#38BDF8` 13×, `#FFFFFF` 26×, dst.), dan emoji dipakai
   sebagai ikon (kapsul hero, tombol guestbook).

## 11. Anti-pattern (jangan dilakukan)

- ❌ Emoji sebagai ikon struktural. Pakai SVG inline dengan satu gaya (stroke 1.8, ujung bulat), tanpa
  menambah library ikon tanpa persetujuan.
- ❌ Hex mentah atau `--palette-*` langsung di CSS komponen. Pakai `--ds-*`.
- ❌ Menghapus outline fokus tanpa pengganti, atau fokus yang hanya berupa box-shadow.
- ❌ Placeholder sebagai pengganti label, atau memblokir paste di field password.
- ❌ `disabled` pada tombol submit yang sedang fokus (fokus keyboard hilang). Pakai `aria-disabled` + guard.
- ❌ Gradien brand untuk teks isi atau latar tombol.
- ❌ Hover yang menggeser layout, atau animasi `width/height/top/left`.
- ❌ Migrasi ke Tailwind atau menambah framework UI tanpa persetujuan pemilik project.
- ❌ Efek dekoratif yang menangkap klik, mengambil fokus, terbaca screen reader, atau tetap bergerak saat
  reduced motion / tab tersembunyi.
- ❌ Menyalin tata letak khas situs referensi (lihat BRIEF §1 "Orisinalitas").

## 12. Pre-delivery checklist

- [ ] Hanya token `--ds-*` di CSS komponen baru.
- [ ] `npm run lint` 0 diagnostik, `npm run build` sukses.
- [ ] Dicek di 375 / 768 / 1024 / 1440: tanpa scroll horizontal, tidak ada konten tertutup.
- [ ] Keyboard: urutan Tab benar, fokus terlihat, Enter/Space bekerja.
- [ ] Kontras dihitung dari computed style (bukan ditebak).
- [ ] Reduced motion diuji (emulasi `prefers-reduced-motion: reduce`).
- [ ] Halaman lain tidak berubah (bandingkan computed style/tinggi section dengan baseline).
- [ ] Halaman publik (sejak 3C): bundle awal tetap tanpa supabase-js dan kode admin; data publik lewat
      `src/lib/publicApi.js`; tanpa pergeseran tata letak (CLS 0); Lighthouse mobile beranda tidak turun.
- [ ] Sumber dari domain lain (gambar, skrip, font, API) ditambahkan juga ke CSP di `vercel.json` (`DEPLOY.md` §9).
- [ ] Screenshot sebelum/sesudah ditunjukkan di laporan. Sejak 15 Okt 2026 screenshot halaman tidak
      di-commit (keputusan pemilik); pemeriksaan logo tetap di `screenshots/logo-check/`.

## 13. Identitas & komponen brand (BRIEF tahap 1)

Komponen bersama, siap dipakai ulang di admin (tahap 2) dan publik (tahap 3). Semua hanya memakai token
`--ds-*` dan mengikuti tema tempat komponen berada.

### Token tambahan (sama di kedua tema)

| Token | Nilai | Kegunaan |
|---|---|---|
| `--ds-screen` | `navy-950` | layar wajah robot (selalu gelap) |
| `--ds-screen-ink` | `sky-400` | mata, mulut, lampu antena robot |
| `--ds-z-shutter` / `--ds-z-cursor` | 900 / 1000 | lapisan overlay transisi dan kursor |

Util UI: `src/lib/useMediaQuery.js` berisi `useMediaQuery(query)`, `usePrefersReducedMotion()`, dan
`prefersReducedMotion()` (untuk handler/timer). `src/lib/usePageHidden.js` berisi `usePageHidden()`
(`true` saat tab tidak aktif) untuk menjeda animasi dekoratif.

### Logo — `src/components/brand/Logo.jsx`

- Sumber bentuk: `public/logo.svg` (grid 16 unit di viewBox 512, 8 `<path>`). Data path disalin di
  `logoGeometry.js` dan wajib identik; pemeriksaan otomatis membandingkan keduanya.
- Props: `size` (px), `title` (tanpa title berarti `aria-hidden`), `assemble`, sisa props ke `<svg>`
  (bisa bersarang di SVG lain lewat `x`/`y`). Warna mengikuti `currentColor`.
- `assemble`: tiap potongan meluncur dari arahnya sendiri (600 ms, jeda 25 ms per potongan, ±0.75 dtk
  total). Mati saat reduced motion. Ganti `key` untuk memutar ulang.
- **Ukuran tajam:** pakai kelipatan 64 px (semua garis grid jatuh di piksel). Di kelipatan ganjil 32 px
  (32, 96) viewBox otomatis digeser 8 unit supaya tepi tegak tetap di piksel. Di bawah 24 px pakai
  `public/favicon.svg` (versi sederhana grid 16 px).
- `trim`: memangkas margin 24 unit (viewBox `24 24 464 464`) supaya logo yang terlihat mengisi kotaknya,
  misalnya di samping teks. Ukuran tajam dengan `trim`: kelipatan 58 px (semua garis grid di piksel bulat);
  29 px menjaga semua tepi tegak tajam. Pastikan posisi logo juga di piksel bulat.
- Favicon dan ikon: `favicon.svg` (terang/gelap lewat `prefers-color-scheme` di dalam SVG),
  `apple-touch-icon.png` 180, `icon-512.png` (di `site.webmanifest`). Rincian di
  `screenshots/logo-check/metrics.md`.

### RobotMascot ("a+") — `src/components/brand/RobotMascot.jsx`

Desain orisinal: kepala kotak dengan layar wajah, antena berupa 4 bracket dengan lampu, badan kecil dengan
`<Logo>` di dada, lengan dan kaki pendek, garis 4 unit. Garis `--ds-text-strong`, badan `--ds-surface`,
layar `--ds-screen`. Selalu `aria-hidden`.

Lengan digambar paling akhir supaya bisa menutupi layar wajah. Pose menutup (`hiding`/`peeking`) adalah
bentuk tetap (lengan terangkat + telapak di depan mata) yang muncul lewat opacity dan sedikit naik; lengan
yang menggantung memudar. Tidak ada stroke yang meregang, jadi robot boleh diskalakan dengan cara apa pun.
Saat tab tidak aktif robot memberi kelas `robot--paused` dan semua animasinya berhenti.

| `mood` | Mata | Mulut | Antena | Gerak |
|---|---|---|---|---|
| `idle` | terbuka | senyum kecil | lampu sky | kedip acak 3–6 dtk; bernapas (badan atas naik-turun 2.5 unit per 3.2 dtk, bayangan ikut mengecil) |
| `watching` | terbuka, mengikuti `lookAt` (-1..1) | datar | lampu sky | kepala bergeser ±3 unit dan miring ±4° ke arah pandang, kedip |
| `hiding` | tertutup | datar | bracket menyempit 5 | kedua lengan naik, telapak menutup kedua mata |
| `peeking` | satu mata terbuka | senyum miring | bracket menyempit 3 | lengan kanan turun sedikit, mata kanan terlihat |
| `error` | X | sedih | lampu `--ds-danger-border` | menggeleng 520 ms |
| `success` | senang (^ ^) | senyum lebar | lampu `--ds-brand-to`, bracket melebar 5 | lompat 560 ms, tangan terangkat |

Props lain: `size` (lebar px, tinggi 1.2×) dan `cue` (ubah nilainya untuk memutar ulang gelengan atau
lompatan). Reduced motion: wajah dan pose tetap berganti (mis. telapak menutup mata), tetapi tanpa kedip,
napas, lirikan, kemiringan, gelengan, lompatan, atau transisi.

Sejak tahap 3B robot juga tampil di halaman publik (footer dan panel buku tamu, `src/components/public/robot/`),
memakai komponen ini **tanpa perubahan**; posisi, mengintip, dan gelembung kata diatur pembungkusnya.

### ViewfinderCursor — `src/components/effects/ViewfinderCursor.jsx`

- Crosshair minimalis 19 px dengan titik tengah 3 px, **tanpa koordinat**, dan `mix-blend-mode:
  difference` supaya terbaca di latar terang maupun gelap. Saat bracket mengunci elemen, garis crosshair
  menyusut dan hanya titik tengah yang tersisa (tidak menimpa teks tombol).
- Hover pada `a[href], button, input, select, textarea, [role=button], [data-cursor-lock]` membuat 4 bracket
  (`--ds-focus-ring`, jarak 6 px) mengunci elemen. Bracket mengikuti tema elemen yang dikunci.
- Kolom teks: crosshair disembunyikan, kursor teks bawaan tampil, bracket tetap mengunci.
- Keyboard: elemen yang fokus dengan `:focus-visible` mendapat bracket; crosshair disembunyikan selama
  navigasi keyboard.
- Aktif hanya bila `(hover: hover) and (pointer: fine)` dan bukan `forced-colors`. Kursor bawaan
  disembunyikan lewat kelas `html.vf-cursor-active`, yang dilepas saat komponen dilepas.
- Performa: satu listener `pointermove` pasif, render lewat rAF, posisi hanya lewat `transform`. rAF
  berjalan terus hanya selama bracket mengunci elemen, untuk mengikuti pergeseran layout.
- Mouse yang diam (sejak tahap 3B): setiap render yang bukan dari `pointermove` (gulir, frame saat mengunci,
  ±450 ms setelah klik) mengecek ulang elemen di bawah mouse dengan `document.elementFromPoint`. Jadi bracket
  tidak tertinggal di tombol yang tertutup panel/dialog setelah diklik, atau di elemen yang tergulir pergi.
- Reduced motion: kursor bawaan tetap, tanpa crosshair, bracket berpindah tanpa animasi.
- Dirender lewat portal di `<body>`, `aria-hidden`, `pointer-events: none`.

### BlueprintBackground — `src/components/effects/BlueprintBackground.jsx`

- Letakkan sebagai anak pertama container yang punya `position` + `isolation`. Lapisan berada di
  `z-index: -1`.
- Dua lapis grid dari gradien CSS: grid utama 64 px dan sub-grid 16 px. Tanda crosshair (+) di beberapa
  persimpangan utama berasal dari **satu** mask SVG 256 px yang diulang (warna dari token), bukan elemen
  terpisah per tanda.
- `variant="busy"` (login, publik): grid dan tanda bergeser 256 px per 128 dtk, ditambah:
  - **jalur sirkuit** tipis bersudut siku di garis sub-grid 16 px (satu mask SVG 512 px yang diulang);
  - **cahaya mengalir** di jalur: lapisan bergradien yang hanya digeser (transform, 9 dtk mendatar /
    11 dtk tegak) di balik mask segmen mendatar/tegak; periode 384/448 px sengaja berbeda dari ubin;
  - **titik persimpangan** utama yang berpendar bergantian (dua set dengan fase opacity berlawanan).
  Semua berbasis ubin, jadi cocok untuk area lebar (publik), dan cukup samar sehingga tidak bersaing dengan
  isi. Tidak ada lagi garis ukur berangka.
- `variant="calm"` (admin): grid diam dan satu garis pindai turun per 10 dtk.
- Berhenti (`animation-play-state: paused`) saat tab tersembunyi (`visibilitychange`) atau elemen di luar
  layar (IntersectionObserver). Reduced motion: grid dan jalur diam, cahaya mengalir disembunyikan, titik
  tidak berdenyut. `forced-colors`: disembunyikan.

### ShutterTransition — `src/components/effects/ShutterTransition.jsx`

- `<ShutterProvider>` dipasang sekali di `App.jsx`, **di luar `<Suspense>`**, supaya overlay bertahan saat
  halaman tujuan dimuat. Halaman memanggil `useShutter().runShutter({ onCovered, isReady, message,
  focusSelector })` dari `shutterContext.js`.
- Linimasa: bracket dari sudut layar menyempit ke kotak 168 px (0–280 ms) → logo 128 px merakit (mulai
  100 ms) → dua tirai atas/bawah menutup (340–600 ms) → `onCovered()` (navigasi) + kilatan halus 120 ms →
  menunggu `isReady()` (maks 2.5 dtk; logo tetap tampil sebagai pemuat) → tirai membuka 280 ms. Animasinya
  sendiri ±1.0 dtk, ditambah waktu muat halaman tujuan.
- Klik atau Escape melewati transisi: navigasi tetap terjadi dan overlay langsung hilang.
- Setelah selesai, fokus pindah ke `focusSelector` (bawaan `h1`) dengan `tabindex="-1"` sementara. Region
  `role="status"` mengumumkan `message`. Overlay `aria-hidden` dan tidak mengambil fokus.
- Reduced motion: tanpa overlay; navigasi langsung, fokus tetap dipindah ke `h1` tujuan.

## 14. Panel admin (tahap 2 dan 2B)

Detail lengkap: `pages/admin.md`. Strategi isi publik: `BRIEF.md` §9. Ringkasnya:

- **Kerangka:** `AdminRoot` (tema, toast, penjaga perubahan, sesi, Keluar) + `AdminLayout` (sidebar gelap,
  laci di < 1024 px, area kerja terang dengan `BlueprintBackground variant="calm"` dan kursor viewfinder,
  satu `h1` per halaman, sub-tab di bawah header). Routing dan logika auth tidak berubah.
- **Navigasi (2B):** 5 menu — Beranda, Tentang Saya, Karya & Keahlian, Rekam Jejak, Kotak Masuk — dari
  `adminNav.js`. Halaman dalam satu menu tampil sebagai sub-tab (`SubNav`: `<nav>` berisi tautan dengan
  `aria-current="page"`, bukan tablist; baris tab digeser sendiri bila tidak muat). Menu induk tetap aktif di
  semua sub-halamannya. Sidebar dan sub-tab memakai penjaga perubahan yang sama (`useGuardedNav`).
- **Komponen bersama** di `src/components/admin/ui/`, satu stylesheet `admin-ui.css` + `admin-layout.css`,
  token komponen `--adm-*`. Semua aturan diawali `.adm` / `.adm-portal` / `html:has(.adm)`, jadi tidak bocor
  ke login atau halaman publik walau stylesheet admin sudah termuat di tab yang sama.
- **Pola yang wajib diikuti halaman admin baru:** `SectionScreen` untuk daftar ↔ form, `FormPanel` +
  `useFormScreen` untuk form, `ConfirmDialog` untuk hapus, `useToast` untuk hasil, `toFriendlyError` untuk
  pesan galat, `EmptyState`/`Skeleton` untuk keadaan kosong/memuat. Tambahan 2B:
  - kolom berulang → `ListInput`; bulan/tahun → `MonthYearSelect`; tampil/unggulan → `DisplaySettings`;
  - gambar → `ImageField` / `GalleryUpload`, PDF → `PdfUpload`, semuanya lewat `useAssetField` /
    `useGalleryField` dan `prepareUploads` (unggah saat simpan, bersihkan saat gagal, hapus file lama setelah
    berhasil);
  - urutan → `ReorderButtons` + `useReorder` di daftar (bukan kotak angka di form);
  - baris daftar → `Thumb` + `DisplayBadges`.
- **Unggahan:** gambar PNG/JPG/WebP ≤10 MB dikompres di canvas ke WebP (1.600 px; logo 400 px) dan hasilnya
  ≤2 MB; PDF ≤5 MB dengan header `%PDF-`; 7 folder di bucket `portfolio-assets` (lihat `pages/admin.md` §5).
- **Fokus:** dialog dan laci memakai `useFocusTrap`. Setelah pindah halaman, ganti tampilan, atau hapus baris,
  fokus ke `h1`. Setelah Naikkan/Turunkan, fokus tetap di tombol yang ditekan.
- **Data:** hooks menerima `{ includeAdminFields: true }` untuk kolom tahap 2B (Profil:
  `includePrivateFields`); tanpa opsi itu query halaman publik sama persis dengan sebelumnya. Kolom baru
  ditambahkan lewat migrasi `20261016000000_admin_content_model.sql`, yang dijalankan pemilik project.

## 15. Halaman publik (tahap 3A, 3B, 3C)

> **Sejak rombakan monokrom (§16):** gaya visual di bagian ini (navy, biru, grid blueprint, kursor viewfinder,
> layar pembuka, `BlueprintBackground`) tidak berlaku lagi untuk halaman publik. Kerangka, data, bahasa, SEO, dan
> aturan aksesibilitasnya tetap berlaku. Bagian lain yang masih Blueprint diganti per fase (`plans/rombakan-monokrom.md`).

Detail lengkap: `pages/public.md`; rencana dan keputusan pemilik: `plans/tahap-3a-publik.md`,
`plans/tahap-3b-publik.md`, `plans/tahap-3c-final.md`. Ringkasnya:

- **Kerangka:** `PublicLayout` (rute `/`, `/projects/:slug`, `*`) memasang `ThemeProvider`, `I18nProvider`, data
  publik yang dimuat sekali (`usePublicPortfolio`), akar `.pub` ber-`data-theme`, tautan "Lewati ke konten",
  kursor viewfinder, navbar, dan footer. Halaman detail, lightbox, panel buku tamu, dan logo teknologi dimuat saat
  dibutuhkan.
- **Tema:** mengikuti perangkat sampai pengunjung memilih (disimpan); skrip di `index.html` memasang
  `data-pub-theme` sebelum render pertama hanya di luar `/admin`. **Bahasa:** ID bawaan, US sekali klik
  (disimpan), kamus `src/i18n/`.
- **CSS:** `src/components/public/public.css` (dimuat di `main.jsx` setelah `index.css`) + CSS per komponen,
  semua diawali `.pub-*` / `:where(.pub)` / `html[data-pub-theme]` / `html:has(.pub)`. Token komponen `--pub-*`.
  Pengecualian primitive: latar `<html>` per tema dan `--pub-logo-plate`.
- **Komponen identitas yang dipakai:** `Logo`, `ViewfinderCursor`, `BlueprintBackground variant="busy"` (hero,
  detail, 404). Komponen admin yang dipakai ulang tanpa diubah: `useFocusTrap`, `useScrollLock`.
- **Data:** hook publik baru (kolom eksplisit, `is_visible = true`, `sort_order`); hook lama untuk admin tidak
  berubah. Data cadangan `portfolioData.js` dihapus. Sejak 3C halaman publik memanggil REST Supabase dengan
  `fetch` (`src/lib/publicApi.js`, tanpa supabase-js) setelah gambar pertama tampil, dan membaca kolom `_en`: di
  mode US setiap teks memakai versi Inggris bila terisi, kalau kosong versi Indonesia (`lang="id"`).
- **Interaksi (tahap 3B, `pages/public.md` §9):** label fisika (matter-js 0.20.0, satu-satunya library baru, lazy),
  tombol suara dan "tok" Web Audio, ayam dan bebek di garis bar status (kalimat di `src/i18n/characterLines.js`),
  layar pembuka, robot a+ di footer dan panel buku tamu. Semua dekoratif (`aria-hidden`, tanpa fokus), berhenti di
  luar layar dan saat tab tidak aktif, diam saat reduced motion. Bagian-bagian ini saling memberi kabar lewat
  `interactionBus.js` (mis. `label-impact`, `intro-done`, `back-to-top`), bukan lewat import langsung, karena
  masing-masing dimuat terpisah.
- **Tahap 3C (`pages/public.md` §2, §11, §12; `plans/tahap-3c-final.md`):** label panggung hero dari admin
  (`profiles.hero_labels`), grafik kontribusi GitHub lewat fungsi Vercel `api/github-contributions.js`, kode admin
  dan section di bawah hero dimuat terpisah, `h1` hero langsung berisi nama (LCP), placeholder tak terlihat (CLS 0),
  meta Open Graph/Twitter, `og-image.png`, JSON-LD `Person` tanpa data pribadi, `robots.txt` dan `sitemap.xml` saat
  build, `noindex` di admin dan 404. Online di Vercel: `vercel.json` (rute SPA, cache aset, header keamanan, CSP
  dengan hash skrip tema) dan panduan `DEPLOY.md`.
- **Gambar proyek (sebelum deploy, `pages/public.md` §5):** bingkai berasio tetap (16:9 di HP, 16:10 lebih lebar);
  gambar lanskap `cover` di tengah, gambar potret (screenshot HP) utuh di atas grid blueprint dengan bayangan halus.
  Orientasi dibaca saat gambar selesai dimuat (`ProjectImage`), sama di kartu, detail, galeri, dan lightbox.

## 16. Halaman publik: gaya monokrom (rombakan Oktober 2026)

Acuan desain: `docs/redesign/PROMPT-rombakan-monokrom.md` dan dua prototipe referensi di folder yang sama
(dibaca sebagai spesifikasi, tidak disalin mentah). Rencana, keputusan, dan checklist fase:
`plans/rombakan-monokrom.md`. Berlaku hanya di dalam `.pub`; login dan admin tidak berubah.

### Palet

| Token | Terang (bawaan) | Gelap | Dipakai untuk |
|---|---|---|---|
| `--bg` | `#ffffff` | `#0a0a0a` | latar halaman dan kartu |
| `--fg` | `#0a0a0a` | `#fafafa` | teks utama, garis kartu, bayangan kotak, tombol isi |
| `--soft` | `#f3f3f1` | `#18181b` | latar lembut (tombol ikon, chip, kartu sekunder) |
| `--mute` | `#55555e` | `#a1a1aa` | teks kedua (±7,4:1 dan ±7,7:1 di `--bg`) |
| `--hair` | `rgb(10 10 10 / .07)` | `rgb(250 250 250 / .06)` | garis grid 46 px |
| `--line` | `rgb(10 10 10 / .14)` | `rgb(250 250 250 / .16)` | garis tipis, pemisah, chip |
| `--ok` | `#22c55e` | `#22c55e` | titik status (terbuka untuk kerja, Live API, pesan terkirim) |

- **Bagian terbalik** (`.pub-invert`: Proyek, Kontak, header detail proyek) memakai palet tema yang lain, jadi
  latarnya `--fg` tema ini dan teksnya `--bg`. Komponen di dalamnya cukup memakai token biasa.
- **Warna lain hanya untuk status:** galat merah (`--ds-danger-*`) dan teks sukses hijau (`--ds-success-text`
  `#15803d` / `#4ade80`), selalu dengan ikon atau teks.
- **Larangan kontras:** `#a1a1aa` (atau lebih pucat) tidak pernah dipakai untuk teks di tema terang (±2,6:1).
  Teks paling pucat adalah `--mute` atau `--ds-text-subtle` (`#63636c` / `#8e8e97`).
- **Jembatan Blueprint:** di dalam `.pub` token `--ds-*` dipetakan ke palet ini (`--ds-accent` = `--fg`,
  `--ds-canvas` = `--bg`, dan seterusnya), supaya komponen yang belum dirombak ikut monokrom. Komponen baru memakai
  token monokrom langsung.

### Tipografi

- **Space Grotesk Variable** (300–700, `@fontsource-variable/space-grotesk`, self-hosted, di-preload untuk nama
  hero) untuk semua teks publik; **JetBrains Mono** untuk baris kode. Tidak ada font dari CDN (CSP).
- **Judul besar** (`.pub-h2`, `.pub-display`): huruf kapital, 700, `letter-spacing: -0.055em`, `line-height: 0.88`;
  judul section 52–112 px.
- **Isi** 17 px, `line-height` 1,6. **Label** huruf kapital 11,5–15 px, 700, tracking 0,08–0,14em.

### Komponen dasar (`public.css`)

- **Kartu** `.pub-tile`: garis 2,5 px `--fg`, sudut 28 px, latar `--bg`; `.pub-tile--shadow` menambah bayangan kotak
  `6px 6px 0 var(--fg)` tanpa blur.
- **Tombol** `.pub-btn`: pil, huruf kapital, garis 2 px, bayangan kotak 4 px. Hover bergeser `-2px` dengan
  bayangan 6 px, ditekan turun `3px` ke bayangannya. `--primary` berlatar `--fg`, `--ghost` tanpa garis, `--sm`
  lebih kecil (44 px di layar sentuh).
- **Tombol ikon** `.pub-icon-btn`: bulat 44 px (48–52 px di navbar desktop) di latar `--soft`.
- **Chip** `.pub-chip` (sudut 8 px, latar lembut), **label** `.pub-tag` dan **badge** `.pub-badge` berbentuk pil.
- **Fokus keyboard** selalu `outline` 3 px `--fg`, offset 3 px. **Grid** 46 px di `.pub-main` dan `.pub-grid-bg`.
- **Gerak** tombol dan ikon dimatikan saat `prefers-reduced-motion`.

### Kerangka global

- **Navbar** (`PublicNavbar`): tanda inisial "AD" di kiri; menu Beranda, Tentang, Proyek, Perjalanan, Sertifikat,
  Kontak di tengah (≥ 1060 px, garis bawah saat hover dan untuk section yang dibaca); di kanan tombol suara
  (≥ 620 px), tema, pilihan bahasa ID/EN (dua tombol `aria-pressed`), dan "Unduh CV" (≥ 1280 px, tidak ada di
  referensi tetapi dipertahankan karena unduhan CV adalah ukuran sukses). Di bawah 1060 px menu menjadi dialog
  layar penuh (fokus terkunci, Esc dan tombol Tutup) berisi semua tombol tadi.
- **Tema:** bawaan **terang**, pilihan pengunjung disimpan (`aldi-portfolio-theme`). Skrip di `index.html` (hash
  CSP di `vercel.json`) dan `ThemeProvider` memasang `data-pub-theme` dan warna `theme-color` di halaman publik;
  login dan admin memakai warna bar dan tema miliknya sendiri (`data-default`), dikembalikan saat keluar dari
  publik.
- **Font per halaman:** skrip yang sama memuat lebih dulu (preload) Space Grotesk di halaman publik dan Inter di
  login/admin. Alamat file datang dari tag meta `font-preload-public` / `font-preload-admin` yang ditambahkan
  `vite.config.js` saat build, jadi isi skrip (dan hash CSP-nya) tidak berubah bila file font berganti.
- **Suara:** satu modul (`sound/tokSynth.js`, Web Audio, tanpa file audio): `playTok` dan `playCue(name)` dengan
  nada `pick`, `drop`, `jump`, `hit`, `land`, `open`, `close`, `zoom`, `meow`, dipanggil lewat
  `useSound().cue`. **Bawaan menyala** (keputusan pemilik, Fase 3), tetapi bunyi baru keluar setelah gestur
  pertama pengunjung; berhenti saat tab tersembunyi; pilihan "mati" disimpan.

### Hero (Fase 3)

- **Chip** (`hero/HeroChips.jsx` + `hero/chipPhysics.js`, tanpa library): teks dari "Label panggung hero" di
  admin (tanpa label: 6 chip bawaan ID/EN di kamus), bintang empat sudut ✦ setelah chip nama depan, dan dua
  lingkaran dari kode (hitam `</>`, putih bintang). Setiap chip tombol: diseret dan dilempar (mouse; di layar
  sentuh `touch-action: pan-y`, jadi geser vertikal tetap menggulir), melompat dengan klik/Enter/Spasi, bunyi
  `pick`/`drop`/`hit`/`jump`. Fisika disimulasikan sebelum frame pertama (tanpa jatuh saat dibuka) dan loop hanya
  berjalan saat ada yang bergerak. Reduced motion: chip yang dilepas langsung diam di tempatnya, tanpa lompat.
- **Nama** `h1` satu node, kata naik sekali saat dibuka; ≥ 768 px satu baris (`min(12.2vw, 12.875rem)`), di HP dua
  baris. Jarak huruf **-0,03em** (judul section -0,04em): nilai referensi -0,055em membuat "AN" nyaris menempel.
- **Baris kode** JetBrains Mono tanpa ligatur, diketik sekali (CSS `steps`), `aria-hidden`; versi EN di kamus.
- **Bar status**: empat kolom bergaris (2 × 2 di bawah 1060 px): terbuka untuk kerja (titik `--ok`), kota,
  tanggal hari ini sesuai bahasa, "Gulir ke bawah" (tautan ke Tentang).
- **Saat digulir** nama naik sedikit dan memudar (`animation-timeline: scroll(root)` di dalam `@supports`).
- **Dilepas dari publik:** `IntroScreen` (dihapus), `ViewfinderCursor` dan `BlueprintBackground` (file tetap untuk
  login dan admin). Fase 3 menghapus panggung label matter-js (dan dependency `matter-js`), kata berganti, ayam dan
  bebek (`characters/`, kecuali `bubble.css` yang masih dipakai robot sampai Fase 5) dan cameo di Proyek.
  Fase 4 menghapus bagian Keahlian berjalan (`skills/`, logo teknologi): keahlian kini di kartu tech stack.

### Tentang, pita, Proyek (Fase 4)

- **Muncul saat digulir:** kelas umum `.pub-reveal` (naik + memudar masuk, `animation-timeline: view()` di dalam
  `@supports`, mati saat reduced motion).
- **Tentang** (`AboutSection`, bento 12 kolom ≥ 1060 px, satu kolom di bawahnya), hanya dari data admin:
  perkenalan (sapaan, bio, Unduh CV), foto + "Terbuka untuk kerja" + "Rekrut saya" (ke Kontak), pendidikan
  pertama (lulus/sedang kuliah, tugas akhir, IPK besar), tech stack per kategori (`id="keahlian"`), kartu hitam
  "Fokus saya" (tagline + kata berganti, atau peran pendukung). Kartu yang datanya kosong tidak dibuat. Bahasa dan
  hobi tidak ditampilkan lagi (tidak ada di desain referensi).
- **Pita teknologi** (`TechRibbon`): keahlian unggulan (bergaris tepi) dan kategori keahlian (isi), bergeser
  berlawanan arah mengikuti scroll; diam tanpa dukungan atau dengan reduced motion. `aria-hidden`.
- **Proyek pilihan** (`ProjectsSection`, `.pub-invert`): bagian melebar dari kartu bersudut ke layar penuh saat
  masuk. Kartu proyek unggulan: label status · jenis, judul, ringkasan (4 baris), fakta Peran (selebar kartu,
  3 baris) / Tahun / Klien hanya yang terisi, chip teknologi, "Baca studi kasus", "Kunjungi" hanya untuk tautan
  demo publik, sampul 16:10. Tanpa angka metrik.
- **Tumpukan** (≥ 1060 × 820 px, ada dukungan, tanpa reduced motion): semua item sticky di dalam satu daftar
  (12 px lebih rendah per kartu), kartu lama mengecil ke 0,9 dan meredup mengikuti linimasa item berikutnya
  (`timeline-scope`, maks. 8 kartu). Selain itu daftar biasa.
- **Proyek lainnya** daftar ringkas; **grafik GitHub** monokrom, label bulan hanya untuk bulan yang lebarnya ≥ 3
  minggu (bulan pertama yang terpotong tidak lagi menempel ke bulan berikutnya).
