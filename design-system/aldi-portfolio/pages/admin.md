# Override Halaman: Panel Admin (`/admin/*`)

> **PROJECT:** Aldi Portfolio · **Diperbarui:** 15 Oktober 2026
> ⚠️ Aturan di file ini **menimpa** `design-system/aldi-portfolio/MASTER.md`.
> **Status: belum diterapkan.** Ini bekal untuk tahap 2; detail layout diputuskan saat tahap 2 dimulai.

---

## Tema

- **Terang sebagai default** (`data-theme="light"` pada root tiap halaman admin), sama dengan login.
- Token gelap sudah tersedia. Toggle gelap untuk admin bisa ditambahkan nanti tanpa token baru.

## Arah awal (diputuskan di tahap 2)

- **Kepadatan:** sedang. Jarak antar elemen 8–24px, tabel/daftar lebih rapat daripada halaman publik.
  Ukuran kontrol tetap 48px untuk form dan minimal 44px untuk target sentuh.
- **Navigasi:** saat ini setiap halaman punya navbar sendiri ("← Dashboard", "Situs Publik"). Pertimbangkan
  sidebar di ≥1024px dan top bar di mobile, dengan penanda halaman aktif. Navigasi harus sama di semua halaman.
- **Komponen dari login yang bisa dipakai ulang:** tombol utama, input, alert, badge, tautan sekunder, spinner.
  Ekstrak dari `AdminLoginPage.css` ke stylesheet admin bersama.
- **Komponen baru yang dibutuhkan:**
  - tabel/daftar data (header jelas, angka tabular);
  - kartu modul;
  - dialog konfirmasi hapus (fokus terkunci, Esc menutup, aksi destruktif berwarna danger dan terpisah);
  - toast (`role="status"`, hilang otomatis 3–5 detik);
  - empty state dengan aksi;
  - skeleton saat memuat.

## Masalah yang harus diselesaikan di tahap 2

1. Halaman admin masih memakai token gelap lama (`--color-*`) dan banyak hex mentah (`#FCA5A5` 13×, `#FFFFFF` 8×).
2. Variabel tidak terdefinisi: `--color-bg-base` (AdminGuestbookPage.css ×2), `--color-bg-elevated`
   (AdminProjectsPage.css) → ganti ke `--ds-canvas` / `--ds-surface-raised`.
3. Class `admin-alert`, `admin-alert-success`, `admin-alert-error`, `admin-alert-banner`, `alert-banner-*` dipakai
   di 4 file tetapi **tidak punya CSS**, sehingga pesan sukses/gagal tampil sebagai teks polos.
4. `.admin-back-link` hanya didefinisikan di `AdminLoginPage.css` (lihat `pages/login.md`) → pindahkan.
5. Fallback `Suspense` (`App.jsx`) dan loading `AdminRoute` (`.admin-auth-loading` di `AdminRoute.css`) masih
   gelap → samakan dengan tema terang. Cukup ubah styling; logika routing/guard tetap.
6. `.btn` global tidak mewarisi `font-family`, dan teks putih di `.btn-primary` hanya 3.68:1 → pakai tombol
   berbasis `--ds-*`.
7. Konfirmasi hapus memakai `window.confirm` (misalnya Guestbook) → dialog yang konsisten dan aksesibel.
8. Tidak ada `prefers-reduced-motion` dan fokus terlihat yang konsisten di halaman admin.
