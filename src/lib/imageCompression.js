/**
 * Image preparation before upload (admin only): checks the chosen file, then resizes and
 * re-encodes it with the browser's own canvas. Re-encoding also drops photo metadata such as GPS
 * location. No library involved.
 */

export const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']
export const IMAGE_ACCEPT = IMAGE_TYPES.join(',')
export const MAX_IMAGE_INPUT_BYTES = 10 * 1024 * 1024
export const MAX_IMAGE_UPLOAD_BYTES = 2 * 1024 * 1024

/** Longest side after resizing: photos/screenshots and logos/icons. */
export const IMAGE_MAX_SIDE = { photo: 1600, logo: 400 }

const EXTENSIONS = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png' }

/** Error with a message that can be shown to the user as is. */
export class FileCheckError extends Error {}

/** Checks a chosen file before compression. Returns a message for the user, or null when fine. */
export function checkImageFile(file) {
  if (!file) return 'Pilih sebuah gambar.'
  if (!IMAGE_TYPES.includes(file.type)) return 'File ini bukan gambar PNG, JPG, atau WebP. Pilih file lain.'
  if (file.size > MAX_IMAGE_INPUT_BYTES) return 'Gambar ini lebih dari 10 MB. Pilih gambar yang lebih kecil.'
  return null
}

async function decode(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' })
    } catch {
      // fall back to <img> below
    }
  }
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    return img
  } finally {
    URL.revokeObjectURL(url)
  }
}

function toBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality))
}

function makeCanvas(width, height) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

/**
 * Resizes the image so its longest side is at most IMAGE_MAX_SIDE[kind] (never enlarges) and
 * encodes it as WebP. A browser that cannot encode WebP gets JPEG for photos (on white) and PNG for
 * logos (keeps transparency). Photos above 2 MB are retried at a lower quality first.
 *
 * @param {File} file
 * @param {{ kind?: 'photo' | 'logo', quality?: number }} [options]
 * @returns {Promise<{ file: File, width: number, height: number, originalSize: number }>}
 * @throws {FileCheckError} with a message for the user
 */
export async function compressImage(file, { kind = 'photo', quality = 0.82 } = {}) {
  const problem = checkImageFile(file)
  if (problem) throw new FileCheckError(problem)

  let source
  try {
    source = await decode(file)
  } catch {
    throw new FileCheckError('Gambar ini tidak bisa dibuka. Pilih file lain.')
  }

  const maxSide = IMAGE_MAX_SIDE[kind] ?? IMAGE_MAX_SIDE.photo
  const scale = Math.min(1, maxSide / Math.max(source.width, source.height))
  const width = Math.max(1, Math.round(source.width * scale))
  const height = Math.max(1, Math.round(source.height * scale))

  const canvas = makeCanvas(width, height)
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(source, 0, 0, width, height)
  source.close?.()

  let type = 'image/webp'
  let output = canvas
  let q = quality
  let blob = await toBlob(output, type, q)

  if (!blob || blob.type !== 'image/webp') {
    type = kind === 'logo' ? 'image/png' : 'image/jpeg'
    if (type === 'image/jpeg') {
      // JPEG has no transparency: put the photo on white instead of black
      output = makeCanvas(width, height)
      const flat = output.getContext('2d')
      flat.fillStyle = '#ffffff'
      flat.fillRect(0, 0, width, height)
      flat.drawImage(canvas, 0, 0)
    }
    blob = await toBlob(output, type, q)
  }

  while (blob && blob.size > MAX_IMAGE_UPLOAD_BYTES && type !== 'image/png' && q > 0.5) {
    q -= 0.12
    blob = await toBlob(output, type, q)
  }

  if (!blob) throw new FileCheckError('Gambar ini tidak bisa diproses. Pilih file lain.')
  if (blob.size > MAX_IMAGE_UPLOAD_BYTES) {
    throw new FileCheckError('Gambar ini masih lebih dari 2 MB setelah dikecilkan. Pilih gambar lain.')
  }

  const baseName = file.name.replace(/\.[^.]*$/, '') || 'gambar'
  return {
    file: new File([blob], `${baseName}.${EXTENSIONS[type]}`, { type }),
    width,
    height,
    originalSize: file.size,
  }
}
