// Browser storage that never throws: private windows, blocked site data and previews can make
// localStorage / sessionStorage unavailable. Reads then return null and writes are skipped.

function area(kind) {
  try {
    return kind === 'session' ? window.sessionStorage : window.localStorage
  } catch {
    return null
  }
}

/** @param {'local' | 'session'} [kind] */
export function readStorage(key, kind = 'local') {
  try {
    return area(kind)?.getItem(key) ?? null
  } catch {
    return null
  }
}

/** @param {'local' | 'session'} [kind] */
export function writeStorage(key, value, kind = 'local') {
  try {
    area(kind)?.setItem(key, value)
  } catch {
    // Storage full or blocked: the choice just is not remembered
  }
}
