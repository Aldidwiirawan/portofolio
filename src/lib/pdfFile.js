/**
 * PDF checks before upload (admin only): CV, certificate files and achievement documents.
 */

export const MAX_PDF_BYTES = 5 * 1024 * 1024
export const PDF_ACCEPT = 'application/pdf,.pdf'

/**
 * Checks type, size and the "%PDF-" header (a renamed text file is refused).
 * @param {File} file
 * @returns {Promise<string | null>} a message for the user, or null when fine
 */
export async function checkPdfFile(file) {
  if (!file) return 'Pilih sebuah file PDF.'
  const looksLikePdf = file.type === 'application/pdf' || (!file.type && /\.pdf$/i.test(file.name))
  if (!looksLikePdf) return 'File ini bukan PDF. Pilih file berformat PDF.'
  if (file.size > MAX_PDF_BYTES) return 'File PDF ini lebih dari 5 MB. Pilih file yang lebih kecil.'
  let head = ''
  try {
    head = await file.slice(0, 5).text()
  } catch {
    head = ''
  }
  if (head !== '%PDF-') return 'File ini tidak terbaca sebagai PDF. Pilih file PDF yang asli.'
  return null
}

/** Same file with the PDF type set explicitly (some systems leave File.type empty). */
export function asPdfFile(file) {
  return file.type === 'application/pdf' ? file : new File([file], file.name, { type: 'application/pdf' })
}
