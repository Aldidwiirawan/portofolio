import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

// Columns read by the public portfolio page (unchanged).
const PUBLIC_COLUMNS =
  'id, title, event_name, year, description, created_at'

// The admin also reads the content columns added in stage 2B (migration 20261016000000).
const ADMIN_COLUMNS = `${PUBLIC_COLUMNS}, month, document_url, photo_url, is_visible, is_featured, sort_order`

/**
 * Custom Hook: useAchievements
 * Provides read access for public.achievements table.
 *
 * @param {{ includeAdminFields?: boolean }} [options]
 *   Set includeAdminFields to true only in the admin (columns from the stage 2B migration).
 * @returns {{
 *   achievements: Array<Object>,
 *   isLoading: boolean,
 *   error: string | null,
 *   refetch: () => void
 * }}
 */
export function useAchievements({ includeAdminFields = false } = {}) {
  const [achievements, setAchievements] = useState([])
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

    async function loadAchievements() {
      try {
        const { data, error: queryError } = await supabase
          .from('achievements')
          .select(includeAdminFields ? ADMIN_COLUMNS : PUBLIC_COLUMNS)
          .order('year', { ascending: false })
          .order('created_at', { ascending: false })

        if (!isMounted) return

        if (queryError) {
          throw new Error(queryError.message || 'Gagal memuat data pencapaian dari database.')
        }

        setAchievements(data ?? [])
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Terjadi kesalahan sistem saat mengambil data pencapaian.'
          )
          setAchievements([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadAchievements()

    return () => {
      isMounted = false
    }
  }, [reloadKey, includeAdminFields])

  return {
    achievements,
    isLoading,
    error,
    refetch,
  }
}
