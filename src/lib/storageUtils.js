/**
 * Utility functions for Supabase Storage operations (bucket portfolio-assets, admin only)
 */
import { supabase } from './supabaseClient'

export const STORAGE_BUCKET = 'portfolio-assets'

/**
 * Folders the admin uploads into (policies in the storage migrations):
 * projects/ cover images · profile/ profile photo · logos/ logos and skill icons ·
 * gallery/ screenshots and photos · cv/ CV · documents/ achievement documents ·
 * certificates/ certificate images and PDFs
 */
export const STORAGE_FOLDERS = ['projects', 'profile', 'logos', 'gallery', 'cv', 'documents', 'certificates']

const EXTENSIONS = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'application/pdf': 'pdf',
}

/**
 * Extracts relative storage path (e.g. 'projects/uuid.webp') from a Supabase public URL
 * @param {string|null|undefined} url
 * @returns {string | null}
 */
export function extractStoragePath(url) {
  if (!url || typeof url !== 'string') return null
  try {
    const marker = '/portfolio-assets/'
    const index = url.indexOf(marker)
    if (index !== -1) {
      const pathWithQuery = url.substring(index + marker.length)
      const cleanPath = pathWithQuery.split('?')[0].split('#')[0]
      if (STORAGE_FOLDERS.some((folder) => cleanPath.startsWith(`${folder}/`))) {
        return cleanPath
      }
    }
  } catch {
    return null
  }
  return null
}

/**
 * Uploads a prepared file (compressed image or checked PDF) under a new random name and returns
 * its public URL. The content type is sent explicitly because the bucket only accepts PNG, JPEG,
 * WebP and PDF.
 * @param {string} folder one of STORAGE_FOLDERS
 * @param {File} file
 * @returns {Promise<{ path: string, url: string }>}
 * @throws {Error} with the storage message (shown through toFriendlyError)
 */
export async function uploadAsset(folder, file) {
  const extension = EXTENSIONS[file.type]
  if (!STORAGE_FOLDERS.includes(folder) || !extension) {
    throw new Error('Format file tidak didukung.')
  }
  const path = `${folder}/${crypto.randomUUID()}.${extension}`
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  })
  if (error) {
    throw new Error(error.message || 'Gagal mengunggah file.')
  }
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
  return { path, url: data?.publicUrl || '' }
}

/**
 * Best-effort removal of stored files by public URL (or storage path). URLs outside the bucket
 * (e.g. an old external link) are skipped. Never throws: a file left behind is only logged.
 * @param {Array<string|null|undefined>} urls
 */
export async function removeAssets(urls) {
  const paths = [
    ...new Set(
      urls
        .map((url) => (url && STORAGE_FOLDERS.some((folder) => url.startsWith(`${folder}/`)) ? url : extractStoragePath(url)))
        .filter(Boolean)
    ),
  ]
  if (paths.length === 0) return
  try {
    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove(paths)
    if (error) {
      console.warn('[Storage Cleanup] Gagal menghapus file lama:', paths, error.message)
    }
  } catch (err) {
    console.warn('[Storage Cleanup] Exception saat menghapus file lama:', paths, err)
  }
}
