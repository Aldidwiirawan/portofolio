import { useCallback, useEffect, useRef, useState } from 'react'
import { compressImage, FileCheckError } from '../../../lib/imageCompression'
import { asPdfFile, checkPdfFile } from '../../../lib/pdfFile'
import { removeAssets, uploadAsset } from '../../../lib/storageUtils'

/**
 * File fields of the admin forms. Files are prepared when chosen (images compressed, PDFs
 * checked) but only uploaded when the form is saved, through prepareUploads():
 *
 *   const avatar = useAssetField(profile?.avatar_url, { folder: 'profile' })
 *   const cv = useAssetField(profile?.cv_file_url, { folder: 'cv', type: 'pdf' })
 *   const gallery = useGalleryField(project?.gallery, { max: 5 })
 *
 *   const uploads = await prepareUploads({ avatar_url: avatar, cv_file_url: cv, gallery })
 *   payload = { ...payload, ...uploads.values }
 *   save fails → await uploads.rollback()      (removes the files just uploaded)
 *   save works → await uploads.cleanup()       (removes replaced or removed files)
 */

const UNREADABLE = 'File ini tidak bisa diproses. Pilih file lain.'

/** One stored file: an image (compressed before upload) or a PDF. */
export function useAssetField(savedUrl, { folder, type = 'image', imageKind = 'photo' }) {
  const [saved] = useState(savedUrl || null)
  const [next, setNext] = useState(null)
  const [removed, setRemoved] = useState(false)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const token = useRef(0)

  // Object URLs of chosen files are released when replaced and on unmount
  useEffect(() => {
    if (!next?.preview) return undefined
    return () => URL.revokeObjectURL(next.preview)
  }, [next])

  const choose = useCallback(
    async (file) => {
      if (!file) return
      token.current += 1
      const id = token.current
      setError(null)
      setBusy(true)
      try {
        let prepared
        if (type === 'pdf') {
          const problem = await checkPdfFile(file)
          if (problem) throw new FileCheckError(problem)
          const pdf = asPdfFile(file)
          prepared = { file: pdf, name: file.name, size: pdf.size }
        } else {
          const result = await compressImage(file, { kind: imageKind })
          prepared = {
            file: result.file,
            name: file.name,
            size: result.file.size,
            originalSize: result.originalSize,
            width: result.width,
            height: result.height,
          }
        }
        if (id !== token.current) return
        setNext({ ...prepared, preview: URL.createObjectURL(prepared.file) })
        setRemoved(false)
      } catch (err) {
        if (id !== token.current) return
        setError(err instanceof FileCheckError ? err.message : UNREADABLE)
      } finally {
        if (id === token.current) setBusy(false)
      }
    },
    [type, imageKind]
  )

  /** Drops a newly chosen file (back to the saved one). */
  const cancel = useCallback(() => {
    token.current += 1
    setNext(null)
    setError(null)
    setBusy(false)
  }, [])

  /** Marks the saved file for removal (done after saving). */
  const remove = useCallback(() => {
    cancel()
    setRemoved(true)
  }, [cancel])

  const restore = useCallback(() => setRemoved(false), [])

  return {
    kind: 'single',
    folder,
    type,
    savedUrl: saved,
    next,
    removed,
    error,
    busy,
    /** URL to show now: the chosen file, else the saved one unless it is marked for removal */
    url: next ? next.preview : removed ? null : saved,
    hasFile: Boolean(next) || (!removed && Boolean(saved)),
    dirty: Boolean(next) || removed,
    choose,
    cancel,
    remove,
    restore,
  }
}

/** [{ url, caption, caption_en }] from a stored jsonb value (tolerates plain URL strings). */
export function normalizeGallery(value) {
  if (!Array.isArray(value)) return []
  const text = (v) => (typeof v === 'string' ? v : '')
  return value
    .map((item) => (typeof item === 'string' ? { url: item } : item))
    .filter((item) => item && typeof item.url === 'string' && item.url)
    .map((item) => ({ url: item.url, caption: text(item.caption), caption_en: text(item.caption_en) }))
}

let galleryKey = 0
const nextKey = () => {
  galleryKey += 1
  return `g${galleryKey}`
}

/**
 * Ordered images with a short caption each (project gallery, experience photos). The English caption
 * (caption_en, stage 3C) belongs to its image, so it moves with it.
 */
export function useGalleryField(savedItems, { folder = 'gallery', max = 5, imageKind = 'photo' } = {}) {
  const [initial] = useState(() => normalizeGallery(savedItems))
  const [items, setItems] = useState(() =>
    initial.map((item) => ({ key: nextKey(), url: item.url, caption: item.caption, caption_en: item.caption_en }))
  )
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const itemsRef = useRef(items)

  // Keeps the ref in step at once, so quick successive clicks work on the latest list
  const commit = useCallback((list) => {
    itemsRef.current = list
    setItems(list)
  }, [])

  // Release the previews of chosen files on unmount
  useEffect(
    () => () => {
      itemsRef.current.forEach((item) => item.preview && URL.revokeObjectURL(item.preview))
    },
    []
  )

  const add = useCallback(
    async (fileList) => {
      const files = [...(fileList || [])]
      if (files.length === 0) return
      const free = Math.max(0, max - itemsRef.current.length)
      const accepted = files.slice(0, free)
      const skipped = files.length - accepted.length
      setBusy(true)
      setError(null)
      const added = []
      const problems = []
      for (const file of accepted) {
        try {
          const result = await compressImage(file, { kind: imageKind })
          added.push({
            key: nextKey(),
            file: result.file,
            preview: URL.createObjectURL(result.file),
            caption: '',
            caption_en: '',
            name: file.name,
            size: result.file.size,
          })
        } catch (err) {
          problems.push(`${file.name}: ${err instanceof FileCheckError ? err.message : UNREADABLE}`)
        }
      }
      const prev = itemsRef.current
      const room = Math.max(0, max - prev.length)
      added.slice(room).forEach((item) => URL.revokeObjectURL(item.preview))
      commit([...prev, ...added.slice(0, room)])
      if (skipped > 0) problems.push(`${skipped} gambar tidak ditambahkan karena batasnya ${max} gambar.`)
      setError(problems.length ? problems.join(' ') : null)
      setAnnouncement(added.length ? `${added.length} gambar ditambahkan.` : '')
      setBusy(false)
    },
    [max, imageKind, commit]
  )

  const remove = useCallback(
    (key) => {
      const prev = itemsRef.current
      const item = prev.find((x) => x.key === key)
      if (!item) return
      if (item.preview) URL.revokeObjectURL(item.preview)
      commit(prev.filter((x) => x.key !== key))
      setError(null)
      setAnnouncement('Gambar dihapus dari daftar.')
    },
    [commit]
  )

  const move = useCallback(
    (key, delta) => {
      const prev = itemsRef.current
      const from = prev.findIndex((x) => x.key === key)
      const to = from + delta
      if (from === -1 || to < 0 || to >= prev.length) return
      const copy = [...prev]
      const [item] = copy.splice(from, 1)
      copy.splice(to, 0, item)
      commit(copy)
      setAnnouncement(`Gambar dipindah ke posisi ${to + 1} dari ${copy.length}.`)
    },
    [commit]
  )

  const setCaption = useCallback(
    (key, caption) => commit(itemsRef.current.map((x) => (x.key === key ? { ...x, caption } : x))),
    [commit]
  )

  const setCaptionEn = useCallback(
    (key, captionEn) => commit(itemsRef.current.map((x) => (x.key === key ? { ...x, caption_en: captionEn } : x))),
    [commit]
  )

  const dirty =
    JSON.stringify(items.map((item) => [item.url || item.key, item.caption.trim(), item.caption_en.trim()])) !==
    JSON.stringify(initial.map((item) => [item.url, item.caption.trim(), item.caption_en.trim()]))

  return {
    kind: 'gallery',
    folder,
    max,
    initial,
    items,
    error,
    busy,
    announcement,
    dirty,
    add,
    remove,
    move,
    setCaption,
    setCaptionEn,
  }
}

/**
 * Uploads the new files of the given fields (in order) and works out the values to save.
 * If an upload fails, the files uploaded so far are removed again and the error is thrown.
 * @param {Record<string, ReturnType<typeof useAssetField> | ReturnType<typeof useGalleryField>>} fields
 */
export async function prepareUploads(fields) {
  const values = {}
  const uploaded = []
  const obsolete = []
  try {
    for (const [key, field] of Object.entries(fields)) {
      if (field.kind === 'gallery') {
        const result = []
        for (const item of field.items) {
          let url = item.url
          if (item.file) {
            url = (await uploadAsset(field.folder, item.file)).url
            uploaded.push(url)
          }
          const caption = item.caption.trim()
          const captionEn = item.caption_en.trim()
          result.push({ url, ...(caption ? { caption } : {}), ...(captionEn ? { caption_en: captionEn } : {}) })
        }
        const kept = new Set(result.map((item) => item.url))
        field.initial.forEach((item) => {
          if (!kept.has(item.url)) obsolete.push(item.url)
        })
        values[key] = result
      } else if (field.next) {
        const { url } = await uploadAsset(field.folder, field.next.file)
        uploaded.push(url)
        values[key] = url
        if (field.savedUrl) obsolete.push(field.savedUrl)
      } else if (field.removed) {
        values[key] = null
        if (field.savedUrl) obsolete.push(field.savedUrl)
      } else {
        values[key] = field.savedUrl
      }
    }
  } catch (err) {
    await removeAssets(uploaded)
    throw err
  }
  return {
    values,
    uploadedCount: uploaded.length,
    rollback: () => removeAssets(uploaded),
    cleanup: () => removeAssets(obsolete),
  }
}

/** Every stored file of a record (for removal when the record is deleted). */
export function assetUrlsOf(record, singleKeys = [], galleryKeys = []) {
  if (!record) return []
  return [
    ...singleKeys.map((key) => record[key]),
    ...galleryKeys.flatMap((key) => normalizeGallery(record[key]).map((item) => item.url)),
  ].filter(Boolean)
}
