-- ==============================================================================
-- Seed: proyek baru Mobile Absensi MTs Sunan Gunung Jati (bukan migrasi)
-- Tanggal: 2026-11-06
-- Sumber: repositori https://github.com/Aldidwiirawan/Mobile-Absensi-Siswa-Mts-Suguja
-- Jalankan di Supabase SQL Editor SETELAH semua migrasi, termasuk 20261018000000_project_links.sql,
-- 20261019000000_english_content.sql, dan 20261030000000_redesign_monokrom.sql.
--
-- Isinya
-- 1. Urutan: proyek ini ditaruh tepat setelah SIM Absensi (dasbor admin); proyek di bawahnya
--    turun satu urutan. Bila SIM Absensi tidak ada, proyek ini ditaruh paling akhir.
-- 2. Proyek baru "Mobile Absensi MTs Suguja: Aplikasi Guru dan Wali Murid" (slug mobile-absensi-mts-suguja): unggulan, tampil, status selesai, jenis mobile,
--    teks ID dan EN, 6 fitur, sampul, 5 gambar galeri, dan tautan kode GitHub (publik).
--    github_url, demo_url, dan repo privat diisi sama seperti saat menyimpan di admin.
--
-- Teksnya sama dengan PROJECT_OVERRIDES['mobile-absensi-mts-suguja'] di src/data/projectDataOverrides.js.
--
-- Aman dijalankan ulang: bila slug, judul yang mirip, atau tautan repo yang sama sudah ada, urutan
-- tidak digeser dan tidak ada baris baru. Satu transaksi: bila satu perintah gagal, tidak ada yang
-- berubah. Query setelah COMMIT menampilkan semua proyek menurut urutan tampil.
-- ==============================================================================

BEGIN;

-- 1. Geser proyek setelah SIM Absensi satu urutan ke bawah (hanya saat proyek belum ada)
UPDATE public.projects
SET sort_order = sort_order + 1
WHERE sort_order > COALESCE(
    (SELECT d.sort_order FROM public.projects AS d WHERE d.slug = 'sim-absensi-mts-suguja' LIMIT 1),
    (SELECT max(m.sort_order) FROM public.projects AS m)
  )
  AND NOT EXISTS (
  SELECT 1
  FROM public.projects AS p
  WHERE p.slug = 'mobile-absensi-mts-suguja'
    OR lower(p.title) LIKE '%mobile%absensi%suguja%'
    OR lower(rtrim(btrim(p.github_url), '/')) = 'https://github.com/aldidwiirawan/mobile-absensi-siswa-mts-suguja'
    OR EXISTS (
      SELECT 1
      FROM jsonb_array_elements(p.links) AS l (item)
      WHERE lower(rtrim(btrim(l.item ->> 'url'), '/')) = 'https://github.com/aldidwiirawan/mobile-absensi-siswa-mts-suguja'
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
  'Mobile Absensi MTs Suguja: Aplikasi Guru dan Wali Murid',
  'MTs Suguja Attendance Mobile: Teacher and Parent App',
  'mobile-absensi-mts-suguja',
  'Aplikasi mobile Flutter (Android dan iOS) untuk presensi MTs Sunan Gunung Jati dengan tiga peran dalam satu aplikasi: petugas gerbang memindai kartu QR siswa, guru dan wali kelas memantau kehadiran per kelas dan menyetujui surat izin atau sakit, serta wali murid melihat status kehadiran anaknya dan mengajukan surat dari HP. Notifikasi dikirim lewat OneSignal, dan datanya satu basis data Supabase dengan dasbor admin sekolah.',
  'A Flutter mobile app (Android and iOS) for attendance at MTs Sunan Gunung Jati with three roles in one app: gate staff scan student QR cards, teachers and homeroom teachers follow attendance per class and approve sick or leave letters, and parents check their child''s attendance and submit letters from their phone. Notifications go out through OneSignal, and the app shares one Supabase database with the school''s admin dashboard.',
  'completed', 2025, 'mobile',
  'MTs Sunan Gunung Jati (Suguja)',
  'MTs Sunan Gunung Jati (Suguja)',
  'Anggota Tim Proyek SIM Absensi (tim 5 mahasiswa): kode aplikasi mobile ini ditulis rekan satu tim. Saya mengerjakan dasbor admin web yang memakai basis data Supabase yang sama (halaman Data Guru dan Data Absensi), serta ikut menyusun kebutuhan dan menguji alur aplikasi mobile.',
  'SIM Absensi Project Team Member (5-student team): the code of this mobile app was written by my teammates. I built parts of the web admin dashboard that uses the same Supabase database (the Teacher Data and Attendance Data pages), and helped define the requirements and test the mobile app''s flows.',
  'Sistem presensi MTs Sunan Gunung Jati (Suguja) terdiri dari dua aplikasi yang memakai satu basis data Supabase: dasbor admin untuk mengelola data sekolah, dan aplikasi mobile ini untuk orang-orang yang setiap hari terlibat langsung dengan kehadiran siswa, yaitu petugas di gerbang, guru dan wali kelas, serta orang tua. Pengembangannya dimulai Oktober 2025 oleh tim 5 mahasiswa.',
  'The attendance system of MTs Sunan Gunung Jati (Suguja) is made of two apps sharing one Supabase database: an admin dashboard to manage school data, and this mobile app for the people who deal with student attendance every day: gate staff, teachers and homeroom teachers, and parents. A team of 5 students started building it in October 2025.',
  'Presensi dicatat manual di lembar kertas per kelas, sehingga guru baru tahu siapa yang terlambat atau tidak hadir setelah lembar itu dihitung. Orang tua tidak segera tahu apakah anaknya sudah sampai di sekolah. Surat izin dan sakit dititipkan dalam bentuk kertas, mudah tercecer, dan status kehadirannya harus diubah satu per satu. Guru juga tidak selalu berada di depan komputer untuk membuka dasbor sekolah.',
  'Attendance was written by hand on a paper sheet per class, so teachers only knew who was late or absent after the sheet was counted. Parents did not find out quickly whether their child had reached school. Sick and leave letters were handed over on paper, got lost easily, and the attendance status had to be changed one student at a time. Teachers were also not always at a computer to open the school dashboard.',
  'Satu aplikasi Flutter yang memilih tampilan sesuai peran saat login. Petugas gerbang memakai pemindai QR kontinu: kartu siswa cukup didekatkan ke kamera, status Hadir atau Terlambat ditentukan dari jam masuk kelas, dan pindaian kedua dicatat sebagai pulang. Guru masuk dengan email dan melihat ringkasan kelas yang diampu, daftar presensi per kelas, form koreksi status dengan catatan, dan halaman persetujuan surat yang otomatis memperbarui presensi. Wali murid masuk cukup dengan NIS anak, bisa menambah lebih dari satu anak, lalu melihat status hari ini, rekap dan grafik bulanan, pengumuman sekolah, dan mengajukan surat dengan foto lampiran. Notifikasi presensi dan status surat dikirim lewat OneSignal melalui Supabase Edge Function.',
  'One Flutter app that picks its screens by role at login. Gate staff use a continuous QR scanner: students hold their card up to the camera, Present or Late is set from the class check-in time, and a second scan records check-out. Teachers sign in with email and see a summary of the classes they teach, the attendance list per class, a status correction form with notes, and a letter approval page that updates attendance automatically. Parents sign in with just their child''s student ID (NIS), can add more than one child, and then see today''s status, the monthly recap and chart, school announcements, and submit letters with a photo attachment. Attendance and letter notifications are sent through OneSignal via a Supabase Edge Function.',
  ARRAY[
    'Pemindai QR kontinu untuk petugas gerbang: tanpa berhenti di tiap siswa, jeda per NIS agar tidak tercatat ganda, status Hadir, Terlambat, atau Pulang otomatis, animasi laser, getar, senter, dan ganti kamera',
    'Dasbor guru: persentase kehadiran hari ini, ringkasan per kelas yang diampu (hadir, telat, sakit, izin, alfa), penanda surat yang menunggu, dan pembaruan otomatis',
    'Daftar presensi per kelas dengan pencarian dan filter status, serta koreksi status manual lewat tombol cepat dan catatan guru',
    'Persetujuan surat izin dan sakit: tab Menunggu, Disetujui, Ditolak, dan Semua, foto lampiran yang bisa diperbesar, catatan untuk orang tua, dan presensi yang ikut diperbarui',
    'Portal wali murid dengan login NIS: beberapa anak dalam satu akun, kartu status hari ini (jam masuk dan pulang), rekap dan grafik kehadiran bulanan, serta tombol WhatsApp ke wali kelas',
    'Pengajuan surat dari HP dengan rentang tanggal dan foto yang dikompres sebelum diunggah (wajib untuk surat sakit), pengumuman sekolah per kelas, dan notifikasi OneSignal'
  ]::TEXT[],
  ARRAY[
    'Continuous QR scanner for gate staff: no stopping per student, a per-NIS cooldown against double entries, automatic Present, Late, or Check-out status, laser animation, vibration, flashlight, and camera switch',
    'Teacher dashboard: today''s attendance rate, a summary per class taught (present, late, sick, leave, unexcused), a badge for pending letters, and automatic refresh',
    'Attendance list per class with search and status filters, plus manual status correction with quick buttons and teacher notes',
    'Sick and leave letter approval: Pending, Approved, Rejected, and All tabs, zoomable photo attachments, a note for parents, and attendance updated along with it',
    'Parent portal with NIS login: several children in one account, today''s status card (check-in and check-out time), monthly attendance recap and chart, and a WhatsApp button to the homeroom teacher',
    'Letter submission from the phone with a date range and a photo compressed before upload (required for sick letters), school announcements per class, and OneSignal notifications'
  ]::TEXT[],
  'Satu aplikasi melayani tiga peran sekaligus, dan semua yang dicatat di HP langsung tampil di dasbor admin karena keduanya memakai basis data Supabase yang sama. Kehadiran tercatat saat siswa memindai kartu di gerbang, orang tua bisa memantau dan mengajukan surat tanpa datang ke sekolah, dan guru menyetujui surat langsung dari HP. Kodenya disusun per fitur (core, data, features), dan build Android memakai R8 untuk memperkecil ukuran APK. Tangkapan layar di galeri memakai data contoh, bukan data siswa asli.',
  'One app serves all three roles, and everything recorded on a phone shows up on the admin dashboard right away because both use the same Supabase database. Attendance is recorded when students scan their card at the gate, parents can follow attendance and submit letters without coming to school, and teachers approve letters straight from their phone. The code is organised by feature (core, data, features), and the Android build uses R8 to shrink the APK. The gallery screenshots use sample data, not real student records.',
  ARRAY[
    'Flutter',
    'Dart',
    'Supabase',
    'PostgreSQL',
    'OneSignal',
    'Supabase Edge Functions'
  ]::TEXT[],
  '[
    {
      "label": "Kode sumber (GitHub)",
      "label_en": "Source code (GitHub)",
      "type": "code",
      "url": "https://github.com/Aldidwiirawan/Mobile-Absensi-Siswa-Mts-Suguja",
      "is_private": false
    }
  ]'::JSONB,
  'https://github.com/Aldidwiirawan/Mobile-Absensi-Siswa-Mts-Suguja', NULL, false,
  '/projects/mobile-absensi-mts-cover.webp',
  '[
    {
      "url": "/projects/raw/mobileabsensi_dashboard_guru.webp",
      "caption": "Dashboard Guru: Persentase kehadiran hari ini, penanda surat yang menunggu persetujuan, dan ringkasan tiap kelas yang diampu.",
      "caption_en": "Teacher Dashboard: Today''s attendance rate, a badge for letters awaiting approval, and a summary of every class taught.",
      "kind": "gallery",
      "device": "mobile"
    },
    {
      "url": "/projects/raw/mobileabsensi_scanner_qr.webp",
      "caption": "Pemindai Presensi QR: Kartu pelajar dipindai di gerbang dan status Hadir Tepat Waktu langsung muncul tanpa menutup kamera.",
      "caption_en": "QR Attendance Scanner: A student card is scanned at the gate and the On Time status appears without closing the camera.",
      "kind": "gallery",
      "device": "mobile"
    },
    {
      "url": "/projects/raw/mobileabsensi_presensi_kelas.webp",
      "caption": "Presensi Kelas: Daftar siswa dengan jam masuk, filter status, penanda surat, dan tombol koreksi status per siswa.",
      "caption_en": "Class Attendance: Student list with check-in times, status filters, letter markers, and a correction button per student.",
      "kind": "gallery",
      "device": "mobile"
    },
    {
      "url": "/projects/raw/mobileabsensi_persetujuan_surat.webp",
      "caption": "Persetujuan Izin / Sakit: Surat dari wali murid dengan foto lampiran yang bisa diperbesar, lalu disetujui atau ditolak guru.",
      "caption_en": "Leave / Sick Approval: Letters from parents with a zoomable photo attachment, approved or rejected by the teacher.",
      "kind": "gallery",
      "device": "mobile"
    },
    {
      "url": "/projects/raw/mobileabsensi_wali_murid.webp",
      "caption": "Portal Wali Murid: Status kehadiran anak hari ini, jam masuk dan pulang, pengajuan surat, pengumuman, dan kontak wali kelas.",
      "caption_en": "Parent Portal: The child''s attendance today, check-in and check-out time, letter submission, announcements, and the homeroom teacher''s contact.",
      "kind": "gallery",
      "device": "mobile"
    }
  ]'::JSONB,
  true,
  COALESCE(COALESCE(
    (SELECT d.sort_order FROM public.projects AS d WHERE d.slug = 'sim-absensi-mts-suguja' LIMIT 1),
    (SELECT max(m.sort_order) FROM public.projects AS m)
  ), -1) + 1,
  true
WHERE NOT EXISTS (
  SELECT 1
  FROM public.projects AS p
  WHERE p.slug = 'mobile-absensi-mts-suguja'
    OR lower(p.title) LIKE '%mobile%absensi%suguja%'
    OR lower(rtrim(btrim(p.github_url), '/')) = 'https://github.com/aldidwiirawan/mobile-absensi-siswa-mts-suguja'
    OR EXISTS (
      SELECT 1
      FROM jsonb_array_elements(p.links) AS l (item)
      WHERE lower(rtrim(btrim(l.item ->> 'url'), '/')) = 'https://github.com/aldidwiirawan/mobile-absensi-siswa-mts-suguja'
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
