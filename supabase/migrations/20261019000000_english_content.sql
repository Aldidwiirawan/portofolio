BEGIN;

-- ==============================================================================
-- Migration: English content and hero labels (Tahap 3C)
-- Date: 2026-10-19
-- Description:
-- 1. Optional English versions of every content text the public page shows, as companion
--    columns with the same type and the suffix _en (e.g. bio → bio_en, responsibilities TEXT[] →
--    responsibilities_en TEXT[]). Empty means "use the Indonesian text". Lists are parallel to
--    their Indonesian list: item n of the _en list translates item n of the Indonesian list.
--    Inside JSON (project gallery and links) the English text is a key of the same item:
--    gallery[].caption_en and links[].label_en, so it moves with the item when the order changes.
-- 2. profiles.hero_labels: the labels of the hero stage chosen in the admin (BRIEF §5), a JSONB
--    array of at most 10 objects:
--      text     text, required, 1–24 characters (a circle: 1–3 characters)
--      text_en  optional English text, same limits
--      shape    'tag' | 'circle'
--    An empty list means the page keeps showing the featured skills.
--
-- Requires: 20261016000000_admin_content_model.sql and 20261018000000_project_links.sql.
-- Runs as one transaction: when any statement fails, nothing is changed. Safe to run more than
-- once: columns are added only once and constraints are replaced. No data is changed and RLS
-- policies are not touched. The query after COMMIT lists every column this migration adds.
-- ==============================================================================


-- ==============================================================================
-- 1. PROFILES
-- ==============================================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tagline_en TEXT,
  ADD COLUMN IF NOT EXISTS bio_en TEXT,
  ADD COLUMN IF NOT EXISTS primary_role_en TEXT,
  ADD COLUMN IF NOT EXISTS secondary_roles_en TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  ADD COLUMN IF NOT EXISTS hero_keywords_en TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  ADD COLUMN IF NOT EXISTS contact_topics_en TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  ADD COLUMN IF NOT EXISTS hobbies_en TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  ADD COLUMN IF NOT EXISTS hero_labels JSONB NOT NULL DEFAULT '[]'::JSONB;

-- Same limits as the Indonesian columns
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_primary_role_en_length;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_primary_role_en_length
  CHECK (primary_role_en IS NULL OR char_length(primary_role_en) <= 60);

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_secondary_roles_en_max;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_secondary_roles_en_max
  CHECK (cardinality(secondary_roles_en) <= 2);

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_hero_keywords_en_max;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_hero_keywords_en_max
  CHECK (cardinality(hero_keywords_en) <= 8);

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_contact_topics_en_max;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_contact_topics_en_max
  CHECK (cardinality(contact_topics_en) <= 8);

-- Hero labels: an array of at most 10 objects; every item passes the rules (lax mode: a missing key
-- fails its rule; each rule checks the type first, so a wrong type makes the item invalid)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_hero_labels_shape;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_hero_labels_shape
  CHECK (
    CASE
      WHEN jsonb_typeof(hero_labels) = 'array' THEN
        jsonb_array_length(hero_labels) <= 10
        AND NOT jsonb_path_exists(hero_labels, 'strict $[*] ? (@.type() != "object")')
        AND NOT jsonb_path_exists(
          hero_labels,
          'lax $[*] ? (!(
             @.text.type() == "string"
             && @.text like_regex "\\S"
             && !(@.text like_regex "^.{25}" flag "s")
             && @.shape.type() == "string"
             && (@.shape == "tag" || @.shape == "circle")
             && (@.shape == "tag" || !(@.text like_regex "^.{4}" flag "s"))
             && (!exists(@.text_en)
                 || @.text_en.type() == "null"
                 || (@.text_en.type() == "string"
                     && !(@.text_en like_regex "^.{25}" flag "s")
                     && (@.shape == "tag" || !(@.text_en like_regex "^.{4}" flag "s"))))
          ))'
        )
      ELSE false
    END
  );


-- ==============================================================================
-- 2. PROJECTS
-- ==============================================================================
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS title_en TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS client_name_en TEXT,
  ADD COLUMN IF NOT EXISTS my_role_en TEXT,
  ADD COLUMN IF NOT EXISTS problem_en TEXT,
  ADD COLUMN IF NOT EXISTS solution_en TEXT,
  ADD COLUMN IF NOT EXISTS outcome_en TEXT,
  ADD COLUMN IF NOT EXISTS content_en TEXT;

-- Links: the rules of 20261018000000_project_links.sql plus an optional English label (label_en,
-- text up to 60 characters, or null)
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_links_shape;
ALTER TABLE public.projects ADD CONSTRAINT projects_links_shape
  CHECK (
    CASE
      WHEN jsonb_typeof(links) = 'array' THEN
        jsonb_array_length(links) <= 6
        AND NOT jsonb_path_exists(links, 'strict $[*] ? (@.type() != "object")')
        AND NOT jsonb_path_exists(
          links,
          'lax $[*] ? (!(
             @.label.type() == "string"
             && @.label like_regex "\\S"
             && !(@.label like_regex "^.{61}" flag "s")
             && @."type".type() == "string"
             && (@."type" == "code" || @."type" == "demo" || @."type" == "docs"
                 || @."type" == "video" || @."type" == "other")
             && @.is_private.type() == "boolean"
             && (!exists(@.url)
                 || @.url.type() == "null"
                 || (@.url.type() == "string" && @.url like_regex "^https://\\S+$"))
             && (@.is_private == true
                 || (@.url.type() == "string" && @.url like_regex "^https://\\S+$"))
             && (!exists(@.label_en)
                 || @.label_en.type() == "null"
                 || (@.label_en.type() == "string" && !(@.label_en like_regex "^.{61}" flag "s")))
          ))'
        )
      ELSE false
    END
  );

-- Gallery: the rule of 20261016000000 (every item has a url) plus an optional English caption
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_gallery_shape;
ALTER TABLE public.projects ADD CONSTRAINT projects_gallery_shape
  CHECK (
    CASE
      WHEN jsonb_typeof(gallery) = 'array' THEN
        jsonb_array_length(gallery) <= 5
        AND NOT jsonb_path_exists(gallery, '$[*] ? (!(@.url.type() == "string"))')
        AND NOT jsonb_path_exists(
          gallery,
          'lax $[*] ? (exists(@.caption_en) && !(@.caption_en.type() == "null" || @.caption_en.type() == "string"))'
        )
      ELSE false
    END
  );


-- ==============================================================================
-- 3. EXPERIENCES
-- ==============================================================================
ALTER TABLE public.experiences
  ADD COLUMN IF NOT EXISTS role_en TEXT,
  ADD COLUMN IF NOT EXISTS company_en TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS responsibilities_en TEXT[] NOT NULL DEFAULT '{}'::TEXT[];

ALTER TABLE public.experiences DROP CONSTRAINT IF EXISTS experiences_responsibilities_en_max;
ALTER TABLE public.experiences ADD CONSTRAINT experiences_responsibilities_en_max
  CHECK (cardinality(responsibilities_en) <= 5);


-- ==============================================================================
-- 4. EDUCATIONS, CERTIFICATIONS, ACHIEVEMENTS, ORGANIZATIONS, LANGUAGES, SKILLS
-- ==============================================================================
ALTER TABLE public.educations
  ADD COLUMN IF NOT EXISTS degree_en TEXT,
  ADD COLUMN IF NOT EXISTS field_of_study_en TEXT,
  ADD COLUMN IF NOT EXISTS thesis_title_en TEXT;

ALTER TABLE public.certifications
  ADD COLUMN IF NOT EXISTS name_en TEXT,
  ADD COLUMN IF NOT EXISTS issuer_en TEXT;

ALTER TABLE public.achievements
  ADD COLUMN IF NOT EXISTS title_en TEXT,
  ADD COLUMN IF NOT EXISTS event_name_en TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT;

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS role_en TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT;

ALTER TABLE public.languages
  ADD COLUMN IF NOT EXISTS language_name_en TEXT,
  ADD COLUMN IF NOT EXISTS proficiency_level_en TEXT;

-- Only for names written in Indonesian (soft skills, "Jaringan Komputer"); tech names stay empty
ALTER TABLE public.skills
  ADD COLUMN IF NOT EXISTS name_en TEXT;

COMMIT;


-- ==============================================================================
-- CHECK (read only, runs after COMMIT): every column this migration adds, per table, and the
-- constraints it adds or replaces. "BELUM ADA" in the tipe column means that column is missing.
-- ==============================================================================
SELECT
  e.tabel,
  e.kolom,
  COALESCE(c.data_type, CASE WHEN k.constraint_name IS NOT NULL THEN 'aturan (CHECK)' END, 'BELUM ADA') AS tipe,
  c.is_nullable AS boleh_kosong,
  c.column_default AS nilai_awal,
  e.keterangan
FROM (
  VALUES
    ('profiles', 'tagline_en', 'tagline (Inggris)'),
    ('profiles', 'bio_en', 'bio (Inggris)'),
    ('profiles', 'primary_role_en', 'peran utama (Inggris), maks. 60 karakter'),
    ('profiles', 'secondary_roles_en', 'peran pendukung (Inggris), maks. 2'),
    ('profiles', 'hero_keywords_en', 'kata berganti (Inggris), maks. 8'),
    ('profiles', 'contact_topics_en', 'topik pesan (Inggris), maks. 8'),
    ('profiles', 'hobbies_en', 'hobi (Inggris)'),
    ('profiles', 'hero_labels', 'label panggung hero, maks. 10'),

    ('projects', 'title_en', 'judul (Inggris)'),
    ('projects', 'description_en', 'deskripsi singkat (Inggris)'),
    ('projects', 'client_name_en', 'klien (Inggris)'),
    ('projects', 'my_role_en', 'peran saya (Inggris)'),
    ('projects', 'problem_en', 'masalah (Inggris)'),
    ('projects', 'solution_en', 'solusi (Inggris)'),
    ('projects', 'outcome_en', 'hasil (Inggris)'),
    ('projects', 'content_en', 'detail teknis (Inggris)'),

    ('experiences', 'role_en', 'jabatan (Inggris)'),
    ('experiences', 'company_en', 'instansi (Inggris)'),
    ('experiences', 'description_en', 'ringkasan (Inggris)'),
    ('experiences', 'responsibilities_en', 'poin tugas (Inggris), maks. 5'),

    ('educations', 'degree_en', 'jenjang (Inggris)'),
    ('educations', 'field_of_study_en', 'jurusan (Inggris)'),
    ('educations', 'thesis_title_en', 'judul tugas akhir (Inggris)'),

    ('certifications', 'name_en', 'nama sertifikat (Inggris)'),
    ('certifications', 'issuer_en', 'penerbit (Inggris)'),

    ('achievements', 'title_en', 'nama pencapaian (Inggris)'),
    ('achievements', 'event_name_en', 'penyelenggara (Inggris)'),
    ('achievements', 'description_en', 'keterangan (Inggris)'),

    ('organizations', 'role_en', 'peran (Inggris)'),
    ('organizations', 'description_en', 'keterangan (Inggris)'),

    ('languages', 'language_name_en', 'nama bahasa (Inggris)'),
    ('languages', 'proficiency_level_en', 'tingkat (Inggris)'),

    ('skills', 'name_en', 'nama keahlian (Inggris)'),

    ('projects', 'projects_links_shape', 'aturan tautan (+ label_en)'),
    ('projects', 'projects_gallery_shape', 'aturan galeri (+ caption_en)'),
    ('profiles', 'profiles_hero_labels_shape', 'aturan label hero')
) AS e (tabel, kolom, keterangan)
LEFT JOIN information_schema.columns AS c
  ON c.table_schema = 'public'
  AND c.table_name = e.tabel
  AND c.column_name = e.kolom
LEFT JOIN information_schema.table_constraints AS k
  ON k.table_schema = 'public'
  AND k.table_name = e.tabel
  AND k.constraint_name = e.kolom
ORDER BY e.tabel, c.ordinal_position NULLS LAST, e.kolom;
