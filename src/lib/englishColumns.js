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

// Other optional columns, as 'table.column': columns of a later migration (e.g. educations.photos of
// 20261030000000_redesign_monokrom.sql) that the page can do without until the owner runs it
const missingOptional = new Set()

/** True once a query found that this optional column of this table does not exist yet. */
export function optionalColumnMissing(table, column) {
  return missingOptional.has(`${table}.${column}`)
}

/**
 * Runs `build(columns)` with the optional columns of `table` added (those not known to be missing),
 * and once more without the ones the database says do not exist. Only a column named in the error
 * message is marked missing, so another missing column (e.g. an English one) is not blamed on it.
 * @param {(columns: string) => PromiseLike<{ data: any, error: any }>} build
 * @param {string} columns
 * @param {string} table
 * @param {string[]} optional e.g. ['photos']
 */
export async function selectWithOptional(build, columns, table, optional = []) {
  const wanted = optional.filter((column) => !missingOptional.has(`${table}.${column}`))
  if (wanted.length === 0) return build(columns)
  const result = await build(`${columns}, ${wanted.join(', ')}`)
  if (!result.error || !isMissingColumnError(result.error)) return result
  const named = wanted.filter((column) => new RegExp(`\\b${column}\\b`).test(result.error.message || ''))
  if (named.length === 0) return result
  named.forEach((column) => missingOptional.add(`${table}.${column}`))
  return selectWithOptional(build, columns, table, optional)
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
