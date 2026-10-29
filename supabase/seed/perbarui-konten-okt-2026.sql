-- ==============================================================================
-- Seed: perbarui isi portofolio Oktober 2026 (bukan migrasi)
-- Tanggal: 2026-10-29
-- Jalankan di Supabase SQL Editor SETELAH semua migrasi dan seed proyek-tambahan.sql.
--
-- Isinya
-- 1. Pengalaman "Web Developer Intern" di Dinas Komunikasi dan Informatika Kabupaten Kediri:
--    poin tugas ID dan EN diganti seluruhnya (item ke-n EN = terjemahan item ke-n ID), teknologi
--    menjadi tepat PHP, Laravel, MySQL, Bootstrap, Midtrans, SSL (Midtrans sekali saja).
-- 2. Proyek jeejak-console dan jejakpaket: klien ID dan EN menjadi "CV Adisatya IT Consultant".
--    Deskripsi dan studi kasus tidak diubah.
-- 3. Sertifikat TOEIC: skor dikosongkan (NULL). Sertifikatnya tetap ada.
--
-- Kolom yang dipakai
-- - experiences: company (instansi), role (posisi), responsibilities dan responsibilities_en
--   (poin tugas, TEXT[] maks. 5), skill_tags (teknologi, TEXT[] maks. 12).
-- - projects: slug, client_name, client_name_en.
-- - certifications: name, issuer, score (TEXT, boleh NULL).
--
-- Cara menjalankan
-- a. Blok bagian 0 saja, lalu Run (SQL Editor menjalankan teks yang diblok): periksa barisnya.
-- b. Jalankan seluruh file. SQL Editor hanya menampilkan hasil query terakhir, yaitu cek bagian 5.
--
-- Pengaman: sebelum mengubah apa pun, bagian 1 memastikan tepat 1 pengalaman, tepat 2 proyek, dan
-- tepat 1 sertifikat TOEIC yang cocok. Bila tidak, RAISE EXCEPTION membatalkan seluruh transaksi
-- dan tidak ada yang berubah. Aman dijalankan ulang: setiap UPDATE mengisi nilai yang sama.
-- Kolom gambar, urutan, dan status tampil tidak disentuh.
-- ==============================================================================


-- ==============================================================================
-- 0. CEK SEBELUM PERUBAHAN (hanya membaca)
-- ==============================================================================
-- Satu tabel: baris "jumlah cocok" per bagian, lalu isi kolom yang akan diubah. Poin tugas tampil
-- satu baris per poin.
SELECT bagian, baris, kolom, nilai
FROM (
  SELECT 1 AS no, 'pengalaman' AS bagian, NULL::TEXT AS baris, 0 AS urut,
    'jumlah cocok (harus 1)' AS kolom, count(*)::TEXT AS nilai
  FROM public.experiences AS e
  WHERE (e.company ILIKE '%Kominfo%' OR e.company ILIKE '%Komunikasi dan Informatika%')
    AND e.role ILIKE '%Web Developer%'

  UNION ALL
  SELECT 1, 'pengalaman', e.company || ' · ' || e.role, x.urut, x.kolom, x.nilai
  FROM public.experiences AS e
  CROSS JOIN LATERAL (
    SELECT 1 AS urut, 'id' AS kolom, e.id::TEXT AS nilai
    UNION ALL SELECT 2, 'teknologi (skill_tags)', array_to_string(e.skill_tags, ', ')
    UNION ALL SELECT 100 + r.n::INTEGER, 'poin ID ' || r.n, r.poin
      FROM unnest(e.responsibilities) WITH ORDINALITY AS r (poin, n)
    UNION ALL SELECT 200 + r.n::INTEGER, 'poin EN ' || r.n, r.poin
      FROM unnest(e.responsibilities_en) WITH ORDINALITY AS r (poin, n)
  ) AS x
  WHERE (e.company ILIKE '%Kominfo%' OR e.company ILIKE '%Komunikasi dan Informatika%')
    AND e.role ILIKE '%Web Developer%'

  UNION ALL
  SELECT 2, 'proyek', NULL, 0, 'jumlah cocok (harus 2)', count(*)::TEXT
  FROM public.projects AS p
  WHERE p.slug IN ('jeejak-console', 'jejakpaket')

  UNION ALL
  SELECT 2, 'proyek', p.slug, x.urut, x.kolom, x.nilai
  FROM public.projects AS p
  CROSS JOIN LATERAL (
    SELECT 1 AS urut, 'client_name' AS kolom, COALESCE(p.client_name, '(NULL)') AS nilai
    UNION ALL SELECT 2, 'client_name_en', COALESCE(p.client_name_en, '(NULL)')
  ) AS x
  WHERE p.slug IN ('jeejak-console', 'jejakpaket')

  UNION ALL
  SELECT 3, 'sertifikat', NULL, 0, 'jumlah cocok (harus 1)', count(*)::TEXT
  FROM public.certifications AS c
  WHERE c.name ILIKE '%TOEIC%'

  UNION ALL
  SELECT 3, 'sertifikat', c.name, x.urut, x.kolom, x.nilai
  FROM public.certifications AS c
  CROSS JOIN LATERAL (
    SELECT 1 AS urut, 'id' AS kolom, c.id::TEXT AS nilai
    UNION ALL SELECT 2, 'issuer', c.issuer
    UNION ALL SELECT 3, 'score', COALESCE(c.score, '(NULL)')
  ) AS x
  WHERE c.name ILIKE '%TOEIC%'
) AS cek
ORDER BY no, baris NULLS FIRST, urut;


BEGIN;

-- ==============================================================================
-- 1. PENGAMAN: jumlah baris yang cocok harus tepat
-- ==============================================================================
DO $$
DECLARE
  jumlah INTEGER;
BEGIN
  SELECT count(*) INTO jumlah
  FROM public.experiences AS e
  WHERE (e.company ILIKE '%Kominfo%' OR e.company ILIKE '%Komunikasi dan Informatika%')
    AND e.role ILIKE '%Web Developer%';
  IF jumlah <> 1 THEN
    RAISE EXCEPTION 'Pengalaman Web Developer Intern di Kominfo: % baris cocok, harus tepat 1. Tidak ada yang diubah.', jumlah;
  END IF;

  SELECT count(*) INTO jumlah
  FROM public.projects AS p
  WHERE p.slug IN ('jeejak-console', 'jejakpaket');
  IF jumlah <> 2 THEN
    RAISE EXCEPTION 'Proyek jeejak-console dan jejakpaket: % baris ditemukan, harus 2. Tidak ada yang diubah.', jumlah;
  END IF;

  SELECT count(*) INTO jumlah
  FROM public.certifications AS c
  WHERE c.name ILIKE '%TOEIC%';
  IF jumlah <> 1 THEN
    RAISE EXCEPTION 'Sertifikat TOEIC: % baris cocok, harus tepat 1. Tidak ada yang diubah.', jumlah;
  END IF;
END $$;


-- ==============================================================================
-- 2. PENGALAMAN: Web Developer Intern, Diskominfo Kabupaten Kediri
-- ==============================================================================
-- Teknologi diisi daftar akhirnya langsung, jadi Midtrans selalu ada tepat sekali.
UPDATE public.experiences AS e
SET
  responsibilities = ARRAY[
    'Membangun Madura Mart, toko online dan sistem stok berbasis web dengan tiga peran: Pembeli, Admin, dan Owner.',
    'Mengembangkan katalog, keranjang, dan pembayaran Midtrans untuk pembeli.',
    'Membuat pengelolaan produk, kategori, stok masuk, stok keluar, dan stok opname untuk admin.',
    'Membuat laporan keuntungan dan penjualan untuk owner, dengan ekspor PDF dan Excel.',
    'Membantu aktivasi SSL situs desa dan kecamatan serta migrasi portal website Pemkab Kediri.'
  ]::TEXT[],
  responsibilities_en = ARRAY[
    'Built Madura Mart, a web-based online store and inventory system with three roles: Customer, Admin, and Owner.',
    'Developed the product catalog, cart, and Midtrans payment flow for customers.',
    'Built product, category, stock-in, stock-out, and stock-opname management for admins.',
    'Created profit and sales reports for the owner, with PDF and Excel export.',
    'Helped activate SSL for village and district websites and migrate the Kediri Regency government portal.'
  ]::TEXT[],
  skill_tags = ARRAY['PHP', 'Laravel', 'MySQL', 'Bootstrap', 'Midtrans', 'SSL']::TEXT[]
WHERE (e.company ILIKE '%Kominfo%' OR e.company ILIKE '%Komunikasi dan Informatika%')
  AND e.role ILIKE '%Web Developer%';


-- ==============================================================================
-- 3. PROYEK: klien Jeejak dan JejakPaket
-- ==============================================================================
UPDATE public.projects AS p
SET
  client_name = 'CV Adisatya IT Consultant',
  client_name_en = 'CV Adisatya IT Consultant'
WHERE p.slug IN ('jeejak-console', 'jejakpaket');


-- ==============================================================================
-- 4. SERTIFIKAT: skor TOEIC dikosongkan
-- ==============================================================================
UPDATE public.certifications AS c
SET score = NULL
WHERE c.name ILIKE '%TOEIC%';

COMMIT;


-- ==============================================================================
-- 5. CEK SESUDAH PERUBAHAN (hanya membaca, berjalan setelah COMMIT)
-- ==============================================================================
-- Query yang sama dengan bagian 0. Yang diharapkan: jumlah cocok 1, 2, 1; poin ID dan EN masing-
-- masing 5; teknologi "PHP, Laravel, MySQL, Bootstrap, Midtrans, SSL"; kedua klien "CV Adisatya IT
-- Consultant"; score TOEIC "(NULL)".
SELECT bagian, baris, kolom, nilai
FROM (
  SELECT 1 AS no, 'pengalaman' AS bagian, NULL::TEXT AS baris, 0 AS urut,
    'jumlah cocok (harus 1)' AS kolom, count(*)::TEXT AS nilai
  FROM public.experiences AS e
  WHERE (e.company ILIKE '%Kominfo%' OR e.company ILIKE '%Komunikasi dan Informatika%')
    AND e.role ILIKE '%Web Developer%'

  UNION ALL
  SELECT 1, 'pengalaman', e.company || ' · ' || e.role, x.urut, x.kolom, x.nilai
  FROM public.experiences AS e
  CROSS JOIN LATERAL (
    SELECT 1 AS urut, 'id' AS kolom, e.id::TEXT AS nilai
    UNION ALL SELECT 2, 'teknologi (skill_tags)', array_to_string(e.skill_tags, ', ')
    UNION ALL SELECT 100 + r.n::INTEGER, 'poin ID ' || r.n, r.poin
      FROM unnest(e.responsibilities) WITH ORDINALITY AS r (poin, n)
    UNION ALL SELECT 200 + r.n::INTEGER, 'poin EN ' || r.n, r.poin
      FROM unnest(e.responsibilities_en) WITH ORDINALITY AS r (poin, n)
  ) AS x
  WHERE (e.company ILIKE '%Kominfo%' OR e.company ILIKE '%Komunikasi dan Informatika%')
    AND e.role ILIKE '%Web Developer%'

  UNION ALL
  SELECT 2, 'proyek', NULL, 0, 'jumlah cocok (harus 2)', count(*)::TEXT
  FROM public.projects AS p
  WHERE p.slug IN ('jeejak-console', 'jejakpaket')

  UNION ALL
  SELECT 2, 'proyek', p.slug, x.urut, x.kolom, x.nilai
  FROM public.projects AS p
  CROSS JOIN LATERAL (
    SELECT 1 AS urut, 'client_name' AS kolom, COALESCE(p.client_name, '(NULL)') AS nilai
    UNION ALL SELECT 2, 'client_name_en', COALESCE(p.client_name_en, '(NULL)')
  ) AS x
  WHERE p.slug IN ('jeejak-console', 'jejakpaket')

  UNION ALL
  SELECT 3, 'sertifikat', NULL, 0, 'jumlah cocok (harus 1)', count(*)::TEXT
  FROM public.certifications AS c
  WHERE c.name ILIKE '%TOEIC%'

  UNION ALL
  SELECT 3, 'sertifikat', c.name, x.urut, x.kolom, x.nilai
  FROM public.certifications AS c
  CROSS JOIN LATERAL (
    SELECT 1 AS urut, 'id' AS kolom, c.id::TEXT AS nilai
    UNION ALL SELECT 2, 'issuer', c.issuer
    UNION ALL SELECT 3, 'score', COALESCE(c.score, '(NULL)')
  ) AS x
  WHERE c.name ILIKE '%TOEIC%'
) AS cek
ORDER BY no, baris NULLS FIRST, urut;
