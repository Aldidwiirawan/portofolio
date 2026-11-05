-- ==============================================================================
-- Seed: proyek baru SIM Absensi MTs Sunan Gunung Jati (bukan migrasi)
-- Tanggal: 2026-11-06
-- Sumber: repositori https://github.com/Aldidwiirawan/SIM-Dasbor-Absensi-Mts-Suguja
-- Jalankan di Supabase SQL Editor SETELAH semua migrasi, termasuk 20261018000000_project_links.sql,
-- 20261019000000_english_content.sql, dan 20261030000000_redesign_monokrom.sql.
--
-- Isinya
-- 1. Urutan: proyek ini ditaruh tepat setelah Dwijaya Coffee; proyek di bawahnya turun satu
--    urutan. Bila Dwijaya Coffee tidak ada, proyek ini ditaruh paling akhir.
-- 2. Proyek baru "SIM Absensi MTs Suguja: Dasbor Admin Sekolah" (slug sim-absensi-mts-suguja): unggulan, tampil, status selesai, jenis web,
--    teks ID dan EN, 6 fitur, sampul, 5 gambar galeri, dan tautan kode GitHub (publik).
--    github_url, demo_url, dan repo privat diisi sama seperti saat menyimpan di admin.
--
-- Teksnya sama dengan PROJECT_OVERRIDES['sim-absensi-mts-suguja'] di src/data/projectDataOverrides.js.
--
-- Aman dijalankan ulang: bila slug, judul yang mirip, atau tautan repo yang sama sudah ada, urutan
-- tidak digeser dan tidak ada baris baru. Satu transaksi: bila satu perintah gagal, tidak ada yang
-- berubah. Query setelah COMMIT menampilkan semua proyek menurut urutan tampil.
-- ==============================================================================

BEGIN;

-- 1. Geser proyek setelah Dwijaya Coffee satu urutan ke bawah (hanya saat proyek belum ada)
UPDATE public.projects
SET sort_order = sort_order + 1
WHERE sort_order > COALESCE(
    (SELECT d.sort_order FROM public.projects AS d WHERE d.slug = 'dwijaya-coffee' LIMIT 1),
    (SELECT max(m.sort_order) FROM public.projects AS m)
  )
  AND NOT EXISTS (
  SELECT 1
  FROM public.projects AS p
  WHERE p.slug = 'sim-absensi-mts-suguja'
    OR lower(p.title) LIKE '%absensi%suguja%'
    OR lower(rtrim(btrim(p.github_url), '/')) = 'https://github.com/aldidwiirawan/sim-dasbor-absensi-mts-suguja'
    OR EXISTS (
      SELECT 1
      FROM jsonb_array_elements(p.links) AS l (item)
      WHERE lower(rtrim(btrim(l.item ->> 'url'), '/')) = 'https://github.com/aldidwiirawan/sim-dasbor-absensi-mts-suguja'
    )
);

-- 2. Proyek baru
INSERT INTO public.projects (
  title, title_en, slug, description, description_en, status, year, project_type,
  client_name, client_name_en, my_role, my_role_en, background, background_en, problem, problem_en,
  solution, solution_en, features, features_en, outcome, outcome_en, tech_stack, links,
  github_url, demo_url, is_repo_private, thumbnail_url, gallery, is_featured, sort_order, is_visible
)
SELECT
  'SIM Absensi MTs Suguja: Dasbor Admin Sekolah',
  'MTs Suguja Attendance System: School Admin Dashboard',
  'sim-absensi-mts-suguja',
  'Dasbor admin berbasis Flutter (web dan desktop) untuk MTs Sunan Gunung Jati: pengelolaan data guru, kelas, dan siswa, rekap presensi harian dan bulanan, verifikasi surat izin dan sakit dari wali murid, kartu QR presensi siswa, serta pengumuman ke HP wali murid lewat OneSignal Push dan WhatsApp. Terhubung dengan aplikasi mobile guru dan orang tua melalui satu basis data Supabase.',
  'A Flutter admin dashboard (web and desktop) for MTs Sunan Gunung Jati: teacher, class, and student records, daily and monthly attendance recaps, review of sick and leave letters sent by parents, student QR attendance cards, and announcements to parents'' phones via OneSignal Push and WhatsApp. It shares one Supabase database with the teacher and parent mobile app.',
  'completed', 2025, 'web',
  'MTs Sunan Gunung Jati (Suguja)',
  'MTs Sunan Gunung Jati (Suguja)',
  'Anggota Tim Pengembang (tim 5 mahasiswa): membangun halaman Data Guru (tabel guru dengan avatar, form tambah dan edit, serta dialog hapus) dan halaman Data Absensi (daftar presensi, form koreksi status kehadiran, tanggal, waktu masuk dan pulang, serta keterangan) yang membaca dan menulis langsung ke Supabase, lengkap dengan pesan berhasil atau gagal dan tampilan saat data kosong.',
  'Development Team Member (5-student team): built the Teacher Data page (teacher table with avatars, add and edit forms, delete dialog) and the Attendance Data page (attendance list, correction form for attendance status, date, check-in and check-out time, and notes) that read and write directly to Supabase, with success and error messages and an empty state.',
  'MTs Sunan Gunung Jati (Suguja) membutuhkan presensi digital yang menghubungkan sekolah, guru, dan wali murid. Proyek ini dikerjakan tim 5 mahasiswa mulai Oktober 2025 sebagai bagian dari dua aplikasi yang saling terhubung: aplikasi mobile untuk guru (memindai QR presensi siswa) dan orang tua (mengajukan surat izin), serta dasbor admin ini sebagai pusat pengelolaan data sekolah. Keduanya memakai satu basis data Supabase.',
  'MTs Sunan Gunung Jati (Suguja) needed digital attendance that connects the school, its teachers, and parents. A team of 5 students built it starting in October 2025 as two connected apps: a mobile app for teachers (scanning student QR codes) and parents (submitting leave letters), and this admin dashboard as the school''s data hub. Both share one Supabase database.',
  'Presensi siswa dicatat di lembar kertas per kelas, sehingga rekap harian dan bulanan harus dihitung manual dan sulit dipantau lintas kelas. Surat izin dan sakit datang dalam bentuk kertas yang mudah tercecer dan tidak langsung masuk ke rekap kehadiran. Wali murid juga tidak segera tahu bila anaknya terlambat atau tidak hadir, dan pengumuman sekolah masih disebar satu per satu lewat grup chat.',
  'Attendance was recorded on paper sheets per class, so daily and monthly recaps were counted by hand and hard to follow across classes. Sick and leave letters arrived on paper, got lost easily, and never reached the attendance recap directly. Parents did not find out quickly when their child was late or absent, and school announcements were still passed around one chat group at a time.',
  'Dasbor admin Flutter yang berjalan di browser dan desktop Windows, terhubung ke Supabase (PostgreSQL, Auth, Storage, Realtime). Admin mengelola data guru, kelas (wali kelas, jam masuk dan pulang), dan siswa (aktif, lulus, pindah) dengan impor Excel dan kenaikan kelas massal. Presensi yang dikirim guru dari aplikasi mobile langsung muncul di dasbor, bisa dikoreksi admin, dan direkap per hari, per bulan, dan per semester. Surat izin dan sakit dari wali murid diperiksa di satu halaman dan bisa dicadangkan ke ZIP. Halaman Notifikasi mengirim pengumuman ke semua wali murid, per kelas, atau per siswa lewat OneSignal Push, WhatsApp, atau keduanya.',
  'A Flutter admin dashboard that runs in the browser and on Windows desktop, backed by Supabase (PostgreSQL, Auth, Storage, Realtime). Admins manage teachers, classes (homeroom teacher, check-in and check-out times), and students (active, graduated, transferred), with Excel import and bulk class promotion. Attendance sent by teachers from the mobile app shows up on the dashboard right away, can be corrected by the admin, and is recapped per day, month, and semester. Sick and leave letters from parents are reviewed on one page and can be backed up to a ZIP file. The Notifications page sends announcements to all parents, one class, or one student via OneSignal Push, WhatsApp, or both.',
  ARRAY[
    'Dasbor ringkasan yang diperbarui otomatis: kehadiran hari ini, terlambat, absen (sakit, izin, alfa), total siswa aktif, rekap semester, grafik kehadiran, dan distribusi per kelas',
    'Data guru, kelas, dan siswa: wali kelas, jam masuk dan pulang per kelas, status siswa (aktif, lulus, pindah), impor Excel, dan kenaikan kelas massal',
    'Presensi harian dan rekap bulanan dengan filter tanggal dan kelas, koreksi status oleh admin (waktu masuk, waktu pulang, keterangan, pencatat perubahan), serta ekspor Excel, CSV, dan PDF',
    'Kartu QR presensi per siswa yang dicetak per kelas ke PDF, untuk dipindai guru lewat aplikasi mobile',
    'Pemeriksaan surat izin dan sakit dari wali murid dengan pratinjau lampiran, filter jenis dan tanggal, serta cadangan ZIP',
    'Pusat notifikasi: pengumuman ke semua wali murid, per kelas, atau per siswa lewat OneSignal Push, WhatsApp, atau keduanya, dengan template pesan, riwayat kiriman, dan uji koneksi gateway'
  ]::TEXT[],
  ARRAY[
    'Self-updating summary dashboard: today''s attendance, late arrivals, absences (sick, leave, unexcused), active students, semester recap, attendance chart, and per-class distribution',
    'Teacher, class, and student records: homeroom teachers, check-in and check-out times per class, student status (active, graduated, transferred), Excel import, and bulk class promotion',
    'Daily attendance and monthly recap with date and class filters, admin corrections (check-in, check-out, notes, who changed it), and Excel, CSV, and PDF export',
    'QR attendance card for every student, printed per class to PDF, for teachers to scan with the mobile app',
    'Review of sick and leave letters from parents with attachment preview, type and date filters, and ZIP backup',
    'Notification center: announcements to all parents, one class, or one student via OneSignal Push, WhatsApp, or both, with message templates, send history, and a gateway connection test'
  ]::TEXT[],
  'Dasbor berjalan di browser dan desktop Windows dengan data 77 siswa aktif di 8 rombel kelas (7A sampai 9C) beserta guru dan wali kelasnya. Presensi dari aplikasi guru langsung terekap tanpa hitung manual, surat izin dan sakit tercatat bersama data kehadiran, dan sekolah punya jalur pengumuman langsung ke HP wali murid. Kodenya disusun berlapis (core, data, logic, presentation) dengan cache stale-while-revalidate untuk data master, serta dilengkapi unit test dan widget test.',
  'The dashboard runs in the browser and on Windows desktop with 77 active students in 8 class groups (7A to 9C), along with their teachers and homeroom teachers. Attendance from the teacher app is recapped without manual counting, sick and leave letters sit next to the attendance data, and the school has a direct announcement channel to parents'' phones. The code is layered (core, data, logic, presentation) with a stale-while-revalidate cache for master data, plus unit and widget tests.',
  ARRAY[
    'Flutter',
    'Dart',
    'Supabase',
    'PostgreSQL',
    'OneSignal',
    'WhatsApp API (WAHA)'
  ]::TEXT[],
  '[
    {
      "label": "Kode sumber (GitHub)",
      "label_en": "Source code (GitHub)",
      "type": "code",
      "url": "https://github.com/Aldidwiirawan/SIM-Dasbor-Absensi-Mts-Suguja",
      "is_private": false
    }
  ]'::JSONB,
  'https://github.com/Aldidwiirawan/SIM-Dasbor-Absensi-Mts-Suguja', NULL, false,
  '/projects/sim-absensi-mts-cover.webp',
  '[
    {
      "url": "/projects/raw/simabsensi_dashboard.webp",
      "caption": "Dashboard Admin: Ringkasan kehadiran hari ini, rekap semester, grafik statistik kehadiran, dan distribusi siswa per kelas.",
      "caption_en": "Admin Dashboard: Today''s attendance summary, semester recap, attendance chart, and student distribution per class.",
      "kind": "gallery",
      "device": "web"
    },
    {
      "url": "/projects/raw/simabsensi_data_siswa.webp",
      "caption": "Data Siswa: Filter kelas, nama, dan status, dengan tombol impor Excel, kenaikan kelas massal, dan cetak QR Code per kelas.",
      "caption_en": "Student Data: Class, name, and status filters, with Excel import, bulk class promotion, and per-class QR code printing.",
      "kind": "gallery",
      "device": "web"
    },
    {
      "url": "/projects/raw/simabsensi_notifikasi.webp",
      "caption": "Pusat Notifikasi: Kirim pengumuman ke semua wali murid, per kelas, atau per siswa lewat OneSignal Push, WhatsApp, atau keduanya.",
      "caption_en": "Notification Center: Send announcements to all parents, one class, or one student via OneSignal Push, WhatsApp, or both.",
      "kind": "gallery",
      "device": "web"
    },
    {
      "url": "/projects/raw/simabsensi_surat.webp",
      "caption": "Data Surat Siswa: Arsip surat izin dan sakit dari wali murid dengan filter jenis dan tanggal, pratinjau lampiran, dan cadangan ZIP.",
      "caption_en": "Student Letters: Archive of sick and leave letters from parents with type and date filters, attachment preview, and ZIP backup.",
      "kind": "gallery",
      "device": "web"
    },
    {
      "url": "/projects/raw/simabsensi_data_kelas.webp",
      "caption": "Data Kelas: Daftar rombel dengan wali kelas serta jam masuk dan jam pulang masing-masing kelas.",
      "caption_en": "Class Data: Class groups with their homeroom teacher and check-in and check-out times.",
      "kind": "gallery",
      "device": "web"
    }
  ]'::JSONB,
  true,
  COALESCE(COALESCE(
    (SELECT d.sort_order FROM public.projects AS d WHERE d.slug = 'dwijaya-coffee' LIMIT 1),
    (SELECT max(m.sort_order) FROM public.projects AS m)
  ), -1) + 1,
  true
WHERE NOT EXISTS (
  SELECT 1
  FROM public.projects AS p
  WHERE p.slug = 'sim-absensi-mts-suguja'
    OR lower(p.title) LIKE '%absensi%suguja%'
    OR lower(rtrim(btrim(p.github_url), '/')) = 'https://github.com/aldidwiirawan/sim-dasbor-absensi-mts-suguja'
    OR EXISTS (
      SELECT 1
      FROM jsonb_array_elements(p.links) AS l (item)
      WHERE lower(rtrim(btrim(l.item ->> 'url'), '/')) = 'https://github.com/aldidwiirawan/sim-dasbor-absensi-mts-suguja'
    )
);

COMMIT;


-- ==============================================================================
-- CEK (hanya membaca, berjalan setelah COMMIT): semua proyek menurut urutan tampil.
-- urutan dimulai dari 1 (= sort_order + 1).
-- ==============================================================================
SELECT p.sort_order + 1 AS urutan, p.slug, p.title AS judul, p.status, p.is_featured AS unggulan,
  p.is_visible AS tampil, jsonb_array_length(p.gallery) AS jumlah_galeri,
  jsonb_array_length(p.links) AS jumlah_tautan, p.github_url, p.is_repo_private AS repo_privat
FROM public.projects AS p
ORDER BY p.sort_order, p.created_at DESC;
