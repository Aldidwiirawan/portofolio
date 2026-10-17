import { useLayoutEffect, useRef, useState } from 'react'
import { IMAGE_ACCEPT, IMAGE_MAX_SIDE } from '../../../lib/imageCompression'
import { PDF_ACCEPT } from '../../../lib/pdfFile'
import { useLock } from './adminContexts'
import { IconButton } from './Button'
import { formatFileSize } from './format'
import { ImageUpload } from './ImageUpload'
import { IconAlert, IconArrowDown, IconArrowUp, IconEye, IconFile, IconImage, IconTrash, IconUpload } from './icons'

const sizeText = (next) => {
  if (!next) return null
  const size = formatFileSize(next.size)
  return next.originalSize && next.originalSize !== next.size ? `${size} (asli ${formatFileSize(next.originalSize)})` : size
}

const IMAGE_HINTS = {
  photo: `PNG, JPG, atau WebP sampai 10 MB. Gambar otomatis dikecilkan (sisi terpanjang ${IMAGE_MAX_SIDE.photo.toLocaleString('id-ID')} px) sebelum diunggah.`,
  logo: `PNG, JPG, atau WebP sampai 10 MB. Otomatis dikecilkan menjadi ${IMAGE_MAX_SIDE.logo} px; latar transparan tetap terjaga.`,
}

/** ImageUpload bound to a useAssetField() image field. */
export function ImageField({ field, id, label, hint, optional = true, shape = 'wide', imageKind = 'photo', disabled = false }) {
  const inputRef = useRef(null)
  const next = field.next
  return (
    <ImageUpload
      id={id}
      label={label}
      optional={optional}
      hint={hint ?? IMAGE_HINTS[imageKind]}
      error={field.error}
      previewUrl={next?.preview}
      currentUrl={field.removed ? null : field.savedUrl}
      fileName={next?.name}
      fileSize={sizeText(next)}
      inputRef={inputRef}
      onChange={(e) => {
        const file = e.target.files?.[0]
        if (inputRef.current) inputRef.current.value = ''
        field.choose(file)
      }}
      onRemove={field.cancel}
      onRemoveSaved={field.savedUrl ? field.remove : undefined}
      removed={field.removed}
      onRestore={field.restore}
      busy={field.busy}
      shape={shape}
      disabled={disabled}
    />
  )
}

/**
 * PDF picker bound to a useAssetField({ type: 'pdf' }) field: file name and size, "Pratinjau"
 * (opens the PDF in a new tab: the chosen file before saving, the stored one after), replace,
 * cancel a new choice or mark the stored file for removal.
 */
export function PdfUpload({ field, id, label, hint, optional = true, disabled = false }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const next = field.next
  const href = next ? next.preview : field.removed ? null : field.savedUrl
  const labelId = `${id}-label`
  const hintId = `${id}-hint`
  const statusId = `${id}-status`
  const errorId = field.error ? `${id}-error` : undefined
  const locked = disabled || field.busy

  const pick = (files) => {
    const file = files?.[0]
    if (inputRef.current) inputRef.current.value = ''
    field.choose(file)
  }

  return (
    <div className={['adm-field', field.error && 'is-invalid'].filter(Boolean).join(' ')}>
      <span id={labelId} className="adm-label">
        {label}
        {optional && <span className="adm-optional">(opsional)</span>}
      </span>
      <div
        className={['adm-upload', 'adm-upload--file', dragging && 'is-dragging', href && 'has-file'].filter(Boolean).join(' ')}
        onDragOver={(e) => {
          e.preventDefault()
          if (!locked) setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          if (!locked) pick(e.dataTransfer?.files)
        }}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={PDF_ACCEPT}
          className="adm-upload-input"
          onChange={(e) => pick(e.target.files)}
          disabled={locked}
          aria-labelledby={labelId}
          aria-describedby={[errorId, statusId, hintId].filter(Boolean).join(' ')}
          aria-invalid={field.error ? true : undefined}
        />
        {href ? (
          <div className="adm-file">
            <span className="adm-file-icon" aria-hidden="true">
              <IconFile size={24} />
            </span>
            <div className="adm-upload-meta">
              <p className="adm-upload-name">{next ? next.name : 'PDF tersimpan'}</p>
              <p className="adm-upload-size">{next ? `${formatFileSize(next.size)} · belum disimpan` : 'Sudah tersimpan'}</p>
              <div className="adm-upload-actions">
                <a className="adm-btn adm-btn--secondary adm-btn--sm" href={href} target="_blank" rel="noopener noreferrer">
                  <IconEye size={16} />
                  <span className="adm-btn-label">Pratinjau</span>
                  <span className="adm-sr-only"> {label} (tab baru)</span>
                </a>
                <label htmlFor={id} className="adm-btn adm-btn--secondary adm-btn--sm adm-upload-pick" aria-disabled={locked || undefined}>
                  <IconUpload size={16} />
                  <span className="adm-btn-label">Ganti PDF</span>
                </label>
                {next ? (
                  <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={field.cancel} disabled={disabled}>
                    <span className="adm-btn-label">Batalkan pilihan</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="adm-btn adm-btn--ghost adm-btn--sm adm-btn--danger-text"
                    onClick={field.remove}
                    disabled={locked}
                  >
                    <IconTrash size={16} />
                    <span className="adm-btn-label">Hapus PDF</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="adm-upload-empty">
            <IconFile size={28} className="adm-upload-icon" />
            <p className="adm-upload-text">Seret file PDF ke sini, atau</p>
            <label htmlFor={id} className="adm-btn adm-btn--secondary adm-btn--sm adm-upload-pick" aria-disabled={locked || undefined}>
              <IconUpload size={16} />
              <span className="adm-btn-label">Pilih PDF</span>
            </label>
            {field.removed && (
              <p className="adm-upload-removed">
                PDF tersimpan akan dihapus saat Anda menyimpan.{' '}
                <button type="button" className="adm-link-btn" onClick={field.restore} disabled={disabled}>
                  Batalkan hapus
                </button>
              </p>
            )}
          </div>
        )}
      </div>
      <p id={statusId} className="adm-upload-status" role="status">
        {field.busy ? (
          <>
            <span className="adm-spinner" aria-hidden="true" /> Memeriksa file...
          </>
        ) : null}
      </p>
      <p id={hintId} className="adm-hint">
        {hint ?? 'File PDF sampai 5 MB.'}
      </p>
      {field.error && (
        <p id={errorId} className="adm-error">
          <IconAlert size={16} />
          <span>{field.error}</span>
        </p>
      )}
    </div>
  )
}

/**
 * Ordered images with a short caption each, bound to useGalleryField(): add several files at
 * once (up to the limit), remove, move up/down (keyboard buttons; focus follows the moved image
 * and the new position is announced) and write a caption, which is also the alternative text.
 * - altName: e.g. the project title, for automatic alt text when the caption is empty
 */
export function GalleryUpload({ field, id, label, hint, altName = '', captionPlaceholder = 'Contoh: Halaman dasbor', disabled = false }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const focusNext = useRef(null)
  const count = field.items.length
  const full = count >= field.max
  const locked = disabled || field.busy
  const captionLock = useLock(disabled)
  const hintId = `${id}-hint`
  const errorId = field.error ? `${id}-error` : undefined

  useLayoutEffect(() => {
    if (!focusNext.current) return
    document.getElementById(focusNext.current)?.focus()
    focusNext.current = null
  })

  const add = (files) => {
    // Copy first: input.files is live and empties when the input is reset
    const chosen = [...(files || [])]
    if (inputRef.current) inputRef.current.value = ''
    if (!locked && !full) field.add(chosen)
  }

  const move = (item, index, delta) => {
    const to = index + delta
    if (locked || to < 0 || to >= count) return
    focusNext.current = `${id}-${item.key}-${delta < 0 ? 'up' : 'down'}`
    field.move(item.key, delta)
  }

  const remove = (index) => {
    if (locked) return
    const neighbour = field.items[index + 1] ?? field.items[index - 1]
    focusNext.current = neighbour ? `${id}-${neighbour.key}-remove` : `${id}-input`
    field.remove(field.items[index].key)
  }

  return (
    <fieldset className={['adm-field', 'adm-gallery', field.error && 'is-invalid'].filter(Boolean).join(' ')} aria-describedby={[errorId, hintId].filter(Boolean).join(' ')}>
      <legend className="adm-label">
        {label}
        <span className="adm-optional">(opsional)</span>
      </legend>

      {count > 0 && (
        <ol className="adm-gallery-list">
          {field.items.map((item, index) => {
            const n = index + 1
            const caption = item.caption.trim()
            const alt = caption || `Gambar ${n}${altName ? ` dari ${altName}` : ''}`
            return (
              <li key={item.key} className="adm-gallery-item">
                <figure className="adm-gallery-thumb">
                  <img src={item.preview || item.url} alt={alt} />
                  {item.file && <span className="adm-gallery-new">Baru</span>}
                </figure>
                <div className="adm-gallery-body">
                  <label htmlFor={`${id}-${item.key}-caption`} className="adm-sublabel">
                    Keterangan gambar {n}
                  </label>
                  <span className="adm-control">
                    <input
                      id={`${id}-${item.key}-caption`}
                      type="text"
                      className="adm-input"
                      value={item.caption}
                      maxLength={120}
                      placeholder={captionPlaceholder}
                      disabled={captionLock.hard || undefined}
                      readOnly={captionLock.soft || undefined}
                      aria-disabled={captionLock.soft || undefined}
                      onChange={(e) => field.setCaption(item.key, e.target.value)}
                    />
                  </span>
                  {item.file && <p className="adm-upload-size">{formatFileSize(item.size)} · belum disimpan</p>}
                </div>
                <div className="adm-gallery-actions">
                  <IconButton
                    id={`${id}-${item.key}-up`}
                    size="sm"
                    label={`Naikkan gambar ${n}`}
                    icon={<IconArrowUp size={16} />}
                    aria-disabled={index === 0 || locked || undefined}
                    onClick={() => move(item, index, -1)}
                  />
                  <IconButton
                    id={`${id}-${item.key}-down`}
                    size="sm"
                    label={`Turunkan gambar ${n}`}
                    icon={<IconArrowDown size={16} />}
                    aria-disabled={index === count - 1 || locked || undefined}
                    onClick={() => move(item, index, 1)}
                  />
                  <IconButton
                    id={`${id}-${item.key}-remove`}
                    size="sm"
                    variant="danger"
                    label={`Hapus gambar ${n}`}
                    icon={<IconTrash size={16} />}
                    aria-disabled={locked || undefined}
                    onClick={() => remove(index)}
                  />
                </div>
              </li>
            )
          })}
        </ol>
      )}

      <div
        className={['adm-upload', 'adm-gallery-add', dragging && 'is-dragging'].filter(Boolean).join(' ')}
        onDragOver={(e) => {
          e.preventDefault()
          if (!locked && !full) setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          add(e.dataTransfer?.files)
        }}
      >
        <input
          ref={inputRef}
          id={`${id}-input`}
          type="file"
          accept={IMAGE_ACCEPT}
          multiple
          className="adm-upload-input"
          onChange={(e) => add(e.target.files)}
          disabled={locked || full}
          aria-label={`Tambah gambar ke ${label.toLowerCase()}`}
          aria-describedby={[errorId, hintId].filter(Boolean).join(' ')}
        />
        <IconImage size={24} className="adm-upload-icon" />
        {full ? (
          <p className="adm-upload-text adm-gallery-full">
            Sudah {field.max} gambar. Hapus satu gambar untuk menambah yang baru.
          </p>
        ) : (
          <>
            <p className="adm-upload-text">Seret gambar ke sini, atau</p>
            <label htmlFor={`${id}-input`} className="adm-btn adm-btn--secondary adm-btn--sm adm-upload-pick" aria-disabled={locked || undefined}>
              <IconUpload size={16} />
              <span className="adm-btn-label">{count === 0 ? 'Pilih gambar' : 'Tambah gambar'}</span>
            </label>
          </>
        )}
      </div>

      <p className="adm-upload-status" role="status">
        {field.busy ? (
          <>
            <span className="adm-spinner" aria-hidden="true" /> Mengecilkan gambar...
          </>
        ) : (
          field.announcement
        )}
      </p>
      <p id={hintId} className="adm-hint">
        {hint ? `${hint} ` : ''}
        {count}/{field.max} gambar. Keterangan juga dipakai sebagai teks alternatif.
      </p>
      {field.error && (
        <p id={errorId} className="adm-error">
          <IconAlert size={16} />
          <span>{field.error}</span>
        </p>
      )}
    </fieldset>
  )
}
