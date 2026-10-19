# Panduan online di Vercel

Situs ini berupa file statis hasil `npm run build` (Vite) ditambah satu fungsi Vercel, `api/github-contributions.js`,
untuk grafik kontribusi GitHub. Semua isi tetap di Supabase, jadi perubahan dari admin langsung tampil tanpa deploy
ulang. Pengecualiannya adalah sitemap (langkah 7).

Alamat utama: **`https://aldidwiirawan.vercel.app`**. Bila nama itu sudah dipakai orang lain, pakai cadangannya:
`https://aldidwiirawan-portfolio.vercel.app`. Di panduan ini, ganti alamat sesuai yang Anda dapat.

---

## 0. Sebelum mulai

- Akun GitHub yang memegang repo (repo boleh private).
- Akun Vercel. Daftar di vercel.com lewat **Continue with GitHub**; paket **Hobby** (gratis) cukup.
- Dashboard Supabase proyek ini.
- Semua migrasi di `supabase/migrations/` sudah dijalankan di Supabase.

## 1. Impor repo ke Vercel

1. Di vercel.com pilih **Add New… → Project**.
2. Di **Import Git Repository**, pilih repo portofolio ini. Bila repo private tidak muncul, klik **Adjust GitHub App
   Permissions**, beri Vercel akses ke repo ini, lalu kembali.
3. **Project Name**: `aldidwiirawan`. Nama proyek menentukan alamat `*.vercel.app`.
4. **Framework Preset**: Vite (terdeteksi otomatis). Build Command `npm run build`, Output Directory `dist`, Install
   Command `npm install`: biarkan bawaan.
5. **Jangan klik Deploy dulu.** Buka bagian **Environment Variables** dan isi seperti langkah 2.

## 2. Variabel lingkungan (Environment Variables)

Isi di layar impor, atau nanti di **Settings → Environment Variables**. Centang **Production** dan **Preview**.

| Nama | Isi | Catatan |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | sama dengan di `.env.local` | alamat proyek Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | sama dengan di `.env.local` | kunci **publishable**, jangan pernah kunci `service_role`/secret |
| `VITE_SITE_URL` | `https://aldidwiirawan.vercel.app` | tanpa `/` di akhir; dipakai untuk alamat kanonis, pratinjau tautan, dan sitemap |
| `GITHUB_TOKEN` | token dari langkah 4 | hanya dibaca fungsi grafik GitHub di server; **jangan** diberi awalan `VITE_` |

Penting:
- Variabel berawalan `VITE_` dimasukkan ke situs **saat build**. Setiap kali Anda mengubahnya, lakukan **Redeploy**
  (langkah 7) supaya perubahannya terpakai.
- Bila `VITE_SITE_URL` lupa diisi, build memakai alamat produksi Vercel secara otomatis. Tetap isi supaya jelas.

Lalu klik **Deploy** dan tunggu sekitar satu menit.

## 3. Cek alamat vercel.app

Buka **Settings → Domains**. Bila alamatnya bukan `aldidwiirawan.vercel.app` (nama sudah dipakai orang lain), klik
**Edit** pada domain `.vercel.app`, ganti menjadi `aldidwiirawan-portfolio.vercel.app`, simpan, lalu ubah
`VITE_SITE_URL` ke alamat itu dan **Redeploy**.

## 4. Token GitHub untuk grafik kontribusi

Grafik di akhir section Proyek membaca kalender kontribusi publik lewat API resmi GitHub. Token hanya untuk membaca
data publik; tanpa token, atau bila token kedaluwarsa, grafik tidak ditampilkan dan bagian lain situs tetap normal.

**Membuat token**
1. github.com → foto profil → **Settings** → **Developer settings** → **Personal access tokens** →
   **Fine-grained tokens** → **Generate new token**.
2. **Token name**: `portofolio-vercel-grafik`.
3. **Resource owner**: akun Anda sendiri.
4. **Expiration**: **Custom**, pilih tanggal satu tahun dari hari ini.
5. **Repository access**: **Public repositories** (hanya baca repo publik).
6. **Permissions**: jangan tambah izin apa pun.
7. Klik **Generate token**, lalu salin token (hanya tampil sekali).
8. Di Vercel: **Settings → Environment Variables** → `GITHUB_TOKEN` → tempel → **Save** → **Redeploy**.

**Memperbarui token (setiap tahun)**
1. GitHub mengirim email beberapa hari sebelum token kedaluwarsa.
2. Buka halaman **Fine-grained tokens**, pilih token `portofolio-vercel-grafik`, klik **Regenerate token**, dan pilih
   masa berlaku satu tahun lagi.
3. Salin token baru, ganti nilai `GITHUB_TOKEN` di Vercel, lalu **Redeploy**.

**Cek**: buka `https://aldidwiirawan.vercel.app/api/github-contributions`. Hasil yang benar berupa teks JSON berisi
`"total"`. Hasil `503` berarti token kosong atau kedaluwarsa, atau **Username GitHub** di admin Profil kosong.
Jawaban fungsi disimpan sementara (cache) 12 jam, jadi angka baru muncul paling lambat setengah hari kemudian.

## 5. Supabase Auth

Supabase → **Authentication → URL Configuration**:
- **Site URL**: `https://aldidwiirawan.vercel.app`
- **Redirect URLs**: tambahkan `https://aldidwiirawan.vercel.app/**`. Biarkan alamat lokal
  (`http://localhost:5173/**`) bila sudah ada.

Login admin memakai email dan kata sandi; pengaturan ini dipakai tautan di email dari Supabase. Pengaturan CORS di
Supabase tidak perlu diubah.

## 6. Daftar periksa setelah online

- [ ] Beranda tampil, semua section terisi; tema dan bahasa bisa diganti.
- [ ] Ketik langsung alamat sebuah proyek (`/projects/...`) lalu muat ulang halaman: tidak 404.
- [ ] Alamat ngawur (mis. `/abc`) menampilkan halaman "tidak ditemukan".
- [ ] `/admin/login` → login → buka beberapa halaman admin; unggah gambar dan PDF; klik pratinjau PDF.
- [ ] Kirim satu pesan buku tamu dan satu pesan kontak (hapus dari admin bila hanya uji).
- [ ] Lightbox gambar, label fisika di hero, dan suara berjalan.
- [ ] Grafik GitHub muncul di akhir section Proyek.
- [ ] `/robots.txt` dan `/sitemap.xml` terbuka; sitemap berisi beranda dan semua proyek yang tampil.
- [ ] Pratinjau tautan: tempel alamat situs di WhatsApp, atau cek di LinkedIn Post Inspector
      (`linkedin.com/post-inspector`). Gambar dan judul situs muncul.
- [ ] Chrome DevTools → **Console**: tidak ada pesan merah "Refused to ..." (pemblokiran CSP, lihat langkah 9).
- [ ] Chrome DevTools → **Lighthouse** → Mobile → Analyze.
- [ ] (Opsional) Google Search Console: tambah properti **URL prefix** dengan alamat situs, verifikasi, lalu kirim
      `https://aldidwiirawan.vercel.app/sitemap.xml` di menu **Sitemaps**.

## 7. Redeploy manual (proyek baru masuk sitemap)

Isi halaman selalu terbaru dari Supabase, tetapi `sitemap.xml` dibuat **saat build**. Setelah menambah,
menyembunyikan, atau mengganti slug proyek di admin:

1. Vercel → proyek → **Deployments**.
2. Pada deployment teratas yang berlabel **Production**, klik titik tiga (**⋯**) → **Redeploy** → **Redeploy**.
3. Setelah selesai, buka `/sitemap.xml` untuk memastikan proyek baru ada.

Redeploy yang sama dipakai setelah mengubah variabel lingkungan. Setiap `git push` ke cabang `main` juga otomatis
membuat deployment produksi baru; cabang lain mendapat alamat **Preview** sendiri.

## 8. Menambah domain sendiri (nanti)

1. Beli domain di penyedia domain (registrar).
2. Vercel → **Settings → Domains → Add**, ketik domain (mis. `namaanda.com`). Vercel menampilkan catatan DNS yang
   harus dibuat (biasanya `A` untuk domain utama dan `CNAME` untuk `www`). Buat **persis** seperti yang ditampilkan
   di panel DNS registrar.
3. Tunggu status **Valid Configuration** (bisa beberapa menit sampai beberapa jam); HTTPS dibuat otomatis.
4. Ubah `VITE_SITE_URL` ke `https://namaanda.com`, lalu **Redeploy**.
5. Supabase → **Authentication → URL Configuration**: ganti **Site URL** dan tambahkan `https://namaanda.com/**` di
   **Redirect URLs**.
6. Bila memakai Google Search Console, tambahkan properti untuk domain baru dan kirim ulang sitemap.

## 9. Keamanan (header dan CSP)

`vercel.json` mengirim header keamanan untuk semua halaman, termasuk **Content-Security-Policy (CSP)**. CSP adalah
daftar sumber yang boleh dimuat browser:
- skrip hanya dari situs sendiri, ditambah skrip tema kecil di `index.html` yang dikenali lewat hash `sha256-...`;
- gambar dari situs sendiri, `data:`, `blob:` (pratinjau unggahan admin), dan `*.supabase.co`;
- koneksi data ke situs sendiri (fungsi grafik GitHub) dan `*.supabase.co`;
- tanpa iframe/objek dari luar, dan situs tidak bisa dibingkai di situs lain.

Yang perlu diingat:
- **Mengubah `<script>` kecil di `index.html`** mengubah hash-nya. `npm run build` akan berhenti dengan pesan yang
  berisi hash baru; salin hash itu ke `script-src` di `vercel.json`.
- **Menambah layanan dari domain lain** (analitik, video YouTube, font Google, dan sebagainya): tambahkan domainnya
  ke bagian CSP yang sesuai. Tanpa itu, browser memblokirnya dan Console menampilkan "Refused to ...".
- **Darurat** (ada fitur rusak karena CSP): di `vercel.json` ganti kunci `"Content-Security-Policy"` menjadi
  `"Content-Security-Policy-Report-Only"`, lalu push. Browser hanya mencatat pelanggaran di Console tanpa memblokir.
  Setelah diperbaiki, kembalikan.
- Halaman admin diberi header `X-Robots-Tag: noindex`, `robots.txt` menutup `/admin` dan `/api/`, sehingga tidak
  muncul di mesin pencari.

## 10. Bila ada masalah

| Gejala | Penyebab yang mungkin | Perbaikan |
| --- | --- | --- |
| Data tidak muncul, section berisi pesan gagal | `VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY` salah | perbaiki di Vercel → Redeploy |
| Halaman putih, Console "Refused to ..." | CSP memblokir sesuatu | baca pesan di Console; langkah 9 |
| Muat ulang `/projects/...` menjadi 404 | `vercel.json` tidak ikut ter-deploy | pastikan file ada di cabang yang di-deploy |
| Grafik GitHub hilang | token kosong/kedaluwarsa, atau username GitHub di Profil kosong | langkah 4 |
| Proyek baru tidak ada di sitemap | sitemap dibuat saat build | langkah 7 |
| Pratinjau tautan masih gambar lama | WhatsApp/LinkedIn menyimpan pratinjau | cek ulang di LinkedIn Post Inspector; WhatsApp memperbarui sendiri setelah beberapa waktu |
