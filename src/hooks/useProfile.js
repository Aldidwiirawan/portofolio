import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

// Columns rendered on the public portfolio page. Never include user_id or full_address here.
const PUBLIC_PROFILE_COLUMNS =
  'full_name, tagline, bio, location, email, phone_number, github_url, linkedin_url, instagram_url, resume_url, resume_link, hobbies, avatar_url, is_available'

// The admin form also needs the row id (to update instead of insert), full_address and the
// columns added in stage 2B (migration 20261016000000).
const ADMIN_PROFILE_COLUMNS = `id, ${PUBLIC_PROFILE_COLUMNS}, full_address, cv_file_url, primary_role, secondary_roles, hero_keywords, github_username, contact_topics`

/**
 * Custom Hook: useProfile
 * Provides read access for public.profiles table.
 * Fetches the primary portfolio profile record.
 *
 * @param {{ includePrivateFields?: boolean }} [options]
 *   Set includePrivateFields to true only in the admin CMS.
 * @returns {{
 *   profile: Object | null,
 *   isLoading: boolean,
 *   error: string | null,
 *   refetch: () => void
 * }}
 */
export function useProfile({ includePrivateFields = false } = {}) {
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  const refetch = useCallback(() => {
    setIsLoading(true)
    setError(null)
    setReloadKey((prev) => prev + 1)
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadProfile() {
      try {
        const { data, error: queryError } = await supabase
          .from('profiles')
          .select(includePrivateFields ? ADMIN_PROFILE_COLUMNS : PUBLIC_PROFILE_COLUMNS)
          .limit(1)
          .maybeSingle()

        if (!isMounted) return

        if (queryError) {
          throw new Error(queryError.message || 'Gagal memuat data profil dari database.')
        }

        setProfile(data ?? null)
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Terjadi kesalahan sistem saat mengambil data profil.'
          )
          setProfile(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [reloadKey, includePrivateFields])

  return {
    profile,
    isLoading,
    error,
    refetch,
  }
}
