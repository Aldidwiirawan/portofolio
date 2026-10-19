// The public pages talk to the Supabase REST API (PostgREST) with fetch: the same address, publishable
// key and RLS as supabase-js, without downloading that library (stage 3C, K6: about 55 kB gzip less for
// every visitor). Only reads and the two public inserts (contact message, guestbook note); the admin
// keeps supabase-js. Answers have the supabase-js shape { data, error }, error = { code, message }.
// Reads send the key as the apikey query parameter (accepted by the Supabase gateway) and no custom
// header, so the browser makes no CORS preflight first: half the waiting time for a first visit.

const REST_URL = `${String(import.meta.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '')}/rest/v1`
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

function headers(extra = {}) {
  return { apikey: KEY, Authorization: `Bearer ${KEY}`, Accept: 'application/json', ...extra }
}

/** { code, message } from a PostgREST error body (or the HTTP status when it is not JSON). */
async function errorOf(response) {
  try {
    const body = await response.json()
    return { code: body?.code ?? String(response.status), message: body?.message || `HTTP ${response.status}` }
  } catch {
    return { code: String(response.status), message: `HTTP ${response.status}` }
  }
}

/**
 * GET /rest/v1/<table>. filters: [[column, value]] (equality); order: [[column, { ascending }]].
 * With single: the first row or null (like maybeSingle()).
 * @returns {Promise<{ data: any, error: { code: string, message: string } | null }>}
 */
export async function restSelect(table, { columns, filters = [], order = [], limit, single = false } = {}) {
  const params = new URLSearchParams({ select: columns.replace(/\s+/g, ''), apikey: KEY })
  for (const [column, value] of filters) params.append(column, `eq.${value}`)
  if (order.length > 0) {
    params.set('order', order.map(([column, options = {}]) => `${column}.${options.ascending === false ? 'desc' : 'asc'}`).join(','))
  }
  if (single || limit) params.set('limit', String(single ? 1 : limit))
  try {
    const response = await fetch(`${REST_URL}/${table}?${params}`, { headers: { Accept: 'application/json' } })
    if (!response.ok) return { data: null, error: await errorOf(response) }
    const rows = await response.json()
    return { data: single ? (rows[0] ?? null) : rows, error: null }
  } catch (err) {
    return { data: null, error: { code: 'network', message: err?.message || 'Network error' } }
  }
}

/**
 * POST /rest/v1/<table> with one row. With returnRow the stored row comes back (RLS must allow
 * reading it), else nothing (return=minimal).
 * @returns {Promise<{ data: any, error: { code: string, message: string } | null }>}
 */
export async function restInsert(table, row, { returnRow = false } = {}) {
  try {
    const response = await fetch(`${REST_URL}/${table}`, {
      method: 'POST',
      headers: headers({ 'Content-Type': 'application/json', Prefer: returnRow ? 'return=representation' : 'return=minimal' }),
      body: JSON.stringify(row),
    })
    if (!response.ok) return { data: null, error: await errorOf(response) }
    return { data: returnRow ? ((await response.json())[0] ?? null) : null, error: null }
  } catch (err) {
    return { data: null, error: { code: 'network', message: err?.message || 'Network error' } }
  }
}
