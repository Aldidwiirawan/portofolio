BEGIN;

-- ==============================================================================
-- Seed: draf terjemahan Inggris (bukan migrasi) — Tahap 3C
-- Tanggal: 2026-10-19
-- Jalankan di Supabase SQL Editor SETELAH migrasi 20261019000000_english_content.sql.
--
-- Isinya
-- - Hanya mengisi kolom versi Inggris (_en, caption_en, label_en). Kolom Indonesia, urutan,
--   gambar, dan tautan tidak diubah. Nomor HP dan alamat tidak disentuh.
-- - Setiap baris dicocokkan lewat slug/id DAN teks Indonesianya saat draf dibuat (19 Oktober 2026).
--   Bila teks Indonesianya sudah Anda ubah sejak itu, baris itu dilewati, jadi terjemahan tidak
--   pernah dipasang ke teks yang berbeda. Terjemahkan teks barunya lewat admin.
-- - Kolom Inggris yang sudah terisi (misalnya lewat admin) tidak ditimpa. Karena itu file ini aman
--   dijalankan ulang: jalankan kedua tidak mengubah apa pun.
-- - Teks di antara $en$ ... $en$ boleh Anda ubah dulu sebelum menjalankan file ini. Teks di antara
--   $id$ ... $id$ JANGAN diubah: itu teks Indonesia yang dicocokkan.
-- - Nama orang, instansi, produk, dan teknologi dibiarkan (AyamBebek Pakan dan Ternak, CV Adisatya
--   IT Consultant, Politeknik Negeri Malang, LSP, MikroTik, nama repo, perintah instalasi).
--
-- Satu transaksi: bila satu perintah gagal, tidak ada yang berubah. Query setelah COMMIT
-- menampilkan setiap kolom yang diisi file ini dan statusnya (terisi = true).
-- ==============================================================================

-- ==============================================================================
-- 1. PROFIL (satu baris)
-- ==============================================================================
UPDATE public.profiles SET tagline_en = $en$Junior Programmer · Web & Mobile$en$
WHERE tagline = $id$Junior Programmer · Web & Mobile$id$ AND tagline_en IS NULL;
UPDATE public.profiles SET bio_en = $en$I'm Aldi, a graduate of the Informatics Management diploma program (D3) at Politeknik Negeri Malang. I build web and mobile applications, from designing the interface in Figma to writing the code and connecting it to the database, and I'm also used to handling computer networks. My latest project is a barcode-based order packing and tracking system used by a client in Kediri, which I worked on with the team at CV Adisatya IT Consultant.$en$
WHERE bio = $id$Saya Aldi, lulusan D3 Manajemen Informatika Politeknik Negeri Malang. Saya membangun aplikasi web dan mobile, mulai dari merancang tampilan di Figma sampai menulis kode dan menghubungkannya ke basis data, dan terbiasa juga menangani jaringan. Proyek terakhir saya adalah sistem pengemasan dan pelacakan pesanan berbasis barcode yang dipakai klien di Kediri, yang saya kerjakan bersama tim di CV Adisatya IT Consultant.$id$ AND bio_en IS NULL;
UPDATE public.profiles SET primary_role_en = $en$Junior Programmer$en$
WHERE primary_role = $id$Junior Programmer$id$ AND primary_role_en IS NULL;
UPDATE public.profiles SET secondary_roles_en = ARRAY[$en$IT Support$en$, $en$IT Administration$en$]::TEXT[]
WHERE secondary_roles = ARRAY[$id$IT Support$id$, $id$IT Administrasi$id$]::TEXT[] AND cardinality(secondary_roles_en) = 0;
UPDATE public.profiles SET hero_keywords_en = ARRAY[$en$websites$en$, $en$mobile apps$en$, $en$computer networks$en$]::TEXT[]
WHERE hero_keywords = ARRAY[$id$website$id$, $id$aplikasi mobile$id$, $id$jaringan komputer$id$]::TEXT[] AND cardinality(hero_keywords_en) = 0;
UPDATE public.profiles SET contact_topics_en = ARRAY[$en$Job offer$en$, $en$Project collaboration$en$, $en$General question$en$]::TEXT[]
WHERE contact_topics = ARRAY[$id$Tawaran kerja$id$, $id$Kerja sama proyek$id$, $id$Pertanyaan umum$id$]::TEXT[] AND cardinality(contact_topics_en) = 0;
UPDATE public.profiles SET hobbies_en = ARRAY[$en$Football$en$, $en$Futsal$en$, $en$Badminton$en$, $en$Swimming$en$, $en$Running$en$]::TEXT[]
WHERE hobbies = ARRAY[$id$Sepak Bola$id$, $id$Futsal$id$, $id$Badminton$id$, $id$Renang$id$, $id$Lari$id$]::TEXT[] AND cardinality(hobbies_en) = 0;

-- ==============================================================================
-- 2. PROYEK (dicocokkan lewat slug + teks Indonesianya)
-- ==============================================================================

-- SI-Arsip: Sistem Informasi Arsip Surat Desa Karangduren
UPDATE public.projects SET title_en = $en$SI-Arsip: Karangduren Village Letter Archive Information System$en$
WHERE slug = $id$aplikasi-arsip-surat$id$ AND title = $id$SI-Arsip: Sistem Informasi Arsip Surat Desa Karangduren$id$ AND title_en IS NULL;
UPDATE public.projects SET description_en = $en$SI-Arsip was built as a competency test project for LSP Politeknik Negeri Malang, using the letter archive of Karangduren Village as its case study. Village staff can upload letters as PDF files, group them by category, search them by title, and view them right on the page without downloading. Installation instructions are in the README of the GitHub repository.$en$
WHERE slug = $id$aplikasi-arsip-surat$id$ AND description = $id$SI-Arsip dibuat sebagai proyek uji kompetensi LSP Politeknik Negeri Malang, dengan studi kasus arsip surat Desa Karangduren. Perangkat desa bisa mengunggah surat dalam bentuk PDF, mengelompokkannya per kategori, mencarinya berdasarkan judul, dan melihat isinya langsung di halaman tanpa harus mengunduh. Panduan instalasi tersedia di README repo GitHub.$id$ AND description_en IS NULL;
UPDATE public.projects SET client_name_en = $en$Competency test case study, LSP Politeknik Negeri Malang$en$
WHERE slug = $id$aplikasi-arsip-surat$id$ AND client_name = $id$Studi kasus uji kompetensi LSP Politeknik Negeri Malang$id$ AND client_name_en IS NULL;
UPDATE public.projects SET my_role_en = $en$Designed and built it end to end$en$
WHERE slug = $id$aplikasi-arsip-surat$id$ AND my_role = $id$Merancang dan mengembangkan seluruhnya$id$ AND my_role_en IS NULL;
UPDATE public.projects SET problem_en = $en$The village's letter archive was still kept by hand in folders and on shelves, so finding a letter was hard and took time.$en$
WHERE slug = $id$aplikasi-arsip-surat$id$ AND problem = $id$Arsip surat desa masih disimpan manual di map dan rak, sehingga sulit dicari dan memakan waktu.$id$ AND problem_en IS NULL;
UPDATE public.projects SET solution_en = $en$A web application to upload, search, view, and download PDF letter archives, with an in-page PDF preview, letter category management, and a confirmation step before deleting.$en$
WHERE slug = $id$aplikasi-arsip-surat$id$ AND solution = $id$Aplikasi web untuk mengunggah, mencari, melihat, dan mengunduh arsip surat PDF, dengan pratinjau PDF langsung di halaman, pengelolaan kategori surat, dan konfirmasi sebelum menghapus.$id$ AND solution_en IS NULL;
UPDATE public.projects SET content_en = replace($en$Title: SI-Arsip (Karangduren Village Letter Archive Information System)
🎯 Purpose
This application helps village staff manage their letter archive digitally, so it is tidier, easier to search, and safer.
With this system, archiving is no longer done by hand with folders or shelves but on a computer, which saves time and effort.

✨ Main Features
📂 Letter Archive Management
Upload, view, download, and delete PDF files.
Search the archive by title.
🗂 Letter Categories
Create, view, edit, and delete categories (automatic ID).
👀 PDF Preview
View a letter directly without downloading it (inline iframe).
🗑 Delete Confirmation
A confirmation dialog before data is deleted.
ℹ About Page
Shows who made the application and when.
1. Requirements
PHP 8.2+
MySQL / MariaDB (or adjust .env if you use SQLite)
Composer
Laravel
2. Database Setup (MySQL)
If the si_arsip database does not exist yet, you can create it manually:

sql SOURCE database/init/si_arsip.sql;

Or run this yourself in a database client:

sql CREATE DATABASE IF NOT EXISTS si_arsip CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

3. .env Configuration
Copy the example file: bash copy .env.example .env

Fill in the important variables (Laragon / XAMPP defaults as an example):

APP_NAME="SI-Arsip" APP_TIMEZONE=Asia/Jakarta DB_CONNECTION=mysql DB_HOST=127.0.0.1 DB_PORT=3306 DB_DATABASE=si_arsip DB_USERNAME=root DB_PASSWORD= FILESYSTEM_DISK=public SESSION_DRIVER=database CACHE_STORE=database QUEUE_CONNECTION=database

Generate the app key: bash php artisan key:generate

4. Migrations & Seeders
bash php artisan migrate --seed

The seeder adds 4 default categories: Undangan (invitations), Pengumuman (announcements), Nota Dinas (official memos), and Pemberitahuan (notices).

5. Storage Link
bash php artisan storage:link

Make sure the PDF upload folder exists: storage/app/public/pdf (it is created automatically on the first upload).

6. Running the Application
bash php artisan serve

Open: http://127.0.0.1:8000$en$, E'\r', '')
WHERE slug = $id$aplikasi-arsip-surat$id$ AND replace(content, E'\r', '') = replace($id$Judul : SI-Arsip (Sistem Informasi Arsip Surat Desa Karangduren)
🎯 Tujuan
Aplikasi ini dibuat untuk membantu perangkat desa dalam mengelola arsip surat secara digital agar lebih rapi, mudah dicari, dan aman.
Dengan adanya sistem ini, pengarsipan tidak lagi dilakukan secara manual menggunakan map atau rak, tetapi terkomputerisasi sehingga menghemat waktu dan tenaga.

✨ Fitur Utama
📂 Manajemen Arsip Surat
Unggah, lihat, unduh, dan hapus file PDF.
Pencarian arsip berdasarkan judul.
🗂 Kategori Surat
CRUD kategori (ID otomatis).
👀 Pratinjau PDF
Bisa dilihat langsung tanpa diunduh (inline iframe).
🗑 Konfirmasi Hapus
Modal konfirmasi sebelum menghapus data.
ℹ About Page
Menampilkan identitas pembuat dan tanggal pembuatan.
1. Kebutuhan
PHP 8.2+
MySQL / MariaDB (atau sesuaikan .env bila pakai SQLite)
Composer
Laravel
2. Persiapan Database (MySQL)
Jika database si_arsip belum ada, bisa buat manual:

sql SOURCE database/init/si_arsip.sql;

Atau jalankan sendiri di client:

sql CREATE DATABASE IF NOT EXISTS si_arsip CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

3. Konfigurasi .env
Salin file contoh: bash copy .env.example .env

Isi variabel penting (contoh default Laragon / XAMPP):

APP_NAME="SI-Arsip" APP_TIMEZONE=Asia/Jakarta DB_CONNECTION=mysql DB_HOST=127.0.0.1 DB_PORT=3306 DB_DATABASE=si_arsip DB_USERNAME=root DB_PASSWORD= FILESYSTEM_DISK=public SESSION_DRIVER=database CACHE_STORE=database QUEUE_CONNECTION=database

Generate key: bash php artisan key:generate

4. Migrasi & Seeder
bash php artisan migrate --seed

Seeder akan menambahkan 4 kategori default: Undangan, Pengumuman, Nota Dinas, Pemberitahuan.

5. Storage Link
bash php artisan storage:link

Pastikan folder upload PDF: storage/app/public/pdf (dibuat otomatis saat unggah pertama).

6. Menjalankan Aplikasi
bash php artisan serve

Buka: http://127.0.0.1:8000$id$, E'\r', '') AND content_en IS NULL;
-- Keterangan galeri: caption_en masuk ke item yang sama (item yang sudah punya caption_en tidak diubah)
UPDATE public.projects AS p
SET gallery = (
  SELECT jsonb_agg(
           CASE WHEN m.en IS NOT NULL AND NOT (g.item ? 'caption_en') THEN g.item || jsonb_build_object('caption_en', m.en) ELSE g.item END
           ORDER BY g.ord)
  FROM jsonb_array_elements(p.gallery) WITH ORDINALITY AS g(item, ord)
  LEFT JOIN (VALUES ($id$Halaman About$id$, $en$About page$en$),
           ($id$Halaman Unggah Arsip$id$, $en$Upload archive page$en$),
           ($id$Halaman Lihat Arsip$id$, $en$View archive page$en$),
           ($id$Halaman Category$id$, $en$Category page$en$),
           ($id$Halaman Tambah Category$id$, $en$Add category page$en$)) AS m(id, en) ON m.id = g.item->>'caption'
)
WHERE p.slug = $id$aplikasi-arsip-surat$id$ AND jsonb_typeof(p.gallery) = 'array' AND jsonb_array_length(p.gallery) > 0;
-- Label tautan: label_en masuk ke item yang sama (item yang sudah punya label_en tidak diubah)
UPDATE public.projects AS p
SET links = (
  SELECT jsonb_agg(
           CASE WHEN m.en IS NOT NULL AND NOT (g.item ? 'label_en') THEN g.item || jsonb_build_object('label_en', m.en) ELSE g.item END
           ORDER BY g.ord)
  FROM jsonb_array_elements(p.links) WITH ORDINALITY AS g(item, ord)
  LEFT JOIN (VALUES ($id$Kode$id$, $en$Code$en$)) AS m(id, en) ON m.id = g.item->>'label'
)
WHERE p.slug = $id$aplikasi-arsip-surat$id$ AND jsonb_typeof(p.links) = 'array' AND jsonb_array_length(p.links) > 0;

-- AyamBebek: Sistem Pengemasan dan Pelacakan Pesanan Multi-Marketplace
UPDATE public.projects SET title_en = $en$AyamBebek: Multi-Marketplace Order Packing and Tracking System$en$
WHERE slug = $id$ayambebek$id$ AND title = $id$AyamBebek: Sistem Pengemasan dan Pelacakan Pesanan Multi-Marketplace$id$ AND title_en IS NULL;
UPDATE public.projects SET description_en = $en$A web console and mobile app for packing and tracking Shopee and TikTok Shop orders at AyamBebek, an animal feed store in Kediri.$en$
WHERE slug = $id$ayambebek$id$ AND description = $id$Konsol web dan aplikasi mobile untuk mengemas dan melacak pesanan Shopee dan TikTok Shop di toko pakan ternak AyamBebek, Kediri.$id$ AND description_en IS NULL;
UPDATE public.projects SET my_role_en = $en$Frontend and UI/UX of the web console (designed in Figma, then built as HTML pages), the monitoring dashboard, and the feature that syncs shipping-label scan data from the mobile app to the server. I also helped develop the Flutter mobile app with the programming team at CV Adisatya IT Consultant.$en$
WHERE slug = $id$ayambebek$id$ AND my_role = $id$Frontend dan UI/UX konsol web (merancang di Figma lalu membangun halaman HTML), dasbor pemantauan, fitur sinkronisasi data pemindaian resi dari aplikasi mobile ke server, serta ikut mengembangkan aplikasi mobile Flutter bersama tim programmer CV Adisatya IT Consultant.$id$ AND my_role_en IS NULL;
UPDATE public.projects SET problem_en = $en$Shipping status was recorded by hand in Excel and proof of handover was sent over WhatsApp, so finding the status of a single parcel could take up to about 3 days. The store processes 20–100 orders a day with 7 operators.$en$
WHERE slug = $id$ayambebek$id$ AND problem = $id$Status pengiriman dicatat manual di Excel dan bukti serah terima dikirim lewat WhatsApp, sehingga mencari status satu paket bisa memakan waktu hingga sekitar 3 hari. Toko memproses 20–100 pesanan per hari dengan 7 operator.$id$ AND problem_en IS NULL;
UPDATE public.projects SET solution_en = $en$A system developed with the team, in two parts: a web console for admins (the seller-integration repo) that imports Shopee and TikTok Shop orders from Excel files, shows a packing monitoring dashboard, and manages users; and a mobile app for operators (the ayambebekmobile repo) that scans shipping-label barcodes during packing and sends the scan data, with photo proof, to the server.$en$
WHERE slug = $id$ayambebek$id$ AND solution = $id$Sistem yang dikembangkan bersama tim dan terdiri dari dua bagian: konsol web untuk admin (repo seller-integration) yang mengimpor pesanan Shopee dan TikTok Shop dari file Excel, menampilkan dasbor pemantauan pengemasan, dan mengelola pengguna; serta aplikasi mobile untuk operator (repo ayambebekmobile) yang memindai barcode resi saat pengemasan dan mengirim data pemindaian beserta foto bukti ke server.$id$ AND solution_en IS NULL;
-- Label tautan: label_en masuk ke item yang sama (item yang sudah punya label_en tidak diubah)
UPDATE public.projects AS p
SET links = (
  SELECT jsonb_agg(
           CASE WHEN m.en IS NOT NULL AND NOT (g.item ? 'label_en') THEN g.item || jsonb_build_object('label_en', m.en) ELSE g.item END
           ORDER BY g.ord)
  FROM jsonb_array_elements(p.links) WITH ORDINALITY AS g(item, ord)
  LEFT JOIN (VALUES ($id$Konsol web (seller-integration)$id$, $en$Web console (seller-integration)$en$),
           ($id$Aplikasi mobile (ayambebekmobile)$id$, $en$Mobile app (ayambebekmobile)$en$)) AS m(id, en) ON m.id = g.item->>'label'
)
WHERE p.slug = $id$ayambebek$id$ AND jsonb_typeof(p.links) = 'array' AND jsonb_array_length(p.links) > 0;

-- Sistem Informasi Pengelolaan Data Produk Madura Mart
UPDATE public.projects SET title_en = $en$Madura Mart Product Data Management Information System$en$
WHERE slug = $id$sistem-informasi-pengelolaan-data-produk-madura-mart$id$ AND title = $id$Sistem Informasi Pengelolaan Data Produk Madura Mart$id$ AND title_en IS NULL;
UPDATE public.projects SET description_en = $en$A web-based information system for managing Madura Mart's product data, built during my internship at the Kediri Regency Communication and Informatics Office (Diskominfo).$en$
WHERE slug = $id$sistem-informasi-pengelolaan-data-produk-madura-mart$id$ AND description = $id$Sistem informasi berbasis web untuk mengelola data produk Madura Mart, dibuat saat magang di Diskominfo Kabupaten Kediri.$id$ AND description_en IS NULL;
UPDATE public.projects SET client_name_en = $en$Kediri Regency Communication and Informatics Office (Diskominfo)$en$
WHERE slug = $id$sistem-informasi-pengelolaan-data-produk-madura-mart$id$ AND client_name = $id$Dinas Komunikasi dan Informatika Kabupaten Kediri$id$ AND client_name_en IS NULL;
UPDATE public.projects SET my_role_en = $en$Web Developer intern$en$
WHERE slug = $id$sistem-informasi-pengelolaan-data-produk-madura-mart$id$ AND my_role = $id$Web Developer magang$id$ AND my_role_en IS NULL;
UPDATE public.projects SET problem_en = $en$Madura Mart's product records needed to move to a structured digital system.$en$
WHERE slug = $id$sistem-informasi-pengelolaan-data-produk-madura-mart$id$ AND problem = $id$Pendataan produk Madura Mart perlu dipindahkan ke sistem digital yang terstruktur.$id$ AND problem_en IS NULL;
UPDATE public.projects SET solution_en = $en$A web-based information system with Admin-only access for managing product data, and a responsive layout that makes entering and monitoring data easier.$en$
WHERE slug = $id$sistem-informasi-pengelolaan-data-produk-madura-mart$id$ AND solution = $id$Sistem informasi berbasis web dengan hak akses khusus Admin untuk mengelola data produk, serta tampilan responsif yang memudahkan input dan pemantauan data.$id$ AND solution_en IS NULL;

-- Website Portofolio Pribadi
UPDATE public.projects SET title_en = $en$Personal Portfolio Website$en$
WHERE slug = $id$website-portofolio-pribadi$id$ AND title = $id$Website Portofolio Pribadi$id$ AND title_en IS NULL;
UPDATE public.projects SET description_en = $en$A portfolio site with a private admin panel for managing all of its content, built with React, Vite, and Supabase.$en$
WHERE slug = $id$website-portofolio-pribadi$id$ AND description = $id$Situs portofolio dengan panel admin pribadi untuk mengelola seluruh isi, dibangun dengan React, Vite, dan Supabase.$id$ AND description_en IS NULL;
UPDATE public.projects SET my_role_en = $en$Designed and built it end to end$en$
WHERE slug = $id$website-portofolio-pribadi$id$ AND my_role = $id$Merancang dan mengembangkan seluruhnya$id$ AND my_role_en IS NULL;
UPDATE public.projects SET solution_en = $en$A portfolio site with an admin panel for managing all of its content, using Supabase authentication and database.$en$
WHERE slug = $id$website-portofolio-pribadi$id$ AND solution = $id$Situs portofolio dengan panel admin untuk mengelola seluruh isi, memakai autentikasi dan basis data Supabase.$id$ AND solution_en IS NULL;

-- ==============================================================================
-- 3. PENGALAMAN (dicocokkan lewat id + teks Indonesianya; JF Interior disembunyikan, tidak diterjemahkan)
-- ==============================================================================

-- Programmer Intern · CV Adisatya IT Consultant
UPDATE public.experiences SET role_en = $en$Programmer Intern$en$
WHERE id = '0bb89873-2bb2-480d-a377-c29d37bd0d3e' AND role = $id$Programmer Intern$id$ AND role_en IS NULL;
UPDATE public.experiences SET responsibilities_en = ARRAY[$en$Designed the UI/UX of the web console in Figma and built its frontend pages for the order packing system of the client AyamBebek Pakan dan Ternak.$en$, $en$Developed the monitoring dashboard and the feature that syncs shipping-label scan data from the mobile app to the server.$en$, $en$Helped develop the Flutter-based mobile app for operators together with the programming team.$en$]::TEXT[]
WHERE id = '0bb89873-2bb2-480d-a377-c29d37bd0d3e' AND responsibilities = ARRAY[$id$Merancang UI/UX konsol web di Figma dan membangun halaman frontend-nya untuk sistem pengemasan pesanan klien AyamBebek Pakan dan Ternak.$id$, $id$Mengembangkan dasbor pemantauan dan fitur sinkronisasi data pemindaian resi dari aplikasi mobile ke server.$id$, $id$Ikut mengembangkan aplikasi mobile operator berbasis Flutter bersama tim programmer.$id$]::TEXT[] AND cardinality(responsibilities_en) = 0;

-- Web Developer Intern · Dinas Komunikasi dan Informatika Kabupaten Kediri
UPDATE public.experiences SET role_en = $en$Web Developer Intern$en$
WHERE id = '56438a24-ae97-4007-989b-3c08e589f948' AND role = $id$Web Developer Intern$id$ AND role_en IS NULL;
UPDATE public.experiences SET company_en = $en$Kediri Regency Communication and Informatics Office (Diskominfo)$en$
WHERE id = '56438a24-ae97-4007-989b-3c08e589f948' AND company = $id$Dinas Komunikasi dan Informatika Kabupaten Kediri$id$ AND company_en IS NULL;
UPDATE public.experiences SET responsibilities_en = ARRAY[$en$Designed and developed a web-based information system for managing Madura Mart product data.$en$, $en$Built Admin-only access so that product data is managed securely and in a structured way.$en$, $en$Implemented a responsive layout to make data entry and monitoring easier.$en$]::TEXT[]
WHERE id = '56438a24-ae97-4007-989b-3c08e589f948' AND responsibilities = ARRAY[$id$Merancang dan mengembangkan sistem informasi pengelolaan data produk Madura Mart berbasis web.$id$, $id$Membangun hak akses khusus Admin agar pengelolaan data produk aman dan terstruktur.$id$, $id$Menerapkan tampilan responsif untuk memudahkan input dan pemantauan data.$id$]::TEXT[] AND cardinality(responsibilities_en) = 0;

-- ==============================================================================
-- 4. PENDIDIKAN
-- ==============================================================================

-- Politeknik Negeri Malang
UPDATE public.educations SET degree_en = $en$Associate Degree (D3)$en$
WHERE id = '950e0792-31fa-40d2-8c9d-74c5920f65af' AND degree = $id$Diploma III (D3)$id$ AND degree_en IS NULL;
UPDATE public.educations SET field_of_study_en = $en$Informatics Management$en$
WHERE id = '950e0792-31fa-40d2-8c9d-74c5920f65af' AND field_of_study = $id$Manajemen Informatika$id$ AND field_of_study_en IS NULL;
UPDATE public.educations SET thesis_title_en = $en$Barcode Scanning-Based Shipment Monitoring System for AyamBebek Pakan dan Ternak$en$
WHERE id = '950e0792-31fa-40d2-8c9d-74c5920f65af' AND thesis_title = $id$Sistem Monitoring Pengiriman Barang Berbasis Pemindaian Barcode Pada AyamBebek Pakan dan Ternak$id$ AND thesis_title_en IS NULL;

-- ==============================================================================
-- 5. SERTIFIKAT (4 nama sudah berbahasa Inggris: diisi teks yang sama)
-- ==============================================================================

-- Sertifikat Kompetensi Pemrograman Software Komputer
UPDATE public.certifications SET name_en = $en$Computer Software Programming Competency Certificate$en$
WHERE id = '63e8e888-b8ba-4c95-a763-6c4d7d316265' AND name = $id$Sertifikat Kompetensi Pemrograman Software Komputer$id$ AND name_en IS NULL;

-- Python Essentials
UPDATE public.certifications SET name_en = $en$Python Essentials$en$
WHERE id = '9a75018f-d154-4c55-8a1e-e0d1d08e8130' AND name = $id$Python Essentials$id$ AND name_en IS NULL;

-- MikroTik Certified Network Associate (MTCNA)
UPDATE public.certifications SET name_en = $en$MikroTik Certified Network Associate (MTCNA)$en$
WHERE id = '6b8d6212-7ac3-447d-9be6-bc10a767f80c' AND name = $id$MikroTik Certified Network Associate (MTCNA)$id$ AND name_en IS NULL;

-- Operating Systems Basics
UPDATE public.certifications SET name_en = $en$Operating Systems Basics$en$
WHERE id = '1c8c8a9a-593a-496b-be61-b68ef4eacb39' AND name = $id$Operating Systems Basics$id$ AND name_en IS NULL;

-- TOEIC
UPDATE public.certifications SET name_en = $en$TOEIC$en$
WHERE id = 'de86a9c1-6ced-439e-bfa5-cd895de5dabf' AND name = $id$TOEIC$id$ AND name_en IS NULL;

-- ==============================================================================
-- 6. BAHASA (tingkat kemampuan standar sudah diterjemahkan otomatis oleh situs)
-- ==============================================================================

-- Bahasa Inggris
UPDATE public.languages SET language_name_en = $en$English$en$
WHERE id = 'a4e0128f-2922-4355-a26a-30829ca5134f' AND language_name = $id$Bahasa Inggris$id$ AND language_name_en IS NULL;

-- Bahasa Indonesia
UPDATE public.languages SET language_name_en = $en$Indonesian$en$
WHERE id = 'abac3e1d-c058-4865-ab57-8247adc9bb8a' AND language_name = $id$Bahasa Indonesia$id$ AND language_name_en IS NULL;

-- ==============================================================================
-- 7. KEAHLIAN (hanya nama berbahasa Indonesia; nama teknologi tetap)
-- ==============================================================================
UPDATE public.skills SET name_en = $en$Communication$en$ WHERE id = 'c8fcfa2f-6586-412c-b4e5-a1fbfc77d829' AND name = $id$Komunikasi$id$ AND name_en IS NULL;
UPDATE public.skills SET name_en = $en$Discipline$en$ WHERE id = '8b3b7334-baa3-4c84-90dd-7e082307819c' AND name = $id$Kedisiplinan$id$ AND name_en IS NULL;
UPDATE public.skills SET name_en = $en$Teamwork$en$ WHERE id = 'd97dacd2-11b4-4ce5-8fb1-a261b039bc6a' AND name = $id$Kerja Tim$id$ AND name_en IS NULL;
UPDATE public.skills SET name_en = $en$Documentation$en$ WHERE id = '32bf9f49-079d-40c1-9d6c-018e460d5240' AND name = $id$Dokumentasi$id$ AND name_en IS NULL;
UPDATE public.skills SET name_en = $en$Barcode Scanner Integration$en$ WHERE id = '22ddac83-5cb8-472f-a368-7d32f163ab60' AND name = $id$Integrasi Scanner Barcode$id$ AND name_en IS NULL;
UPDATE public.skills SET name_en = $en$Operating System Installation$en$ WHERE id = '025f3fc7-42ba-4249-b323-a46e2c4de9f6' AND name = $id$Instalasi Sistem Operasi$id$ AND name_en IS NULL;
UPDATE public.skills SET name_en = $en$Computer Networking$en$ WHERE id = '4c895cb4-0db9-4e03-8a68-36cb943d1ac9' AND name = $id$Jaringan Komputer$id$ AND name_en IS NULL;

COMMIT;


-- ==============================================================================
-- CEK (hanya membaca, berjalan setelah COMMIT): setiap kolom yang diisi file ini. terisi = false
-- berarti baris itu dilewati karena teks Indonesianya sudah berubah (terjemahkan lewat admin),
-- atau migrasi belum dijalankan. Baris yang tidak muncul sama sekali sudah dihapus.
-- ==============================================================================
SELECT * FROM (
  SELECT 'profil' AS bagian, p.full_name AS baris, v.kolom, v.terisi
  FROM public.profiles AS p
  CROSS JOIN LATERAL (VALUES
    ('tagline_en', p.tagline_en IS NOT NULL),
    ('bio_en', p.bio_en IS NOT NULL),
    ('primary_role_en', p.primary_role_en IS NOT NULL),
    ('secondary_roles_en', cardinality(p.secondary_roles_en) > 0),
    ('hero_keywords_en', cardinality(p.hero_keywords_en) > 0),
    ('contact_topics_en', cardinality(p.contact_topics_en) > 0),
    ('hobbies_en', cardinality(p.hobbies_en) > 0)
  ) AS v(kolom, terisi)
  UNION ALL
  SELECT 'proyek', p.slug, v.kolom, v.terisi
  FROM public.projects AS p
  CROSS JOIN LATERAL (VALUES
    ('title_en', p.title_en IS NOT NULL),
    ('description_en', p.description_en IS NOT NULL),
    ('client_name_en', p.client_name_en IS NOT NULL),
    ('my_role_en', p.my_role_en IS NOT NULL),
    ('problem_en', p.problem_en IS NOT NULL),
    ('solution_en', p.solution_en IS NOT NULL),
    ('content_en', p.content_en IS NOT NULL),
    ('gallery.caption_en (5 gambar)', jsonb_array_length(p.gallery) = (SELECT count(*) FROM jsonb_array_elements(p.gallery) AS g(item) WHERE g.item ? 'caption_en')),
    ('links.label_en (1 tautan)', jsonb_array_length(p.links) = (SELECT count(*) FROM jsonb_array_elements(p.links) AS l(item) WHERE l.item ? 'label_en'))
  ) AS v(kolom, terisi)
  WHERE p.slug = 'aplikasi-arsip-surat'
  UNION ALL
  SELECT 'proyek', p.slug, v.kolom, v.terisi
  FROM public.projects AS p
  CROSS JOIN LATERAL (VALUES
    ('title_en', p.title_en IS NOT NULL),
    ('description_en', p.description_en IS NOT NULL),
    ('my_role_en', p.my_role_en IS NOT NULL),
    ('problem_en', p.problem_en IS NOT NULL),
    ('solution_en', p.solution_en IS NOT NULL),
    ('links.label_en (2 tautan)', jsonb_array_length(p.links) = (SELECT count(*) FROM jsonb_array_elements(p.links) AS l(item) WHERE l.item ? 'label_en'))
  ) AS v(kolom, terisi)
  WHERE p.slug = 'ayambebek'
  UNION ALL
  SELECT 'proyek', p.slug, v.kolom, v.terisi
  FROM public.projects AS p
  CROSS JOIN LATERAL (VALUES
    ('title_en', p.title_en IS NOT NULL),
    ('description_en', p.description_en IS NOT NULL),
    ('client_name_en', p.client_name_en IS NOT NULL),
    ('my_role_en', p.my_role_en IS NOT NULL),
    ('problem_en', p.problem_en IS NOT NULL),
    ('solution_en', p.solution_en IS NOT NULL)
  ) AS v(kolom, terisi)
  WHERE p.slug = 'sistem-informasi-pengelolaan-data-produk-madura-mart'
  UNION ALL
  SELECT 'proyek', p.slug, v.kolom, v.terisi
  FROM public.projects AS p
  CROSS JOIN LATERAL (VALUES
    ('title_en', p.title_en IS NOT NULL),
    ('description_en', p.description_en IS NOT NULL),
    ('my_role_en', p.my_role_en IS NOT NULL),
    ('solution_en', p.solution_en IS NOT NULL)
  ) AS v(kolom, terisi)
  WHERE p.slug = 'website-portofolio-pribadi'
  UNION ALL
  SELECT 'pengalaman', t.role || ' · ' || t.company, v.kolom, v.terisi
  FROM public.experiences AS t
  CROSS JOIN LATERAL (VALUES
    ('role_en', t.role_en IS NOT NULL),
    ('responsibilities_en', cardinality(t.responsibilities_en) > 0)
  ) AS v(kolom, terisi)
  WHERE t.id = '0bb89873-2bb2-480d-a377-c29d37bd0d3e'
  UNION ALL
  SELECT 'pengalaman', t.role || ' · ' || t.company, v.kolom, v.terisi
  FROM public.experiences AS t
  CROSS JOIN LATERAL (VALUES
    ('role_en', t.role_en IS NOT NULL),
    ('company_en', t.company_en IS NOT NULL),
    ('responsibilities_en', cardinality(t.responsibilities_en) > 0)
  ) AS v(kolom, terisi)
  WHERE t.id = '56438a24-ae97-4007-989b-3c08e589f948'
  UNION ALL
  SELECT 'pendidikan', t.institution, v.kolom, v.terisi
  FROM public.educations AS t
  CROSS JOIN LATERAL (VALUES
    ('degree_en', t.degree_en IS NOT NULL),
    ('field_of_study_en', t.field_of_study_en IS NOT NULL),
    ('thesis_title_en', t.thesis_title_en IS NOT NULL)
  ) AS v(kolom, terisi)
  WHERE t.id = '950e0792-31fa-40d2-8c9d-74c5920f65af'
  UNION ALL
  SELECT 'sertifikat', t.name, v.kolom, v.terisi
  FROM public.certifications AS t
  CROSS JOIN LATERAL (VALUES
    ('name_en', t.name_en IS NOT NULL)
  ) AS v(kolom, terisi)
  WHERE t.id = '63e8e888-b8ba-4c95-a763-6c4d7d316265'
  UNION ALL
  SELECT 'sertifikat', t.name, v.kolom, v.terisi
  FROM public.certifications AS t
  CROSS JOIN LATERAL (VALUES
    ('name_en', t.name_en IS NOT NULL)
  ) AS v(kolom, terisi)
  WHERE t.id = '9a75018f-d154-4c55-8a1e-e0d1d08e8130'
  UNION ALL
  SELECT 'sertifikat', t.name, v.kolom, v.terisi
  FROM public.certifications AS t
  CROSS JOIN LATERAL (VALUES
    ('name_en', t.name_en IS NOT NULL)
  ) AS v(kolom, terisi)
  WHERE t.id = '6b8d6212-7ac3-447d-9be6-bc10a767f80c'
  UNION ALL
  SELECT 'sertifikat', t.name, v.kolom, v.terisi
  FROM public.certifications AS t
  CROSS JOIN LATERAL (VALUES
    ('name_en', t.name_en IS NOT NULL)
  ) AS v(kolom, terisi)
  WHERE t.id = '1c8c8a9a-593a-496b-be61-b68ef4eacb39'
  UNION ALL
  SELECT 'sertifikat', t.name, v.kolom, v.terisi
  FROM public.certifications AS t
  CROSS JOIN LATERAL (VALUES
    ('name_en', t.name_en IS NOT NULL)
  ) AS v(kolom, terisi)
  WHERE t.id = 'de86a9c1-6ced-439e-bfa5-cd895de5dabf'
  UNION ALL
  SELECT 'bahasa', t.language_name, v.kolom, v.terisi
  FROM public.languages AS t
  CROSS JOIN LATERAL (VALUES
    ('language_name_en', t.language_name_en IS NOT NULL)
  ) AS v(kolom, terisi)
  WHERE t.id = 'a4e0128f-2922-4355-a26a-30829ca5134f'
  UNION ALL
  SELECT 'bahasa', t.language_name, v.kolom, v.terisi
  FROM public.languages AS t
  CROSS JOIN LATERAL (VALUES
    ('language_name_en', t.language_name_en IS NOT NULL)
  ) AS v(kolom, terisi)
  WHERE t.id = 'abac3e1d-c058-4865-ab57-8247adc9bb8a'
  UNION ALL
  SELECT 'keahlian', t.name, 'name_en', t.name_en IS NOT NULL
  FROM public.skills AS t
  WHERE t.name IN ('Komunikasi', 'Kedisiplinan', 'Kerja Tim', 'Dokumentasi', 'Integrasi Scanner Barcode', 'Instalasi Sistem Operasi', 'Jaringan Komputer')
) AS cek
ORDER BY bagian, baris, kolom;
