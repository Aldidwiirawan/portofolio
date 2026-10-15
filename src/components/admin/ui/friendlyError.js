// Maps raw error messages (Supabase/PostgREST in English, or older Indonesian messages with technical
// words) to plain Indonesian at render time. The strings inside the data logic are not changed.

const PATTERNS = [
  {
    pattern: /failed to fetch|networkerror|network request failed|load failed|fetch failed/i,
    message: 'Tidak bisa terhubung ke server. Periksa koneksi internet, lalu coba lagi.',
  },
  {
    pattern: /duplicate key|unique constraint|already exists|23505/i,
    message: 'Sudah ada data dengan isian yang sama (misalnya alamat singkat). Ganti isiannya, lalu coba lagi.',
  },
  {
    pattern: /row-level security|row level security|permission denied|not authorized|42501|unauthorized/i,
    message: 'Anda tidak punya izin untuk menyimpan perubahan ini.',
  },
  {
    pattern: /jwt expired|invalid jwt|session.*(expired|missing)|refresh token/i,
    message: 'Sesi Anda sudah berakhir. Silakan keluar, lalu masuk lagi.',
  },
  {
    pattern: /payload too large|maximum allowed size|exceeded the maximum|413/i,
    message: 'Ukuran file terlalu besar. Pilih gambar maksimal 2 MB.',
  },
  {
    pattern: /mime type|invalid file type|not supported/i,
    message: 'Format file tidak didukung. Pakai PNG, JPG, atau WebP.',
  },
  {
    pattern: /not-null|null value in column|violates not-null/i,
    message: 'Ada kolom wajib yang masih kosong. Lengkapi, lalu coba lagi.',
  },
  {
    pattern: /check constraint|invalid input syntax|out of range/i,
    message: 'Ada isian yang tidak sesuai aturan. Periksa lagi isiannya.',
  },
  {
    pattern: /rate limit|too many requests/i,
    message: 'Terlalu banyak permintaan. Tunggu sebentar, lalu coba lagi.',
  },
]

// English or technical wording that should not reach the screen as-is
const TECHNICAL = /\b(the|failed|error|invalid|could|unable|cannot|violates|column|relation|row|query|database|tabel|record|supabase|public\.[a-z_]+|storage|bucket|sql|jwt|rls|null)\b/i

/**
 * @param {unknown} error   string, Error, or { message }
 * @param {string} fallback plain message for this context, e.g. "Proyek belum bisa dimuat."
 * @returns {string}
 */
export function toFriendlyError(error, fallback = 'Terjadi kesalahan. Coba lagi sebentar lagi.') {
  const message = typeof error === 'string' ? error : error?.message || ''
  if (!message) return fallback
  const known = PATTERNS.find(({ pattern }) => pattern.test(message))
  if (known) return known.message
  return TECHNICAL.test(message) ? fallback : message
}
