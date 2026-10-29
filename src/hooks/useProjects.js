import { useCallback, useEffect, useState } from 'react'
import { selectWithEnglish, selectWithOptional } from '../lib/englishColumns'
import { supabase } from '../lib/supabaseClient'

// Columns read by the public portfolio page (unchanged).
const PUBLIC_COLUMNS =
  'id, title, slug, description, content, thumbnail_url, demo_url, github_url, tech_stack, is_featured, sort_order, created_at, updated_at'

// The admin also reads the content columns added in stage 2B (migration 20261016000000) and the
// project links (migration 20261018000000).
const ADMIN_COLUMNS = `${PUBLIC_COLUMNS}, gallery, status, year, project_type, client_name, my_role, problem, solution, outcome, is_repo_private, is_visible, links`

// English versions (migration 20261019000000), read by the admin only; while that migration has not
// been run the query runs again without them (lib/englishColumns.js).
const ENGLISH_COLUMNS = 'title_en, description_en, client_name_en, my_role_en, problem_en, solution_en, outcome_en, content_en'

// The points of the project page (migration 20261030000000), admin only; read only when they exist
// (lib/englishColumns.js selectWithOptional), so the list keeps working before that migration.
const OPTIONAL_ADMIN_COLUMNS = ['background', 'features', 'background_en', 'features_en']

/**
 * Custom Hook: useProjects
 * Provides read-only data access for public.projects table.
 * Encapsulates data fetching, loading state, error handling, and refetch capabilities.
 *
 * @param {{ includeAdminFields?: boolean }} [options]
 *   Set includeAdminFields to true only in the admin (columns from the stage 2B migration).
 * @returns {{
 *   projects: Array<Object>,
 *   isLoading: boolean,
 *   error: string | null,
 *   refetch: () => void
 * }}
 */
export function useProjects({ includeAdminFields = false } = {}) {
  const [projects, setProjects] = useState([])
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

    async function loadProjects() {
      try {
        const { data, error: queryError } = await selectWithEnglish(
          (columns) =>
            selectWithOptional(
              (all) =>
                supabase
                  .from('projects')
                  .select(all)
                  .order('is_featured', { ascending: false })
                  .order('sort_order', { ascending: true, nullsFirst: false })
                  .order('created_at', { ascending: false }),
              columns,
              'projects',
              includeAdminFields ? OPTIONAL_ADMIN_COLUMNS : []
            ),
          includeAdminFields ? ADMIN_COLUMNS : PUBLIC_COLUMNS,
          includeAdminFields ? ENGLISH_COLUMNS : undefined
        )

        if (!isMounted) return

        if (queryError) {
          throw new Error(queryError.message || 'Gagal memuat data projects dari database.')
        }

        setProjects(data ?? [])
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Terjadi kesalahan sistem saat mengambil data projects.'
          )
          setProjects([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadProjects()

    return () => {
      isMounted = false
    }
  }, [reloadKey, includeAdminFields])

  return {
    projects,
    isLoading,
    error,
    refetch,
  }
}
