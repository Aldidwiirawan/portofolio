# Fase 8: samakan tampilan dengan styfensagala.vercel.app

Effort: High. Lanjutkan di branch `feat/redesign-monokrom`. Commit per bagian. Push boleh ke branch ini saja (supaya Preview Vercel ikut diperbarui). Jangan merge ke `main` dan jangan deploy production.

## Tujuan

Tampilan publik dibuat **sama persis** dengan https://styfensagala.vercel.app: ukuran, jarak, huruf, garis, bayangan, animasi, dan perilaku. Setelah sama, pemilik akan memberi instruksi tambahan atau pengurangan sendiri.

Yang disamakan hanya **tampilan dan perilakunya**. Semua isi tetap milik Aldi dan tetap diambil dari database:
- nama, teks, data proyek dan pengalaman,
- foto,
- logo "AD",
- kucing Kopi & Susu.

Jangan menyalin teks, logo, foto, karakter, atau aset dari situs Styfen.

## Cara kerja (wajib)

1. Buka situs Styfen dengan Playwright, baca saja, dalam ukuran:
   - 1440×900,
   - 1920×1080,
   - 390×844,
   - tema terang dan gelap.
2. Untuk tiap bagian, ukur `getBoundingClientRect` dan computed style elemen pentingnya:
   - posisi dan ukuran,
   - `font-size`, `font-weight`, `letter-spacing`, `line-height`,
   - warna,
   - `border` dan `border-radius`,
   - `box-shadow`,
   - jarak antarelemen.
   Ukur juga perilakunya: hover, animasi muncul, dan efek saat di-scroll.
3. Bandingkan dengan situs kita di ukuran yang sama. Screenshot berdampingan, lalu ulangi sampai selisihnya kecil, kira-kira ±4 px dan warna yang sama.
4. Simpan tabel ukuran Styfen dan ukuran kita (sebelum dan sesudah) di scratchpad untuk laporan.

Kalau ada keputusan yang tidak jelas, tanyakan ke pemilik dulu, jangan menebak.

## Keputusan pemilik

**Dipertahankan** (gayanya disamakan dengan Styfen):
- Bagian Sertifikat, beserta lightbox dan "Lihat semua".
- Grafik kontribusi GitHub.
- Kucing Kopi & Susu, tapi ukuran dan posisinya mengikuti karakter Styfen (lihat Hero).
- Kartu proyek tetap berisi fakta asli: Peran / Tahun / Klien.
  - Tiga kotaknya ditata persis seperti tiga kotak angka di kartu Styfen.
  - **Tanpa angka metrik buatan.**
- ID/EN, tema terang/gelap, suara, buku tamu, dan formulir kontak.

**Dihapus:**
- Pita teknologi: dua baris teks besar yang bergeser saat di-scroll (`TechRibbon`).
- Tombol "Unduh CV" di navbar, baik desktop maupun menu HP. Unduh CV cukup ada di bagian Tentang saya.

**Diubah:**
- Navbar mendapat menu **Buku Tamu** seperti Styfen, yang membuka panel buku tamu. Urutannya: Beranda, Tentang, Proyek, Perjalanan, Sertifikat, Buku Tamu, Kontak.
- **Studi kasus proyek menjadi pop-up (modal)** seperti Styfen, bukan pindah halaman (lihat bagian Proyek).

## Ukuran yang sudah terbaca dari situs Styfen (1440×900)

Pakai sebagai titik awal, lalu pastikan sendiri dengan pengukuran.

### Navbar
- `position: fixed`, tinggi 81 px, latar putih 95% dengan `backdrop-blur`, garis bawah abu muda (neutral-200).
- Logo di kiri (x ≈ 96 px), berupa ikon kecil tanpa kotak. Untuk kita: logo "AD" dibuat seukuran dan segaya itu.
- Menu di tengah: 14 px, bold, huruf kapital, `letter-spacing` 0.1em.
- Kanan: tombol suara dan tema (lingkaran) serta pilihan bahasa bersegmen.

### Hero
- Tinggi tepat 1 layar (`100vh`), dan bar status **terlihat di dasar layar pertama**. Sekarang di 1920×1080 bar status kita terdorong keluar layar.
- Nama:
  - Space Grotesk 900, huruf kapital, `letter-spacing` −0.05em, `line-height` 0.7.
  - Membentang dari tepi ke tepi seperti Styfen (14vw untuk 13 huruf). "ALDI DWI IRAWAN" lebih panjang, jadi skala ukuran hurufnya supaya lebar totalnya sama dan tetap satu baris di desktop.
- Chip:
  - Huruf 1.1vw (≈15.8 px), bold, kapital.
  - Garis ≈1.4 px, bukan 2.5 px.
  - Tinggi ±64–74 px, latar putih, bulat penuh.
  - Lingkaran 4.5vw (≈65 px): putih berisi ✱ dan hitam berisi `</>`.
  - Chip berada di area atas, terpisah dari nama, menyebar lebar seperti Styfen.
  - Saat halaman dibuka, chip **jatuh dari atas dengan fisika** seperti Styfen. Dengan reduced motion, chip langsung diam di tempat.
  - Ukur juga bayangan chip dan lingkaran di setiap keadaan (diam, hover, diseret).
- Baris kode:
  - Space Grotesk, bukan monospace, ≈0.8vw (11.5 px), tepat di bawah nama.
  - Kata kunci bold hitam, nama variabel abu (neutral-600), tanda baca abu muda.
  - Pengecualian aksesibilitas: teks yang perlu dibaca minimal kontras 4.5:1. Kalau warna Styfen lebih pucat dari itu, pakai abu terdekat yang lolos dan catat di laporan.
- Bar status:
  - 4 kolom bergaris, tinggi 52 px, huruf 14 px, `letter-spacing` 0.05em.
  - "Terbuka untuk kerja" bold dengan titik hijau. "Hari ini:" bold dan tanggalnya regular.
  - Saat hover, kolom terbalik jadi hitam dengan teks putih.
- Kucing:
  - Ukurannya seperti karakter Styfen, sekitar 55–60 px.
  - Berdiri di atas garis bar status, bisa sebagian tersembunyi di belakangnya seperti karakter Styfen.
  - Jangan pernah menutupi nama atau baris kode. Sekarang di 1920×1080 kucing menutupi baris kode.
- Tombol Buku Tamu mengambang:
  - `fixed`, kanan-bawah 32 px, ±171×48 px, putih, garis ≈1.4 px, bulat penuh, ikon + "Buku Tamu" + angka.
  - Tetap terlihat saat bar status terlihat, seperti Styfen. Aturan menyembunyikannya di Fase 5 dicabut.

### Judul bagian
- Tentang, Proyek, Kontak: 72 px, weight 900, `letter-spacing` −0.05em, kapital.
- Perjalanan: 96 px, rata tengah, dengan subjudul di bawahnya.

### Tentang saya (bento)
- Kartu perkenalan dengan judul 30 px bold.
- Kartu profil ±368×360 px:
  - latar hitam 90%, radius 30 px, bayangan lembut `2px 4px 20px -5px rgba(0,0,0,.8)`,
  - berisi nama atau handle, status "Online", dan tombol "Rekrut saya". Untuk kita: foto Aldi dan teks Aldi.
- Kartu pendidikan dengan IPK besar. Styfen punya daftar mata kuliah, tapi kita tidak punya datanya, jadi bagian itu dilewati.
- Tech stack per kategori.
- Kartu hitam "Fokus saya" dengan tag.

### Proyek pilihan (bagian hitam)
- Ukur dan samakan tata letak kartunya:
  - label di atas,
  - judul 48 px bold kapital (`line-height` 1.25),
  - deskripsi,
  - tiga kotak fakta (isinya Peran / Tahun / Klien),
  - tag,
  - tombol "Baca studi kasus" dan "Kunjungi",
  - gambar dengan lapisan hover "Lihat studi kasus".
- Samakan juga efek scroll dan hover Styfen, termasuk perubahan warna gambar kalau ada.

**Pop-up studi kasus** (menggantikan perpindahan ke halaman detail):
- Ukuran ±896 px lebar, tinggi maks ±720 px (bisa di-scroll di dalamnya), radius 18 px, latar ≈ #141414, latar belakang halaman digelapkan, tombol tutup bulat di kanan atas.
- Kepala pop-up: gambar sampul proyek dengan gradasi gelap, chip "Studi kasus", dan judul besar kapital.
- Isi, berurutan:
  1. **Permasalahan** (titik merah) dan **Solusi** (titik hijau), dua kolom.
  2. Garis pemisah, lalu **Latar belakang proyek** (±2/3 lebar) dan **Fitur utama** (±1/3 lebar, poin dengan tanda ▸).
  3. Garis pemisah, lalu tombol "Kunjungi situs" kalau ada demo publik.
  4. Tambahan milik Aldi, ditata dengan gaya pop-up yang sama:
     - galeri dan diagram ringkas, dengan lightbox,
     - panel Repositori GitHub (khusus repo publik),
     - catatan Hasil,
     - Peran dan teknologi.
     Bagian yang datanya kosong disembunyikan.
- Bisa ditutup dengan Esc, tombol tutup, dan klik di luar. Fokus terkunci di dalam pop-up, lalu kembali ke tombol pembukanya.
- URL lama `/proyek/:slug` tetap berfungsi: membuka beranda dengan pop-up proyek itu terbuka, supaya tautan yang sudah dibagikan dan SEO tidak rusak. Saat pop-up dibuka dari kartu, URL ikut berubah, dan tombol Back menutup pop-up.
- Navigasi proyek sebelumnya/berikutnya di dalam pop-up hanya ditambahkan kalau Styfen punya.

### Perjalanan
- Samakan:
  - timeline,
  - kartu,
  - folder "Arsip proyek / Klik folder",
  - foto kecil dari folder (±73×62 px, grayscale, berwarna saat hover).

### Sertifikat
- Bagian ini tidak ada di Styfen. Tata letaknya tetap milik kita, tapi huruf, garis, radius, bayangan, dan hover disamakan dengan kartu-kartu Styfen supaya serasi.

### Kontak dan footer
- Samakan tata letak Styfen:
  - kolom kiri: judul dua baris, paragraf, email langsung, dan media sosial,
  - kolom kanan: formulir dengan label kapital.
- Footer: hak cipta, "Berbasis di Kediri, ID", dan "Terbuka untuk kerja jarak jauh". Ambil teksnya dari data yang ada, jangan karang klaim baru.
- Logika formulir dan buku tamu tidak diubah.

### HP (390×844)
- Ukur ulang semua bagian di atas di lebar HP dan samakan juga, termasuk menu HP dan pop-up studi kasus versi HP.

## Tetap berlaku

- Panel admin tidak berubah (uji regresi login dan admin terhadap `main`).
- CSP, tanpa CDN atau font eksternal baru, dan tanpa dependency baru.
- Reduced motion dihormati.
- Navigasi keyboard tetap jalan.
- Tidak ada scroll horizontal.
- Tidak ada angka metrik buatan.
- Token hanya di server.

## Laporan

- Tabel ukuran per bagian: Styfen dibanding milik kita.
- Screenshot berdampingan di 1440, 1920, dan 390 (terang dan gelap): hero, Tentang, Proyek, pop-up studi kasus, Perjalanan, dan Kontak.
- Daftar hal yang sengaja berbeda beserta alasannya, misalnya kontras teks atau data yang tidak ada.
- Hasil build, lint, dan uji.

Setelah push ke branch, berhenti dan laporkan.
