-- ==============================================================================
-- Seed (opsional): label hero untuk gaya monokrom (bukan migrasi)
-- Tanggal: 2026-10-30
-- Jalankan di Supabase SQL Editor SETELAH 20261019000000_english_content.sql (kolom hero_labels).
-- Boleh dilewati: isi yang sama bisa diketik di admin, halaman Profil, isian "Label panggung hero".
--
-- Isinya: profiles.hero_labels diganti seluruhnya dengan 6 chip yang bisa diseret di hero baru.
-- Huruf kapital dibuat oleh tampilan, jadi teksnya ditulis biasa.
--   ID                     EN
--   UI/UX                  UI/UX
--   Kota Kediri            Kediri City
--   Aldi                   Aldi
--   Junior Programmer      Junior Programmer
--   Manajemen Informatika  Informatics Management
--   Web & Mobile           Web & Mobile
-- Dua lingkaran (ikon </> dan ikon bintang) serta bintang kecil di chip nama depan dibuat oleh kode
-- halaman, jadi tidak disimpan di sini.
--
-- Kolom yang dipakai: profiles.hero_labels (JSONB, maks. 10 item {text, text_en, shape}; shape 'tag',
-- teks 1–24 karakter, sesuai aturan profiles_hero_labels_shape).
--
-- Cara menjalankan
-- a. Blok bagian 0 saja, lalu Run: lihat label yang tersimpan sekarang (label itu akan diganti).
-- b. Jalankan seluruh file. SQL Editor hanya menampilkan hasil query terakhir, yaitu cek bagian 2.
--
-- Pengaman: tabel profiles harus berisi tepat 1 baris. Bila tidak, RAISE EXCEPTION membatalkan
-- seluruh transaksi dan tidak ada yang berubah. Aman dijalankan ulang: isinya selalu sama.
-- ==============================================================================


-- ==============================================================================
-- 0. CEK SEBELUM PERUBAHAN (hanya membaca)
-- ==============================================================================
SELECT no, text, text_en, shape
FROM (
  SELECT 0 AS no, 'jumlah profil (harus 1): ' || count(*) AS text, NULL::TEXT AS text_en, NULL::TEXT AS shape
  FROM public.profiles

  UNION ALL
  SELECT l.n::INTEGER, l.item ->> 'text', l.item ->> 'text_en', l.item ->> 'shape'
  FROM public.profiles AS p
  CROSS JOIN LATERAL jsonb_array_elements(p.hero_labels) WITH ORDINALITY AS l (item, n)
) AS cek
ORDER BY no;


BEGIN;

-- ==============================================================================
-- 1. PENGAMAN DAN PERUBAHAN
-- ==============================================================================
DO $$
DECLARE
  jumlah INTEGER;
BEGIN
  SELECT count(*) INTO jumlah FROM public.profiles;
  IF jumlah <> 1 THEN
    RAISE EXCEPTION 'Tabel profiles: % baris, harus tepat 1. Tidak ada yang diubah.', jumlah;
  END IF;
END $$;

UPDATE public.profiles
SET hero_labels = '[
  {"text": "UI/UX", "text_en": "UI/UX", "shape": "tag"},
  {"text": "Kota Kediri", "text_en": "Kediri City", "shape": "tag"},
  {"text": "Aldi", "text_en": "Aldi", "shape": "tag"},
  {"text": "Junior Programmer", "text_en": "Junior Programmer", "shape": "tag"},
  {"text": "Manajemen Informatika", "text_en": "Informatics Management", "shape": "tag"},
  {"text": "Web & Mobile", "text_en": "Web & Mobile", "shape": "tag"}
]'::JSONB;

COMMIT;


-- ==============================================================================
-- 2. CEK SESUDAH PERUBAHAN (hanya membaca, berjalan setelah COMMIT)
-- ==============================================================================
-- Yang diharapkan: jumlah profil 1, lalu 6 baris dengan urutan dan teks seperti tabel di atas.
SELECT no, text, text_en, shape
FROM (
  SELECT 0 AS no, 'jumlah profil (harus 1): ' || count(*) AS text, NULL::TEXT AS text_en, NULL::TEXT AS shape
  FROM public.profiles

  UNION ALL
  SELECT l.n::INTEGER, l.item ->> 'text', l.item ->> 'text_en', l.item ->> 'shape'
  FROM public.profiles AS p
  CROSS JOIN LATERAL jsonb_array_elements(p.hero_labels) WITH ORDINALITY AS l (item, n)
) AS cek
ORDER BY no;
