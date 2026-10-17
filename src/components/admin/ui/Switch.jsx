import { useId } from 'react'
import { useLock } from './adminContexts'
import { FormSection } from './Field'

/**
 * On/off switch (role="switch", a native button: Space and Enter toggle it) with a visible title
 * and a description that can follow the state. `describedBy` adds the id of a note shown elsewhere.
 */
export function Switch({ id, label, description, describedBy, checked, onChange, disabled = false, onText = 'Ya', offText = 'Tidak' }) {
  const autoId = useId()
  const base = id || autoId
  const labelId = `${base}-label`
  const descId = description ? `${base}-desc` : undefined
  const lock = useLock(disabled)

  return (
    <div className="adm-switch-row">
      <div className="adm-switch-text">
        <p id={labelId} className="adm-switch-title">
          {label}
        </p>
        {description && (
          <p id={descId} className="adm-switch-desc">
            {description}
          </p>
        )}
      </div>
      <button
        type="button"
        id={base}
        role="switch"
        aria-checked={Boolean(checked)}
        aria-labelledby={labelId}
        aria-describedby={[descId, describedBy].filter(Boolean).join(' ') || undefined}
        className="adm-switch"
        onClick={() => !lock.soft && onChange(!checked)}
        disabled={lock.hard || undefined}
        aria-disabled={lock.soft || undefined}
      >
        <span className="adm-switch-track" aria-hidden="true">
          <span className="adm-switch-thumb" />
        </span>
        <span className="adm-switch-state" aria-hidden="true">
          {checked ? onText : offText}
        </span>
      </button>
    </div>
  )
}

/**
 * "Tampilan di halaman publik" block of a content form: show/hide on the public site and, when the
 * content has it, the featured flag. Order is set with the Naik/Turun buttons in the list.
 * Until stage 3 the public page does not read these switches yet, so a temporary note says so
 * (remove it when stage 3 ships).
 */
export function DisplaySettings({
  idPrefix,
  visible,
  onVisibleChange,
  featured,
  onFeaturedChange,
  featuredLabel = 'Unggulan',
  featuredDescription,
  disabled = false,
}) {
  const noteId = `${idPrefix}-display-note`
  return (
    <FormSection title="Tampilan di halaman publik">
      <p id={noteId} className="adm-display-note">
        Berlaku setelah halaman publik diperbarui. Sampai saat itu, semua data masih tampil seperti biasa.
      </p>
      <Switch
        id={`${idPrefix}-visible`}
        describedBy={noteId}
        label="Tampil di halaman publik"
        description={
          visible
            ? 'Data ini ikut tampil di halaman publik.'
            : 'Disembunyikan dari halaman publik, tapi tetap tersimpan di sini.'
        }
        checked={visible}
        onChange={onVisibleChange}
        disabled={disabled}
      />
      {onFeaturedChange && (
        <Switch
          id={`${idPrefix}-featured`}
          label={featuredLabel}
          description={featuredDescription}
          describedBy={noteId}
          checked={featured}
          onChange={onFeaturedChange}
          disabled={disabled}
        />
      )}
      <p className="adm-hint">Urutan tampil diatur dengan tombol Naik dan Turun di daftar.</p>
    </FormSection>
  )
}
