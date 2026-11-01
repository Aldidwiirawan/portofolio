-- ==============================================================================
-- Seed: perbarui isi deskripsi Perjalanan Saya (Pengalaman & Pendidikan) 2026
-- Tanggal: 2026-11-01
-- Menyelaraskan ringkasan pengalaman PKL Diskominfo (Madura Mart), Magang CV Adisatya (Jeejak),
-- dan riwayat pendidikan Politeknik Negeri Malang (D3 Manajemen Informatika).
-- ==============================================================================

BEGIN;

-- 1. Web Developer Intern · Dinas Komunikasi dan Informatika Kabupaten Kediri
UPDATE public.experiences
SET
  description = 'Praktik Kerja Lapangan (PKL) di Diskominfo Kabupaten Kediri bersama tim 3 mahasiswa Politeknik Negeri Malang, berfokus pada pengembangan sistem web e-commerce & rantai pasok Madura Mart serta dukungan infrastruktur portal Pemkab Kediri.',
  description_en = 'Internship (PKL) at Kediri Regency Communication and Informatics Office with a team of 3 students from Politeknik Negeri Malang, focusing on web e-commerce & supply chain development for Madura Mart and municipal portal infrastructure support.'
WHERE (company ILIKE '%Kominfo%' OR company ILIKE '%Komunikasi dan Informatika%')
  AND role ILIKE '%Web Developer%';

-- 2. Programmer Intern · CV Adisatya IT Consultant
UPDATE public.experiences
SET
  description = 'Magang industri di CV Adisatya IT Consultant, berkontribusi dalam perancangan UI/UX dan frontend konsol web serta pengembangan aplikasi mobile pencatatan bukti packing paket marketplace (kini dirilis sebagai Jeejak).',
  description_en = 'Industrial internship at CV Adisatya IT Consultant, contributing to the UI/UX and web console frontend design as well as the mobile operator app for marketplace parcel packing verification (now released as Jeejak).'
WHERE company ILIKE '%Adisatya%'
  AND role ILIKE '%Programmer%';

-- 3. Diploma III (D3) · Politeknik Negeri Malang
UPDATE public.educations
SET
  description = 'Menempuh studi D3 Manajemen Informatika PSDKU Kota Kediri dengan fokus rekayasa perangkat lunak web dan mobile, perancangan basis data relasional, serta perancangan sistem monitoring berbasis pemindaian barcode.'
WHERE institution ILIKE '%Politeknik Negeri Malang%';

COMMIT;
