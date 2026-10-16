import { useState } from 'react'
import { IMAGE_ACCEPT } from '../../../lib/imageCompression'
import { IconAlert, IconImage, IconTrash, IconUpload } from './icons'

/**
 * Image picker with preview. Presentational: the form (usually through useAssetField and
 * ImageField) keeps the file handling and validation and passes the results in.
 * - onChange receives the input change event; a dropped file is passed as { target: { files } }
 * - previewUrl (newly chosen file) wins over currentUrl (saved image)
 * - onRemove cancels a newly chosen file; onRemoveSaved marks the saved image for removal,
 *   `removed` shows that state with onRestore ("Batalkan hapus")
 * - busy: the chosen image is being compressed
 * - shape: 'wide' (covers, photos) or 'square' (logos, icons, profile photo)
 */
export function ImageUpload({
  id,
  label,
  hint = 'PNG, JPG, atau WebP. Maksimal 2 MB.',
  error,
  optional = false,
  previewUrl,
  currentUrl,
  fileName,
  fileSize,
  inputRef,
  onChange,
  onRemove,
  onRemoveSaved,
  removed = false,
  onRestore,
  busy = false,
  shape = 'wide',
  disabled = false,
  accept = IMAGE_ACCEPT,
}) {
  const [dragging, setDragging] = useState(false)
  const image = previewUrl || currentUrl
  const isNew = Boolean(previewUrl)
  const labelId = `${id}-label`
  const hintId = `${id}-hint`
  const statusId = `${id}-status`
  const errorId = error ? `${id}-error` : undefined
  const locked = disabled || busy

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    if (locked || !e.dataTransfer?.files?.length) return
    onChange({ target: { files: e.dataTransfer.files } })
  }

  return (
    <div className={['adm-field', error && 'is-invalid'].filter(Boolean).join(' ')}>
      <span id={labelId} className="adm-label">
        {label}
        {optional && <span className="adm-optional">(opsional)</span>}
      </span>
      <div
        className={['adm-upload', `adm-upload--${shape}`, dragging && 'is-dragging', image && 'has-image'].filter(Boolean).join(' ')}
        onDragOver={(e) => {
          e.preventDefault()
          if (!locked) setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          className="adm-upload-input"
          onChange={onChange}
          disabled={locked}
          aria-labelledby={labelId}
          aria-describedby={[errorId, statusId, hintId].filter(Boolean).join(' ')}
          aria-invalid={error ? true : undefined}
        />
        {image ? (
          <>
            <figure className="adm-upload-preview">
              <img src={image} alt={isNew ? 'Pratinjau gambar yang dipilih' : 'Gambar yang tersimpan saat ini'} />
            </figure>
            <div className="adm-upload-meta">
              <p className="adm-upload-name">{isNew ? fileName : 'Gambar saat ini'}</p>
              {isNew && fileSize && <p className="adm-upload-size">{fileSize} · belum disimpan</p>}
              <div className="adm-upload-actions">
                <label htmlFor={id} className="adm-btn adm-btn--secondary adm-btn--sm adm-upload-pick" aria-disabled={locked || undefined}>
                  <IconUpload size={16} />
                  <span className="adm-btn-label">Ganti gambar</span>
                </label>
                {isNew && onRemove && (
                  <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={onRemove} disabled={disabled}>
                    <span className="adm-btn-label">Batalkan pilihan</span>
                  </button>
                )}
                {!isNew && onRemoveSaved && (
                  <button
                    type="button"
                    className="adm-btn adm-btn--ghost adm-btn--sm adm-btn--danger-text"
                    onClick={onRemoveSaved}
                    disabled={locked}
                  >
                    <IconTrash size={16} />
                    <span className="adm-btn-label">Hapus gambar</span>
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="adm-upload-empty">
            <IconImage size={28} className="adm-upload-icon" />
            <p className="adm-upload-text">Seret gambar ke sini, atau</p>
            <label htmlFor={id} className="adm-btn adm-btn--secondary adm-btn--sm adm-upload-pick" aria-disabled={locked || undefined}>
              <IconUpload size={16} />
              <span className="adm-btn-label">Pilih gambar</span>
            </label>
            {removed && onRestore && (
              <p className="adm-upload-removed">
                Gambar tersimpan akan dihapus saat Anda menyimpan.{' '}
                <button type="button" className="adm-link-btn" onClick={onRestore} disabled={disabled}>
                  Batalkan hapus
                </button>
              </p>
            )}
          </div>
        )}
      </div>
      <p id={statusId} className="adm-upload-status" role="status">
        {busy ? (
          <>
            <span className="adm-spinner" aria-hidden="true" /> Mengecilkan gambar...
          </>
        ) : null}
      </p>
      <p id={hintId} className="adm-hint">
        {hint}
      </p>
      {error && (
        <p id={errorId} className="adm-error">
          <IconAlert size={16} />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}
