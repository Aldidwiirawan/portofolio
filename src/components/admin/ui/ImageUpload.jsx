import { useState } from 'react'
import { IconAlert, IconImage, IconUpload } from './icons'

/**
 * Image picker with preview. Presentational: the form keeps its own file handling and validation
 * (e.g. the 2 MB limit) and passes the results in.
 * - onChange receives the input change event; a dropped file is passed as { target: { files } }
 * - previewUrl (newly chosen file) wins over currentUrl (saved image)
 * - onRemove cancels a newly chosen file
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
  disabled = false,
  accept = 'image/*',
}) {
  const [dragging, setDragging] = useState(false)
  const image = previewUrl || currentUrl
  const isNew = Boolean(previewUrl)
  const labelId = `${id}-label`
  const hintId = `${id}-hint`
  const errorId = error ? `${id}-error` : undefined

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    if (disabled || !e.dataTransfer?.files?.length) return
    onChange({ target: { files: e.dataTransfer.files } })
  }

  return (
    <div className={['adm-field', error && 'is-invalid'].filter(Boolean).join(' ')}>
      <span id={labelId} className="adm-label">
        {label}
        {optional && <span className="adm-optional">(opsional)</span>}
      </span>
      <div
        className={['adm-upload', dragging && 'is-dragging', image && 'has-image'].filter(Boolean).join(' ')}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setDragging(true)
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
          disabled={disabled}
          aria-labelledby={labelId}
          aria-describedby={[errorId, hintId].filter(Boolean).join(' ')}
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
                <label htmlFor={id} className="adm-btn adm-btn--secondary adm-btn--sm adm-upload-pick">
                  <IconUpload size={16} />
                  <span className="adm-btn-label">Ganti gambar</span>
                </label>
                {isNew && onRemove && (
                  <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={onRemove} disabled={disabled}>
                    <span className="adm-btn-label">Batalkan pilihan</span>
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="adm-upload-empty">
            <IconImage size={28} className="adm-upload-icon" />
            <p className="adm-upload-text">Seret gambar ke sini, atau</p>
            <label htmlFor={id} className="adm-btn adm-btn--secondary adm-btn--sm adm-upload-pick">
              <IconUpload size={16} />
              <span className="adm-btn-label">Pilih gambar</span>
            </label>
          </div>
        )}
      </div>
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
