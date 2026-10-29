---
# RINGKASAN untuk impeccable. Acuan utama: design-system/aldi-portfolio/MASTER.md (bila berbeda, MASTER.md yang berlaku).
name: Blueprint (Aldi Portfolio)
description: Satu identitas, dua tema; presisi teknis ala cetak biru dengan konten yang bersih.
colors:
  canvas-light: "#F6F8FB"
  surface-light: "#FFFFFF"
  inset-light: "#F1F5F9"
  border-light: "#E2E8F0"
  border-control-light: "#808C9F"
  text-strong-light: "#0F172A"
  text-light: "#334155"
  text-muted-light: "#475569"
  text-subtle-light: "#5B6B80"
  accent-subtle-light: "#EFF6FF"
  accent-text-light: "#1D4ED8"
  focus-ring-light: "#2563EB"
  danger-text-light: "#B91C1C"
  danger-bg-light: "#FEF2F2"
  danger-border-light: "#DC2626"
  success-text-light: "#047857"
  success-bg-light: "#ECFDF5"
  canvas-dark: "#0A0D14"
  surface-dark: "#111625"
  surface-raised-dark: "#171F33"
  border-dark: "#1F293D"
  border-control-dark: "#5B6B85"
  text-strong-dark: "#F8FAFC"
  text-dark: "#CBD5E1"
  text-muted-dark: "#94A3B8"
  text-subtle-dark: "#7C8BA1"
  accent-subtle-dark: "#172554"
  accent-text-dark: "#60A5FA"
  danger-text-dark: "#FCA5A5"
  danger-bg-dark: "#2B1418"
  danger-border-dark: "#F87171"
  success-text-dark: "#6EE7B7"
  success-bg-dark: "#0F2A22"
  accent: "#2563EB"
  accent-hover: "#1D4ED8"
  on-accent: "#FFFFFF"
  brand-sky: "#38BDF8"
  brand-emerald: "#34D399"
  # Halaman publik sejak rombakan monokrom (MASTER §16)
  pub-bg-light: "#FFFFFF"
  pub-fg-light: "#0A0A0A"
  pub-soft-light: "#F3F3F1"
  pub-mute-light: "#55555E"
  pub-bg-dark: "#0A0A0A"
  pub-fg-dark: "#FAFAFA"
  pub-soft-dark: "#18181B"
  pub-mute-dark: "#A1A1AA"
  pub-ok: "#22C55E"
typography:
  pub-display:
    fontFamily: "Space Grotesk Variable, Space Grotesk, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "clamp(3.25rem, 1.6rem + 5.6vw, 7rem)"
    fontWeight: 700
    lineHeight: 0.88
    letterSpacing: "-0.055em"
  pub-body:
    fontFamily: "Space Grotesk Variable, Space Grotesk, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  headline:
    fontFamily: "Inter Variable, Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Inter Variable, Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Inter Variable, Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  body-ui:
    fontFamily: "Inter Variable, Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.35
  label:
    fontFamily: "JetBrains Mono Variable, JetBrains Mono, ui-monospace, SFMono-Regular, Consolas, monospace"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "0.08em"
rounded:
  tag: "2px"
  control: "4px"
  sm: "6px"
  md: "10px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
  "10": "40px"
  "12": "48px"
  "16": "64px"
  "20": "80px"
  "24": "96px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.body-ui}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "{colors.on-accent}"
  button-secondary:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.text-strong-light}"
    typography: "{typography.body-ui}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "44px"
  button-secondary-hover:
    backgroundColor: "{colors.accent-subtle-light}"
    textColor: "{colors.accent-text-light}"
  button-danger:
    backgroundColor: "{colors.danger-border-light}"
    textColor: "{colors.on-accent}"
    typography: "{typography.body-ui}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "44px"
  input:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.text-strong-light}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "44px"
  input-login:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.text-strong-light}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    height: "48px"
  card:
    backgroundColor: "{colors.surface-light}"
    rounded: "{rounded.sm}"
    padding: "20px"
  badge-accent:
    backgroundColor: "{colors.accent-subtle-light}"
    textColor: "{colors.accent-text-light}"
    typography: "{typography.label}"
    rounded: "{rounded.tag}"
    padding: "2px 7px"
  badge-neutral:
    backgroundColor: "{colors.inset-light}"
    textColor: "{colors.text-muted-light}"
    typography: "{typography.label}"
    rounded: "{rounded.tag}"
    padding: "2px 7px"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.text-dark}"
    typography: "{typography.body-ui}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "40px"
  nav-item-active:
    textColor: "{colors.text-strong-dark}"
  subnav-tab:
    textColor: "{colors.text-muted-light}"
    typography: "{typography.body-ui}"
    padding: "0 12px"
    height: "44px"
  subnav-tab-active:
    textColor: "{colors.text-strong-light}"
  pub-button:
    backgroundColor: "{colors.pub-bg-light}"
    textColor: "{colors.pub-fg-light}"
    typography: "{typography.pub-body}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "48px"
  pub-button-primary:
    backgroundColor: "{colors.pub-fg-light}"
    textColor: "{colors.pub-bg-light}"
    typography: "{typography.pub-body}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "48px"
  pub-card:
    backgroundColor: "{colors.pub-bg-light}"
    rounded: "28px"
    padding: "24px"
---

> **Ringkasan, bukan acuan utama.** File ini hanya ringkasan design system untuk impeccable.
> Acuan utama adalah `design-system/aldi-portfolio/MASTER.md` (dan override per halaman di
> `design-system/aldi-portfolio/pages/`), yang tunduk pada `design-system/aldi-portfolio/BRIEF.md`.
> **Bila ada perbedaan antara file ini dan MASTER.md, yang berlaku MASTER.md.** Jangan mengubah MASTER.md
> berdasarkan isi file ini; perbarui file ini mengikuti MASTER.md. Sumber token di kode: `src/index.css`
> (blok "DESIGN SYSTEM BLUEPRINT v1") dan `src/components/admin/ui/admin-ui.css` (token `--adm-*`).
> Diringkas 17 Oktober 2026 dari MASTER.md v1.2; bagian "Halaman publik: monokrom" ditambahkan 30 Oktober 2026
> dari MASTER.md v1.4 §16 (palet publik di `src/components/public/public.css`).

# Design System: Blueprint (Aldi Portfolio)

## Overview

**Creative North Star: "Blueprint"**

Situs ini adalah gambar kerja seorang programmer: presisi teknis yang terlihat di latar (grid titik dan garis
cetak biru, jalur sirkuit, bracket sudut, kursor viewfinder), sementara konten di depannya tetap bersih,
berhierarki jelas, dan punya satu aksi utama per layar. Dekorasi tinggal di latar dan tidak pernah
mengganggu isi, keyboard, atau pengguna yang mengurangi gerak.

**Satu identitas, dua tema.** Halaman publik berkarakter (navy, nama raksasa satu warna, grid blueprint,
aksen monospace). Login dan admin memakai tema terang untuk kerja yang tenang. Keduanya memakai token semantic
yang sama (`--ds-*`), dipilih lewat atribut `data-theme` yang boleh bersarang (mis. sidebar admin dan panel
brand login gelap di dalam halaman terang). Status saat ini: login dan seluruh admin memakai Blueprint. Halaman
publik dirombak ke **gaya monokrom** sejak 30 Oktober 2026 (lihat "Halaman publik: monokrom" di bawah).

Identitasnya khas dan punya kepribadian: logo monogram stensil yang merakit diri, maskot robot **a+**, karakter
ayam dan bebek, dan transisi jepret kamera. Semuanya diperlakukan sebagai komponen brand yang bisa dipakai ulang,
bukan hiasan sekali pakai.

**Key Characteristics:**
- Presisi, bukan dekorasi: efek blueprint hanya di latar, konten bersih.
- Token dulu: komponen hanya memakai `--ds-*` (dan `--adm-*` di admin).
- Inter untuk semua teks UI, JetBrains Mono untuk label teknis dan badge.
- Admin bersudut tajam (4 px kontrol, 2 px tag) dengan bracket sudut dan bayangan offset aksen.
- Aksesibel secara default: WCAG 2.2 AA, fokus berupa outline asli, target sentuh ≥44 px, reduced motion dihormati.

## Halaman publik: monokrom

**Creative North Star (publik): "Monokrom berani".** Hitam di atas putih (atau sebaliknya di tema gelap), huruf
kapital tebal yang rapat, garis tebal, sudut membulat, dan bayangan kotak tanpa blur. Satu-satunya warna adalah
status. Rincian dan alasannya di MASTER §16; ringkasnya:

- **Palet:** pub-bg, pub-fg, pub-soft, pub-mute per tema; grid tipis 46 px di latar; titik status pub-ok. Bagian
  terbalik (Proyek, Kontak, header detail) memakai palet tema yang lain. Teks tidak pernah lebih pucat dari pub-mute.
- **Huruf:** Space Grotesk (pub-display untuk judul besar, pub-body 17 px untuk isi), JetBrains Mono untuk kode.
- **Komponen:** kartu bergaris 2,5 px bersudut 28 px (sebagian dengan bayangan kotak 6 px), tombol pil huruf
  kapital dengan bayangan kotak yang bergeser saat hover dan ditekan, tombol ikon bulat di latar lembut, fokus
  `outline` 3 px.
- **Kerangka:** navbar dengan tanda inisial, menu tengah, suara, tema, ID/EN, dan "Unduh CV"; tema bawaan terang;
  suara bawaan menyala, bunyi hanya setelah interaksi pertama.
- **Hero:** chip pil berfisika yang bisa diseret (bintang ✦ dan dua lingkaran ikon dari kode), nama kapital satu
  baris selebar layar (jarak huruf -0,03em agar tidak menempel), baris kode yang diketik sekali, bar status
  empat kolom bergaris.
- **Tentang dan Proyek:** bento kartu bergaris (perkenalan, foto, pendidikan dengan IPK besar, tech stack, kartu
  hitam Fokus), pita teks besar yang bergeser mengikuti scroll, lalu bagian hitam berisi kartu proyek yang menumpuk
  (sticky) di layar lebar dan daftar biasa di HP; tanpa angka metrik.
- **Perjalanan, Sertifikat, Kontak:** garis waktu dengan tahun bergaris tepi dan folder foto berkipas, kartu
  sertifikat bergambar utuh dengan lightbox, bagian kontak hitam dengan formulir di panel tipis, footer hitam
  sederhana. Kucing Kopi (hitam) dan Susu (putih) mengintip di bawah layar dan tidak pernah menutupi tombol,
  formulir, atau bar status; tombol buku tamu berbentuk pil mengambang.
- **Detail proyek:** header hitam (label, judul, lead, meta Waktu/Tempat/Mitra/Status), media bertab
  Sampul/Galeri/Diagram di panggung 16:10, panel bergaris (Info proyek, Repositori GitHub dengan bar bahasa
  abu-abu bertingkat, Tautan), empat poin bernomor yang hanya tampil bila terisi, catatan Hasil, dan navigasi
  sebelumnya/berikutnya.
- **Tetap berlaku dari Blueprint:** aturan aksesibilitas, target sentuh ≥44 px, reduced motion, dan "Not Color
  Alone". Komponen Blueprint (kursor viewfinder, latar blueprint, layar pembuka) tidak dipakai di publik.

## Colors

Palet dingin dan teknis: navy dan slate sebagai netral, satu biru sebagai aksen kerja, dan gradien sky ke
emerald sebagai tanda identitas yang dekoratif saja (login dan admin; publik lihat bagian di atas).

### Primary
- **Biru Kerja** (accent, hover accent-hover): latar tombol utama dan penanda aktif di kedua tema. Teks putih di
  atasnya 5,17:1 (hover 6,70:1). Di tema gelap tetap biru yang sama, bukan biru lama `#3B82F6` yang hanya 3,68:1.
- **Tinta Aksen** (accent-text-light / accent-text-dark): teks dan tautan beraksen, garis aktif sub-tab dan rel
  menu aktif. Focus ring memakai focus-ring-light / accent-text-dark.

### Secondary
- **Gradien Identitas** (brand-sky → brand-emerald): monogram, garis tipis, glow, lampu robot saat berhasil, LED
  kartu admin. Hanya dekoratif.

### Neutral
- **Kertas Cetak** (canvas-light) dan **Malam Navy** (canvas-dark): latar halaman tema terang dan gelap.
- **Permukaan** (surface-light, surface-dark, surface-raised-dark): kartu, input, menu, popover.
- **Area Tenggelam** (inset-light): bar judul kartu, hover tombol ikon, kontrol nonaktif.
- **Garis** (border-light / border-dark) untuk pemisah dekoratif; **Garis Kontrol** (border-control-light /
  border-control-dark) untuk border input, ≥3:1 terhadap latarnya.
- **Empat tingkat teks**: text-strong (judul, label, isi input), text (isi), text-muted (teks sekunder),
  text-subtle (placeholder, hint). Semuanya ≥4,5:1 di latar tempatnya.
- **Status**: danger-text/bg/border dan success-text/bg per tema; selalu disertai ikon atau teks.

### Named Rules
**The Decorative Gradient Rule.** Gradien sky ke emerald tidak pernah dipakai untuk teks isi atau latar tombol.
**The Token First Rule.** Komponen hanya merujuk token semantic `--ds-*`; hex mentah dan `--palette-*` tidak
dipakai langsung (pengecualian yang terdokumentasi ada di MASTER.md dan `pages/admin.md` §1).
**The Not Color Alone Rule.** Status error/sukses selalu punya ikon dan/atau teks, bukan warna saja.

## Typography

**Display Font:** Inter Variable (dengan system-ui)
**Body Font:** Inter Variable (dengan system-ui)
**Label/Mono Font:** JetBrains Mono Variable (dengan ui-monospace)

**Character:** Inter yang rapi dan netral membawa semua teks; JetBrains Mono memberi aksen "label teknis" pada
badge, bar judul kartu, dan kode. Keduanya dimuat self-hosted lewat Fontsource.

### Hierarchy
- **Headline** (700, 36 px, 1.2, tracking -0.02em): judul besar admin. Hero publik memakai `clamp()` sendiri
  dengan weight sampai 800.
- **Title** (700, 24–30 px, 1.2): judul section admin (24 px) dan judul halaman (30 px).
- **Body** (400, 16 px, 1.65 untuk paragraf / 1.5 untuk UI): isi dan semua input (≥16 px agar iOS tidak zoom).
  Panjang baris 60–75 karakter; judul pendek memakai `text-wrap: balance`.
- **UI** (600, 14 px, 1.35): label, tombol, menu, sub-tab, pesan.
- **Label** (600, 12 px mono, tracking 0.08em, huruf besar): badge dan caption; 12 px adalah batas minimum.

### Named Rules
**The Inter Rule.** Inter adalah keputusan pemilik yang dikunci (17 Oktober 2026) untuk login dan admin. Jangan
menggantinya dengan font lain di sana, termasuk saat detektor menandai Inter sebagai font yang terlalu umum.
Halaman publik memakai Space Grotesk sejak rombakan monokrom (keputusan pemilik, 30 Oktober 2026).
**The Wide Tracking Rule.** Tracking lebar hanya untuk label kecil huruf besar; tracking teks isi tidak diubah.

## Layout

Mobile-first dengan skala spasi kelipatan 4 px (`--space-1..24`). Ritme vertikal: 8 px di dalam grup, 16–24 px
antar field atau blok, 32–48 px antar section. Layout berganti di 768 px dan 1024 px; uji wajib di 375, 768,
1024, dan 1440 px tanpa scroll horizontal.

Admin: sidebar gelap 16,5 rem di ≥1024 px, bar atas 3,5 rem dan laci di bawahnya. Isi maksimal 72 rem dengan
jarak tepi 16 / 24 / 32 / 40 px di 375 / 768 / 1024 / 1440. Daftar menjadi baris di layar lebar dan kartu di HP.
Sub-tab yang tidak muat digeser sendiri tanpa menggeser halaman. Kontrol setinggi 44 px (login 48 px), dan
semua target sentuh ≥44 px.

## Elevation & Depth

Hibrida: bayangan lembut per tema untuk mengangkat permukaan, ditambah **bayangan offset** tajam berwarna aksen
12 % yang menjadi ciri admin (kartu bertanda bracket, hover tombol utama). Kedalaman lain datang dari lapisan
tonal (canvas, surface, inset) dan garis struktur tipis.

### Shadow Vocabulary
- **Bayangan kecil** (`--ds-shadow-sm`): tombol, kartu di HP, kartu admin.
- **Bayangan sedang** (`--ds-shadow-md`): kartu di ≥768 px.
- **Bayangan besar** (`--ds-shadow-lg`): dialog dan popover.
- **Offset aksen** (`6px 6px 0` kartu bertanda bracket; `3px 3px 0` hover tombol utama, warna `--adm-offset`).

### Named Rules
**The Background-Only Glow Rule.** Grid, jalur sirkuit, dan glow hanya di latar, `aria-hidden`, tidak menangkap
klik atau fokus, dan diam saat reduced motion atau tab tersembunyi.

## Shapes

Dua bahasa sudut. Login dan halaman publik lebih lembut: 6 px tombol ikon, 10 px input/tombol/alert, 16 px
kartu, 24 px panel besar, pill untuk badge. Admin lebih tajam seperti gambar teknik: 4 px untuk input dan tombol,
2 px untuk badge dan tag, 6 px untuk kartu dan dialog. **Bracket sudut** (aksen, 12 px, garis 2 px) adalah bentuk
khas Blueprint: dipakai di kartu admin, saat tombol "Tersimpan", dan oleh kursor viewfinder yang mengunci elemen.

## Components

### Buttons
- **Shape:** sudut tajam di admin (4 px), 10 px di login; tinggi 44 px (login 48 px), teks 14 px/600.
- **Primary:** latar Biru Kerja, teks putih, bayangan kecil.
- **Hover / Focus:** hover menggelap ke accent-hover, naik 1 px dengan bayangan offset 3 px; tekan turun 1 px.
  Fokus keyboard selalu outline 2 px focus ring dengan offset 2 px.
- **Secondary / Danger / Ghost:** sekunder bergaris kontrol di atas permukaan, hover beraksen samar; bahaya
  merah penuh; ghost transparan dengan teks muted (varian teks merah untuk Hapus di daftar).
- **Busy:** spinner + teks proses, `aria-disabled="true"` (bukan `disabled`) agar fokus tidak hilang.

### Chips
- **Style:** grup radio berbentuk chip untuk pilihan tetap (jenis pengalaman, kategori keahlian); pilihan cepat
  memakai `aria-pressed`.
- **Badge:** mono 11–12 px huruf besar, sudut 2 px, varian netral, aksen, sukses, bahaya; "Disembunyikan"
  bergaris putus-putus dengan ikon mata dicoret.

### Cards / Containers
- **Corner Style:** 6 px di admin.
- **Background:** permukaan dengan garis struktur tipis (teks kuat 14 %).
- **Shadow Strategy:** bayangan kecil; varian bracket menambah offset aksen 6 px.
- **Border:** bar judul mono huruf besar di atas latar tenggelam, kadang dengan LED emerald.
- **Internal Padding:** 20 px.

### Inputs / Fields
- **Style:** permukaan, border garis kontrol 1 px, sudut 4 px, tinggi 44 px, teks 16 px; label selalu terlihat
  dengan "(opsional)" atau `*`, petunjuk dan galat tepat di bawah kolom.
- **Focus:** border aksen + outline 2 px focus ring, ditambah **garis kiri 3 px yang menyala** (tumbuh dari
  tengah, 180 ms) berwarna aksen, merah saat field galat.
- **Error / Disabled:** border merah dan pesan dengan ikon; nonaktif berlatar tenggelam dengan teks muted.

### Navigation
- **Sidebar (gelap):** item 40 px (36 px desktop, 44 px layar sentuh), teks 14 px/500. Menu aktif berlatar aksen
  20 % dengan rel kiri 2 px tinta aksen, ikon beraksen, dan tetap aktif di semua sub-halamannya.
- **Sub-tab (terang):** tautan 44 px, teks muted 14 px/600; tab aktif teks kuat dengan garis bawah 2 px tinta
  aksen. Baris digeser sendiri bila tidak muat, tepinya memudar.
- **HP:** laci modal dengan fokus terkunci, ditutup lewat Esc, scrim, atau memilih menu.

### Signature Components
Logo monogram yang merakit diri, robot **a+** (enam mood: idle, watching, hiding, peeking, error, success),
kursor viewfinder (crosshair + bracket pengunci, hanya untuk pointer halus), BlueprintBackground (`busy` untuk
login/publik, `calm` untuk admin), dan transisi jepret setelah login. Rincian perilaku di MASTER.md §13. Sejak
tahap 3B halaman publik juga punya label fisika bergaya tag blueprint, ayam dan bebek (SVG garis tinta, paruh
sky, jengger merah) di garis bar status, layar pembuka logo, dan robot a+ di footer dan buku tamu; semuanya
dekoratif (`pages/public.md` §9).

### Named Rules
**The Focus Rail Rule.** Garis kiri yang menyala saat fokus pada kolom isian adalah keputusan pemilik yang dikunci
(17 Oktober 2026). Jangan dihapus atau diganti; outline 2 px tetap ada di sampingnya.

## Do's and Don'ts

### Do:
- **Do** memakai token `--ds-*` (dan `--adm-*` di admin) di setiap komponen baru.
- **Do** memberi setiap kontrol outline `:focus-visible` asli 2 px, bukan hanya box-shadow.
- **Do** menjaga target sentuh ≥44 px dan input ≥16 px.
- **Do** menganimasikan hanya `transform` dan `opacity` (120 / 200 / 320 ms, ease-out `cubic-bezier(0.16, 1, 0.3, 1)`),
  maksimal 1–2 elemen bergerak per layar, dan mematikan gerak saat reduced motion.
- **Do** memakai SVG inline satu gaya (stroke 1,8, ujung bulat) untuk ikon.
- **Do** mengikuti MASTER.md dan `pages/*.md` bila ada yang belum tercakup di sini.

### Don't:
- **Don't** mengganti font Inter atau menghapus garis fokus kiri pada kolom isian (keputusan pemilik).
- **Don't** memakai emoji sebagai ikon struktural.
- **Don't** memakai gradien brand untuk teks isi atau latar tombol.
- **Don't** membuat hover yang menggeser layout, atau menganimasikan `width`, `height`, `top`, `left`.
- **Don't** memakai placeholder sebagai pengganti label, atau memblokir paste di kolom kata sandi.
- **Don't** memasang `disabled` pada tombol submit yang sedang fokus; pakai `aria-disabled` + guard.
- **Don't** memakai Tailwind atau framework UI, atau menambah library dan font tanpa persetujuan pemilik.
- **Don't** menyalin tata letak khas situs referensi (sidebar bernomor dan garis kontur; stiker pil miring
  dengan bayangan tegas dan karakter gumpalan hitam).
- **Don't** membuat efek dekoratif yang menangkap klik, mengambil fokus, terbaca screen reader, atau tetap
  bergerak saat reduced motion atau tab tersembunyi.
