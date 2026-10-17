# Perbaikan hasil audit admin

> **Status:** audit disetujui pemilik project, 17 Oktober 2026 · **Branch:** `fix/admin-audit` (dari `main`
> f6b3df7). Acuan: `BRIEF.md` (utama), `MASTER.md`, `pages/admin.md`.

**Cara melanjutkan bila konteks terputus:** baca file ini, cek `git status` dan `git log --oneline -5`,
lalu kerjakan butir pertama yang belum dicentang di "Urutan commit". Setiap butir dicentang di commit yang
sama dengan pekerjaannya. Jangan mengulang pekerjaan yang sudah di-commit.

**Aturan:**
- BRIEF §7. Tanpa library baru. Commit per kelompok perbaikan, jangan push atau merge. Screenshot tidak
  di-commit.
- Halaman login dan publik tidak berubah, kecuali izin khusus:
  - **Nomor 2:** `useProfile` (query publik) dan `AboutSection` boleh diubah supaya nomor HP dan alamat
    lengkap tidak diambil dan tidak tampil di halaman publik. Hanya itu perubahan di halaman publik.
  - **Nomor 8:** kolom `topic` boleh ditambahkan ke query `useMessages`, lalu ditampilkan di daftar dan
    detail Pesan (kalau kosong, tidak ditampilkan).
  - **Nomor 16:** di halaman login, teks "Kembali ke beranda" diganti "Lihat situs". Hanya teksnya.
- Garis kiri aksen dipertahankan **hanya** untuk fokus kolom isian dan menu aktif. Arti lain memakai penanda
  Blueprint lain (titik/badge, sudut bracket, garis atas). Screenshot sebelum/sesudah masuk laporan. Kalau
  perubahan tampilannya terlalu besar, tanya pemilik dulu.
- `DESIGN.md` dan `MASTER.md` tidak diubah. `.impeccable/design.json` diperbarui lewat `/impeccable document`.

---

## Urutan commit

- [x] 0. Daftar periksa ini.
- [x] 1. **P1 · Nomor 1:** kunci gulir memakai penghitung bersama, dilepas saat dialog terakhir tertutup.
  Uji otomatis: buka pesan → Hapus → Ya, hapus → halaman bisa digulir, juga setelah pindah halaman admin
  dan setelah Keluar ke halaman login.
- [x] 2. **P1 · Nomor 2:** petunjuk jujur di form Profil (nomor HP dan alamat). `useProfile` publik tidak
  mengambil nomor HP dan alamat lengkap; `AboutSection` tidak menampilkannya. Uji: tidak muncul di halaman
  publik maupun di request publik ke Supabase.
- [x] 3. **P2 · Nomor 3:** fokus tidak hilang saat tombol/kolom terkunci ketika menyimpan.
- [x] 4. **P2 · Nomor 4:** catatan sementara di sakelar tampilan ("Berlaku setelah halaman publik
  diperbarui") sampai tahap 3 selesai.
- [x] 5. **P2 · Nomor 5 + P3 · Nomor 13:** teks minimal 12 px; ukuran 13 px dan `black` mentah diganti token.
- [x] 6. **P2 · Nomor 6 dan 7:** keadaan terpilih terlihat di mode kontras tinggi; target sentuh 44 px.
- [x] 7. **P2 · Nomor 8:** topik pesan diambil dan ditampilkan di daftar dan detail Pesan.
- [x] 8. **P3 · Nomor 9, 10, 14, 15:** galat ListInput, gulir halus dihapus, tahun Pendidikan pakai pilihan,
  Beranda (h3, pengingat merah paling atas).
- [x] 9. **P3 · Nomor 11:** halaman Proyek memakai `SectionScreen` (galeri, urutan, penjaga perubahan tetap).
  Uji ulang CRUD proyek.
- [x] 10. **P3 · Nomor 12:** garis kiri aksen hanya untuk fokus kolom isian dan menu aktif.
- [ ] 11. **P3 · Nomor 16:** "Kembali ke beranda" → "Lihat situs" di halaman login.
- [ ] 12. `.impeccable/design.json` diperbarui lewat `/impeccable document`.
- [ ] 13. Uji akhir dan hasilnya dicatat di bawah: CRUD admin, keyboard, kontras, forced-colors, reduced
  motion, lebar 375/768/1024/1440, login dan publik dibandingkan dengan `main`, lint dan build.

---

## Laporan audit (17 Oktober 2026)

Ada 2 temuan P1, 6 P2 dan 8 P3. Skor total **15/20 (Baik)**.

| # | Aspek | Skor | Temuan utama |
|---|---|---|---|
| 1 | Aksesibilitas | 3 | Halaman tidak bisa digulir setelah menghapus pesan dari dialog detail |
| 2 | Performa | 3 | Beranda mengirim 12 permintaan data sekaligus (masih wajar) |
| 3 | Token & tema | 3 | Teks 11 px di bawah batas 12 px MASTER; ukuran 13 px di luar token |
| 4 | Responsif | 3 | Beberapa tombol tutup dan tautan kecil di bawah 44 px di layar sentuh |
| 5 | Konsistensi implementasi | 3 | Halaman Proyek tidak memakai `SectionScreen`; garis kiri aksen dipakai untuk terlalu banyak arti |

### P1: perbaiki dulu

**1. Halaman tidak bisa digulir setelah menghapus pesan dari dialog detail.**
- Lokasi: `AdminMessagesPage.jsx` (hapus dari dialog detail) bersama `Dialog.jsx` (kunci gulir).
- Langkah: buka pesan → klik Hapus di dialog → Ya, hapus.
- Penyebab: dua dialog tertutup bersamaan. Dialog pesan mengembalikan `overflow` ke kosong. Sesudah itu
  dialog konfirmasi mengembalikan nilai yang ia simpan saat terbuka, yaitu `hidden`.
- Akibat: `<html>` tetap terkunci, juga setelah pindah halaman admin atau Keluar ke halaman login.
- Perbaikan: kunci gulir dengan penghitung bersama, dilepas saat dialog terakhir tertutup.

**2. Teks privasi di Profil menyesatkan.**
- Lokasi: `AdminProfilePage.jsx` (kolom nomor HP dan alamat).
- Nomor HP tidak punya petunjuk, padahal ikut diambil query publik (`useProfile.js`) dan tampil di
  `AboutSection.jsx`. Bertentangan dengan BRIEF §9.
- Petunjuk alamat "Hanya tersimpan di sini" melebihi kenyataan: data konten bukan rahasia dan tetap bisa
  dibaca lewat API (BRIEF §9).
- Perbaikan: teks apa adanya, misalnya "Tidak tampil di halaman publik, tapi jangan isi data rahasia", dan
  halaman publik berhenti mengambil serta menampilkan nomor HP dan alamat lengkap.

### P2: perbaiki sebelum rilis

**3. Fokus keyboard hilang karena tombol atau kolom menjadi `disabled` saat sedang difokus** (MASTER §11).
- Buku tamu: setelah balasan tersimpan, tombol "Simpan balasan" menjadi `disabled` padahal fokus masih di
  tombol itu.
- Semua form: kolom diberi `disabled: busy` saat menyimpan. Kalau form dikirim dengan Enter dari sebuah
  kolom, fokus jatuh ke `body`.
- Perbaikan: `aria-disabled` dan penjaga, atau `readOnly`.

**4. Sakelar tampilan menjanjikan efek yang belum ada.** "Disembunyikan dari halaman publik" dan "Proyek
langsung tampil di halaman publik" ditulis sebagai fakta, padahal halaman publik belum membaca sakelar ini
sampai tahap 3 (`pages/admin.md` §11).

**5. Teks 11 px di bawah batas 12 px MASTER §4** di 8 tempat: badge, bar judul kartu, judul kelompok menu,
keterangan lockup, judul kelompok form, tag, label "Baru" di galeri, label "Masuk sebagai".

**6. Pilihan chip dan pilihan cepat tidak terlihat di mode kontras tinggi Windows.** Keadaan terpilih hanya
ditandai latar dan `box-shadow`, keduanya hilang di `forced-colors`. Perbaikan: outline `Highlight` untuk
`:checked` dan `[aria-pressed=true]`.

**7. Target sentuh di bawah 44 px di `pointer: coarse`:** tombol tutup toast dan alert (32 px), tautan jejak
halaman dan "Batalkan hapus" (24 px).

**8. Topik pesan tidak terlihat di Pesan.** Migrasi sudah menambah `messages.topic`, tetapi `useMessages.js`
tidak mengambilnya.

### P3: rapikan bila sempat

9. Galat di `ListInput` hanya terhubung ke `fieldset`; saat fokus melompat ke baris yang salah, pembaca
   layar tidak membacakan pesannya.
10. `scrollTo({behavior:'smooth'})` di 8 halaman mengabaikan reduced motion dan tidak berpengaruh karena
    `AdminLayout` langsung menggulir ke atas. Hapus.
11. Halaman Proyek menulis ulang pola daftar ↔ form, padahal MASTER §14 mewajibkan `SectionScreen`.
12. Garis kiri aksen dipakai untuk 9 arti: fokus, menu aktif, chip terpilih, pilihan cepat aktif, kartu
    disorot, proyek unggulan, pesan baru, entri belum dibalas, warna toast.
13. Nilai di luar token: 13 px (`0.8125rem`) dipakai 10× untuk petunjuk dan galat; hover tombol bahaya
    memakai `black` mentah.
14. Tahun di Pendidikan memakai `type="number"`, nilainya bisa berubah saat roda mouse digulir. Form lain
    memakai select.
15. Beranda: h2 "Terbaru" langsung diikuti kartu h2 (seharusnya h3); pengingat merah (sertifikat
    kedaluwarsa) tidak diurutkan paling atas.
16. "Kembali ke beranda" di halaman Masuk menuju halaman publik, padahal "Beranda" di admin berarti halaman
    utama admin.

### Diabaikan karena bertentangan dengan BRIEF atau MASTER
Garis kiri di kolom isian (keputusan pemilik), latar grid, font Inter, mematikan semua animasi saat reduced
motion, menu 36 px di desktop, primitive `--palette-*` yang tercatat, tinta gelap avatar buku tamu, label
9 px dekoratif di SVG login.

---

## Hasil

- **Nomor 1:** `useScrollLock` (penghitung bersama) dipakai `Dialog` dan laci menu. Uji otomatis: di `main` 9/19
  lulus (halaman terkunci setelah hapus, pindah halaman, dan di halaman login); di branch 19/19, termasuk
  Batal + Tutup, Escape dua kali, dan laci menu di 375 px.
- **Nomor 2:** petunjuk nomor HP dan alamat: "Tidak tampil di halaman publik, tapi jangan isi data rahasia."
  `useProfile` publik tidak lagi mengambil `phone_number`; `AboutSection` hanya menampilkan kota (judul
  kartu "Lokasi & Alamat" → "Lokasi") dan email. Atas keputusan pemilik (17 Okt), nomor HP dan alamat juga
  dihapus dari `portfolioData.js` dan dari penggabungan cadangan di `PublicPortfolioPage`, jadi tombol
  WhatsApp di hero ikut hilang. Uji: di `main` 17/32 (nomor, alamat statis, tautan wa.me, kolom di request,
  isi bundle); di branch 32/32, admin tetap memuat dan menyimpan kedua kolom.
- **Nomor 3:** `FormPanel` memberi tahu kontrol bahwa form sedang menyimpan (`FormBusyContext`). Selama itu
  kolom teks, pilihan, kotak centang, sakelar, pilihan cepat dan tombol tetap bisa difokus:
  `aria-disabled` plus `readOnly` atau penjaga, bukan `disabled`. Di luar penyimpanan `disabled` tetap
  biasa. Tombol balasan Buku tamu memakai `softDisabled`. Uji: di `main` 8/16 (fokus jatuh ke `body`);
  di branch 16/16, termasuk simpan gagal (fokus tetap di kolom, kolom bisa diisi lagi).
- **Nomor 4:** blok "Tampilan di halaman publik" di 8 form diberi catatan sementara "Berlaku setelah halaman
  publik diperbarui. Sampai saat itu, semua data masih tampil seperti biasa." (kotak garis putus), terhubung
  ke kedua sakelar lewat `aria-describedby`. Kalimat "Proyek langsung tampil di halaman publik." di form
  Proyek dihapus. **Hapus catatan ini saat tahap 3 selesai** (`DisplaySettings` di `Switch.jsx`). Uji 18/18.
- **Nomor 5 dan 13:** 8 label 11 px → `--ds-fs-xs` (12 px); 10 ukuran 13 px (petunjuk, galat, keterangan)
  → `--ds-fs-sm` (14 px, ukuran MASTER untuk teks pendukung); hover tombol bahaya memakai
  `--ds-danger-text` (merah tua yang sama, red-700) pengganti `black`. Laci menu HP 18rem → 19rem supaya
  subjudul lockup 12 px muat di samping tombol tutup. Uji 75/75: teks terkecil ≥ 12 px di 12 halaman pada
  1440 dan 375 px, tanpa gulir samping, label kecil tidak terpotong.
- **Nomor 6:** di `forced-colors` chip terpilih dan pilihan cepat yang aktif memakai latar `Highlight`, teks
  `HighlightText` dan garis 2 px `Highlight` (`forced-color-adjust: none` supaya teksnya tidak tertutup
  latar Canvas dari browser); garis fokus tetap terlihat (`CanvasText`).
- **Nomor 7:** pada `pointer: coarse` tombol tutup toast/peringatan menjadi 44 × 44 px (margin negatif, tinggi
  toast tetap), tautan jejak halaman dan "Batalkan hapus" mendapat area sentuh 44 px yang tidak terlihat.
  Uji nomor 6–7: di `main` 6/13, di branch 13/13 (termasuk ketukan 20 px dari tengah tetap mengenai
  tombol).
- **Nomor 8:** `useMessages` mengambil `topic` (kolom dari migrasi 2B, jadi Pesan butuh migrasi itu seperti
  halaman admin lain). Daftar Pesan menampilkan topik sebagai badge netral, detail menampilkan baris
  "Topik"; keduanya tidak tampil bila topik kosong. Uji 8/8, termasuk 375 px tanpa gulir samping.
- **Nomor 9:** setiap baris `ListInput` diberi `aria-describedby` ke pesan galat, jadi galat dibacakan saat
  fokus pindah ke baris. Saat ini belum ada form yang mengirim galat ke `ListInput`; diuji di halaman
  terpisah (deskripsi aksesibilitas baris = pesan galat).
- **Nomor 10:** `scrollTo({ behavior: 'smooth' })` dihapus dari 8 halaman (Profil tetap, karena sudah
  menghormati reduced motion dan judulnya tidak berubah). Halaman tetap langsung ke atas dan h1 difokus.
- **Nomor 14:** tahun masuk dan tahun lulus Pendidikan memakai `Select` (tahun lulus punya pilihan
  "Belum lulus", sampai 6 tahun ke depan); tahun tersimpan di luar rentang tetap muncul. Roda mouse tidak
  mengubah nilai.
- **Nomor 15:** `Card` mendapat `headingLevel`; dua kartu di bawah "Terbaru" menjadi h3. Pengingat merah
  (sertifikat kedaluwarsa atau hampir kedaluwarsa) diurutkan paling atas. Uji 9/10/14/15: 18/18 (di
  `main` nomor 10 dan 15 gagal seperti yang diharapkan).
- **Nomor 11:** halaman Proyek memakai `SectionScreen`, `RowActions` dan `useSectionScreen` seperti 8 halaman
  lain; logika simpan/hapus/urutan/galeri tidak berubah (galeri ada di `ProjectForm`). HTML daftar, keadaan
  kosong, galat muat, dialog hapus, form ubah dan form tambah sama persis dengan `main` (12/13; satu-satunya
  beda adalah kalimat yang dihapus di nomor 4). Uji ulang CRUD proyek 99/99 (tambah lengkap, ubah sampul dan
  galeri, hapus beserta file, urutan, gagal simpan, skema lama, lebar layar) dan penjaga di jejak halaman 6/6.
- **Nomor 12:** garis kiri aksen kini hanya untuk fokus kolom isian dan menu aktif. Pengganti (perubahan
  kecil, tidak perlu persetujuan dulu): chip terpilih dan pilihan cepat aktif → bingkai aksen ganda
  (`inset 0 0 0 1px`); baris daftar disorot (unggulan, pesan baru), kartu Beranda disorot, entri buku tamu
  belum dibalas dan toast → garis atas 2 px; pesan baru di "Pesan terbaru" Beranda → titik LED 6 px sejajar
  nama. Uji 9/9 di 6 halaman (sebelum perubahan: 3/9). Screenshot sebelum/sesudah (tidak di-commit):
  `C:\Users\acer\portofolio-screenshots\audit-admin\12-*-before.png` dan `12-*-after.png`.
