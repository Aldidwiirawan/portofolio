// The English versions of the content (_en columns, migration 20261019000000). Until that migration
// has been run, a query that names them fails with "column … does not exist". selectWithEnglish then
// runs the query again without them and remembers it: the public page stays Indonesian and the admin
// forms say the database update is missing, while the Indonesian content keeps working.

let missing = false

/** True once a query found that the _en columns do not exist yet. */
export function englishColumnsMissing() {
  return missing
}

/** PostgREST error for an unknown column (42703 in a select, PGRST204 in an insert/update). */
export function isMissingColumnError(error) {
  return (
    error?.code === '42703' ||
    error?.code === 'PGRST204' ||
    /column .* does not exist|could not find the .* column/i.test(error?.message || '')
  )
}

/**
 * Runs `build(columns)` (a Supabase query) with the English columns added, and once more without them
 * when they do not exist.
 * @param {(columns: string) => PromiseLike<{ data: any, error: any }>} build
 * @param {string} columns the Indonesian/base column list
 * @param {string} [enColumns] the _en columns of the same table
 */
export async function selectWithEnglish(build, columns, enColumns) {
  const withEnglish = Boolean(enColumns) && !missing
  const result = await build(withEnglish ? `${columns}, ${enColumns}` : columns)
  if (!result.error || !withEnglish || !isMissingColumnError(result.error)) return result
  missing = true
  return build(columns)
}
