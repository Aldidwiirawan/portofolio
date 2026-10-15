# Pemeriksaan logo.svg terhadap logo.jpeg

Tanggal: 15 Oktober 2026 · Sumber: `design-system/aldi-portfolio/source/logo.jpeg` (2048×2048, latar abu; sebelumnya `public/logo.jpeg`) · Hasil: `public/logo.svg`

## Cara mengukur

Chrome headless (tanpa dependency):
1. Threshold luminans 126 (foreground 23, latar 229) → 8 komponen terhubung.
2. Kontur setiap komponen ditelusuri, lalu disederhanakan (Ramer–Douglas–Peucker, ε 2.5 px).
3. Fit garis untuk sudut dan fit lingkaran (Kasa, rms ≤ 0.17 px) untuk busur.
4. Lebar batang dan celah diukur di banyak baris/kolom.

Perbandingan memakai skala seragam 1 unit SVG = 2.6875 px sumber, dipusatkan pada kotak logo sumber.

## Hasil ukur sumber

| Elemen | Sumber (px) | Unit SVG | Dipakai |
|---|---|---|---|
| Kotak logo | 1247 × 1234.5 | 464 × 459 | 464 × 464 (x 24–488, y 24–488) |
| Batang tegak (I, L, D, kaki A) | 170–175 | 63.3–65.1 | **64** |
| Palang horizontal | 179 (bawah) · 191 (tutup) · 202 (palang A/atas D) | 66.6 · 71.1 · 75.2 | **72** |
| Kaki miring A, lebar horizontal | kiri 191–195 · kanan 167–184 | kiri 71–72.5 · kanan 62–68 | kiri **70** · kanan **64** (tebal tegak lurus keduanya sama: 57.3) |
| Celah sempit | 37–50 | 13.8–18.6 | **16** |
| Celah lebar | 79.5–84 | 29.6–31.3 | **32** |
| Sudut miring "/" | 54.6°–56.1° (rata-rata 55.3°) | — | **55.0°** (rasio 7:10) |
| Sudut miring "\\" | 62.9°–64.9° (rata-rata 63.7°) | — | **63.4°** (rasio 1:2) |
| Sudut luar mangkuk D, kanan atas | r 132 | 49.1 | **48** |
| Sudut luar mangkuk D, kanan bawah | r 158 | 58.9 | **56** |
| Potongan cekung tutup D | r 218 (pusat bergeser 30 px) | 81 | **80**, sepusat dengan sudut atas |
| Potongan cekung kaki D | r 288 (tidak sepusat) | 107 | **88**, sepusat dengan sudut bawah |

**Grid:** unit u = 16 di viewBox 512. Semua x berada di kelipatan 8: 24, 40, 104, 120, 136, 200, 232, 296,
328, 392, 424, 488. Baris y: 24, 96, 128, 144, 200, 216, 280, 312, 384, 416, 488. Titik pada garis miring
dan busur dibulatkan ke .5.

## Varian yang dibandingkan

| Varian | Aturan | IoU total |
|---|---|---|
| v1 | semua batang 64 (tegak, palang, miring diukur horizontal) | 0.878 |
| v2 | v1 + kedua kaki miring sama tebal tegak lurus | 0.884 |
| **v3 (dipakai)** | **batang tegak 64, semua palang 72, kaki miring sama tebal, celah 16/32** | **0.930** |
| v4 | seperti v3, tetapi palang bawah 64 (dua ketebalan palang) | 0.934 |
| v5 | semua palang 68 | 0.921 |

v3 dipilih karena tiap jenis batang punya **satu** ketebalan dan semua celah seragam, dengan kecocokan
hampir setara v4 (v4 memakai dua ketebalan palang). v1 (semua 64) lebih "seragam total", tetapi palang A
dan bagian atas D bergeser 15–20 unit dari aslinya.

### IoU per potongan (v3)

| Potongan | IoU | Luas SVG / sumber |
|---|---|---|
| logo-i-cap | 0.921 | 0.99 |
| logo-i | 0.974 | 1.01 |
| logo-a-left | 0.919 | 0.95 |
| logo-a-right | 0.909 | 0.93 |
| logo-l | 0.947 | 1.05 |
| logo-d-cap | 0.918 | 0.98 |
| logo-d | 0.910 | 0.99 |
| logo-d-foot | 0.908 | 0.97 |

## Normalisasi yang disengaja (terlihat di `diff.png`)

1. **Palang horizontal diseragamkan ke 72.** Di sumber, palang bawah lebih tipis (≈67), sehingga di SVG
   kaki kanan A dan alas dalam D ±10 unit lebih tinggi.
2. **Potongan cekung tutup dan kaki D dibuat sepusat dengan sudut mangkuk**, supaya celah di lengkungan rata
   32. Ekor tutup D jadi sedikit lebih pendek dan ujung kaki D sedikit lebih rendah daripada sumber.
3. **Logo persegi 464 × 464.** Sumber 1% lebih pendek secara vertikal.
4. Tinggi takik di palang A 16 (sumber ≈ 21), sehingga titiknya tetap di grid.

## Ukuran kecil (`sizes-light.png`, `sizes-dark.png`)

- **48 px ke atas:** tajam dan terbaca.
- **32 px:** terbaca, tetapi celah 1 px tampak lembut. Margin 24 (1.5 unit) membuat tepi jatuh di setengah
  piksel.
- **16 px:** detail celah hilang. Karena itu favicon memakai versi sederhana (lihat bagian berikut).

## Favicon dan ikon aplikasi (`favicon-check.png`)

`public/favicon.svg` adalah versi sederhana "A", dipilih dari tiga kandidat (logo penuh, A, B dengan busur):

- Grid 16 px: viewBox 32, jadi 1 px = 2 unit. Margin 1 px, batang 2 px, celah minimal 1 px.
  Semua garis tegak dan datar jatuh tepat di piksel pada 16, 32, dan 48 px.
- Kolom (px): I 1–3 · A/L 4–6 · stub D 7–9 · kaki A 10–12 · batang D 13–15.
  Baris (px): tutup 1–3 · palang 4–6 · L/stub 7 · kaki A sampai 9 · alas D 10–12 · alas 13–15.
- Detail di bawah 1 px dibuang: serif alas I, takik palang A, kaki kecil A-kiri, potongan miring sudut L,
  serta busur cekung tutup dan kaki D.
- Sudut miring: "/" 0.75 (53°), "\\" 0.5 (63.4°). Titik puncak A-kanan dibulatkan ke .5, selisihnya ≤ 0.13 px
  pada 16 px.
- Warna: `#0f172a`, menjadi `#f8fafc` lewat `@media (prefers-color-scheme: dark)` di dalam SVG
  (diuji: render terang 15,23,42 dan gelap 248,250,252).

Ikon PNG memakai logo penuh, berwarna `#f8fafc` di atas latar solid `#0a0d14`. Skala logo n/16 membuat semua
garis grid jatuh di piksel bulat.

| File | Ukuran | Logo | Dipakai di |
|---|---|---|---|
| `apple-touch-icon.png` | 180 × 180 | 116 px (64 %) | `<link rel="apple-touch-icon">` |
| `icon-512.png` | 512 × 512 | 290 px (57 %) | `site.webmanifest` |
