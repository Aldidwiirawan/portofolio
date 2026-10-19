import { useCallback, useEffect, useState } from 'react'
import { selectWithEnglish } from '../lib/englishColumns'
import { supabase } from '../lib/supabaseClient'

// Columns read by the public portfolio page (unchanged).
const PUBLIC_COLUMNS =
  'id, name, issuer, issue_date, credential_url, created_at'

// The admin also reads the content columns added in stage 2B (migration 20261016000000).
const ADMIN_COLUMNS = `${PUBLIC_COLUMNS}, category, expiry_date, no_expiry, credential_id, score, image_url, pdf_url, is_visible, is_featured, sort_order`

// English versions (migration 20261019000000), read by the admin only; while that migration has not
// been run the query runs again without them (lib/englishColumns.js).
const ENGLISH_COLUMNS = 'name_en, issuer_en'

/**
 * Custom Hook: useCertifications
 * Provides read access for public.certifications table.
 *
 * @param {{ includeAdminFields?: boolean }} [options]
 *   Set includeAdminFields to true only in the admin (columns from the stage 2B migration).
 * @returns {{
 *   certifications: Array<Object>,
 *   isLoading: boolean,
 *   error: string | null,
 *   refetch: () => void
 * }}
 */
export function useCertifications({ includeAdminFields = false } = {}) {
  const [certifications, setCertifications] = useState([])
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

    async function loadCertifications() {
      try {
        const { data, error: queryError } = await selectWithEnglish(
          (columns) =>
            supabase
              .from('certifications')
              .select(columns)
              .order('issue_date', { ascending: false, nullsLast: true })
              .order('created_at', { ascending: false }),
          includeAdminFields ? ADMIN_COLUMNS : PUBLIC_COLUMNS,
          includeAdminFields ? ENGLISH_COLUMNS : undefined
        )

        if (!isMounted) return

        if (queryError) {
          throw new Error(queryError.message || 'Gagal memuat data sertifikasi dari database.')
        }

        setCertifications(data ?? [])
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Terjadi kesalahan sistem saat mengambil data sertifikasi.'
          )
          setCertifications([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadCertifications()

    return () => {
      isMounted = false
    }
  }, [reloadKey, includeAdminFields])

  return {
    certifications,
    isLoading,
    error,
    refetch,
  }
}
