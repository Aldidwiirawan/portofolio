-- ==============================================================================
-- Seed: pengalaman tambahan untuk garis waktu "Perjalanan saya" (bukan migrasi)
-- Tanggal: 2026-10-30
-- Jalankan di Supabase SQL Editor SETELAH semua migrasi (butuh kolom _en dari
-- 20261019000000_english_content.sql). Tidak bergantung pada 20261030000000_redesign_monokrom.sql.
--
-- Isinya
-- 1. Siswa PKL, Teknisi CCTV di BM Multimedia, Kediri: Oktober 2021 sampai Maret 2022, PKL dari
--    SMK PGRI 1 Kota Kediri jurusan TKJ. Belum ada di database, jadi baris baru dibuat.
-- 2. Admin di JF Interior, Sidoarjo: April sampai Juni 2023, sebelum kuliah. Barisnya sudah ada
--    (tersembunyi, jabatan "Interior", Feb–Mei 2023), jadi baris itu yang diperbarui dan ditampilkan.
--
-- Kolom yang dipakai (tabel experiences)
-- - company (instansi), role / role_en (posisi), experience_type ('Magang' atau 'Kerja', sama
--   dengan pilihan di admin), location (kota).
-- - start_date / end_date (DATE, tanggal 1 bulan itu, seperti yang ditulis form admin),
--   is_current (false).
-- - description / description_en (ringkasan), responsibilities / responsibilities_en (poin tugas,
--   TEXT[] maks. 5; item ke-n EN = terjemahan item ke-n ID), skill_tags (tag, TEXT[] maks. 12).
-- - is_visible (true). Untuk baris baru: is_featured false dan sort_order setelah yang terakhir.
--   Baris yang sudah ada tetap memakai company, is_featured, sort_order, logo, foto, dan proyek
--   terkaitnya sendiri.
--
-- Cara menjalankan
-- a. Blok bagian 0 saja, lalu Run (SQL Editor menjalankan teks yang diblok): periksa barisnya.
-- b. Jalankan seluruh file. SQL Editor hanya menampilkan hasil query terakhir, yaitu cek bagian 4.
--
-- Pengaman: bagian 1 menghentikan semuanya bila ada lebih dari 1 baris yang cocok dengan
-- "BM Multimedia" atau "JF Interior" (RAISE EXCEPTION membatalkan seluruh transaksi, tidak ada yang
-- berubah). Satu baris cocok → diperbarui; tidak ada → dibuat. Aman dijalankan ulang: setelah
-- dijalankan sekali, kedua baris ada dan hanya diisi ulang dengan nilai yang sama.
-- ==============================================================================


-- ==============================================================================
-- 0. CEK SEBELUM PERUBAHAN (hanya membaca)
-- ==============================================================================
-- Satu tabel: jumlah baris yang cocok per instansi (harus 0 atau 1), lalu isi baris yang cocok.
-- Poin tugas tampil satu baris per poin.
SELECT bagian, baris, kolom, nilai
FROM (
  SELECT k.no, k.bagian, NULL::TEXT AS baris, 0 AS urut,
    'jumlah cocok (harus 0 atau 1)' AS kolom,
    (SELECT count(*) FROM public.experiences AS e WHERE e.company ILIKE k.pola)::TEXT AS nilai
  FROM (VALUES (1, 'BM Multimedia', '%BM Multimedia%'), (2, 'JF Interior', '%JF Interior%')) AS k (no, bagian, pola)

  UNION ALL
  SELECT k.no, k.bagian, e.company || ' · ' || e.role, x.urut, x.kolom, x.nilai
  FROM (VALUES (1, 'BM Multimedia', '%BM Multimedia%'), (2, 'JF Interior', '%JF Interior%')) AS k (no, bagian, pola)
  JOIN public.experiences AS e ON e.company ILIKE k.pola
  CROSS JOIN LATERAL (
    SELECT 1 AS urut, 'id' AS kolom, e.id::TEXT AS nilai
    UNION ALL SELECT 2, 'role_en', COALESCE(e.role_en, '(NULL)')
    UNION ALL SELECT 3, 'experience_type', COALESCE(e.experience_type, '(NULL)')
    UNION ALL SELECT 4, 'location', COALESCE(e.location, '(NULL)')
    UNION ALL SELECT 5, 'start_date', COALESCE(e.start_date::TEXT, '(NULL)')
    UNION ALL SELECT 6, 'end_date', COALESCE(e.end_date::TEXT, '(NULL)')
    UNION ALL SELECT 7, 'is_current', e.is_current::TEXT
    UNION ALL SELECT 8, 'is_visible', e.is_visible::TEXT
    UNION ALL SELECT 9, 'sort_order', e.sort_order::TEXT
    UNION ALL SELECT 10, 'description', COALESCE(e.description, '(NULL)')
    UNION ALL SELECT 11, 'description_en', COALESCE(e.description_en, '(NULL)')
    UNION ALL SELECT 12, 'tag (skill_tags)', array_to_string(e.skill_tags, ', ')
    UNION ALL SELECT 100 + r.n::INTEGER, 'poin ID ' || r.n, r.poin
      FROM unnest(e.responsibilities) WITH ORDINALITY AS r (poin, n)
    UNION ALL SELECT 200 + r.n::INTEGER, 'poin EN ' || r.n, r.poin
      FROM unnest(e.responsibilities_en) WITH ORDINALITY AS r (poin, n)
  ) AS x
) AS cek
ORDER BY no, baris NULLS FIRST, urut;


BEGIN;

-- Isi kedua pengalaman, ditulis sekali dan dipakai oleh UPDATE dan INSERT di bawah. Tabel
-- sementara ini hilang sendiri saat COMMIT atau ROLLBACK.
CREATE TEMP TABLE pengalaman_tambahan ON COMMIT DROP AS
SELECT *
FROM (
  VALUES
    (
      '%BM Multimedia%',
      'BM Multimedia',
      'Siswa PKL, Teknisi CCTV',
      'Vocational Intern, CCTV Technician',
      'Magang',
      'Kediri',
      DATE '2021-10-01',
      DATE '2022-03-01',
      'PKL 6 bulan dari SMK PGRI 1 Kota Kediri, jurusan Teknik Komputer dan Jaringan (TKJ).',
      'A 6-month vocational internship from SMK PGRI 1 Kota Kediri, Computer and Network Engineering (TKJ) program.',
      ARRAY[
        'Memasang CCTV baru serta membongkar dan memasang ulang perangkat CCTV di lokasi pelanggan.',
        'Mengatur koneksi CCTV online agar bisa dipantau langsung lewat HP Android.',
        'Memeriksa dan memperbaiki kamera CCTV yang bermasalah.',
        'Membantu pembuatan dan pemasangan papan running text.',
        'Melayani pelanggan dan menjaga toko, termasuk penjualan kamera dan suku cadang CCTV.'
      ]::TEXT[],
      ARRAY[
        'Installed new CCTV systems and dismantled and reinstalled CCTV equipment at customer sites.',
        'Configured online CCTV connections for live monitoring from Android phones.',
        'Diagnosed and repaired faulty CCTV cameras.',
        'Helped build and install running-text LED message boards.',
        'Served customers and ran the store, including sales of cameras and CCTV parts.'
      ]::TEXT[],
      ARRAY['CCTV', 'Jaringan', 'Instalasi', 'Troubleshooting']::TEXT[]
    ),
    (
      '%JF Interior%',
      'JF Interior',
      'Admin',
      'Admin',
      'Kerja',
      'Sidoarjo',
      DATE '2023-04-01',
      DATE '2023-06-01',
      'Bekerja sebagai admin sebelum mulai kuliah.',
      'Worked as an admin before starting college.',
      ARRAY[
        'Mencatat dan merekap pesanan pelanggan di komputer.',
        'Mencatat stok bahan seperti kayu, HPL, dan aksesoris.',
        'Merekap pemasukan dan pengeluaran usaha.',
        'Mengelola media sosial dan foto hasil kerja untuk promosi.'
      ]::TEXT[],
      ARRAY[
        'Recorded and compiled customer orders on the computer.',
        'Tracked stock of materials such as wood, HPL laminate, and hardware.',
        'Compiled business income and expense records.',
        'Managed social media and project photos for promotion.'
      ]::TEXT[],
      ARRAY['Administrasi', 'Excel', 'Media Sosial']::TEXT[]
    )
) AS v (
  pola, company, role, role_en, experience_type, location, start_date, end_date,
  description, description_en, responsibilities, responsibilities_en, skill_tags
);


-- ==============================================================================
-- 1. PENGAMAN: paling banyak 1 baris yang cocok per instansi
-- ==============================================================================
DO $$
DECLARE
  baris RECORD;
BEGIN
  FOR baris IN
    SELECT v.company, (SELECT count(*) FROM public.experiences AS e WHERE e.company ILIKE v.pola) AS jumlah
    FROM pengalaman_tambahan AS v
  LOOP
    IF baris.jumlah > 1 THEN
      RAISE EXCEPTION 'Pengalaman di %: % baris cocok, paling banyak 1. Tidak ada yang diubah.', baris.company, baris.jumlah;
    END IF;
  END LOOP;
END $$;


-- ==============================================================================
-- 2. PERBARUI BARIS YANG SUDAH ADA (JF Interior; BM Multimedia bila sudah pernah dibuat)
-- ==============================================================================
UPDATE public.experiences AS e
SET
  role = v.role,
  role_en = v.role_en,
  experience_type = v.experience_type,
  location = v.location,
  start_date = v.start_date,
  end_date = v.end_date,
  is_current = false,
  description = v.description,
  description_en = v.description_en,
  responsibilities = v.responsibilities,
  responsibilities_en = v.responsibilities_en,
  skill_tags = v.skill_tags,
  is_visible = true
FROM pengalaman_tambahan AS v
WHERE e.company ILIKE v.pola;


-- ==============================================================================
-- 3. BUAT BARIS YANG BELUM ADA (BM Multimedia), urutan tampil setelah yang terakhir
-- ==============================================================================
INSERT INTO public.experiences (
  company, role, role_en, experience_type, location, start_date, end_date, is_current,
  description, description_en, responsibilities, responsibilities_en, skill_tags,
  is_visible, is_featured, sort_order
)
SELECT
  v.company, v.role, v.role_en, v.experience_type, v.location, v.start_date, v.end_date, false,
  v.description, v.description_en, v.responsibilities, v.responsibilities_en, v.skill_tags,
  true, false,
  (SELECT COALESCE(max(e.sort_order), -1) FROM public.experiences AS e)
    + row_number() OVER (ORDER BY v.start_date DESC)::INTEGER
FROM pengalaman_tambahan AS v
WHERE NOT EXISTS (SELECT 1 FROM public.experiences AS e WHERE e.company ILIKE v.pola);

COMMIT;


-- ==============================================================================
-- 4. CEK SESUDAH PERUBAHAN (hanya membaca, berjalan setelah COMMIT)
-- ==============================================================================
-- Query yang sama dengan bagian 0. Yang diharapkan: jumlah cocok 1 dan 1; BM Multimedia Magang,
-- Kediri, 2021-10-01 sampai 2022-03-01, 5 poin ID dan 5 poin EN; JF Interior Admin, Kerja,
-- Sidoarjo, 2023-04-01 sampai 2023-06-01, 4 poin ID dan 4 poin EN; keduanya is_visible true.
SELECT bagian, baris, kolom, nilai
FROM (
  SELECT k.no, k.bagian, NULL::TEXT AS baris, 0 AS urut,
    'jumlah cocok (harus 1)' AS kolom,
    (SELECT count(*) FROM public.experiences AS e WHERE e.company ILIKE k.pola)::TEXT AS nilai
  FROM (VALUES (1, 'BM Multimedia', '%BM Multimedia%'), (2, 'JF Interior', '%JF Interior%')) AS k (no, bagian, pola)

  UNION ALL
  SELECT k.no, k.bagian, e.company || ' · ' || e.role, x.urut, x.kolom, x.nilai
  FROM (VALUES (1, 'BM Multimedia', '%BM Multimedia%'), (2, 'JF Interior', '%JF Interior%')) AS k (no, bagian, pola)
  JOIN public.experiences AS e ON e.company ILIKE k.pola
  CROSS JOIN LATERAL (
    SELECT 1 AS urut, 'id' AS kolom, e.id::TEXT AS nilai
    UNION ALL SELECT 2, 'role_en', COALESCE(e.role_en, '(NULL)')
    UNION ALL SELECT 3, 'experience_type', COALESCE(e.experience_type, '(NULL)')
    UNION ALL SELECT 4, 'location', COALESCE(e.location, '(NULL)')
    UNION ALL SELECT 5, 'start_date', COALESCE(e.start_date::TEXT, '(NULL)')
    UNION ALL SELECT 6, 'end_date', COALESCE(e.end_date::TEXT, '(NULL)')
    UNION ALL SELECT 7, 'is_current', e.is_current::TEXT
    UNION ALL SELECT 8, 'is_visible', e.is_visible::TEXT
    UNION ALL SELECT 9, 'sort_order', e.sort_order::TEXT
    UNION ALL SELECT 10, 'description', COALESCE(e.description, '(NULL)')
    UNION ALL SELECT 11, 'description_en', COALESCE(e.description_en, '(NULL)')
    UNION ALL SELECT 12, 'tag (skill_tags)', array_to_string(e.skill_tags, ', ')
    UNION ALL SELECT 100 + r.n::INTEGER, 'poin ID ' || r.n, r.poin
      FROM unnest(e.responsibilities) WITH ORDINALITY AS r (poin, n)
    UNION ALL SELECT 200 + r.n::INTEGER, 'poin EN ' || r.n, r.poin
      FROM unnest(e.responsibilities_en) WITH ORDINALITY AS r (poin, n)
  ) AS x
) AS cek
ORDER BY no, baris NULLS FIRST, urut;
