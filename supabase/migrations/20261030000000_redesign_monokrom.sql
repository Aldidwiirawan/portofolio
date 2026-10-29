-- ==============================================================================
-- Migration: Monochrome redesign content (feat/redesign-monokrom, phase 1)
-- Date: 2026-10-30
-- Description:
-- 1. projects: the four numbered points of the new project page. problem and solution already
--    exist; this adds
--      background, background_en   TEXT    "Latar belakang"
--      features, features_en       TEXT[]  "Fitur utama", at most 8 items each; item n of
--                                          features_en translates item n of features
--    The short lead under the title stays description (already the short description).
-- 2. projects.gallery: every image may say what it is, for the media viewer of the project page
--    (the cover stays thumbnail_url):
--      kind             'gallery' | 'diagram'   missing or null = gallery
--      device           'web' | 'mobile'        missing or null = web ("Layar Web / Layar HP")
--      label, label_en  text, at most 24 characters, or null (short name of a diagram, e.g. "ERD")
--    The limit goes from 5 to 12 images. url, caption and caption_en stay as they are.
-- 3. Journey photos (the folder of the timeline): experiences.photos already exists (at most 3,
--    uploaded in the admin); its rule now also checks caption and caption_en (the alt text, ID and
--    EN). educations gets the same photos column with the same rule. Files stay in the gallery/
--    folder of portfolio-assets, which the storage policies already allow.
--
-- Requires: 20261016000000_admin_content_model.sql and 20261019000000_english_content.sql.
-- Runs as one transaction: when any statement fails, nothing is changed. Safe to run more than
-- once: columns are added only once and constraints are replaced. No data is changed, no table is
-- created and RLS policies are not touched.
--
-- How to run (Supabase SQL Editor shows only the result of the last query):
-- a. Select part 0 only and run it: it shows which columns exist and whether the saved images pass
--    the new rules ("lolos aturan baru" must be "ya" everywhere).
-- b. Run the whole file. The result shown is the check after COMMIT.
-- ==============================================================================


-- ==============================================================================
-- 0. CHECK BEFORE (read only)
-- ==============================================================================
-- bagian: kolom (does the column exist), galeri (images per project), foto (photos per experience).
-- "lolos aturan baru" uses the same rules as part 2 and 3 below.
SELECT bagian, nama, nilai, keterangan
FROM (
  SELECT 1 AS no, 'kolom' AS bagian, e.tabel || '.' || e.kolom AS nama,
    CASE WHEN c.column_name IS NULL THEN 'BELUM ADA' ELSE 'ADA' END AS nilai,
    e.keterangan
  FROM (
    VALUES
      ('projects', 'background', 'latar belakang (baru)'),
      ('projects', 'background_en', 'latar belakang EN (baru)'),
      ('projects', 'features', 'fitur utama (baru)'),
      ('projects', 'features_en', 'fitur utama EN (baru)'),
      ('projects', 'gallery', 'galeri (sudah ada, aturannya diganti)'),
      ('experiences', 'photos', 'foto pengalaman (sudah ada, aturannya diganti)'),
      ('educations', 'photos', 'foto pendidikan (baru)')
  ) AS e (tabel, kolom, keterangan)
  LEFT JOIN information_schema.columns AS c
    ON c.table_schema = 'public' AND c.table_name = e.tabel AND c.column_name = e.kolom

  UNION ALL
  SELECT 2, 'galeri', p.slug, jsonb_array_length(p.gallery)::TEXT || ' gambar',
    'lolos aturan baru: ' || CASE WHEN
      jsonb_array_length(p.gallery) <= 12
      AND NOT jsonb_path_exists(p.gallery, '$[*] ? (!(@.url.type() == "string"))')
      AND NOT jsonb_path_exists(
        p.gallery,
        'lax $[*] ? (!(
           (!exists(@.caption) || @.caption.type() == "null" || @.caption.type() == "string")
           && (!exists(@.caption_en) || @.caption_en.type() == "null" || @.caption_en.type() == "string")
           && (!exists(@.kind) || @.kind.type() == "null"
               || (@.kind.type() == "string" && (@.kind == "gallery" || @.kind == "diagram")))
           && (!exists(@.device) || @.device.type() == "null"
               || (@.device.type() == "string" && (@.device == "web" || @.device == "mobile")))
           && (!exists(@.label) || @.label.type() == "null"
               || (@.label.type() == "string" && !(@.label like_regex "^.{25}" flag "s")))
           && (!exists(@.label_en) || @.label_en.type() == "null"
               || (@.label_en.type() == "string" && !(@.label_en like_regex "^.{25}" flag "s")))
        ))'
      )
    THEN 'ya' ELSE 'TIDAK' END
  FROM public.projects AS p
  WHERE jsonb_typeof(p.gallery) = 'array'

  UNION ALL
  SELECT 3, 'foto', x.company || ' · ' || x.role, jsonb_array_length(x.photos)::TEXT || ' foto',
    'lolos aturan baru: ' || CASE WHEN
      jsonb_array_length(x.photos) <= 3
      AND NOT jsonb_path_exists(x.photos, '$[*] ? (!(@.url.type() == "string"))')
      AND NOT jsonb_path_exists(
        x.photos,
        'lax $[*] ? (!(
           (!exists(@.caption) || @.caption.type() == "null" || @.caption.type() == "string")
           && (!exists(@.caption_en) || @.caption_en.type() == "null" || @.caption_en.type() == "string")
        ))'
      )
    THEN 'ya' ELSE 'TIDAK' END
  FROM public.experiences AS x
  WHERE jsonb_typeof(x.photos) = 'array'
) AS cek
ORDER BY no, nama;


BEGIN;

-- ==============================================================================
-- 1. PROJECTS: background and main features
-- ==============================================================================
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS background TEXT,
  ADD COLUMN IF NOT EXISTS background_en TEXT,
  ADD COLUMN IF NOT EXISTS features TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  ADD COLUMN IF NOT EXISTS features_en TEXT[] NOT NULL DEFAULT '{}'::TEXT[];

ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_features_max;
ALTER TABLE public.projects ADD CONSTRAINT projects_features_max
  CHECK (cardinality(features) <= 8);

ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_features_en_max;
ALTER TABLE public.projects ADD CONSTRAINT projects_features_en_max
  CHECK (cardinality(features_en) <= 8);


-- ==============================================================================
-- 2. PROJECTS: gallery images with kind, device and label
-- ==============================================================================
-- The rules of 20261019000000 (every item has a url string; caption_en null or text) plus caption,
-- kind, device, label and label_en. Lax mode: a missing key passes its rule. Each rule checks the
-- value type first, so a wrong type makes the item invalid instead of skipping the rule.
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_gallery_shape;
ALTER TABLE public.projects ADD CONSTRAINT projects_gallery_shape
  CHECK (
    CASE
      WHEN jsonb_typeof(gallery) = 'array' THEN
        jsonb_array_length(gallery) <= 12
        AND NOT jsonb_path_exists(gallery, '$[*] ? (!(@.url.type() == "string"))')
        AND NOT jsonb_path_exists(
          gallery,
          'lax $[*] ? (!(
             (!exists(@.caption) || @.caption.type() == "null" || @.caption.type() == "string")
             && (!exists(@.caption_en) || @.caption_en.type() == "null" || @.caption_en.type() == "string")
             && (!exists(@.kind) || @.kind.type() == "null"
                 || (@.kind.type() == "string" && (@.kind == "gallery" || @.kind == "diagram")))
             && (!exists(@.device) || @.device.type() == "null"
                 || (@.device.type() == "string" && (@.device == "web" || @.device == "mobile")))
             && (!exists(@.label) || @.label.type() == "null"
                 || (@.label.type() == "string" && !(@.label like_regex "^.{25}" flag "s")))
             && (!exists(@.label_en) || @.label_en.type() == "null"
                 || (@.label_en.type() == "string" && !(@.label_en like_regex "^.{25}" flag "s")))
          ))'
        )
      ELSE false
    END
  );


-- ==============================================================================
-- 3. JOURNEY PHOTOS: experiences.photos (existing) and educations.photos (new)
-- ==============================================================================
-- At most 3 photos, each with a url string and an optional caption / caption_en (the alt text)
ALTER TABLE public.experiences DROP CONSTRAINT IF EXISTS experiences_photos_shape;
ALTER TABLE public.experiences ADD CONSTRAINT experiences_photos_shape
  CHECK (
    CASE
      WHEN jsonb_typeof(photos) = 'array' THEN
        jsonb_array_length(photos) <= 3
        AND NOT jsonb_path_exists(photos, '$[*] ? (!(@.url.type() == "string"))')
        AND NOT jsonb_path_exists(
          photos,
          'lax $[*] ? (!(
             (!exists(@.caption) || @.caption.type() == "null" || @.caption.type() == "string")
             && (!exists(@.caption_en) || @.caption_en.type() == "null" || @.caption_en.type() == "string")
          ))'
        )
      ELSE false
    END
  );

ALTER TABLE public.educations
  ADD COLUMN IF NOT EXISTS photos JSONB NOT NULL DEFAULT '[]'::JSONB;

ALTER TABLE public.educations DROP CONSTRAINT IF EXISTS educations_photos_shape;
ALTER TABLE public.educations ADD CONSTRAINT educations_photos_shape
  CHECK (
    CASE
      WHEN jsonb_typeof(photos) = 'array' THEN
        jsonb_array_length(photos) <= 3
        AND NOT jsonb_path_exists(photos, '$[*] ? (!(@.url.type() == "string"))')
        AND NOT jsonb_path_exists(
          photos,
          'lax $[*] ? (!(
             (!exists(@.caption) || @.caption.type() == "null" || @.caption.type() == "string")
             && (!exists(@.caption_en) || @.caption_en.type() == "null" || @.caption_en.type() == "string")
          ))'
        )
      ELSE false
    END
  );

COMMIT;


-- ==============================================================================
-- CHECK AFTER (read only, runs after COMMIT): every column and rule of this migration, then the
-- images per project and the photos per experience and education. "BELUM ADA" in the tipe column
-- means that column or rule is missing.
-- ==============================================================================
SELECT bagian, nama, tipe, keterangan
FROM (
  SELECT 1 AS no, 'kolom' AS bagian, e.tabel || '.' || e.kolom AS nama,
    COALESCE(c.data_type, CASE WHEN k.constraint_name IS NOT NULL THEN 'aturan (CHECK)' END, 'BELUM ADA') AS tipe,
    e.keterangan
  FROM (
    VALUES
      ('projects', 'background', 'latar belakang'),
      ('projects', 'background_en', 'latar belakang (Inggris)'),
      ('projects', 'features', 'fitur utama, maks. 8'),
      ('projects', 'features_en', 'fitur utama (Inggris), maks. 8'),
      ('educations', 'photos', 'foto pendidikan, maks. 3'),
      ('projects', 'projects_features_max', 'aturan fitur utama'),
      ('projects', 'projects_features_en_max', 'aturan fitur utama (Inggris)'),
      ('projects', 'projects_gallery_shape', 'aturan galeri: maks. 12, kind, device, label'),
      ('experiences', 'experiences_photos_shape', 'aturan foto pengalaman: maks. 3, caption'),
      ('educations', 'educations_photos_shape', 'aturan foto pendidikan: maks. 3, caption')
  ) AS e (tabel, kolom, keterangan)
  LEFT JOIN information_schema.columns AS c
    ON c.table_schema = 'public' AND c.table_name = e.tabel AND c.column_name = e.kolom
  LEFT JOIN information_schema.table_constraints AS k
    ON k.table_schema = 'public' AND k.table_name = e.tabel AND k.constraint_name = e.kolom

  UNION ALL
  SELECT 2, 'galeri', p.slug, jsonb_array_length(p.gallery)::TEXT || ' gambar', 'maks. 12'
  FROM public.projects AS p

  UNION ALL
  SELECT 3, 'foto pengalaman', x.company || ' · ' || x.role, jsonb_array_length(x.photos)::TEXT || ' foto', 'maks. 3'
  FROM public.experiences AS x

  UNION ALL
  SELECT 4, 'foto pendidikan', d.institution, jsonb_array_length(COALESCE(to_jsonb(d) -> 'photos', '[]'::JSONB))::TEXT || ' foto', 'maks. 3'
  FROM public.educations AS d
) AS cek
ORDER BY no, nama;
