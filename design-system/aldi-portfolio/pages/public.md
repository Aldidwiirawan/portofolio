# Override Halaman: Portofolio Publik (`/`)

> **PROJECT:** Aldi Portfolio · **Diperbarui:** 15 Oktober 2026
> ⚠️ Aturan di file ini **menimpa** `design-system/aldi-portfolio/MASTER.md`.
> **Status: belum diterapkan.** Ini bekal untuk tahap 3. Halaman publik tidak diubah di tahap 0–1
> (sudah diverifikasi: computed style dan tinggi section sama dengan baseline, tidak ada request font baru).

---

## Tema & karakter

- **Gelap** (nilai default `:root` / `data-theme="dark"`). Halaman publik boleh lebih ekspresif daripada
  admin, tetapi tetap memakai token yang sama.
- **Pertahankan identitas:**
  - judul nama raksasa uppercase;
  - gradien nama `--ds-brand-from` → `--ds-brand-to` (sky → emerald);
  - grid titik "blueprint" dan spotlight yang mengikuti mouse;
  - aksen terminal/monospace (`~/guestbook.log`, `>_`);
  - kartu ID 3D.
- Saat migrasi, pasang `data-theme="dark"` di root halaman supaya `color-scheme: dark` aktif (scrollbar dan
  kontrol native ikut gelap). Ini perubahan visual yang disengaja.

## Masalah yang harus diselesaikan di tahap 3

1. **Kontras:**
   - teks putih di `.btn-primary` (`#3B82F6`) = 3.68:1 → `--ds-accent` (`#2563EB`, 5.17:1);
   - `--color-text-muted` (`#64748B`) = 4.08:1 di `#0A0D14` → `--ds-text-subtle` (5.61:1).
2. **Font:** migrasi `--font-sans` → `--ds-font-sans` akan benar-benar memuat Inter. Metrik font berubah,
   jadi cek ulang judul raksasa hero, wrap teks, dan tinggi kartu di 375–1440.
3. **Ikon emoji** di kapsul hero (⚡ 🛡️ 🎓) dan tombol guestbook (💬) → SVG inline satu gaya.
4. **Reduced motion:** custom cursor, spotlight mouse, pulse badge, ticker, dan animasi drawer belum
   menghormati `prefers-reduced-motion`.
5. **Hex mentah** di CSS komponen (`#38BDF8` 13×, `#FFFFFF` 26×, `#34D399` 6×, dst.) → token `--ds-*`.
6. **Fokus:** `:focus-visible` hanya ada di Navbar dan `.btn`. Kartu proyek, tab Journey, drawer guestbook, dan
   form kontak perlu outline fokus yang konsisten.
7. **Tautan admin di footer** (ikon gembok ke `/admin/login`) → putuskan apakah tetap ada (lihat
   PROJECT_ANALYSIS.md §11).
8. `.btn` tidak mewarisi `font-family`, sehingga teks tombol memakai font default browser.
