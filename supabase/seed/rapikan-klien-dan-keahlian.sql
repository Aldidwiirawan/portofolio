-- ==============================================================================
-- Seed: rapikan teks klien dan keahlian yang tampil (bukan migrasi)
-- Tanggal: 2026-10-29
-- Jalankan di Supabase SQL Editor SETELAH semua migrasi dan seed sebelumnya.
--
-- Isinya
-- 1. Teks klien (ID dan EN) tiga proyek disingkat, dicari lewat slug: dwijaya-coffee, madura-mart,
--    aplikasi-arsip-surat. Deskripsi dan studi kasus tidak diubah.
-- 2. Keahlian: hanya 32 nama di daftar bagian 2 yang tampil; semua keahlian lain disembunyikan
--    (is_visible = false), tidak dihapus. Nama dicocokkan tanpa membedakan huruf besar/kecil dan
--    spasi di tepi, di kategori mana pun. Nama daftar yang tidak ada di database tidak dibuat:
--    dilaporkan lewat RAISE NOTICE dan juga di query cek. Tanda unggulan (is_featured), kategori,
--    dan urutan tidak disentuh.
--
-- Kolom yang dipakai
-- - projects: slug, client_name, client_name_en.
-- - skills: name, category, is_visible, is_featured (hanya dibaca), sort_order (hanya untuk urutan cek).
--
-- Cara menjalankan
-- a. Blok bagian 0 saja, lalu Run: periksa teks klien dan rencana tampil/sembunyi tiap keahlian.
-- b. Jalankan seluruh file. SQL Editor hanya menampilkan hasil query terakhir, yaitu cek bagian 4.
--
-- Pengaman: bila salah satu slug tidak ditemukan atau cocok lebih dari 1 baris, atau tidak ada
-- satu pun nama daftar keahlian yang ditemukan, RAISE EXCEPTION membatalkan seluruh transaksi dan
-- tidak ada yang berubah. Aman dijalankan ulang: setiap UPDATE mengisi nilai yang sama.
--
-- Daftar slug dan daftar keahlian ditulis di empat tempat (bagian 0, 1, 2, 4); isinya harus sama.
-- ==============================================================================


-- ==============================================================================
-- 0. CEK SEBELUM PERUBAHAN (hanya membaca)
-- ==============================================================================
-- nilai = isi sekarang, keterangan = rencana. Keahlian unggulan diberi tanda ★.
SELECT bagian, grup, nama, nilai, keterangan
FROM (
  SELECT 1 AS no, 'klien' AS bagian, v.slug AS grup, 0 AS urut, 'jumlah cocok (harus 1)' AS nama,
    (SELECT count(*) FROM public.projects AS p WHERE p.slug = v.slug)::TEXT AS nilai, NULL::TEXT AS keterangan
  FROM (
    VALUES
      ('dwijaya-coffee', 'Dwijaya Coffee, Kediri', 'Dwijaya Coffee, Kediri'),
      ('madura-mart', 'Diskominfo Kabupaten Kediri', 'Kediri Regency Communication and Informatics Office'),
      ('aplikasi-arsip-surat', 'Uji kompetensi LSP Polinema', 'LSP Polinema competency assessment')
  ) AS v (slug, klien, klien_en)

  UNION ALL
  SELECT 1, 'klien', p.slug, k.urut, k.kolom, k.sekarang, k.rencana
  FROM (
    VALUES
      ('dwijaya-coffee', 'Dwijaya Coffee, Kediri', 'Dwijaya Coffee, Kediri'),
      ('madura-mart', 'Diskominfo Kabupaten Kediri', 'Kediri Regency Communication and Informatics Office'),
      ('aplikasi-arsip-surat', 'Uji kompetensi LSP Polinema', 'LSP Polinema competency assessment')
  ) AS v (slug, klien, klien_en)
  JOIN public.projects AS p ON p.slug = v.slug
  CROSS JOIN LATERAL (
    SELECT 1 AS urut, 'client_name' AS kolom, COALESCE(p.client_name, '(NULL)') AS sekarang, v.klien AS rencana
    UNION ALL SELECT 2, 'client_name_en', COALESCE(p.client_name_en, '(NULL)'), v.klien_en
  ) AS k

  UNION ALL
  SELECT 2, 'keahlian', s.category, s.sort_order,
    s.name || CASE WHEN s.is_featured THEN ' ★' ELSE '' END,
    CASE WHEN s.is_visible THEN 'tampil' ELSE 'tersembunyi' END,
    CASE WHEN lower(btrim(s.name)) IN (SELECT lower(d.nama) FROM unnest(daftar.nama) AS d (nama))
      THEN 'tampil' ELSE 'disembunyikan' END
  FROM public.skills AS s
  CROSS JOIN (
    SELECT ARRAY[
      'HTML', 'CSS', 'JavaScript', 'React.js', 'Tailwind CSS', 'Bootstrap', 'Blade', 'Jinja2', 'UI/UX Design',
      'PHP', 'Laravel', 'Python', 'FastAPI', 'REST API', 'Midtrans',
      'Flutter', 'Dart',
      'MySQL', 'PostgreSQL', 'Supabase',
      'MikroTik MTCNA', 'Jaringan Komputer', 'Instalasi Sistem Operasi', 'Troubleshooting', 'Integrasi Scanner Barcode',
      'Figma', 'Git', 'Postman',
      'Komunikasi', 'Kerja Tim', 'Kedisiplinan', 'Dokumentasi'
    ]::TEXT[] AS nama
  ) AS daftar

  UNION ALL
  SELECT 3, 'tidak ditemukan', NULL, 0, d.nama, '-', 'tidak dibuat'
  FROM unnest(ARRAY[
    'HTML', 'CSS', 'JavaScript', 'React.js', 'Tailwind CSS', 'Bootstrap', 'Blade', 'Jinja2', 'UI/UX Design',
    'PHP', 'Laravel', 'Python', 'FastAPI', 'REST API', 'Midtrans',
    'Flutter', 'Dart',
    'MySQL', 'PostgreSQL', 'Supabase',
    'MikroTik MTCNA', 'Jaringan Komputer', 'Instalasi Sistem Operasi', 'Troubleshooting', 'Integrasi Scanner Barcode',
    'Figma', 'Git', 'Postman',
    'Komunikasi', 'Kerja Tim', 'Kedisiplinan', 'Dokumentasi'
  ]::TEXT[]) AS d (nama)
  WHERE NOT EXISTS (SELECT 1 FROM public.skills AS s WHERE lower(btrim(s.name)) = lower(d.nama))
) AS cek
ORDER BY no, grup NULLS FIRST, urut, nama;


BEGIN;

-- ==============================================================================
-- 1. PROYEK: teks klien
-- ==============================================================================
DO $$
DECLARE
  item RECORD;
BEGIN
  FOR item IN
    SELECT v.slug, (SELECT count(*) FROM public.projects AS p WHERE p.slug = v.slug) AS jumlah
    FROM (VALUES ('dwijaya-coffee'), ('madura-mart'), ('aplikasi-arsip-surat')) AS v (slug)
  LOOP
    IF item.jumlah <> 1 THEN
      RAISE EXCEPTION 'Proyek dengan slug %: % baris cocok, harus tepat 1. Tidak ada yang diubah.', item.slug, item.jumlah;
    END IF;
  END LOOP;
END $$;

UPDATE public.projects AS p
SET
  client_name = v.klien,
  client_name_en = v.klien_en
FROM (
  VALUES
    ('dwijaya-coffee', 'Dwijaya Coffee, Kediri', 'Dwijaya Coffee, Kediri'),
    ('madura-mart', 'Diskominfo Kabupaten Kediri', 'Kediri Regency Communication and Informatics Office'),
    ('aplikasi-arsip-surat', 'Uji kompetensi LSP Polinema', 'LSP Polinema competency assessment')
) AS v (slug, klien, klien_en)
WHERE p.slug = v.slug;


-- ==============================================================================
-- 2. KEAHLIAN: hanya daftar ini yang tampil
-- ==============================================================================
-- Per kategori: Frontend; Backend; Mobile; Database; Jaringan & IT Support; Tools; Soft skill.
DO $$
DECLARE
  daftar TEXT[] := ARRAY[
    'HTML', 'CSS', 'JavaScript', 'React.js', 'Tailwind CSS', 'Bootstrap', 'Blade', 'Jinja2', 'UI/UX Design',
    'PHP', 'Laravel', 'Python', 'FastAPI', 'REST API', 'Midtrans',
    'Flutter', 'Dart',
    'MySQL', 'PostgreSQL', 'Supabase',
    'MikroTik MTCNA', 'Jaringan Komputer', 'Instalasi Sistem Operasi', 'Troubleshooting', 'Integrasi Scanner Barcode',
    'Figma', 'Git', 'Postman',
    'Komunikasi', 'Kerja Tim', 'Kedisiplinan', 'Dokumentasi'
  ]::TEXT[];
  hilang TEXT;
  ditemukan INTEGER;
BEGIN
  SELECT count(*) INTO ditemukan
  FROM unnest(daftar) AS d (nama)
  WHERE EXISTS (SELECT 1 FROM public.skills AS s WHERE lower(btrim(s.name)) = lower(d.nama));
  IF ditemukan = 0 THEN
    RAISE EXCEPTION 'Tidak ada satu pun nama daftar keahlian yang ditemukan di tabel skills. Tidak ada yang diubah.';
  END IF;

  FOR hilang IN
    SELECT d.nama
    FROM unnest(daftar) WITH ORDINALITY AS d (nama, urut)
    WHERE NOT EXISTS (SELECT 1 FROM public.skills AS s WHERE lower(btrim(s.name)) = lower(d.nama))
    ORDER BY d.urut
  LOOP
    RAISE NOTICE 'Keahlian "%" tidak ditemukan di database; tidak dibuat.', hilang;
  END LOOP;

  UPDATE public.skills AS s
  SET is_visible = (lower(btrim(s.name)) IN (SELECT lower(d.nama) FROM unnest(daftar) AS d (nama)))
  WHERE s.is_visible IS DISTINCT FROM (lower(btrim(s.name)) IN (SELECT lower(d.nama) FROM unnest(daftar) AS d (nama)));
END $$;

COMMIT;


-- ==============================================================================
-- 4. CEK SESUDAH PERUBAHAN (hanya membaca, berjalan setelah COMMIT)
-- ==============================================================================
-- Teks klien ketiga proyek, jumlah keahlian tampil per kategori (keterangan: dari total), daftar
-- keahlian yang disembunyikan (★ = unggulan), dan nama daftar yang tidak ditemukan (bila ada).
SELECT bagian, grup, nama, nilai, keterangan
FROM (
  SELECT 1 AS no, 'klien' AS bagian, p.slug AS grup, k.urut, k.kolom AS nama, k.nilai, NULL::TEXT AS keterangan
  FROM public.projects AS p
  CROSS JOIN LATERAL (
    SELECT 1 AS urut, 'client_name' AS kolom, COALESCE(p.client_name, '(NULL)') AS nilai
    UNION ALL SELECT 2, 'client_name_en', COALESCE(p.client_name_en, '(NULL)')
  ) AS k
  WHERE p.slug IN ('dwijaya-coffee', 'madura-mart', 'aplikasi-arsip-surat')

  UNION ALL
  SELECT 2, 'tampil per kategori', s.category, 0, 'jumlah tampil',
    (count(*) FILTER (WHERE s.is_visible))::TEXT, 'dari ' || count(*)
  FROM public.skills AS s
  GROUP BY s.category

  UNION ALL
  SELECT 3, 'disembunyikan', s.category, s.sort_order,
    s.name || CASE WHEN s.is_featured THEN ' ★' ELSE '' END, 'tersembunyi', NULL
  FROM public.skills AS s
  WHERE NOT s.is_visible

  UNION ALL
  SELECT 4, 'tidak ditemukan', NULL, 0, d.nama, '-', 'tidak dibuat'
  FROM unnest(ARRAY[
    'HTML', 'CSS', 'JavaScript', 'React.js', 'Tailwind CSS', 'Bootstrap', 'Blade', 'Jinja2', 'UI/UX Design',
    'PHP', 'Laravel', 'Python', 'FastAPI', 'REST API', 'Midtrans',
    'Flutter', 'Dart',
    'MySQL', 'PostgreSQL', 'Supabase',
    'MikroTik MTCNA', 'Jaringan Komputer', 'Instalasi Sistem Operasi', 'Troubleshooting', 'Integrasi Scanner Barcode',
    'Figma', 'Git', 'Postman',
    'Komunikasi', 'Kerja Tim', 'Kedisiplinan', 'Dokumentasi'
  ]::TEXT[]) AS d (nama)
  WHERE NOT EXISTS (SELECT 1 FROM public.skills AS s WHERE lower(btrim(s.name)) = lower(d.nama))
) AS cek
ORDER BY no, grup NULLS FIRST, urut, nama;
