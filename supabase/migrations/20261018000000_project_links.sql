BEGIN;

-- ==============================================================================
-- Migration: Project links
-- Date: 2026-10-18
-- Description:
-- 1. projects.links: a project can have several links, e.g. two repositories (web console and
--    mobile app). A JSONB array of at most 6 objects:
--      label       text, required, 1–60 characters, not only spaces
--      type        'code' | 'demo' | 'docs' | 'video' | 'other'
--      url         text that starts with https://, or null; required when the link is public
--      is_private  boolean
-- 2. Existing github_url and demo_url are copied into links, labelled "Kode" and "Demo". The old
--    columns stay: the admin keeps writing the first public code and demo link to them, so the
--    public page keeps working until stage 3.
--
-- Copy rules: only rows whose links are still empty, and only https:// addresses (the old form
-- also accepted http://; such an address stays in its old column and the check query below lists
-- it, so it can be fixed in the admin). The copied code link is private when the project is marked
-- "Repo privat".
--
-- Requires: 20261016000000_admin_content_model.sql (projects.is_repo_private).
-- Runs as one transaction: when any statement fails, nothing is changed. Safe to run more than
-- once: the column is added only once, the constraint is replaced, and rows that already have
-- links are not copied again. RLS policies are not changed.
-- ==============================================================================


-- ==============================================================================
-- 1. COLUMN
-- ==============================================================================
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS links JSONB NOT NULL DEFAULT '[]'::JSONB;


-- ==============================================================================
-- 2. SHAPE OF EVERY LINK
-- ==============================================================================
-- - links is an array of at most 6 items and every item is an object (strict mode, so a nested
--   array is not unwrapped into its items);
-- - no item fails the rules (lax mode: a missing key simply fails its rule). Each rule first
--   checks the value type, so a wrong type makes the item invalid instead of skipping the rule.
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
          ))'
        )
      ELSE false
    END
  );


-- ==============================================================================
-- 3. COPY github_url AND demo_url INTO links
-- ==============================================================================
UPDATE public.projects AS p
SET links = (
  SELECT jsonb_agg(moved.item ORDER BY moved.position)
  FROM (
    SELECT
      1 AS position,
      jsonb_build_object(
        'label', 'Kode',
        'type', 'code',
        'url', btrim(p.github_url),
        'is_private', COALESCE(p.is_repo_private, false)
      ) AS item
    WHERE btrim(p.github_url) ~ '^https://\S+$'
    UNION ALL
    SELECT
      2,
      jsonb_build_object('label', 'Demo', 'type', 'demo', 'url', btrim(p.demo_url), 'is_private', false)
    WHERE btrim(p.demo_url) ~ '^https://\S+$'
  ) AS moved
)
WHERE p.links = '[]'::JSONB
  AND (btrim(p.github_url) ~ '^https://\S+$' OR btrim(p.demo_url) ~ '^https://\S+$');

COMMIT;


-- ==============================================================================
-- CHECK (read only, runs after COMMIT): one row per project with its links. "BELUM ADA" in
-- jumlah_tautan means the column is missing (the migration did not run). "catatan" names an old
-- code or demo address that is not in the links yet (e.g. an http:// address); fix it in the admin.
-- ==============================================================================
SELECT
  p.title AS proyek,
  CASE WHEN j.row_data -> 'links' IS NULL THEN 'BELUM ADA' ELSE jsonb_array_length(j.row_data -> 'links')::TEXT END AS jumlah_tautan,
  (
    SELECT count(*)
    FROM jsonb_array_elements(COALESCE(j.row_data -> 'links', '[]'::JSONB)) AS l (item)
    WHERE l.item ->> 'is_private' = 'true'
  ) AS privat,
  (
    SELECT string_agg(
      format('%s (%s%s)', l.item ->> 'label', l.item ->> 'type', CASE WHEN l.item ->> 'is_private' = 'true' THEN ', privat' ELSE '' END),
      ' · ' ORDER BY l.position
    )
    FROM jsonb_array_elements(COALESCE(j.row_data -> 'links', '[]'::JSONB)) WITH ORDINALITY AS l (item, position)
  ) AS tautan,
  p.github_url,
  p.demo_url,
  NULLIF(concat_ws('; ',
    CASE
      WHEN NULLIF(btrim(p.github_url), '') IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM jsonb_array_elements(COALESCE(j.row_data -> 'links', '[]'::JSONB)) AS l (item)
          WHERE l.item ->> 'url' = btrim(p.github_url)
        )
      THEN 'tautan kode lama belum ada di daftar tautan'
    END,
    CASE
      WHEN NULLIF(btrim(p.demo_url), '') IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM jsonb_array_elements(COALESCE(j.row_data -> 'links', '[]'::JSONB)) AS l (item)
          WHERE l.item ->> 'url' = btrim(p.demo_url)
        )
      THEN 'tautan demo lama belum ada di daftar tautan'
    END
  ), '') AS catatan
FROM public.projects AS p
CROSS JOIN LATERAL (SELECT to_jsonb(p) AS row_data) AS j
ORDER BY p.sort_order NULLS LAST, p.created_at;
