import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

// Columns read by the public portfolio page (unchanged).
const PUBLIC_COLUMNS =
  'id, language_name, proficiency_level, created_at'

// The admin also reads the content columns added in stage 2B (migration 20261016000000).
const ADMIN_COLUMNS = `${PUBLIC_COLUMNS}, is_visible, sort_order`

/**
 * Custom Hook: useLanguages
 * Provides read access for public.languages table.
 *
 * @param {{ includeAdminFields?: boolean }} [options]
 *   Set includeAdminFields to true only in the admin (columns from the stage 2B migration).
 * @returns {{
 *   languages: Array<Object>,
 *   isLoading: boolean,
 *   error: string | null,
 *   refetch: () => void
 * }}
 */
export function useLanguages({ includeAdminFields = false } = {}) {
  const [languages, setLanguages] = useState([])
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

    async function loadLanguages() {
      try {
        const { data, error: queryError } = await supabase
          .from('languages')
          .select(includeAdminFields ? ADMIN_COLUMNS : PUBLIC_COLUMNS)
          .order('created_at', { ascending: true })

        if (!isMounted) return

        if (queryError) {
          throw new Error(queryError.message || 'Gagal memuat data bahasa dari database.')
        }

        setLanguages(data ?? [])
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Terjadi kesalahan sistem saat mengambil data bahasa.'
          )
          setLanguages([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadLanguages()

    return () => {
      isMounted = false
    }
  }, [reloadKey, includeAdminFields])

  return {
    languages,
    isLoading,
    error,
    refetch,
  }
}
