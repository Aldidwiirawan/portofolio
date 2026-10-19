import { useCallback, useEffect, useState } from 'react'
import { selectWithEnglish } from '../lib/englishColumns'
import { supabase } from '../lib/supabaseClient'

// Columns read by the public portfolio page (unchanged).
const PUBLIC_COLUMNS =
  'id, company, role, location, start_date, end_date, is_current, description, sort_order, experience_type, created_at'

// The admin also reads the content columns added in stage 2B (migration 20261016000000).
const ADMIN_COLUMNS = `${PUBLIC_COLUMNS}, responsibilities, skill_tags, logo_url, photos, related_project_id, is_visible, is_featured`

// English versions (migration 20261019000000), read by the admin only; while that migration has not
// been run the query runs again without them (lib/englishColumns.js).
const ENGLISH_COLUMNS = 'role_en, company_en, description_en, responsibilities_en'

/**
 * Custom Hook: useExperiences
 * Provides read access for public.experiences table.
 * Encapsulates data fetching, loading state, error handling, and refetch capabilities.
 *
 * @param {{ includeAdminFields?: boolean }} [options]
 *   Set includeAdminFields to true only in the admin (columns from the stage 2B migration).
 * @returns {{
 *   experiences: Array<Object>,
 *   isLoading: boolean,
 *   error: string | null,
 *   refetch: () => void
 * }}
 */
export function useExperiences({ includeAdminFields = false } = {}) {
  const [experiences, setExperiences] = useState([])
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

    async function loadExperiences() {
      try {
        const { data, error: queryError } = await selectWithEnglish(
          (columns) =>
            supabase
              .from('experiences')
              .select(columns)
              .order('sort_order', { ascending: true, nullsFirst: false })
              .order('start_date', { ascending: false }),
          includeAdminFields ? ADMIN_COLUMNS : PUBLIC_COLUMNS,
          includeAdminFields ? ENGLISH_COLUMNS : undefined
        )

        if (!isMounted) return

        if (queryError) {
          throw new Error(queryError.message || 'Gagal memuat data experiences dari database.')
        }

        setExperiences(data ?? [])
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Terjadi kesalahan sistem saat mengambil data experiences.'
          )
          setExperiences([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadExperiences()

    return () => {
      isMounted = false
    }
  }, [reloadKey, includeAdminFields])

  return {
    experiences,
    isLoading,
    error,
    refetch,
  }
}
