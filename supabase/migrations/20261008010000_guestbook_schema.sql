-- ==============================================================================
-- MIGRATION: GUESTBOOK (Buku Tamu Publik)
-- Timestamp: 2026-10-08T21:05:00Z
-- Requires: private.is_admin() (already used by the other migrations)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.guestbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  avatar_color VARCHAR(30) DEFAULT '#38bdf8',
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  admin_reply TEXT,
  admin_reply_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT guestbooks_name_length CHECK (char_length(name) <= 100),
  CONSTRAINT guestbooks_message_length CHECK (char_length(message) <= 240)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.guestbooks ENABLE ROW LEVEL SECURITY;

-- 1. Public can read all guestbook entries
DROP POLICY IF EXISTS "Allow public read access on guestbooks" ON public.guestbooks;
CREATE POLICY "Allow public read access on guestbooks"
  ON public.guestbooks FOR SELECT
  TO anon, authenticated
  USING (true);

-- 2. Public can insert a new entry, but cannot set admin-only fields
DROP POLICY IF EXISTS "Allow public insert on guestbooks" ON public.guestbooks;
CREATE POLICY "Allow public insert on guestbooks"
  ON public.guestbooks FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    admin_reply IS NULL
    AND admin_reply_at IS NULL
    AND is_pinned = false
  );

-- 3. Only the admin can update entries (reply or pin)
DROP POLICY IF EXISTS "Allow authenticated update on guestbooks" ON public.guestbooks;
DROP POLICY IF EXISTS "Admin can update guestbooks" ON public.guestbooks;
CREATE POLICY "Admin can update guestbooks"
  ON public.guestbooks FOR UPDATE
  TO authenticated
  USING ((select private.is_admin()))
  WITH CHECK ((select private.is_admin()));

-- 4. Only the admin can delete entries
DROP POLICY IF EXISTS "Allow authenticated delete on guestbooks" ON public.guestbooks;
DROP POLICY IF EXISTS "Admin can delete guestbooks" ON public.guestbooks;
CREATE POLICY "Admin can delete guestbooks"
  ON public.guestbooks FOR DELETE
  TO authenticated
  USING ((select private.is_admin()));
