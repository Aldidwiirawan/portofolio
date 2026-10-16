BEGIN;

-- ==============================================================================
-- Migration: Admin content model (Tahap 2B)
-- Date: 2026-10-16
-- Description:
-- 1. New content columns for profiles, projects, experiences, educations, certifications,
--    achievements, skills, languages and organizations (visibility, featured flag, order,
--    images, PDF files and the details the admin forms collect), plus messages.topic for the
--    topic a visitor picks in the contact form.
-- 2. Columns the admin already uses are guaranteed to exist (ADD COLUMN IF NOT EXISTS does
--    nothing when they are there): profiles.avatar_url (profile photo), profiles.location and
--    experiences.location (city name only), and sort_order (display order) on projects,
--    experiences, educations and skills.
-- 3. Storage: bucket portfolio-assets accepts only PNG, JPEG, WebP and PDF (no SVG), up to 5 MB,
--    plus admin policies for the new folders profile/, logos/, gallery/, cv/, documents/ and
--    certificates/.
--
-- Requires: private.is_admin() and the tables used by the earlier migrations.
-- Runs as one transaction: when any statement fails, nothing is changed. Safe to run more than
-- once. The query after COMMIT lists every added or guaranteed column per table.
-- Table RLS policies and the existing projects/ storage policies are not changed. New choice
-- columns store codes (e.g. 'production'); the admin shows the labels.
-- ==============================================================================


-- ==============================================================================
-- 1. PROFILES
-- ==============================================================================
-- avatar_url (profile photo) and location (city) already exist; listed so they are guaranteed
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS cv_file_url TEXT,
  ADD COLUMN IF NOT EXISTS primary_role TEXT,
  ADD COLUMN IF NOT EXISTS secondary_roles TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  ADD COLUMN IF NOT EXISTS hero_keywords TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  ADD COLUMN IF NOT EXISTS github_username TEXT,
  ADD COLUMN IF NOT EXISTS contact_topics TEXT[] NOT NULL
    DEFAULT ARRAY['Tawaran kerja', 'Kerja sama proyek', 'Pertanyaan umum']::TEXT[];

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_primary_role_length;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_primary_role_length
  CHECK (primary_role IS NULL OR char_length(primary_role) <= 60);

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_secondary_roles_max;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_secondary_roles_max
  CHECK (cardinality(secondary_roles) <= 2);

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_hero_keywords_max;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_hero_keywords_max
  CHECK (cardinality(hero_keywords) <= 8);

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_contact_topics_max;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_contact_topics_max
  CHECK (cardinality(contact_topics) <= 8);

-- GitHub usernames: letters, digits and single hyphens, at most 39 characters,
-- not starting or ending with a hyphen
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_github_username_format;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_github_username_format
  CHECK (
    github_username IS NULL
    OR (
      github_username ~ '^[A-Za-z0-9-]{1,39}$'
      AND github_username !~ '(^-|-$|--)'
    )
  );


-- ==============================================================================
-- 2. PROJECTS
-- ==============================================================================
-- sort_order (display order) already exists; listed so it is guaranteed
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gallery JSONB NOT NULL DEFAULT '[]'::JSONB,
  ADD COLUMN IF NOT EXISTS status TEXT,
  ADD COLUMN IF NOT EXISTS year SMALLINT,
  ADD COLUMN IF NOT EXISTS project_type TEXT,
  ADD COLUMN IF NOT EXISTS client_name TEXT,
  ADD COLUMN IF NOT EXISTS my_role TEXT,
  ADD COLUMN IF NOT EXISTS problem TEXT,
  ADD COLUMN IF NOT EXISTS solution TEXT,
  ADD COLUMN IF NOT EXISTS outcome TEXT,
  ADD COLUMN IF NOT EXISTS is_repo_private BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT true;

-- Gallery: an array of at most 5 objects, each with a "url" string (optional "caption")
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_gallery_shape;
ALTER TABLE public.projects ADD CONSTRAINT projects_gallery_shape
  CHECK (
    CASE
      WHEN jsonb_typeof(gallery) = 'array' THEN
        jsonb_array_length(gallery) <= 5
        AND NOT jsonb_path_exists(gallery, '$[*] ? (!(@.url.type() == "string"))')
      ELSE false
    END
  );

ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_status_values;
ALTER TABLE public.projects ADD CONSTRAINT projects_status_values
  CHECK (status IS NULL OR status IN ('production', 'completed', 'final_project', 'in_development', 'concept'));

ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_type_values;
ALTER TABLE public.projects ADD CONSTRAINT projects_type_values
  CHECK (project_type IS NULL OR project_type IN ('web', 'mobile', 'desktop', 'network', 'other'));

ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_year_range;
ALTER TABLE public.projects ADD CONSTRAINT projects_year_range
  CHECK (year IS NULL OR year BETWEEN 2000 AND 2100);


-- ==============================================================================
-- 3. EXPERIENCES
-- ==============================================================================
-- location (city) and sort_order (display order) already exist; listed so they are guaranteed
ALTER TABLE public.experiences
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS responsibilities TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  ADD COLUMN IF NOT EXISTS skill_tags TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS photos JSONB NOT NULL DEFAULT '[]'::JSONB,
  ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;

-- Experience types are now Magang, Kerja, Freelance and Organisasi: PKL becomes Magang
UPDATE public.experiences
SET experience_type = 'Magang'
WHERE experience_type = 'PKL';

ALTER TABLE public.experiences DROP CONSTRAINT IF EXISTS experiences_responsibilities_max;
ALTER TABLE public.experiences ADD CONSTRAINT experiences_responsibilities_max
  CHECK (cardinality(responsibilities) <= 5);

ALTER TABLE public.experiences DROP CONSTRAINT IF EXISTS experiences_skill_tags_max;
ALTER TABLE public.experiences ADD CONSTRAINT experiences_skill_tags_max
  CHECK (cardinality(skill_tags) <= 12);

-- Photos: same shape as the project gallery, at most 3
ALTER TABLE public.experiences DROP CONSTRAINT IF EXISTS experiences_photos_shape;
ALTER TABLE public.experiences ADD CONSTRAINT experiences_photos_shape
  CHECK (
    CASE
      WHEN jsonb_typeof(photos) = 'array' THEN
        jsonb_array_length(photos) <= 3
        AND NOT jsonb_path_exists(photos, '$[*] ? (!(@.url.type() == "string"))')
      ELSE false
    END
  );

-- Related project (optional). The projects table was created in the dashboard, so the column
-- copies the type of projects.id instead of assuming UUID.
DO $$
DECLARE
  project_id_type TEXT;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'experiences'
      AND column_name = 'related_project_id'
  ) THEN
    SELECT format_type(a.atttypid, a.atttypmod)
    INTO project_id_type
    FROM pg_attribute a
    WHERE a.attrelid = 'public.projects'::regclass
      AND a.attname = 'id'
      AND NOT a.attisdropped;

    EXECUTE format(
      'ALTER TABLE public.experiences ADD COLUMN related_project_id %s REFERENCES public.projects(id) ON DELETE SET NULL',
      project_id_type
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS experiences_related_project_id_idx
  ON public.experiences (related_project_id);


-- ==============================================================================
-- 4. EDUCATIONS
-- ==============================================================================
-- sort_order (display order) already exists; listed so it is guaranteed
ALTER TABLE public.educations
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS gpa NUMERIC(3, 2),
  ADD COLUMN IF NOT EXISTS thesis_title TEXT,
  ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.educations DROP CONSTRAINT IF EXISTS educations_gpa_range;
ALTER TABLE public.educations ADD CONSTRAINT educations_gpa_range
  CHECK (gpa IS NULL OR (gpa >= 0 AND gpa <= 4));


-- ==============================================================================
-- 5. CERTIFICATIONS (also used for trainings)
-- ==============================================================================
ALTER TABLE public.certifications
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS expiry_date DATE,
  ADD COLUMN IF NOT EXISTS no_expiry BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS credential_id TEXT,
  ADD COLUMN IF NOT EXISTS score TEXT,
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS pdf_url TEXT,
  ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.certifications DROP CONSTRAINT IF EXISTS certifications_category_values;
ALTER TABLE public.certifications ADD CONSTRAINT certifications_category_values
  CHECK (category IS NULL OR category IN ('competency', 'network', 'language', 'training', 'internship'));

-- "Tidak kedaluwarsa" and an expiry date cannot both be set
ALTER TABLE public.certifications DROP CONSTRAINT IF EXISTS certifications_expiry_choice;
ALTER TABLE public.certifications ADD CONSTRAINT certifications_expiry_choice
  CHECK (NOT (no_expiry AND expiry_date IS NOT NULL));

ALTER TABLE public.certifications DROP CONSTRAINT IF EXISTS certifications_expiry_after_issue;
ALTER TABLE public.certifications ADD CONSTRAINT certifications_expiry_after_issue
  CHECK (expiry_date IS NULL OR issue_date IS NULL OR expiry_date >= issue_date);


-- ==============================================================================
-- 6. ACHIEVEMENTS
-- ==============================================================================
ALTER TABLE public.achievements
  ADD COLUMN IF NOT EXISTS month SMALLINT,
  ADD COLUMN IF NOT EXISTS document_url TEXT,
  ADD COLUMN IF NOT EXISTS photo_url TEXT,
  ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.achievements DROP CONSTRAINT IF EXISTS achievements_month_range;
ALTER TABLE public.achievements ADD CONSTRAINT achievements_month_range
  CHECK (month IS NULL OR month BETWEEN 1 AND 12);


-- ==============================================================================
-- 7. SKILLS, LANGUAGES, ORGANIZATIONS
-- ==============================================================================
-- skills.sort_order (display order) already exists; listed so it is guaranteed
ALTER TABLE public.skills
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS icon_url TEXT,
  ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.languages
  ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;


-- ==============================================================================
-- 8. MESSAGES
-- ==============================================================================
-- Topic the visitor picks in the contact form (one of profiles.contact_topics, at most 60
-- characters in the admin). Optional: older messages and messages without a topic stay NULL.
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS topic TEXT;

ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_topic_length;
ALTER TABLE public.messages ADD CONSTRAINT messages_topic_length
  CHECK (topic IS NULL OR char_length(topic) <= 60);


-- ==============================================================================
-- 9. STORAGE: bucket portfolio-assets
-- ==============================================================================

-- 9.1 Only PNG, JPEG, WebP and PDF (no SVG). The bucket has a single size limit, so it is 5 MB
--     (PDF); the admin keeps images at 2 MB or less (compressed in the browser before upload).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-assets',
  'portfolio-assets',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 9.2 Admin policies for the content folders. The four policies for projects/ from
--     20260928000000_storage_portfolio_assets.sql stay as they are; policies are combined with OR.
--
--     Folder         Content                                              Extensions
--     profile/       profile photo                                        webp, png, jpg, jpeg
--     logos/         experience/education/organization logos, skill icons webp, png, jpg, jpeg
--     gallery/       project screenshots, experience and achievement photos webp, png, jpg, jpeg
--     cv/            CV                                                   pdf
--     documents/     achievement documents                                pdf
--     certificates/  certificate images and PDFs                          webp, png, jpg, jpeg, pdf
DROP POLICY IF EXISTS "Admin select content folders on portfolio-assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin insert content folders on portfolio-assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin update content folders on portfolio-assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete content folders on portfolio-assets" ON storage.objects;

CREATE POLICY "Admin select content folders on portfolio-assets"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'portfolio-assets'
  AND (storage.foldername(name))[1] IN ('profile', 'logos', 'gallery', 'cv', 'documents', 'certificates')
  AND (select private.is_admin())
);

CREATE POLICY "Admin insert content folders on portfolio-assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'portfolio-assets'
  AND (select private.is_admin())
  AND (
    (
      (storage.foldername(name))[1] IN ('profile', 'logos', 'gallery')
      AND lower(storage.extension(name)) IN ('webp', 'png', 'jpg', 'jpeg')
    )
    OR (
      (storage.foldername(name))[1] IN ('cv', 'documents')
      AND lower(storage.extension(name)) = 'pdf'
    )
    OR (
      (storage.foldername(name))[1] = 'certificates'
      AND lower(storage.extension(name)) IN ('webp', 'png', 'jpg', 'jpeg', 'pdf')
    )
  )
);

CREATE POLICY "Admin update content folders on portfolio-assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'portfolio-assets'
  AND (storage.foldername(name))[1] IN ('profile', 'logos', 'gallery', 'cv', 'documents', 'certificates')
  AND (select private.is_admin())
)
WITH CHECK (
  bucket_id = 'portfolio-assets'
  AND (select private.is_admin())
  AND (
    (
      (storage.foldername(name))[1] IN ('profile', 'logos', 'gallery')
      AND lower(storage.extension(name)) IN ('webp', 'png', 'jpg', 'jpeg')
    )
    OR (
      (storage.foldername(name))[1] IN ('cv', 'documents')
      AND lower(storage.extension(name)) = 'pdf'
    )
    OR (
      (storage.foldername(name))[1] = 'certificates'
      AND lower(storage.extension(name)) IN ('webp', 'png', 'jpg', 'jpeg', 'pdf')
    )
  )
);

CREATE POLICY "Admin delete content folders on portfolio-assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'portfolio-assets'
  AND (storage.foldername(name))[1] IN ('profile', 'logos', 'gallery', 'cv', 'documents', 'certificates')
  AND (select private.is_admin())
);

COMMIT;


-- ==============================================================================
-- CHECK (read only, runs after COMMIT): every column this migration adds or guarantees, per
-- table. "BELUM ADA" in the tipe column means that column is missing.
-- ==============================================================================
SELECT
  e.tabel,
  e.kolom,
  COALESCE(c.data_type, 'BELUM ADA') AS tipe,
  c.is_nullable AS boleh_kosong,
  c.column_default AS nilai_awal,
  e.keterangan
FROM (
  VALUES
    ('profiles', 'avatar_url', 'foto profil (sudah ada)'),
    ('profiles', 'location', 'kota (sudah ada)'),
    ('profiles', 'cv_file_url', 'baru'),
    ('profiles', 'primary_role', 'baru'),
    ('profiles', 'secondary_roles', 'baru'),
    ('profiles', 'hero_keywords', 'baru'),
    ('profiles', 'github_username', 'baru'),
    ('profiles', 'contact_topics', 'baru'),

    ('projects', 'sort_order', 'urutan tampil (sudah ada)'),
    ('projects', 'gallery', 'baru'),
    ('projects', 'status', 'baru'),
    ('projects', 'year', 'baru'),
    ('projects', 'project_type', 'baru'),
    ('projects', 'client_name', 'baru'),
    ('projects', 'my_role', 'baru'),
    ('projects', 'problem', 'baru'),
    ('projects', 'solution', 'baru'),
    ('projects', 'outcome', 'baru'),
    ('projects', 'is_repo_private', 'baru'),
    ('projects', 'is_visible', 'baru'),

    ('experiences', 'location', 'kota (sudah ada)'),
    ('experiences', 'sort_order', 'urutan tampil (sudah ada)'),
    ('experiences', 'responsibilities', 'baru'),
    ('experiences', 'skill_tags', 'baru'),
    ('experiences', 'logo_url', 'baru'),
    ('experiences', 'photos', 'baru'),
    ('experiences', 'related_project_id', 'baru'),
    ('experiences', 'is_visible', 'baru'),
    ('experiences', 'is_featured', 'baru'),

    ('educations', 'sort_order', 'urutan tampil (sudah ada)'),
    ('educations', 'logo_url', 'baru'),
    ('educations', 'gpa', 'baru'),
    ('educations', 'thesis_title', 'baru'),
    ('educations', 'is_visible', 'baru'),

    ('certifications', 'category', 'baru'),
    ('certifications', 'expiry_date', 'baru'),
    ('certifications', 'no_expiry', 'baru'),
    ('certifications', 'credential_id', 'baru'),
    ('certifications', 'score', 'baru'),
    ('certifications', 'image_url', 'baru'),
    ('certifications', 'pdf_url', 'baru'),
    ('certifications', 'is_visible', 'baru'),
    ('certifications', 'is_featured', 'baru'),
    ('certifications', 'sort_order', 'baru'),

    ('achievements', 'month', 'baru'),
    ('achievements', 'document_url', 'baru'),
    ('achievements', 'photo_url', 'baru'),
    ('achievements', 'is_visible', 'baru'),
    ('achievements', 'is_featured', 'baru'),
    ('achievements', 'sort_order', 'baru'),

    ('skills', 'sort_order', 'urutan tampil (sudah ada)'),
    ('skills', 'icon_url', 'baru'),
    ('skills', 'is_visible', 'baru'),
    ('skills', 'is_featured', 'baru'),

    ('languages', 'is_visible', 'baru'),
    ('languages', 'sort_order', 'baru'),

    ('organizations', 'logo_url', 'baru'),
    ('organizations', 'is_visible', 'baru'),
    ('organizations', 'sort_order', 'baru'),

    ('messages', 'topic', 'baru')
) AS e (tabel, kolom, keterangan)
LEFT JOIN information_schema.columns AS c
  ON c.table_schema = 'public'
  AND c.table_name = e.tabel
  AND c.column_name = e.kolom
ORDER BY e.tabel, c.ordinal_position NULLS LAST, e.kolom;
