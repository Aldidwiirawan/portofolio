/**
 * Image preparation before upload (admin only): checks the chosen file, then resizes and
 * re-encodes it with the browser's own canvas. Re-encoding also drops photo metadata such as GPS
 * location; the orientation a phone photo is shown in is kept. No library involved.
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

/*
 * Photo orientation. Phone cameras store portrait photos sideways and add an EXIF "Orientation"
 * tag (1–8, 1 = upright) instead of turning the pixels. Current browsers apply the tag when they
 * decode the photo; for a browser that does not, the canvas applies it, so the uploaded photo
 * keeps the orientation it had on the phone. Only JPEG photos carry the tag in practice.
 */

/** APP1 segment with an EXIF block holding only Orientation = 6 (turn 90° clockwise). */
const EXIF_TURN_90 = new Uint8Array([
  0xff, 0xe1, 0x00, 0x22, 0x45, 0x78, 0x69, 0x66, 0x00, 0x00, 0x4d, 0x4d, 0x00, 0x2a, 0x00, 0x00,
  0x00, 0x08, 0x00, 0x01, 0x01, 0x12, 0x00, 0x03, 0x00, 0x00, 0x00, 0x01, 0x00, 0x06, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00,
])

/** Reads the EXIF orientation of a JPEG file; 1 when there is none or the file cannot be read. */
async function readOrientation(file) {
  if (file.type !== 'image/jpeg') return 1
  try {
    // EXIF sits near the start of the file, before the image data
    const view = new DataView(await file.slice(0, 256 * 1024).arrayBuffer())
    if (view.getUint16(0) !== 0xffd8) return 1
    let offset = 2
    while (offset + 4 <= view.byteLength) {
      const marker = view.getUint16(offset)
      // stop at anything that is not a marker, and at start of scan (image data follows)
      if (marker >> 8 !== 0xff || marker === 0xffda) return 1
      const length = view.getUint16(offset + 2)
      // "Exif\0\0"
      if (marker === 0xffe1 && view.getUint32(offset + 4) === 0x45786966 && view.getUint16(offset + 8) === 0) {
        return orientationFromTiff(view, offset + 10)
      }
      offset += 2 + length
    }
  } catch {
    // damaged or cut-off header: treat as upright
  }
  return 1
}

function orientationFromTiff(view, tiff) {
  const littleEndian = view.getUint16(tiff) === 0x4949 // "II"; big endian is "MM"
  const ifd = tiff + view.getUint32(tiff + 4, littleEndian)
  const count = view.getUint16(ifd, littleEndian)
  for (let i = 0; i < count; i += 1) {
    const entry = ifd + 2 + i * 12
    if (view.getUint16(entry, littleEndian) === 0x0112) {
      const value = view.getUint16(entry + 8, littleEndian)
      return value >= 1 && value <= 8 ? value : 1
    }
  }
  return 1
}

let orientationSupport
/**
 * Whether decode() already applies the EXIF orientation: a 2×1 JPEG tagged "turn 90°" comes out
 * 1×2 when it does. Checked once per page load.
 */
function decodeAppliesOrientation() {
  orientationSupport ??= (async () => {
    try {
      const jpeg = await toBlob(makeCanvas(2, 1), 'image/jpeg', 0.5)
      const bytes = new Uint8Array(await jpeg.arrayBuffer())
      const tagged = new Blob([bytes.subarray(0, 2), EXIF_TURN_90, bytes.subarray(2)], { type: 'image/jpeg' })
      const probe = await decode(tagged)
      const applied = probe.height > probe.width
      probe.close?.()
      return applied
    } catch {
      return true // cannot tell: leave the photo as the browser decoded it
    }
  })()
  return orientationSupport
}

/**
 * Sets the canvas transform for an EXIF orientation, for an image drawn at (0, 0) with the given
 * size. Orientations 5–8 turn the image a quarter, so the canvas must be height × width.
 */
function applyOrientation(ctx, orientation, width, height) {
  const transforms = {
    2: [-1, 0, 0, 1, width, 0], // mirrored
    3: [-1, 0, 0, -1, width, height], // upside down
    4: [1, 0, 0, -1, 0, height], // upside down, mirrored
    5: [0, 1, 1, 0, 0, 0], // quarter turn, mirrored
    6: [0, 1, -1, 0, height, 0], // turn 90° clockwise
    7: [0, -1, -1, 0, height, width], // quarter turn, mirrored
    8: [0, -1, 1, 0, 0, width], // turn 90° counter-clockwise
  }
  if (transforms[orientation]) ctx.setTransform(...transforms[orientation])
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

  // Orientation still to apply: none when the photo is upright or the browser already turned it
  let orientation = await readOrientation(file)
  if (orientation > 1 && (await decodeAppliesOrientation())) orientation = 1
  const quarterTurn = orientation >= 5

  const maxSide = IMAGE_MAX_SIDE[kind] ?? IMAGE_MAX_SIDE.photo
  const scale = Math.min(1, maxSide / Math.max(source.width, source.height))
  const drawWidth = Math.max(1, Math.round(source.width * scale))
  const drawHeight = Math.max(1, Math.round(source.height * scale))
  const width = quarterTurn ? drawHeight : drawWidth
  const height = quarterTurn ? drawWidth : drawHeight

  const canvas = makeCanvas(width, height)
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  applyOrientation(ctx, orientation, drawWidth, drawHeight)
  ctx.drawImage(source, 0, 0, drawWidth, drawHeight)
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
