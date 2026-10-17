BEGIN;

-- ==============================================================================
-- Seed: initial content from the CV (not a migration)
-- Date: 2026-10-18
-- Run in the Supabase SQL Editor after 20261016000000_admin_content_model.sql.
--
-- What it does
-- - Inserts projects, experiences, education, certificates, skills and languages from the CV.
--   Each row is skipped when a row with the same name or title already exists (compared without
--   case and surrounding spaces), so running the file again adds nothing twice.
-- - The existing project "Aplikasi Arsip Surat" (same repository as SI-Arsip) is completed with
--   the CV data instead of getting a second row: title, status, year, type, client, role,
--   problem, solution, technology, code link, featured flag and order. Cover image, gallery,
--   slug, short description, full explanation and visibility stay as they are. This only runs
--   while the title is still "Aplikasi Arsip Surat".
-- - The profiles table is not touched.
--
-- Stored formats (same as the admin forms)
-- - Month/year: the first day of that month ('2026-01-01' = Januari 2026).
-- - Order: sort_order starts at 0, like the admin's Naik/Turun buttons (CV order 1 = 0).
--   Skills are ordered per category.
-- - New choice columns store the codes from contentLabels.js (status production, completed,
--   in_development; type web; certificate category competency, network, language, training).
--   Experience type, skill category and language level store the label itself (Magang, Kerja,
--   Frontend, Penutur asli, ...). "Bahasa ibu" in the CV is "Penutur asli" in the admin.
-- - Data the CV does not give stays NULL or the column default: images, logos, PDFs, gallery,
--   demo links, project outcome, short description, thesis title, skill level, TOEIC score.
--
-- Runs as one transaction: when any statement fails, nothing is changed. The query after
-- COMMIT shows the number of rows per table and any name that appears more than once.
-- ==============================================================================


-- ==============================================================================
-- 1. PROJECTS
-- ==============================================================================

-- 1.1 Complete the existing "Aplikasi Arsip Surat" with the CV data (see the header)
UPDATE public.projects
SET
  title = 'SI-Arsip: Sistem Informasi Arsip Surat Desa Karangduren',
  status = 'completed',
  year = 2025,
  project_type = 'web',
  client_name = 'Studi kasus uji kompetensi LSP Politeknik Negeri Malang',
  my_role = 'Merancang dan mengembangkan seluruhnya',
  problem = 'Arsip surat desa masih disimpan manual di map dan rak, sehingga sulit dicari dan memakan waktu.',
  solution = 'Aplikasi web untuk mengunggah, mencari, melihat, dan mengunduh arsip surat PDF, dengan pratinjau PDF langsung di halaman, pengelolaan kategori surat, dan konfirmasi sebelum menghapus.',
  tech_stack = ARRAY['PHP', 'Laravel', 'Blade', 'MySQL']::TEXT[],
  github_url = 'https://github.com/Aldidwiirawan/aplikasi_arsip_surat',
  is_featured = false,
  sort_order = 3
WHERE id = (
    SELECT p.id
    FROM public.projects AS p
    WHERE lower(btrim(p.title)) = 'aplikasi arsip surat'
    ORDER BY p.created_at
    LIMIT 1
  )
  AND NOT EXISTS (
    SELECT 1
    FROM public.projects AS p
    WHERE lower(btrim(p.title)) = lower('SI-Arsip: Sistem Informasi Arsip Surat Desa Karangduren')
  );

-- 1.2 Projects from the CV. A row is skipped when its title, its slug (what the admin makes from
--     the title) or its code link is already used, so SI-Arsip is only inserted on a database
--     without the row above. The short description is not in the CV: it stays NULL, or empty
--     text when the column was created as NOT NULL in the dashboard (the base schema of projects
--     is not in the repo).
INSERT INTO public.projects (
  title, slug, description, status, year, project_type, client_name, my_role, problem, solution,
  tech_stack, github_url, is_repo_private, is_featured, sort_order
)
SELECT
  v.title,
  v.slug,
  (
    SELECT CASE WHEN c.is_nullable = 'NO' THEN '' END
    FROM information_schema.columns AS c
    WHERE c.table_schema = 'public'
      AND c.table_name = 'projects'
      AND c.column_name = 'description'
  ),
  v.status, v.year, v.project_type, v.client_name, v.my_role, v.problem, v.solution,
  v.tech_stack, v.github_url, v.is_repo_private, v.is_featured, v.sort_order
FROM (
  VALUES
    (
      'AyamBebek: Sistem Pengemasan dan Pelacakan Pesanan Multi-Marketplace',
      'ayambebek-sistem-pengemasan-dan-pelacakan-pesanan-multi-marketplace',
      'production', 2026, 'web',
      'AyamBebek Pakan dan Ternak',
      'Frontend dan UI/UX konsol web (merancang di Figma lalu membangun halaman HTML), dasbor pemantauan, fitur sinkronisasi data pemindaian resi dari aplikasi mobile ke server, serta ikut mengembangkan aplikasi mobile Flutter bersama tim programmer CV Adisatya IT Consultant.',
      'Status pengiriman dicatat manual di Excel dan bukti serah terima dikirim lewat WhatsApp, sehingga mencari status satu paket bisa memakan waktu hingga sekitar 3 hari. Toko memproses 20–100 pesanan per hari dengan 7 operator.',
      'Sistem dua bagian yang dikembangkan bersama tim: konsol web untuk admin (impor pesanan Shopee dan TikTok Shop dari file Excel, dasbor pemantauan pengemasan, dan pengelolaan pengguna) serta aplikasi mobile untuk operator yang memindai barcode resi saat pengemasan, lengkap dengan foto bukti yang disinkronkan ke server.',
      ARRAY['Figma', 'HTML', 'Tailwind CSS', 'JavaScript', 'Jinja2', 'FastAPI', 'SQLAlchemy', 'PostgreSQL', 'Flutter', 'Dart']::TEXT[],
      NULL,
      true, true, 0
    ),
    (
      'Sistem Informasi Pengelolaan Data Produk Madura Mart',
      'sistem-informasi-pengelolaan-data-produk-madura-mart',
      'completed', 2025, 'web',
      'Dinas Komunikasi dan Informatika Kabupaten Kediri',
      'Web Developer magang',
      'Pendataan produk Madura Mart perlu dipindahkan ke sistem digital yang terstruktur.',
      'Sistem informasi berbasis web dengan hak akses khusus Admin untuk mengelola data produk, serta tampilan responsif yang memudahkan input dan pemantauan data.',
      ARRAY['PHP', 'Laravel', 'MySQL']::TEXT[],
      NULL,
      false, true, 1
    ),
    (
      'Website Portofolio Pribadi',
      'website-portofolio-pribadi',
      'in_development', 2026, 'web',
      NULL,
      'Merancang dan mengembangkan seluruhnya',
      NULL,
      'Situs portofolio dengan panel admin untuk mengelola seluruh isi, memakai autentikasi dan basis data Supabase.',
      ARRAY['JavaScript', 'React', 'Vite', 'CSS', 'Supabase', 'PostgreSQL']::TEXT[],
      NULL,
      false, true, 2
    ),
    (
      'SI-Arsip: Sistem Informasi Arsip Surat Desa Karangduren',
      'si-arsip-sistem-informasi-arsip-surat-desa-karangduren',
      'completed', 2025, 'web',
      'Studi kasus uji kompetensi LSP Politeknik Negeri Malang',
      'Merancang dan mengembangkan seluruhnya',
      'Arsip surat desa masih disimpan manual di map dan rak, sehingga sulit dicari dan memakan waktu.',
      'Aplikasi web untuk mengunggah, mencari, melihat, dan mengunduh arsip surat PDF, dengan pratinjau PDF langsung di halaman, pengelolaan kategori surat, dan konfirmasi sebelum menghapus.',
      ARRAY['PHP', 'Laravel', 'Blade', 'MySQL']::TEXT[],
      'https://github.com/Aldidwiirawan/aplikasi_arsip_surat',
      false, false, 3
    )
) AS v (
  title, slug, status, year, project_type, client_name, my_role, problem, solution,
  tech_stack, github_url, is_repo_private, is_featured, sort_order
)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.projects AS p
  WHERE lower(btrim(p.title)) = lower(v.title)
    OR p.slug = v.slug
    OR (v.github_url IS NOT NULL AND p.github_url = v.github_url)
);


-- ==============================================================================
-- 2. EXPERIENCES (skipped when the company is already there)
-- ==============================================================================
-- The related project is looked up by its title from section 1.
INSERT INTO public.experiences (
  company, role, experience_type, location, start_date, end_date, is_current,
  responsibilities, skill_tags, related_project_id, is_visible, is_featured, sort_order
)
SELECT
  v.company, v.role, v.experience_type, v.location, v.start_date, v.end_date, false,
  v.responsibilities, v.skill_tags,
  (
    SELECT p.id
    FROM public.projects AS p
    WHERE lower(btrim(p.title)) = lower(v.related_project)
    ORDER BY p.created_at
    LIMIT 1
  ),
  v.is_visible, v.is_featured, v.sort_order
FROM (
  VALUES
    (
      'CV Adisatya IT Consultant', 'Programmer Intern', 'Magang', 'Kediri',
      DATE '2026-01-01', DATE '2026-07-01',
      ARRAY[
        'Merancang UI/UX konsol web di Figma dan membangun halaman frontend-nya untuk sistem pengemasan pesanan klien AyamBebek Pakan dan Ternak.',
        'Mengembangkan dasbor pemantauan dan fitur sinkronisasi data pemindaian resi dari aplikasi mobile ke server.',
        'Ikut mengembangkan aplikasi mobile operator berbasis Flutter bersama tim programmer.'
      ]::TEXT[],
      ARRAY['Figma', 'HTML', 'Tailwind CSS', 'Jinja2', 'FastAPI', 'Flutter']::TEXT[],
      'AyamBebek: Sistem Pengemasan dan Pelacakan Pesanan Multi-Marketplace',
      true, true, 0
    ),
    (
      'Dinas Komunikasi dan Informatika Kabupaten Kediri', 'Web Developer Intern', 'Magang', 'Kediri',
      DATE '2025-06-01', DATE '2025-08-01',
      ARRAY[
        'Merancang dan mengembangkan sistem informasi pengelolaan data produk Madura Mart berbasis web.',
        'Membangun hak akses khusus Admin agar pengelolaan data produk aman dan terstruktur.',
        'Menerapkan tampilan responsif untuk memudahkan input dan pemantauan data.'
      ]::TEXT[],
      ARRAY['PHP', 'Laravel', 'MySQL']::TEXT[],
      'Sistem Informasi Pengelolaan Data Produk Madura Mart',
      true, true, 1
    ),
    (
      'JF Interior', 'Interior', 'Kerja', 'Sidoarjo',
      DATE '2023-02-01', DATE '2023-05-01',
      '{}'::TEXT[],
      '{}'::TEXT[],
      NULL,
      false, false, 2
    )
) AS v (
  company, role, experience_type, location, start_date, end_date,
  responsibilities, skill_tags, related_project, is_visible, is_featured, sort_order
)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.experiences AS e
  WHERE lower(btrim(e.company)) = lower(v.company)
);


-- ==============================================================================
-- 3. EDUCATIONS
-- ==============================================================================
-- Skipped when any "Politeknik Negeri Malang..." entry exists, with or without "(PSDKU Kediri)".
INSERT INTO public.educations (
  institution, degree, field_of_study, start_year, end_year, is_current, gpa, sort_order
)
SELECT
  'Politeknik Negeri Malang (PSDKU Kediri)', 'Diploma III (D3)', 'Manajemen Informatika',
  2023, 2026, false, 3.54, 0
WHERE NOT EXISTS (
  SELECT 1
  FROM public.educations AS e
  WHERE lower(btrim(e.institution)) LIKE 'politeknik negeri malang%'
);


-- ==============================================================================
-- 4. CERTIFICATIONS (skipped when the name is already there)
-- ==============================================================================
INSERT INTO public.certifications (
  name, issuer, category, issue_date, expiry_date, no_expiry, is_featured, sort_order
)
SELECT v.name, v.issuer, v.category, v.issue_date, v.expiry_date, v.no_expiry, v.is_featured, v.sort_order
FROM (
  VALUES
    ('Sertifikat Kompetensi Pemrograman Software Komputer', 'LSP Politeknik Negeri Malang', 'competency', DATE '2025-10-01', DATE '2028-10-01', false, true, 0),
    ('MikroTik Certified Network Associate (MTCNA)', 'MikroTik', 'network', DATE '2024-10-01', DATE '2027-10-01', false, true, 1),
    ('TOEIC', 'PT International Test Center', 'language', DATE '2026-05-01', DATE '2028-05-01', false, true, 2),
    ('Python Essentials', 'Cisco Networking Academy', 'training', DATE '2024-08-01', NULL, true, false, 3),
    ('Operating Systems Basics', 'Cisco Networking Academy', 'training', DATE '2024-05-01', NULL, true, false, 4)
) AS v (name, issuer, category, issue_date, expiry_date, no_expiry, is_featured, sort_order)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.certifications AS c
  WHERE lower(btrim(c.name)) = lower(v.name)
);


-- ==============================================================================
-- 5. SKILLS (skipped when the name is already there, in any category)
-- ==============================================================================
INSERT INTO public.skills (name, category, is_featured, sort_order)
SELECT v.name, v.category, v.is_featured, v.sort_order
FROM (
  VALUES
    ('HTML', 'Frontend', true, 0),
    ('CSS', 'Frontend', false, 1),
    ('JavaScript', 'Frontend', true, 2),
    ('React.js', 'Frontend', true, 3),
    ('Vite', 'Frontend', false, 4),
    ('Tailwind CSS', 'Frontend', false, 5),
    ('Jinja2', 'Frontend', false, 6),
    ('Blade', 'Frontend', false, 7),
    ('UI/UX Design', 'Frontend', true, 8),
    ('Bootstrap', 'Frontend', false, 9),
    ('Next.js', 'Frontend', false, 10),

    ('Python', 'Backend', false, 0),
    ('FastAPI', 'Backend', false, 1),
    ('SQLAlchemy', 'Backend', false, 2),
    ('Alembic', 'Backend', false, 3),
    ('JWT', 'Backend', false, 4),
    ('PHP', 'Backend', true, 5),
    ('Laravel', 'Backend', true, 6),
    ('REST API', 'Backend', false, 7),
    ('Node.js', 'Backend', false, 8),
    ('Java', 'Backend', false, 9),

    ('Flutter', 'Mobile', true, 0),
    ('Dart', 'Mobile', false, 1),
    ('Kotlin', 'Mobile', false, 2),
    ('React Native', 'Mobile', false, 3),

    ('PostgreSQL', 'Database', true, 0),
    ('MySQL', 'Database', true, 1),
    ('Supabase', 'Database', false, 2),
    ('SQL', 'Database', false, 3),
    ('SQLite', 'Database', false, 4),
    ('Firebase', 'Database', false, 5),

    ('MikroTik (MTCNA)', 'Jaringan & IT Support', true, 0),
    ('Jaringan Komputer', 'Jaringan & IT Support', false, 1),
    ('Instalasi Sistem Operasi', 'Jaringan & IT Support', false, 2),
    ('Troubleshooting', 'Jaringan & IT Support', false, 3),
    ('Integrasi Scanner Barcode', 'Jaringan & IT Support', false, 4),
    ('Cisco Packet Tracer', 'Jaringan & IT Support', false, 5),
    ('Linux', 'Jaringan & IT Support', false, 6),
    ('Windows Server', 'Jaringan & IT Support', false, 7),

    ('Figma', 'Tools', true, 0),
    ('Git', 'Tools', true, 1),
    ('GitHub', 'Tools', false, 2),
    ('VS Code', 'Tools', false, 3),
    ('Android Studio', 'Tools', false, 4),
    ('XAMPP', 'Tools', false, 5),
    ('Laragon', 'Tools', false, 6),
    ('uv', 'Tools', false, 7),
    ('Postman', 'Tools', false, 8),
    ('Docker', 'Tools', false, 9),
    ('Canva', 'Tools', false, 10),
    ('Microsoft Office', 'Tools', false, 11),
    ('Google Sheets / Apps Script', 'Tools', false, 12),

    ('Komunikasi', 'Soft skill', false, 0),
    ('Kerja Tim', 'Soft skill', false, 1),
    ('Kedisiplinan', 'Soft skill', false, 2),
    ('Dokumentasi', 'Soft skill', false, 3)
) AS v (name, category, is_featured, sort_order)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.skills AS s
  WHERE lower(btrim(s.name)) = lower(v.name)
);


-- ==============================================================================
-- 6. LANGUAGES (skipped when the language is already there)
-- ==============================================================================
INSERT INTO public.languages (language_name, proficiency_level, sort_order)
SELECT v.language_name, v.proficiency_level, v.sort_order
FROM (
  VALUES
    ('Bahasa Indonesia', 'Penutur asli', 0),
    ('Bahasa Inggris', 'Menengah', 1)
) AS v (language_name, proficiency_level, sort_order)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.languages AS l
  WHERE lower(btrim(l.language_name)) = lower(v.language_name)
);

COMMIT;


-- ==============================================================================
-- CHECK (read only, runs after COMMIT): rows per table. "nama_ganda" lists names that appear
-- more than once (without case and surrounding spaces); "tidak ada" means no duplicates.
-- unggulan is empty for tables without a featured flag.
-- ==============================================================================
SELECT tabel, jumlah, tampil, unggulan, nama_ganda
FROM (
  SELECT
    1 AS no, 'projects' AS tabel, count(*) AS jumlah,
    count(*) FILTER (WHERE is_visible) AS tampil,
    count(*) FILTER (WHERE is_featured) AS unggulan,
    COALESCE((
      SELECT string_agg(d.nama, ', ' ORDER BY d.nama)
      FROM (SELECT min(title) AS nama FROM public.projects GROUP BY lower(btrim(title)) HAVING count(*) > 1) AS d
    ), 'tidak ada') AS nama_ganda
  FROM public.projects

  UNION ALL
  SELECT
    2, 'experiences', count(*),
    count(*) FILTER (WHERE is_visible),
    count(*) FILTER (WHERE is_featured),
    COALESCE((
      SELECT string_agg(d.nama, ', ' ORDER BY d.nama)
      FROM (SELECT min(company) AS nama FROM public.experiences GROUP BY lower(btrim(company)) HAVING count(*) > 1) AS d
    ), 'tidak ada')
  FROM public.experiences

  UNION ALL
  SELECT
    3, 'educations', count(*),
    count(*) FILTER (WHERE is_visible),
    NULL,
    COALESCE((
      SELECT string_agg(d.nama, ', ' ORDER BY d.nama)
      FROM (SELECT min(institution) AS nama FROM public.educations GROUP BY lower(btrim(institution)) HAVING count(*) > 1) AS d
    ), 'tidak ada')
  FROM public.educations

  UNION ALL
  SELECT
    4, 'certifications', count(*),
    count(*) FILTER (WHERE is_visible),
    count(*) FILTER (WHERE is_featured),
    COALESCE((
      SELECT string_agg(d.nama, ', ' ORDER BY d.nama)
      FROM (SELECT min(name) AS nama FROM public.certifications GROUP BY lower(btrim(name)) HAVING count(*) > 1) AS d
    ), 'tidak ada')
  FROM public.certifications

  UNION ALL
  SELECT
    5, 'skills', count(*),
    count(*) FILTER (WHERE is_visible),
    count(*) FILTER (WHERE is_featured),
    COALESCE((
      SELECT string_agg(d.nama, ', ' ORDER BY d.nama)
      FROM (SELECT min(name) AS nama FROM public.skills GROUP BY lower(btrim(name)) HAVING count(*) > 1) AS d
    ), 'tidak ada')
  FROM public.skills

  UNION ALL
  SELECT
    6, 'languages', count(*),
    count(*) FILTER (WHERE is_visible),
    NULL,
    COALESCE((
      SELECT string_agg(d.nama, ', ' ORDER BY d.nama)
      FROM (SELECT min(language_name) AS nama FROM public.languages GROUP BY lower(btrim(language_name)) HAVING count(*) > 1) AS d
    ), 'tidak ada')
  FROM public.languages
) AS hasil
ORDER BY no;
